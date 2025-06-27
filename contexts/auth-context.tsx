"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react"
import { auth } from "@/lib/supabase"
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 세션 가져오기 함수를 useCallback으로 메모이제이션
  const getSession = useCallback(async () => {
    try {
      const { session, error } = await auth.getSession()
      
      if (error) {
        if (error.message?.includes('refresh') || error.message?.includes('Refresh Token')) {
          console.warn('Session expired, user will be logged out')
          return null
        }
        console.error('Error getting session:', error)
        return null
      }
      
      return session
    } catch (error) {
      console.warn('Failed to get session:', error)
      return null
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    // 세션 확인을 약간 지연시켜 초기 렌더링 성능 향상
    const timer = setTimeout(async () => {
      const session = await getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }, 100) // 100ms 지연

    // 인증 상태 변화 감지
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.warn('Token refresh failed, logging out user')
          setUser(null)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        } else {
          setUser(session?.user ?? null)
        }
        setLoading(false)
      }
    )

    return () => {
      clearTimeout(timer)
      subscription?.unsubscribe()
    }
  }, [mounted, getSession])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await auth.signIn(email, password)
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      const { error } = await auth.signOut()
      if (!error) {
        setUser(null)
      }
      return { error }
    } catch (error) {
      return { error }
    }
  }, [])

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
  }

  // 컴포넌트가 마운트되기 전까지는 로딩 상태 표시
  if (!mounted) {
    return (
      <AuthContext.Provider value={{ user: null, loading: true, signIn, signOut }}>
        {children}
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 