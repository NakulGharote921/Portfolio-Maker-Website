import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  getCurrentSession,
  onAuthStateChange,
  signIn as signInWithPassword,
  signInWithGoogle,
  signOutUser,
  signUp as signUpUser,
} from '../services/authService'
import { ADMIN_EMAIL, ensureProfile } from '../services/profileService'
import type { AuthUser, Profile } from '../types/auth'

interface AuthContextType {
  user: AuthUser | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  googleSignIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

async function fetchProfile(user: AuthUser) {
  return ensureProfile(user)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const syncInitialState = async () => {
      try {
        const session = await getCurrentSession()
        const sessionUser = session?.user ?? null

        if (!isMounted) {
          return
        }

        setUser(sessionUser)

        if (sessionUser) {
          const nextProfile = await fetchProfile(sessionUser)

          if (!isMounted) {
            return
          }

          setProfile(nextProfile)
        } else {
          setProfile(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void syncInitialState()

    const subscription = onAuthStateChange((session) => {
      void (async () => {
        if (!isMounted) {
          return
        }

        if (!session?.user) {
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        setLoading(true)
        setUser(session.user)

        try {
          const nextProfile = await fetchProfile(session.user)

          if (!isMounted) {
            return
          }

          setProfile(nextProfile)
        } catch {
          if (!isMounted) {
            return
          }

          setProfile(null)
        } finally {
          if (isMounted) {
            setLoading(false)
          }
        }
      })()
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => {
      const normalizedEmail = user?.email?.trim().toLowerCase()
      const isAdmin = profile?.role === 'admin' && normalizedEmail === ADMIN_EMAIL

      return {
        user,
        profile,
        loading,
        isAdmin,
        signUp: async (email: string, password: string) => {
          await signUpUser(email, password)
        },
        signIn: async (email: string, password: string) => {
          await signInWithPassword(email, password)
        },
        googleSignIn: async () => {
          await signInWithGoogle()
        },
        signOut: async () => {
          await signOutUser()
          setUser(null)
          setProfile(null)
        },
      }
    },
    [loading, profile, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
