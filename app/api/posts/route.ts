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

    let posts, totalCount

    if (search) {
      const searchResult = await postsService.searchPosts(search, page, 9)
      posts = searchResult.posts
      totalCount = searchResult.totalCount
    } else {
      const allPostsResult = await postsService.getAllPosts(page, 9, category as any)
      posts = allPostsResult.posts
      totalCount = allPostsResult.totalCount
    }

    const totalPages = Math.ceil(totalCount / 9)

    return NextResponse.json({
      posts,
      totalCount,
      totalPages,
      currentPage: page
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