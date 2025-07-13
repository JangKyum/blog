import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

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
  
  // 개발 환경에서는 기본값 사용
  return '127.0.0.1'
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // 1. 포스트 조회
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, like_count')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (fetchError) {
      console.error('포스트 조회 오류:', fetchError)
      return NextResponse.json(
        { error: '포스트를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (!post) {
      return NextResponse.json(
        { error: '포스트를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 2. 클라이언트 정보 추출
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    // 3. 좋아요 토글 (Supabase 함수 호출)
    const { data: result, error: toggleError } = await supabase
      .rpc('toggle_post_like', {
        p_post_id: post.id,
        p_user_ip: clientIP,
        p_user_agent: userAgent
      })

    if (toggleError) {
      console.error('좋아요 토글 오류:', toggleError)
      return NextResponse.json(
        { error: '좋아요 처리에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 4. 관련 페이지 캐시 무효화
    try {
      revalidatePath('/')
      revalidatePath('/articles')
      revalidatePath('/admin')
      revalidatePath('/admin/posts')
      revalidatePath(`/posts/${slug}`)
    } catch (revalidateError) {
      console.error('Cache revalidation error:', revalidateError)
      // 캐시 무효화 실패는 치명적이지 않으므로 계속 진행
    }

    return NextResponse.json({
      success: true,
      liked: result.liked,
      like_count: result.like_count,
      action: result.action,
      post_id: post.id
    })

  } catch (error) {
    console.error('좋아요 처리 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 좋아요 상태 조회 API
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // 1. 포스트 조회
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('id, like_count')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (fetchError || !post) {
      return NextResponse.json(
        { error: '포스트를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 2. 클라이언트 IP 추출
    const clientIP = getClientIP(request)

    // 3. 좋아요 상태 확인
    const { data: isLiked, error: checkError } = await supabase
      .rpc('check_user_liked_post', {
        p_post_id: post.id,
        p_user_ip: clientIP
      })

    if (checkError) {
      console.error('좋아요 상태 확인 오류:', checkError)
      return NextResponse.json(
        { error: '좋아요 상태 확인에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      liked: isLiked || false,
      like_count: post.like_count || 0,
      post_id: post.id
    })

  } catch (error) {
    console.error('좋아요 상태 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 