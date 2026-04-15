import { motion } from "framer-motion";
import { Users, MessageCircle } from "lucide-react";

const Community = () => (
  <section className="py-20">
    <div className="container max-w-xl text-center">
      <motion.div
        className="bg-card rounded-3xl p-8 md:p-12 guardian-glow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Users size={48} className="mx-auto text-primary mb-6" />
        <h1 className="text-3xl font-display font-bold text-foreground mb-4">
          Comunidade de Apoio
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Participe da nossa comunidade para receber informações, campanhas de conscientização e conteúdos sobre direitos das mulheres.
        </p>
        <a
          href="https://chat.whatsapp.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-display font-semibold hover:opacity-90 transition-opacity glow-primary"
        >
          <MessageCircle size={20} />
          Entrar na Comunidade do WhatsApp
        </a>
      </motion.div>
    </div>
  </section>
);

export default Community;
