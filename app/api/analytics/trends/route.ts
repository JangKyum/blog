import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

interface TrendData {
  current_period_visits: string
  previous_period_visits: string
  growth_rate: string
  period_days: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const currentDays = parseInt(searchParams.get('current_days') || '7')
    const previousDays = parseInt(searchParams.get('previous_days') || '7')

    const { data, error } = await supabase
      .rpc('get_visit_trends', { 
        p_current_days: currentDays, 
        p_previous_days: previousDays 
      })

    if (error) {
      console.error('트렌드 분석 조회 오류:', error)
      return NextResponse.json({ error: '트렌드 분석 조회 실패' }, { status: 500 })
    }

    const trendData = data as TrendData

    return NextResponse.json({
      currentPeriodVisits: parseInt(trendData.current_period_visits),
      previousPeriodVisits: parseInt(trendData.previous_period_visits),
      growthRate: parseFloat(trendData.growth_rate),
      periodDays: trendData.period_days,
      trend: parseFloat(trendData.growth_rate) > 0 ? 'up' : parseFloat(trendData.growth_rate) < 0 ? 'down' : 'stable'
    })
  } catch (error) {
    console.error('트렌드 분석 조회 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
} 