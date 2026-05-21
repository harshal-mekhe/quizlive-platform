import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import {
  getProfile,
  getSession,
  onAuthStateChange,
  signInAdmin,
  signOut,
  signUpAdmin,
} from '@/services/authService'
import { USER_ROLES } from '@/utils/constants'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId) => {
    try {
      const data = await getProfile(userId)
      setProfile(data)
    } catch {
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const currentSession = await getSession()
        if (!mounted) return

        setSession(currentSession)
        if (currentSession?.user) {
          await loadProfile(currentSession.user.id)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    const {
      data: { subscription },
    } = onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession)
      if (nextSession?.user) {
        await loadProfile(nextSession.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const login = useCallback(async (credentials) => {
    const { session: newSession } = await signInAdmin(credentials)
    if (newSession?.user) {
      await loadProfile(newSession.user.id)
    }
    return newSession
  }, [loadProfile])

  const signup = useCallback(async (payload) => {
    return signUpAdmin(payload)
  }, [])

  const logout = useCallback(async () => {
    await signOut()
    setSession(null)
    setProfile(null)
  }, [])

  const isAdmin = profile?.role === USER_ROLES.ADMIN

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      isAdmin,
      isAuthenticated: Boolean(session),
      login,
      signup,
      logout,
    }),
    [session, profile, loading, isAdmin, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
