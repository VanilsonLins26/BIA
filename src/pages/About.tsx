import { motion } from "framer-motion";

const About = () => (
  <section className="py-20">
    <div className="container max-w-2xl">
      <motion.h1
        className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Sobre o Projeto
      </motion.h1>
      <motion.div
        className="space-y-6 text-muted-foreground leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <p>
          O projeto BIA foi criado como uma iniciativa de impacto social para desenvolver uma ferramenta digital de orientação para mulheres em situação de violência doméstica.
        </p>
        <p>
          A plataforma busca oferecer informação acessível, orientação inicial e encaminhamento para serviços especializados de atendimento às mulheres.
        </p>
        <div className="bg-card rounded-3xl p-6 guardian-glow mt-8">
          <h3 className="font-display font-semibold text-foreground mb-4">Objetivos</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              Oferecer orientação inicial segura
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              Ajudar mulheres a identificar possíveis situações de violência
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              Indicar canais oficiais de ajuda
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              Promover informação e apoio
            </li>
          </ul>
        </div>
        <p className="text-xs text-muted-foreground italic">
          O sistema não substitui atendimento profissional, apenas orienta e encaminha.
        </p>
      </motion.div>
    </div>
  </section>
);

export default About;
