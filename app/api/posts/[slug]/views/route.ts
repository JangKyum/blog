import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // 1. 포스트 조회
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('id, view_count, title')
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

    // 2. 조회수 증가
    const newViewCount = (post.view_count || 0) + 1

    const { error: updateError } = await supabase
      .from('posts')
      .update({ view_count: newViewCount })
      .eq('id', post.id)

    if (updateError) {
      console.error('조회수 업데이트 오류:', updateError)
      return NextResponse.json(
        { error: '조회수 업데이트에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 3. 관련 페이지 캐시 무효화
    try {
      revalidatePath('/')
      revalidatePath('/articles')
      revalidatePath('/admin')
      revalidatePath('/admin/posts')
    } catch (revalidateError) {
      console.error('Cache revalidation error:', revalidateError)
      // 캐시 무효화 실패는 치명적이지 않으므로 계속 진행
    }

    return NextResponse.json({ 
      success: true, 
      view_count: newViewCount,
      post_id: post.id
    })

  } catch (error) {
    console.error('조회수 증가 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 