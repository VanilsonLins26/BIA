import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ShieldCheck, Building2, Home, MapPin, Clock, Mail, ChevronDown } from "lucide-react";

const delegacias = [
  {
    name: "Delegacia de Defesa da Mulher – DDM – 24H",
    address: "R. Tabuleiro do Norte, s/n, Couto Fernandes – Fortaleza/CE",
    phone: "(85) 3108-2950",
    email: "ddmfortaleza@policiacivil.ce.gov.br",
    hours: "24 horas, 7 dias por semana",
  },
  {
    name: "Delegacia de Defesa da Mulher – DDM",
    address: "R. Valdetário Mota, Nº 970, Papicu – Fortaleza/CE",
    phone: "",
    email: "",
    hours: "8h às 17h",
  },
];

const casaMulherServicos = [
  { name: "Recepção", phones: ["(85) 3108-2992", "(85) 3108-2931"], hours: "Plantão 24h" },
  { name: "Delegacia de Defesa da Mulher", phones: ["(85) 3108-2950"], hours: "Plantão 24h, 7 dias" },
  { name: "Centro Estadual de Referência e Apoio à Mulher", phones: ["(85) 3108-2966"], hours: "Seg a Dom (exceto feriados), 8h às 20h" },
  { name: "Defensoria Pública", phones: ["(85) 3108-2986"], hours: "Seg a Sex, 8h às 17h" },
  { name: "Ministério Público", phones: ["(85) 3108-2940", "(85) 3108-2941"], hours: "Seg a Sex, 8h às 16h" },
  { name: "Juizado", phones: ["(85) 3108-2971"], hours: "Seg a Sex, 8h às 17h" },
  { name: "Brinquedoteca (0 a 12 anos)", phones: [], hours: "Plantão 24h" },
  { name: "Pefoce – Núcleo de Perícia da Mulher", phones: [], hours: "Plantão 24h", desc: "Exames periciais, corpo de delito e constatação de crimes sexuais com atendimento humanizado." },
];

const channels = [
  { id: "180", icon: Phone, title: "Disque 180", desc: "Central de Atendimento à Mulher. Ligação gratuita, 24 horas.", href: "tel:180" },
  { id: "190", icon: ShieldCheck, title: "Polícia Militar – 190", desc: "Em caso de emergência, ligue imediatamente.", href: "tel:190" },
  { id: "ddm", icon: Building2, title: "Delegacia da Mulher", desc: "Delegacias especializadas em Fortaleza.", href: "#" },
  { id: "casa", icon: Home, title: "Casa da Mulher Brasileira", desc: "Atendimento humanizado e integrado, 24 horas.", href: "#" },
];

const SupportNetwork = () => {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (id: string) => setExpanded(expanded === id ? null : id);

  return (
    <section className="py-20">
      <div className="container max-w-2xl">
        <motion.h1
          className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Rede de Apoio
        </motion.h1>
        <motion.p
          className="text-muted-foreground leading-relaxed mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Canais oficiais de atendimento e proteção à mulher em Fortaleza.
        </motion.p>

        <div className="grid gap-4">
          {channels.map((c, i) => {
            const isExpandable = c.id === "ddm" || c.id === "casa";
            const isOpen = expanded === c.id;

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {isExpandable ? (
                  <div>
                    <button
                      onClick={() => toggle(c.id)}
                      className="w-full bg-card rounded-3xl p-6 guardian-glow flex items-center gap-4 hover:scale-[0.98] active:scale-[0.96] transition-transform text-left"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <c.icon size={28} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display font-semibold text-foreground">{c.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mt-1">{c.desc}</p>
                      </div>
                      <ChevronDown
                        size={20}
                        className={`text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 space-y-3 px-2">
                            {c.id === "ddm" && delegacias.map((d) => (
                              <div key={d.name} className="bg-muted/50 rounded-2xl p-5 space-y-2">
                                <h4 className="font-display font-semibold text-foreground text-sm">{d.name}</h4>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                  <div className="flex items-start gap-2">
                                    <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
                                    <span>{d.address}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-primary flex-shrink-0" />
                                    <span>{d.hours}</span>
                                  </div>
                                  {d.phone && (
                                    <div className="flex items-center gap-2">
                                      <Phone size={16} className="text-primary flex-shrink-0" />
                                      <a href={`tel:${d.phone.replace(/\D/g, "")}`} className="underline hover:text-primary transition-colors">
                                        {d.phone}
                                      </a>
                                    </div>
                                  )}
                                  {d.email && (
                                    <div className="flex items-center gap-2">
                                      <Mail size={16} className="text-primary flex-shrink-0" />
                                      <a href={`mailto:${d.email}`} className="underline hover:text-primary transition-colors break-all">
                                        {d.email}
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}

                            {c.id === "casa" && (
                              <div className="bg-muted/50 rounded-2xl p-5 space-y-4">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  A Casa da Mulher Brasileira (CMB) oferece acolhimento e encaminhamento de denúncias de forma ágil e especializada, reunindo diversos órgãos em um só local.
                                </p>
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
                                  <span>R. Tabuleiro do Norte com R. Teles de Sousa, Couto Fernandes – Fortaleza/CE</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                                  <Phone size={16} className="text-primary flex-shrink-0" />
                                  <a href="tel:8531082999" className="underline hover:text-primary transition-colors">(85) 3108-2999</a>
                                  <a href="tel:8531082998" className="underline hover:text-primary transition-colors">(85) 3108-2998</a>
                                  <a href="tel:8531082997" className="underline hover:text-primary transition-colors">(85) 3108-2997</a>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Mail size={16} className="text-primary flex-shrink-0" />
                                  <a href="mailto:casadamulherbrasileiradoceara@mulheres.ce.gov.br" className="underline hover:text-primary transition-colors break-all">
                                    casadamulherbrasileiradoceara@mulheres.ce.gov.br
                                  </a>
                                </div>
                                <div className="space-y-2">
                                  <h4 className="font-display font-semibold text-foreground text-sm">Serviços e Contatos</h4>
                                  {casaMulherServicos.map((s) => (
                                    <div key={s.name} className="flex flex-col gap-0.5 text-sm text-muted-foreground border-b border-border/50 pb-2 last:border-0">
                                      <span className="font-medium text-foreground">{s.name}</span>
                                      {"desc" in s && s.desc && (
                                        <span className="text-xs text-muted-foreground">{s.desc}</span>
                                      )}
                                      {s.hours && (
                                        <div className="flex items-center gap-2">
                                          <Clock size={14} className="text-primary flex-shrink-0" />
                                          <span>{s.hours}</span>
                                        </div>
                                      )}
                                      {s.phones.length > 0 && s.phones.map((p) => (
                                        <div key={p} className="flex items-center gap-2">
                                          <Phone size={14} className="text-primary flex-shrink-0" />
                                          <a href={`tel:${p.replace(/\D/g, "")}`} className="underline hover:text-primary transition-colors">
                                            {p}
                                          </a>
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <a
                    href={c.href}
                    className="bg-card rounded-3xl p-6 guardian-glow flex items-center gap-4 hover:scale-[0.98] active:scale-[0.96] transition-transform"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <c.icon size={28} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground">{c.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-1">{c.desc}</p>
                    </div>
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SupportNetwork;
