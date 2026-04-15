import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { trackEvent } from "@/lib/metrics";
import { useUserProfile } from "@/contexts/UserProfileContext";

type Message = {
  id: number;
  from: "bot" | "user";
  text: string;
  buttons?: { label: string; action: string }[];
};

const initialMessages: Message[] = [
  {
    id: 1,
    from: "bot",
    text: "Olá! 💜\nEu sou a BIA, uma assistente virtual criada para ajudar mulheres com informações e orientação.\n\nVocê está segura para conversar agora?",
    buttons: [
      { label: "Sim ✅", action: "safe_yes" },
      { label: "Não ❌", action: "safe_no" },
    ],
  },
];

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [step, setStep] = useState<string>("safety");
  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(2);
  const interactionCountRef = useRef(0);
  const { profileCompleted, setShowProfileModal, incrementInteraction, profile } = useUserProfile();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addBot = (text: string, buttons?: Message["buttons"]) => {
    const msg: Message = { id: idRef.current++, from: "bot", text, buttons };
    setMessages((prev) => [...prev, msg]);
    trackEvent("chatInteractions");
  };

  const addUser = (text: string) => {
    const msg: Message = { id: idRef.current++, from: "user", text };
    setMessages((prev) => [...prev, msg]);
    trackEvent("chatInteractions");
  };

  const handleButton = (action: string, label: string) => {
    addUser(label);
    incrementInteraction();
    interactionCountRef.current += 1;

    // Show profile modal after 3 interactions if not yet completed
    if (!profileCompleted && interactionCountRef.current === 3) {
      setTimeout(() => setShowProfileModal(true), 600);
    }

    setTimeout(() => {
      switch (action) {
        case "safe_yes":
          setStep("main");
          addBot("Fico feliz que esteja segura! 💜\n\nComo posso ajudar você hoje?", [
            { label: "Entender se estou sofrendo violência", action: "identify" },
            { label: "Buscar ajuda", action: "help" },
            { label: "Conhecer meus direitos", action: "rights" },
          ]);
          break;

        case "safe_no":
          setStep("exit");
          addBot("Sua segurança é a prioridade. Clique no botão abaixo para sair rapidamente.", [
            { label: "🚪 SAÍDA RÁPIDA", action: "quick_exit" },
          ]);
          break;

        case "quick_exit":
          window.location.replace("https://google.com");
          break;

        case "identify":
          setStep("identify");
          addBot("Você já passou por alguma dessas situações?", [
            { label: "Agressões físicas", action: "violence_physical" },
            { label: "Ameaças ou humilhações", action: "violence_psychological" },
            { label: "Controle do dinheiro ou bens", action: "violence_patrimonial" },
            { label: "Forçar relação sexual", action: "violence_sexual" },
          ]);
          break;

        case "violence_physical":
          addBot("Agressões, empurrões, tapas ou qualquer forma de agressão corporal são considerados violência física. Isso é crime.\n\nVocê não está sozinha. 💜", [
            { label: "Quero falar com um serviço de apoio", action: "help" },
            { label: "Quero saber meus direitos", action: "rights" },
            { label: "Encerrar conversa", action: "nps" },
          ]);
          break;

        case "violence_psychological":
          addBot("Humilhações, ameaças, manipulação ou controle emocional são formas de violência psicológica. Você merece respeito. 💜", [
            { label: "Quero falar com um serviço de apoio", action: "help" },
            { label: "Quero saber meus direitos", action: "rights" },
            { label: "Encerrar conversa", action: "nps" },
          ]);
          break;

        case "violence_patrimonial":
          addBot("Controle de dinheiro, destruição de bens ou retenção de documentos é violência patrimonial. Você tem direito à autonomia. 💜", [
            { label: "Quero falar com um serviço de apoio", action: "help" },
            { label: "Quero saber meus direitos", action: "rights" },
            { label: "Encerrar conversa", action: "nps" },
          ]);
          break;

        case "violence_sexual":
          addBot("Qualquer ato sexual sem consentimento é violência sexual, mesmo dentro de um relacionamento. Isso é crime. 💜", [
            { label: "Quero falar com um serviço de apoio", action: "help" },
            { label: "Quero saber meus direitos", action: "rights" },
            { label: "Encerrar conversa", action: "nps" },
          ]);
          break;

        case "help":
          setStep("help");
          addBot("Aqui estão os canais de apoio disponíveis:\n\n📞 Disque 180 – Central de Atendimento à Mulher\n🚔 Polícia Militar – 190\n🏛️ Delegacia da Mulher\n🏠 Casa da Mulher Brasileira\n\nLigue agora. Você não está sozinha. 💜", [
            { label: "Encerrar conversa", action: "nps" },
          ]);
          break;

        case "rights":
          setStep("rights");
          addBot("A Lei Maria da Penha (Lei nº 11.340/2006) garante proteção para mulheres vítimas de violência doméstica e familiar.\n\nEla prevê medidas protetivas de urgência, como afastamento do agressor e proibição de contato. 💜", [
            { label: "Buscar ajuda agora", action: "help" },
            { label: "Encerrar conversa", action: "nps" },
          ]);
          break;

        case "nps":
          setStep("nps");
          addBot("Essa conversa foi útil para você?", [
            { label: "👍 Sim", action: "nps_yes" },
            { label: "👎 Não", action: "nps_no" },
          ]);
          break;

        case "nps_yes":
          trackEvent("npsPositive");
          addBot("Obrigada pelo seu feedback! 💜\nSe precisar, estou sempre aqui. Cuide-se.");
          setStep("done");
          break;

        case "nps_no":
          trackEvent("npsNegative");
          addBot("Obrigada pelo feedback. Vamos melhorar! 💜\nSe precisar, estou sempre aqui.");
          setStep("done");
          break;
      }
    }, 500);
  };

  const handleOpen = () => {
    if (!open) {
      trackEvent("chatStarted");
    }
    setOpen(!open);
  };

  return (
    <>
      {/* FAB */}
      <motion.button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={open ? {} : { scale: [1, 1.05, 1] }}
        transition={open ? {} : { repeat: Infinity, duration: 3 }}
      >
        {open ? <X size={24} className="text-primary-foreground" /> : <MessageCircle size={24} className="text-primary-foreground" />}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="fixed bottom-24 right-4 left-4 md:left-auto md:w-96 z-50 bg-card rounded-3xl shadow-2xl overflow-hidden border border-border flex flex-col"
            style={{ maxHeight: "70vh" }}
          >
            {/* Header */}
            <div className="bg-primary px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-card/20 flex items-center justify-center">
                <MessageCircle size={20} className="text-primary-foreground" />
              </div>
              <div>
                <p className="font-display font-semibold text-primary-foreground text-sm">BIA</p>
                <p className="text-xs text-primary-foreground/70">Assistente Virtual</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: "50vh" }}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", damping: 20, stiffness: 100 }}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.from === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    {msg.buttons && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {msg.buttons.map((btn) => (
                          <button
                            key={btn.action}
                            onClick={() => handleButton(btn.action, btn.label)}
                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-card border border-border text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
