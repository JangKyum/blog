import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

interface PopularPageStats {
  pathname: string
  total_visits: string
  unique_visitors: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const limit = parseInt(searchParams.get('limit') || '10')

    const { data, error } = await supabase
      .rpc('get_popular_pages', { 
        p_days: days, 
        p_limit: limit 
      })

    if (error) {
      console.error('인기 페이지 조회 오류:', error)
      return NextResponse.json({ error: '인기 페이지 조회 실패' }, { status: 500 })
    }

    // 데이터 변환
    const result = (data as PopularPageStats[])?.map((item: PopularPageStats) => ({
      pathname: item.pathname,
      totalVisits: parseInt(item.total_visits),
      uniqueVisitors: parseInt(item.unique_visitors)
    })) || []

    return NextResponse.json({
      pages: result,
      period: `${days}일`,
      totalPages: result.length
    })
  } catch (error) {
    console.error('인기 페이지 조회 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
} 