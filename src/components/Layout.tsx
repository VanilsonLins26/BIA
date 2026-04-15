import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X, Download } from "lucide-react";
import { trackEvent } from "@/lib/metrics";

const navLinks = [
  { to: "/", label: "BIA Chat" },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const isChat = location.pathname === "/";

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    trackEvent("installClicks");
    deferredPrompt.prompt();
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="font-display font-bold text-xl text-foreground">
            BIA
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === l.to ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {deferredPrompt && (
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                aria-label="Instalar app"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Instalar</span>
              </button>
            )}
            <button
              onClick={() => window.location.replace("https://google.com")}
              className="bg-foreground text-background px-4 py-1.5 rounded-full font-display font-bold text-xs hover:opacity-90 transition-opacity"
            >
              Saída Rápida
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-foreground"
              aria-label="Menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="md:hidden overflow-hidden border-t border-border"
            >
              <div className="container py-4 flex flex-col gap-3">
                {navLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMenuOpen(false)}
                    className={`text-sm font-medium py-2 ${
                      location.pathname === l.to ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main content */}
      <main className={`flex-1 ${isChat ? "" : ""}`}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={isChat ? "h-full" : ""}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer only on non-chat pages */}
      {!isChat && (
        <footer className="border-t border-border py-12 mt-20">
          <div className="container text-center space-y-4">
            <p className="font-display font-semibold text-foreground">BIA – Busca de Informações e Apoio</p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
              Esta plataforma oferece orientação inicial e não substitui atendimento profissional ou policial.
            </p>
            <p className="text-xs text-muted-foreground">
              Projeto acadêmico e social • Fortaleza – CE – Brasil
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
