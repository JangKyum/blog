import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// 클라이언트 IP 주소 추출 함수 (Vercel 배포 환경 최적화)
function getClientIP(request: NextRequest): string {
  // Vercel에서 권장하는 IP 추출 순서
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xRealIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip') // Cloudflare
  const xClientIp = request.headers.get('x-client-ip')
  
  console.log('IP Headers:', {
    xForwardedFor,
    xRealIp,
    cfConnectingIp,
    xClientIp
  })
  
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',').map(ip => ip.trim())
    return ips[0]
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp
  }
  
  if (xRealIp) {
    return xRealIp
  }
  
  if (xClientIp) {
    return xClientIp
  }
  
  return '127.0.0.1' // 기본값
}

export async function POST(request: NextRequest) {
  console.log('=== 방문 추적 API 시작 ===')
  
  try {
    // 환경변수 체크
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      supabaseUrlPrefix: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'MISSING'
    })
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase 환경변수 누락')
      return NextResponse.json({ 
        error: 'Supabase 환경변수가 설정되지 않았습니다' 
      }, { status: 500 })
    }
    
    // 요청 본문 파싱
    let requestBody
    try {
      requestBody = await request.json()
      console.log('Request body:', requestBody)
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError)
      return NextResponse.json({ 
        error: 'Invalid JSON in request body' 
      }, { status: 400 })
    }
    
    const { pathname, referrer } = requestBody
    
    if (!pathname) {
      console.error('pathname이 누락됨')
      return NextResponse.json({ 
        error: 'pathname is required' 
      }, { status: 400 })
    }
    
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    
    console.log('Visit tracking data:', {
      clientIP,
      pathname,
      referrer,
      userAgent: userAgent.substring(0, 50) + '...'
    })
    
    // IP 주소 유효성 검사
    if (!clientIP || clientIP === '127.0.0.1') {
      console.warn('IP 주소를 제대로 추출하지 못함, 기본값 사용')
    }
    
    // Supabase 함수 호출
    console.log('Calling Supabase record_visit function...')
    const { data, error } = await supabase
      .rpc('record_visit', {
        p_ip_address: clientIP,
        p_pathname: pathname,
        p_referrer: referrer || null,
        p_user_agent: userAgent
      })

    if (error) {
      console.error('Supabase RPC 오류:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      
      // 함수가 존재하지 않는 경우
      if (error.message?.includes('function') && error.message?.includes('does not exist')) {
        return NextResponse.json({ 
          error: 'record_visit 함수가 데이터베이스에 생성되지 않았습니다. SQL 스크립트를 실행해주세요.' 
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        error: '방문 기록 실패',
        details: error.message 
      }, { status: 500 })
    }

    console.log('방문 기록 성공:', data)
    
    return NextResponse.json({ 
      success: true,
      result: data
    })
  } catch (error) {
    console.error('방문 추적 전체 오류:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'UnknownError'
    })
    
    return NextResponse.json({ 
      error: '서버 오류',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 