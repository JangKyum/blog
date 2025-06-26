"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"
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

  useEffect(() => {
    if (!mounted) return

    // 초기 세션 확인
    async function getSession() {
      try {
        const { session, error } = await auth.getSession()
        
        // Refresh token 오류 처리
        if (error) {
          // Refresh token 관련 오류는 조용히 처리 (사용자를 로그아웃 상태로 설정)
          if (error.message?.includes('refresh') || error.message?.includes('Refresh Token')) {
            console.warn('Session expired, user will be logged out')
            return null
          }
          // 다른 오류는 콘솔에 기록
          console.error('Error getting session:', error)
          return null
        }
        
        return session
      } catch (error) {
        // 네트워크 오류 등 예외 처리
        console.warn('Failed to get session:', error)
        return null
      }
    }

    getSession().then((session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 인증 상태 변화 감지
    const { data: { subscription } } = auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      // 토큰 만료나 오류 시 사용자를 null로 설정
      if (event === 'TOKEN_REFRESHED' && !session) {
        console.warn('Token refresh failed, logging out user')
        setUser(null)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      } else {
        setUser(session?.user ?? null)
      }
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [mounted])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await auth.signIn(email, password)
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await auth.signOut()
      // 로그아웃 후 사용자 상태 즉시 업데이트
      if (!error) {
        setUser(null)
      }
      return { error }
    } catch (error) {
      return { error }
    }
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