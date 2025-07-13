'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Heart, Bookmark, Link2 } from 'lucide-react'
import { toast } from 'sonner'

interface ShareButtonProps {
  initialLikeCount?: number
  postSlug: string
}

export default function ShareButton({ initialLikeCount = 0, postSlug }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLoading, setIsLoading] = useState(false)

  // 컴포넌트 마운트 시 좋아요 상태 확인
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const response = await fetch(`/api/posts/${postSlug}/like`)
        if (response.ok) {
          const data = await response.json()
          setIsLiked(data.liked)
          setLikeCount(data.like_count)
        }
      } catch (error) {
        console.error('좋아요 상태 확인 실패:', error)
      }
    }

    fetchLikeStatus()
  }, [postSlug])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      toast.success("링크가 복사되었습니다!")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
      toast.error("링크 복사에 실패했습니다.")
    }
  }

  const handleLike = async () => {
    if (isLoading) return

    setIsLoading(true)
    
    // 낙관적 업데이트
    const previousLiked = isLiked
    const previousCount = likeCount
    
    setIsLiked(!isLiked)
    setLikeCount(prev => !isLiked ? prev + 1 : prev - 1)
    
    try {
      const response = await fetch(`/api/posts/${postSlug}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        
        // 서버 응답으로 상태 업데이트
        setIsLiked(data.liked)
        setLikeCount(data.like_count)
        
        // 피드백 제공
        if (data.liked) {
          toast.success("좋아요를 눌렀습니다! ❤️")
        } else {
          toast.info("좋아요를 취소했습니다.")
        }
      } else {
        // 실패 시 이전 상태로 되돌리기
        setIsLiked(previousLiked)
        setLikeCount(previousCount)
        toast.error("좋아요 업데이트에 실패했습니다.")
      }
    } catch (error) {
      // 실패 시 이전 상태로 되돌리기
      setIsLiked(previousLiked)
      setLikeCount(previousCount)
      toast.error("좋아요 업데이트에 실패했습니다.")
      console.error('좋아요 업데이트 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookmark = () => {
    // 브라우저 북마크 추가 안내
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const shortcut = isMac ? 'Cmd+D' : 'Ctrl+D'
    
    toast.info(
      `브라우저 북마크에 추가하려면 ${shortcut}를 누르세요!`,
      {
        duration: 5000,
        action: {
          label: '닫기',
          onClick: () => {}
        }
      }
    )
  }

  return (
    <div className="flex items-center gap-2 md:gap-3">
      {/* 좋아요 버튼 */}
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleLike}
        disabled={isLoading}
        className={`transition-all duration-200 ${
          isLiked 
            ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
            : 'hover:bg-red-50 hover:border-red-200'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Heart 
          className={`mr-1 md:mr-2 h-4 w-4 transition-all duration-200 ${
            isLiked ? 'fill-red-600 text-red-600 scale-110' : ''
          }`} 
        />
        <span className="font-medium text-xs md:text-sm">
          <span className="hidden sm:inline">
            {likeCount > 0 ? `좋아요 ${likeCount}` : '좋아요'}
          </span>
          <span className="sm:hidden">
            {likeCount > 0 ? likeCount : '♡'}
          </span>
        </span>
      </Button>

      {/* 북마크 버튼 */}
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleBookmark}
        className="transition-all duration-200 hover:bg-blue-50 hover:border-blue-200"
      >
        <Bookmark className="mr-1 md:mr-2 h-4 w-4" />
        <span className="font-medium text-xs md:text-sm">
          <span className="hidden sm:inline">북마크</span>
          <span className="sm:hidden">★</span>
        </span>
      </Button>

      {/* 링크 복사 버튼 */}
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleCopyLink}
        className="transition-all duration-200 hover:bg-gray-50 hover:border-gray-300"
      >
        <Link2 className="mr-1 md:mr-2 h-4 w-4" />
        <span className="font-medium text-xs md:text-sm">
          <span className="hidden sm:inline">
            {copied ? '복사됨!' : '링크 복사'}
          </span>
          <span className="sm:hidden">
            {copied ? '✓' : '🔗'}
          </span>
        </span>
      </Button>
    </div>
  )
} 