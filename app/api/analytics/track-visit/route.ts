import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// 클라이언트 IP 주소 추출 함수
function getClientIP(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xRealIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }
  
  return cfConnectingIp || xRealIp || '127.0.0.1'
}

export async function POST(request: NextRequest) {
  try {
    const { pathname, referrer } = await request.json()
    
    if (!pathname) {
      return NextResponse.json({ 
        error: 'pathname is required' 
      }, { status: 400 })
    }
    
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const today = new Date().toISOString().split('T')[0]
    
    // UPSERT를 통한 방문 기록
    const { data, error } = await supabase
      .from('site_visits')
      .upsert({
        ip_address: clientIP,
        pathname: pathname,
        referrer: referrer || null,
        user_agent: userAgent,
        visit_date: today,
        visit_count: 1
      }, {
        onConflict: 'ip_address,pathname,visit_date',
        ignoreDuplicates: false
      })
      .select()
    
    if (error) {
      console.error('방문 기록 오류:', error)
      return NextResponse.json({ 
        error: '방문 기록 실패',
        details: error.message 
      }, { status: 500 })
    }
    
    // 기존 기록이 있으면 visit_count 증가
    if (data && data.length > 0) {
      const visitRecord = data[0]
      
      const { data: currentRecord } = await supabase
        .from('site_visits')
        .select('visit_count')
        .eq('id', visitRecord.id)
        .single()
      
      if (currentRecord && currentRecord.visit_count > 1) {
        await supabase
          .from('site_visits')
          .update({ 
            visit_count: currentRecord.visit_count + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', visitRecord.id)
      }
    }
    
    return NextResponse.json({ 
      success: true,
      result: data
    })
  } catch (error) {
    console.error('방문 추적 오류:', error)
    
    return NextResponse.json({ 
      error: '서버 오류',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 