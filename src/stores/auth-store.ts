import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

type AuthState = {
  token: string | null
  username: string | null
  setSession: (token: string, username: string) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      username: null,
      setSession: (token, username) => set({ token, username }),
      clearSession: () => set({ token: null, username: null }),
    }),
    {
      name: "cloudbox-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, username: state.username }),
    }
  )
)

export const getAuthToken = () => useAuthStore.getState().token

export function getPersistedAuthToken(): string | null {
  if (typeof window === "undefined") return null

  const raw = window.localStorage.getItem("cloudbox-auth")
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as { state?: { token?: string | null } }
    return parsed.state?.token ?? null
  } catch {
    return null
  }
}
