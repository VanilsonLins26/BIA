import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Hand, Brain, MessageSquareWarning, Wallet, ShieldAlert, X } from "lucide-react";

const types = [
  { icon: Hand, title: "Violência Física", desc: "Agressões, empurrões, tapas ou qualquer forma de agressão corporal.", color: "bg-primary/10 text-primary" },
  { icon: Brain, title: "Violência Psicológica", desc: "Humilhações, ameaças, manipulação ou controle emocional.", color: "bg-secondary/40 text-secondary-foreground" },
  { icon: MessageSquareWarning, title: "Violência Moral", desc: "Acusações falsas, difamação ou exposição pública.", color: "bg-primary/10 text-primary" },
  { icon: Wallet, title: "Violência Patrimonial", desc: "Controle de dinheiro, destruição de bens ou retenção de documentos.", color: "bg-secondary/40 text-secondary-foreground" },
  { icon: ShieldAlert, title: "Violência Sexual", desc: "Qualquer ato sexual sem consentimento.", color: "bg-primary/10 text-primary" },
];

const ViolenceTypes = () => {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <section className="py-20">
      <div className="container max-w-3xl">
        <motion.h1
          className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Tipos de Violência
        </motion.h1>
        <motion.p
          className="text-muted-foreground leading-relaxed mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Conheça as diferentes formas de violência contra a mulher reconhecidas pela Lei Maria da Penha.
        </motion.p>

        <div className="grid gap-4">
          {types.map((t, i) => (
            <motion.div
              key={t.title}
              className="bg-card rounded-3xl guardian-glow overflow-hidden cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 0.99 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <div className="p-6 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${t.color} flex items-center justify-center flex-shrink-0`}>
                  <t.icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-foreground">{t.title}</h3>
                  <AnimatePresence>
                    {expanded === i && (
                      <motion.p
                        className="text-sm text-muted-foreground leading-relaxed mt-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        {t.desc}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ViolenceTypes;
