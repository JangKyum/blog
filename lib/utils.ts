import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

// 서울 시간대 기반 날짜 유틸리티
export const dateUtils = {
  // 한국 시간대로 현재 시간 반환 (ISO 8601 형식)
  getKoreanTime(): string {
    const now = new Date()
    
    // 한국 시간대(UTC+9)로 변환
    const koreanOffset = 9 * 60 // 9시간을 분으로 변환
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
    const koreanTime = new Date(utc + (koreanOffset * 60000))
    
    // ISO 형식으로 반환 (YYYY-MM-DDTHH:mm:ss.sssZ)
    return koreanTime.toISOString()
  },

  // 날짜를 한국 시간대로 변환하고 포맷팅
  formatKoreanDate(dateString: string | null, options: Intl.DateTimeFormatOptions = {}): string {
    if (!dateString) return '--'
    
    try {
      const date = new Date(dateString)
      
      const defaultOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        ...options
      }
      
      return date.toLocaleDateString('ko-KR', defaultOptions)
    } catch (error) {
      return '--'
    }
  },

  // 날짜와 시간을 한국 시간대로 포맷팅
  formatKoreanDateTime(dateString: string | null, options: Intl.DateTimeFormatOptions = {}): string {
    if (!dateString) return '--'
    
    try {
      const date = new Date(dateString)
      
      const defaultOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        ...options
      }
      
      return date.toLocaleString('ko-KR', defaultOptions)
    } catch (error) {
      return '--'
    }
  },

  // 간단한 날짜 포맷 (MM/DD)
  formatSimpleDate(dateString: string | null): string {
    if (!dateString) return '--'
    
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR', {
        timeZone: 'Asia/Seoul',
        month: '2-digit',
        day: '2-digit'
      })
    } catch (error) {
      return '--'
    }
  },

  // 상대적 시간 표시를 위한 helper
  formatRelativeTime(dateString: string | null): string {
    if (!dateString) return '--'
    
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInMs = now.getTime() - date.getTime()
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
      
      if (diffInDays === 0) {
        return '오늘'
      } else if (diffInDays === 1) {
        return '어제'
      } else if (diffInDays < 7) {
        return `${diffInDays}일 전`
      } else {
        return this.formatSimpleDate(dateString)
      }
    } catch (error) {
      return '--'
    }
  }
}
