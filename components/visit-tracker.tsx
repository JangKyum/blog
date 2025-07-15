'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface VisitTrackerProps {
  enabled?: boolean
}

export default function VisitTracker({ enabled = true }: VisitTrackerProps) {
  const pathname = usePathname()
  const hasTracked = useRef(new Set<string>())

  useEffect(() => {
    if (!enabled) return

    // admin 페이지는 추적하지 않음
    if (pathname.startsWith('/admin')) return

    // 이미 추적한 페이지는 중복 추적하지 않음
    if (hasTracked.current.has(pathname)) return

    const trackVisit = async () => {
      try {
        const response = await fetch('/api/analytics/track-visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pathname,
            referrer: document.referrer || null,
          }),
        })

        if (response.ok) {
          hasTracked.current.add(pathname)
        }
      } catch (error) {
        console.error('방문 추적 오류:', error)
      }
    }

    // 페이지 로드 후 잠시 대기
    const timer = setTimeout(trackVisit, 1000)

    return () => clearTimeout(timer)
  }, [pathname, enabled])

  return null
} 