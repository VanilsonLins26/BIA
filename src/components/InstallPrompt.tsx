import { useState, useEffect } from "react";
import { Share, X, PlusSquare, MoreVertical, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [devicePhase, setDevicePhase] = useState<"ios" | "android" | "other">("other");

  useEffect(() => {
    // Check if already installed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone || document.referrer.includes("android-app://");

    if (!isStandalone) {
      // Basic device detection
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);

      if (isIOS) setDevicePhase("ios");
      else if (isAndroid) setDevicePhase("android");

      // Show after a small delay (1.5s) if on mobile, and limit based on localStorage
      const hasDismissed = localStorage.getItem("bia_install_prompt_dismissed");
      if (!hasDismissed && (isIOS || isAndroid)) {
        const timer = setTimeout(() => setShowPrompt(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("bia_install_prompt_dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            onClick={handleDismiss}
          />
          
          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6 shadow-2xl flex flex-col items-center text-center pb-10"
          >
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
              aria-label="Agrupar aviso"
            >
              <X size={20} />
            </button>

            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4 mt-2">
               <Smartphone size={28} className="text-primary" />
            </div>

            <h2 className="text-xl font-display font-bold text-foreground mb-2">
              Deseja adicionar o app BIA à tela inicial?
            </h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto leading-relaxed">
              Instale o aplicativo na sua tela de início para facilitar o acesso rápido em momentos de emergência. A BIA não ocupa memória do celular de forma intrusiva.
            </p>

            <div className="bg-muted/80 w-full max-w-sm rounded-2xl p-4 flex flex-col gap-3 text-left">
              {devicePhase === "ios" ? (
                <>
                  <div className="flex items-center gap-3 text-sm text-foreground">
                    <div className="bg-background rounded-lg p-1.5 shadow-sm">
                      <Share size={18} className="text-primary" />
                    </div>
                    <span>1. Toque no botão de <strong>Compartilhar</strong> (ícone com seta pra cima no rodapé do Safari).</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-foreground">
                    <div className="bg-background rounded-lg p-1.5 shadow-sm">
                      <PlusSquare size={18} className="text-primary" />
                    </div>
                    <span>2. Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 text-sm text-foreground">
                    <div className="bg-background rounded-lg p-1.5 shadow-sm">
                      <MoreVertical size={18} className="text-primary" />
                    </div>
                    <span>1. Toque no <strong>Menu</strong> (os 3 pontinhos) no topo da tela do navegador.</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-foreground">
                    <div className="bg-background rounded-lg p-1.5 shadow-sm">
                      <PlusSquare size={18} className="text-primary" />
                    </div>
                    <span>2. Selecione a opção <strong>Adicionar à tela inicial</strong>.</span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleDismiss}
              className="mt-6 w-full max-w-sm bg-primary text-primary-foreground font-semibold py-3.5 rounded-full hover:bg-primary/90 transition-colors shadow-md"
            >
              Entendi
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
