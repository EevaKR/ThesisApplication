import { create } from "zustand";

type AuthState = {
    isSignedIn: boolean;
    setIsSignedIn: (value: boolean) => void;
signIn: () => void;
signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isSignedIn: false,
    setIsSignedIn: (value) => set ({ isSignedIn: value}),
    signIn: () => set({ isSignedIn: true}),
    signOut: () => set({ isSignedIn: false}),
}))