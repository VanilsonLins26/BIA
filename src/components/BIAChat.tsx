import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Heart, Phone, Shield, BookOpen, AlertTriangle, ThumbsUp, ThumbsDown, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { trackEvent } from "@/lib/metrics";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bia-chat`;

const quickButtons = [
  { label: "O que é violência doméstica?", icon: Shield },
  { label: "Quais são meus direitos?", icon: BookOpen },
  { label: "Preciso de ajuda agora", icon: Phone },
  { label: "Estou em perigo", icon: AlertTriangle },
];

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages }),
    });

    if (!resp.ok || !resp.body) {
      if (resp.status === 429) {
        onError("Muitas solicitações. Aguarde um momento e tente novamente.");
        return;
      }
      onError("Desculpe, ocorreu um erro. Tente novamente.");
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") { streamDone = true; break; }
        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }

    // flush remaining
    if (buffer.trim()) {
      for (let raw of buffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (!raw.startsWith("data: ")) continue;
        const json = raw.slice(6).trim();
        if (json === "[DONE]") continue;
        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignore */ }
      }
    }

    onDone();
  } catch {
    onError("Erro de conexão. Verifique sua internet e tente novamente.");
  }
}

const FeedbackButtons = ({ messageIndex }: { messageIndex: number }) => {
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null);

  const handleFeedback = (type: "positive" | "negative") => {
    if (feedback) return;
    setFeedback(type);
    trackEvent(type === "positive" ? "npsPositive" : "npsNegative");
  };

  return (
    <div className="flex items-center gap-1 mt-1 ml-1">
      <button
        onClick={() => handleFeedback("positive")}
        className={`p-1 rounded-full transition-colors ${
          feedback === "positive"
            ? "text-primary"
            : feedback
            ? "text-muted-foreground/30"
            : "text-muted-foreground/50 hover:text-primary"
        }`}
        disabled={!!feedback}
        aria-label="Resposta útil"
      >
        <ThumbsUp size={14} />
      </button>
      <button
        onClick={() => handleFeedback("negative")}
        className={`p-1 rounded-full transition-colors ${
          feedback === "negative"
            ? "text-destructive"
            : feedback
            ? "text-muted-foreground/30"
            : "text-muted-foreground/50 hover:text-destructive"
        }`}
        disabled={!!feedback}
        aria-label="Resposta não útil"
      >
        <ThumbsDown size={14} />
      </button>
      {feedback && (
        <span className="text-xs text-muted-foreground ml-1">Obrigada pelo feedback!</span>
      )}
    </div>
  );
};

const BIAChat = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    if (!hasStarted) {
      setHasStarted(true);
      trackEvent("chatStarted");
    }
    trackEvent("chatInteractions");

    const userMsg: Msg = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    await streamChat({
      messages: newMessages,
      onDelta: (chunk) => upsertAssistant(chunk),
      onDone: () => setIsLoading(false),
      onError: (msg) => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: msg },
        ]);
        setIsLoading(false);
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full relative">

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {!hasStarted && messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 space-y-8"
            >
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <Heart size={32} className="text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                  Olá, eu sou a BIA 💜
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Uma IA criada para orientar mulheres sobre seus direitos, tipos de violência e canais de apoio em Fortaleza.
                </p>
                <p className="text-xs text-muted-foreground">
                  Sua conversa é anônima e segura.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                {quickButtons.map((btn) => (
                  <button
                    key={btn.label}
                    onClick={() => sendMessage(btn.label)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-card border-2 border-primary/20 text-base font-medium text-foreground hover:bg-primary/10 hover:border-primary/40 transition-colors text-left shadow-sm"
                  >
                    <btn.icon size={20} className="text-primary flex-shrink-0" />
                    {btn.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] ${msg.role === "user" ? "" : "group"}`}>
                <div
                  className={`rounded-2xl px-5 py-3.5 text-base md:text-lg leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground font-medium rounded-br-md"
                      : "bg-white border text-foreground font-medium rounded-bl-md"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-base md:prose-lg max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-1 prose-strong:text-foreground prose-headings:text-foreground prose-headings:text-base md:prose-headings:text-lg prose-headings:font-display">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-line">{msg.content}</p>
                  )}
                </div>
                {msg.role === "assistant" && !isLoading && (
                  <>
                    <FeedbackButtons messageIndex={i} />
                    {i === messages.length - 1 && (
                      <button
                        onClick={() => sendMessage("Continue explicando")}
                        className="flex items-center gap-1.5 mt-2 ml-1 px-3 py-1.5 rounded-full text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        <ArrowRight size={12} />
                        Continuar
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 size={16} className="animate-spin" />
                BIA está pensando...
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Quick suggestions after conversation starts */}
      {hasStarted && !isLoading && (
        <div className="px-4 pb-2 w-full">
          <div className="max-w-2xl mx-auto flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {[
              "Delegacia mais próxima",
              "Casa da Mulher Brasileira",
              "Meus direitos",
              "Tipos de violência",
            ].map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="whitespace-nowrap shrink-0 snap-start px-5 py-2.5 rounded-full text-base font-bold bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground border-2 border-primary/20 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border px-4 py-3 bg-background/80 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            rows={1}
            className="flex-1 resize-none bg-white border border-input rounded-2xl px-4 py-3.5 text-base font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent max-h-32 shadow-sm"
            style={{ minHeight: "52px" }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-50 hover:opacity-90 transition-opacity flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BIAChat;
