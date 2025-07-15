import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

interface DailyVisitStats {
  visit_date: string
  total_visits: string
  unique_visitors: string
  page_views: string
}

interface WeeklyVisitStats {
  week_start: string
  total_visits: string
  unique_visitors: string
  page_views: string
}

interface MonthlyVisitStats {
  month_start: string
  total_visits: string
  unique_visitors: string
  page_views: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'daily'
    const limit = parseInt(searchParams.get('limit') || '30')
    const overall = searchParams.get('overall') === 'true'

    // 전체 통계 조회
    if (overall) {
      const { data, error } = await supabase
        .rpc('get_overall_visit_stats')

      if (error) {
        console.error('전체 통계 조회 오류:', error)
        return NextResponse.json({ error: '전체 통계 조회 실패' }, { status: 500 })
      }

      return NextResponse.json({
        totalVisits: parseInt(data.total_visits),
        uniqueVisitors: parseInt(data.unique_visitors),
        todayVisits: parseInt(data.today_visits),
        todayUniqueVisitors: parseInt(data.today_unique_visitors),
        lastUpdated: data.last_updated
      })
    }

    // 기간별 데이터 조회
    if (period === 'daily') {
      const { data, error } = await supabase
        .rpc('get_daily_visit_stats', { p_days: limit })

      if (error) {
        console.error('일별 통계 조회 오류:', error)
        return NextResponse.json({ error: '일별 통계 조회 실패' }, { status: 500 })
      }

      // 데이터 변환 - 컴포넌트에서 기대하는 형태로
      const result = (data as DailyVisitStats[])?.map((item: DailyVisitStats) => ({
        visitDate: item.visit_date,
        totalVisits: parseInt(item.total_visits),
        uniqueVisitors: parseInt(item.unique_visitors),
        pageViews: parseInt(item.page_views)
      })) || []

      return NextResponse.json({
        period: 'daily',
        data: result,
        totalVisits: result.reduce((sum, item) => sum + item.totalVisits, 0),
        uniqueVisitors: result.reduce((sum, item) => sum + item.uniqueVisitors, 0)
      })
    }

    if (period === 'weekly') {
      const { data, error } = await supabase
        .rpc('get_weekly_visit_stats', { p_weeks: Math.ceil(limit / 7) })

      if (error) {
        console.error('주별 통계 조회 오류:', error)
        return NextResponse.json({ error: '주별 통계 조회 실패' }, { status: 500 })
      }

      // 데이터 변환
      const result = (data as WeeklyVisitStats[])?.map((item: WeeklyVisitStats) => ({
        weekStart: item.week_start,
        totalVisits: parseInt(item.total_visits),
        uniqueVisitors: parseInt(item.unique_visitors),
        pageViews: parseInt(item.page_views)
      })) || []

      return NextResponse.json({
        period: 'weekly',
        data: result,
        totalVisits: result.reduce((sum, item) => sum + item.totalVisits, 0),
        uniqueVisitors: result.reduce((sum, item) => sum + item.uniqueVisitors, 0)
      })
    }

    if (period === 'monthly') {
      const { data, error } = await supabase
        .rpc('get_monthly_visit_stats', { p_months: Math.ceil(limit / 30) })

      if (error) {
        console.error('월별 통계 조회 오류:', error)
        return NextResponse.json({ error: '월별 통계 조회 실패' }, { status: 500 })
      }

      // 데이터 변환
      const result = (data as MonthlyVisitStats[])?.map((item: MonthlyVisitStats) => ({
        monthStart: item.month_start,
        totalVisits: parseInt(item.total_visits),
        uniqueVisitors: parseInt(item.unique_visitors),
        pageViews: parseInt(item.page_views)
      })) || []

      return NextResponse.json({
        period: 'monthly',
        data: result,
        totalVisits: result.reduce((sum, item) => sum + item.totalVisits, 0),
        uniqueVisitors: result.reduce((sum, item) => sum + item.uniqueVisitors, 0)
      })
    }

    return NextResponse.json({ error: '잘못된 기간 파라미터' }, { status: 400 })
  } catch (error) {
    console.error('통계 조회 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
} 