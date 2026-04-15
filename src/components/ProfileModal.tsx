import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield } from "lucide-react";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { trackEvent } from "@/lib/metrics";

import avatar01 from "@/assets/avatars/avatar-01.png";
import avatar02 from "@/assets/avatars/avatar-02.png";
import avatar03 from "@/assets/avatars/avatar-03.png";
import avatar04 from "@/assets/avatars/avatar-04.png";
import avatar05 from "@/assets/avatars/avatar-05.png";
import avatar06 from "@/assets/avatars/avatar-06.png";
import avatar07 from "@/assets/avatars/avatar-07.png";
import avatar08 from "@/assets/avatars/avatar-08.png";
import avatar09 from "@/assets/avatars/avatar-09.png";
import avatar10 from "@/assets/avatars/avatar-10.png";

const avatars = [
  { id: "1", src: avatar01 },
  { id: "2", src: avatar02 },
  { id: "3", src: avatar03 },
  { id: "4", src: avatar04 },
  { id: "5", src: avatar05 },
  { id: "6", src: avatar06 },
  { id: "7", src: avatar07 },
  { id: "8", src: avatar08 },
  { id: "9", src: avatar09 },
  { id: "10", src: avatar10 },
];

function generateId() {
  return `anon_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const ProfileModal = () => {
  const { showProfileModal, setShowProfileModal, setProfile } = useUserProfile();
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const handleContinue = () => {
    const userId = generateId();
    setProfile({
      userId,
      name: name.trim() || undefined,
      avatar: selectedAvatar ? avatars.find((a) => a.id === selectedAvatar)?.src : undefined,
      createdAt: new Date().toISOString(),
      interactionCount: 0,
    });
    trackEvent("profile_created");
    if (selectedAvatar) trackEvent("avatar_selected");
    setShowProfileModal(false);
  };

  const handleSkip = () => {
    const userId = generateId();
    setProfile({
      userId,
      createdAt: new Date().toISOString(),
      interactionCount: 0,
    });
    trackEvent("profile_skipped");
    setShowProfileModal(false);
  };

  return (
    <AnimatePresence>
      {showProfileModal && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={handleSkip}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-card rounded-2xl shadow-2xl border border-border w-full max-w-md max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
              aria-label="Fechar"
            >
              <X size={18} className="text-muted-foreground" />
            </button>

            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="text-center space-y-2">
                <h2 className="text-xl font-display font-bold text-foreground">
                  Crie um perfil rápido 💜
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Para melhorar o atendimento e entender como podemos ajudar mais mulheres, você pode criar um perfil simples.
                </p>
                <p className="text-sm text-muted-foreground">
                  Isso é <strong>opcional</strong> e você pode continuar de forma totalmente anônima.
                </p>
              </div>

              {/* Name input */}
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome ou apelido (opcional)"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  maxLength={30}
                />
              </div>

              {/* Avatar grid */}
              <div>
                <p className="text-sm font-medium text-foreground mb-3">
                  Escolha um avatar (opcional)
                </p>
                <div className="grid grid-cols-5 gap-3 justify-items-center">
                  {avatars.map((av) => (
                    <button
                      key={av.id}
                      onClick={() =>
                        setSelectedAvatar(selectedAvatar === av.id ? null : av.id)
                      }
                      className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                        selectedAvatar === av.id
                          ? "border-primary ring-2 ring-primary/30 scale-110"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={av.src}
                        alt={`Avatar ${av.id}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Privacy note */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50">
                <Shield size={16} className="text-primary flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Você pode usar o chat de forma totalmente anônima. Não armazenamos informações sensíveis.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSkip}
                  className="flex-1 px-4 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  Pular
                </button>
                <button
                  onClick={handleContinue}
                  className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-display font-semibold hover:opacity-90 transition-opacity"
                >
                  Continuar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;
