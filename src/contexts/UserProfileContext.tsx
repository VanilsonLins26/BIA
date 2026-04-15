import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface UserProfile {
  userId: string;
  name?: string;
  avatar?: string;
  createdAt: string;
  interactionCount: number;
  chatStartTime?: number;
}

interface UserProfileContextType {
  profile: UserProfile | null;
  setProfile: (p: UserProfile) => void;
  incrementInteraction: () => void;
  showProfileModal: boolean;
  setShowProfileModal: (v: boolean) => void;
  profileCompleted: boolean;
}

const UserProfileContext = createContext<UserProfileContextType | null>(null);

function generateId() {
  return `anon_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const STORAGE_KEY = "bia_user_profile";
const MODAL_SHOWN_KEY = "bia_profile_modal_shown";

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(() => {
    return localStorage.getItem(MODAL_SHOWN_KEY) === "true";
  });

  const setProfile = useCallback((p: UserProfile) => {
    setProfileState(p);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    localStorage.setItem(MODAL_SHOWN_KEY, "true");
    setProfileCompleted(true);
  }, []);

  const incrementInteraction = useCallback(() => {
    setProfileState((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, interactionCount: prev.interactionCount + 1 };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Auto-show modal after timer if not yet completed
  useEffect(() => {
    if (profileCompleted) return;
    const timer = setTimeout(() => {
      if (!localStorage.getItem(MODAL_SHOWN_KEY)) {
        setShowProfileModal(true);
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [profileCompleted]);

  return (
    <UserProfileContext.Provider
      value={{
        profile,
        setProfile,
        incrementInteraction,
        showProfileModal,
        setShowProfileModal,
        profileCompleted,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error("useUserProfile must be inside UserProfileProvider");
  return ctx;
}
