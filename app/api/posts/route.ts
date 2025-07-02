import { NextRequest, NextResponse } from 'next/server'
// @ts-ignore - JS 파일 import
import { postsService } from '@/lib/posts'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const search = searchParams.get('search') || ''
    const categoryParam = searchParams.get('category')
    const category = categoryParam && categoryParam.trim() !== '' ? categoryParam : undefined

    // getAllPosts를 사용하여 검색과 카테고리 필터링을 모두 처리
    const result = await (postsService as any).getAllPosts(
      page, 
      12, 
      search ? search : undefined, 
      category ? category : undefined
    )

    return NextResponse.json({
      posts: result.posts,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('API 오류:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 