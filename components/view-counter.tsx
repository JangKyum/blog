'use client'

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'

interface ViewCounterProps {
  slug: string
  initialViewCount?: number
  showIcon?: boolean
}

export default function ViewCounter({ 
  slug, 
  initialViewCount = 0, 
  showIcon = false 
}: ViewCounterProps) {
  const [viewCount, setViewCount] = useState(initialViewCount)
  const [hasIncremented, setHasIncremented] = useState(false)

  useEffect(() => {
    if (hasIncremented) return

    // 백그라운드에서 API 호출 (optimistic UI 제거하고 실제 값만 사용)
    const incrementView = async () => {
      try {
        const response = await fetch(`/api/posts/${slug}/views`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const result = await response.json()
          // 서버에서 받은 실제 값으로 설정
          if (result.success && result.view_count) {
            setViewCount(result.view_count)
          }
        }
      } catch (error) {
        // 실패 시 초기값 유지
        console.error('View count update failed:', error)
      }
    }

    setHasIncremented(true)
    // 즉시 API 호출 (500ms 지연 제거)
    incrementView()

  }, [slug, hasIncremented])

  // 아이콘과 함께 표시하는 경우
  if (showIcon) {
    return (
      <div className="flex items-center gap-1">
        <Eye className="w-4 h-4" />
        <span>{viewCount}회 조회</span>
      </div>
    )
  }

  // 숫자만 표시하는 경우
  return <span>{viewCount}</span>
} 