import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// 클라이언트 IP 주소 추출 함수
function getClientIP(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xRealIp = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('remote-addr')
  
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }
  
  if (xRealIp) {
    return xRealIp
  }
  
  if (remoteAddr) {
    return remoteAddr
  }
  
  return '127.0.0.1' // 기본값
}

export async function POST(request: NextRequest) {
  try {
    const { pathname, referrer } = await request.json()
    
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    
    // 새로운 SQL 함수를 사용하여 방문 기록
    const { data, error } = await supabase
      .rpc('record_visit', {
        p_ip_address: clientIP,
        p_pathname: pathname,
        p_referrer: referrer,
        p_user_agent: userAgent
      })

    if (error) {
      console.error('방문 기록 오류:', error)
      return NextResponse.json({ error: '방문 기록 실패' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      result: data
    })
  } catch (error) {
    console.error('방문 추적 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
} 