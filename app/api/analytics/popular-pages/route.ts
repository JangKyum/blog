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

    // 인기 페이지 데이터 조회
    const { data, error } = await supabase
      .rpc('get_popular_pages', { 
        p_days: days, 
        p_limit: limit 
      })

    if (error) {
      console.error('인기 페이지 조회 오류:', error)
      return NextResponse.json({ error: '인기 페이지 조회 실패' }, { status: 500 })
    }

    // 포스트 제목 매핑 및 필터링
    const result = await Promise.all(
      (data as PopularPageStats[])?.map(async (item: PopularPageStats) => {
        const pathname = item.pathname
        
        // 포스트가 아닌 페이지는 제외
        if (!pathname.startsWith('/posts/')) {
          return null
        }

        // 포스트 제목 가져오기
        const slug = pathname.replace('/posts/', '')
        let title = pathname

        if (slug) {
          try {
            const { data: post } = await supabase
              .from('posts')
              .select('title')
              .eq('slug', decodeURIComponent(slug))
              .eq('status', 'published')
              .single()
            
            if (post?.title) {
              title = post.title
            }
          } catch (err) {
            console.error('포스트 제목 가져오기 실패:', err)
          }
        }

        return {
          pathname: item.pathname,
          totalVisits: parseInt(item.total_visits),
          uniqueVisitors: parseInt(item.unique_visitors),
          title: title
        }
      }) || []
    )

    // 포스트만 필터링
    const filteredResult = result.filter(item => item !== null)

    return NextResponse.json({
      pages: filteredResult,
      period: `${days}일`,
      totalPages: filteredResult.length
    })
  } catch (error) {
    console.error('인기 페이지 조회 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
} 