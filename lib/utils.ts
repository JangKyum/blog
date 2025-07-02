import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

// 서울 시간대 기반 날짜 유틸리티
export const dateUtils = {
  // 한국 시간대로 현재 시간 반환
  getKoreanTime(): string {
    return new Date().toLocaleString("en-CA", {
      timeZone: "Asia/Seoul"
    }).replace(", ", "T") + "Z"
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
