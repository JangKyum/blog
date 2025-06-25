"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { auth } from "@/lib/supabase"
import type { User } from '@supabase/supabase-js'

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

  useEffect(() => {
    if (!mounted) return

    // 초기 세션 확인
    async function getSession() {
      try {
        const { session, error } = await auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        }
        return session
      } catch (error) {
        return null
      }
    }

    getSession().then((session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 인증 상태 변화 감지
    const { data: { subscription } } = auth.onAuthStateChange(async (event: any, session: any) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [mounted])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await auth.signIn(email, password)
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await auth.signOut()
    return { error }
  }

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