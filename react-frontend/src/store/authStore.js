import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, tokens) => set({
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }),

      clearAuth: () => set({
        user: null,
        accessToken: null,
        refreshToken: null
      }),

      isAuthenticated: () => {
        const state = useAuthStore.getState()
        return !!state.accessToken
      }
    }),
    {
      name: 'auth-storage' // name of the item in localStorage
    }
  )
)

export default useAuthStore
