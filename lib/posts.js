import { supabase } from './supabase'
import { dateUtils } from './utils'

// 포스트 관련 서비스 함수들
export const postsService = {
  // 모든 공개된 포스트 조회 (페이지네이션 포함)
  async getAllPosts(page = 1, limit = 12, searchTerm = null, categorySlug = null) {
    try {
      const offset = (page - 1) * limit
      
      let query = supabase
        .from('posts')
        .select(`
          *,
          categories:post_categories(
            category:categories(*)
          )
        `, { count: 'exact' })
        .eq('status', 'published')

      // 검색어가 있으면 제목에서 검색
      if (searchTerm && searchTerm.trim()) {
        query = query.ilike('title', `%${searchTerm.trim()}%`)
      }

      // 카테고리 필터가 있으면 적용
      if (categorySlug && categorySlug.trim()) {
        query = query.eq('categories.category.slug', categorySlug)
      }

      // 정렬 및 페이지네이션 적용
      const { data, error, count } = await query
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return { posts: [], totalPages: 0, currentPage: page, totalCount: 0, error }
      }

      // 데이터 후처리
      const formattedData = (data || []).map(post => ({
        ...post,
        categories: (post.categories || [])
          .map(rel => rel?.category)
          .filter(cat => cat && cat.id && cat.name && cat.slug)
          .map(cat => ({
            ...cat,
            color: cat.color || '#6b7280' // 기본 색상 설정
          })) || [],
        excerpt: post.excerpt && post.excerpt.trim() 
          ? post.excerpt 
          : utils.generateExcerpt(post.content || '', 150)
      }))

      const totalPages = Math.ceil((count || 0) / limit)
      
      return { 
        posts: formattedData, 
        totalPages, 
        currentPage: page, 
        totalCount: count || 0,
        error: null 
      }
      
    } catch (error) {
      return { posts: [], totalPages: 0, currentPage: page, totalCount: 0, error }
    }
  },

  // 특정 카테고리의 포스트 조회
  async getPostsByCategory(categorySlug, page = 1, limit = 12) {
    try {
      const offset = (page - 1) * limit

      const { data, error, count } = await supabase
        .from('posts')
        .select(`
          *,
          categories:post_categories!inner(
            category:categories!inner(*)
          )
        `, { count: 'exact' })
        .eq('status', 'published')
        .eq('categories.category.slug', categorySlug)
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return { posts: [], totalPages: 0, currentPage: page, error }
      }

      const formattedData = (data || []).map(post => ({
        ...post,
        categories: (post.categories || [])
          .map(rel => rel?.category)
          .filter(cat => cat && cat.id && cat.name && cat.slug)
          .map(cat => ({
            ...cat,
            color: cat.color || '#6b7280'
          })) || [],
        excerpt: post.excerpt && post.excerpt.trim() 
          ? post.excerpt 
          : utils.generateExcerpt(post.content || '', 150)
      }))

      const totalPages = Math.ceil((count || 0) / limit)
      
      return { posts: formattedData, totalPages, currentPage: page, error: null }
      
    } catch (error) {
      return { posts: [], totalPages: 0, currentPage: page, error }
    }
  },

  // 최근 포스트 조회 - 단일 쿼리로 최적화
  async getRecentPosts(limit = 5) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          categories:post_categories(
            category:categories(*)
          )
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit)

      if (error) {
        return { posts: [], error }
      }

      const formattedData = (data || []).map(post => ({
        ...post,
        categories: (post.categories || [])
          .map(rel => rel?.category)
          .filter(cat => cat && cat.id && cat.name && cat.slug)
          .map(cat => ({
            ...cat,
            color: cat.color || '#6b7280' // 기본 색상 설정
          })) || [],
        excerpt: post.excerpt && post.excerpt.trim() 
          ? post.excerpt 
          : utils.generateExcerpt(post.content || '', 150)
      }))

      return { posts: formattedData, error: null }
      
    } catch (error) {
      return { posts: [], error }
    }
  },

  // 포스트 검색 
  async searchPosts(searchTerm, page = 1, limit = 12) {
    try {
      const offset = (page - 1) * limit
      
      const { data, error, count } = await supabase
        .from('posts')
        .select(`
          *,
          categories:post_categories(
            category:categories(*)
          )
        `, { count: 'exact' })
        .eq('status', 'published')
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return { posts: [], totalPages: 0, currentPage: page, totalCount: 0, error }
      }

      // 데이터 후처리
      const formattedData = (data || []).map(post => ({
        ...post,
        categories: (post.categories || [])
          .map(rel => rel?.category)
          .filter(cat => cat && cat.id && cat.name && cat.slug)
          .map(cat => ({
            ...cat,
            color: cat.color || '#6b7280'
          })) || [],
        excerpt: post.excerpt && post.excerpt.trim() 
          ? post.excerpt 
          : utils.generateExcerpt(post.content || '', 150)
      }))

      const totalPages = Math.ceil((count || 0) / limit)
      
      return { 
        posts: formattedData, 
        totalPages, 
        currentPage: page,
        totalCount: count || 0,
        error: null 
      }
      
    } catch (error) {
      return { posts: [], totalPages: 0, currentPage: page, totalCount: 0, error }
    }
  },

  // 관리자용: 모든 포스트 조회 (상태 무관, 페이지네이션 포함)
  async getAllPostsForAdmin(page = 1, limit = 10, status = null, searchTerm = null) {
    try {
      const offset = (page - 1) * limit
      
      let query = supabase
        .from('posts')
        .select(`
          *,
          categories:post_categories(
            category:categories(*)
          )
        `, { count: 'exact' })

      // 상태 필터
      if (status && status !== 'all') {
        query = query.eq('status', status)
      }

      // 검색 필터
      if (searchTerm && searchTerm.trim()) {
        query = query.ilike('title', `%${searchTerm.trim()}%`)
      }

      // 작성일 기준으로 정렬 (최신순)
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return { posts: [], totalPages: 0, currentPage: page, totalCount: 0, error }
      }

      // 데이터 후처리
      const formattedData = (data || []).map(post => ({
        ...post,
        categories: (post.categories || [])
          .map(rel => rel?.category)
          .filter(cat => cat && cat.id && cat.name && cat.slug)
          .map(cat => ({
            ...cat,
            color: cat.color || '#6b7280'
          })) || []
      }))

      const totalPages = Math.ceil((count || 0) / limit)
      
      return { 
        posts: formattedData, 
        totalPages, 
        currentPage: page, 
        totalCount: count || 0,
        error: null 
      }
      
    } catch (error) {
      return { posts: [], totalPages: 0, currentPage: page, totalCount: 0, error }
    }
  },

  // 포스트 생성
  async createPost(postData) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { post: null, error: { message: '로그인이 필요합니다.' } }
    }

    try {
      // 사용자 프로필 정보 조회
      let authorName = user.email || 'Unknown Author'
      
      // user_metadata에서 이름 정보 확인
      if (user.user_metadata?.full_name) {
        authorName = user.user_metadata.full_name
      } else if (user.user_metadata?.name) {
        authorName = user.user_metadata.name
      }

      const { categoryIds, ...postDataWithoutCategoryIds } = postData
      
      // 한국 시간 기준으로 현재 시간 생성
      const koreanTime = dateUtils.getKoreanTime()
      
      // 1단계: 포스트 생성
      const newPost = {
        ...postDataWithoutCategoryIds,
        author_id: user.id,
        author_name: authorName,
        slug: utils.generateSlug(postData.title),
        published_at: postData.status === 'published' ? koreanTime : null,
        created_at: koreanTime,
        updated_at: koreanTime,
        view_count: 0,
        like_count: 0
      }

      const { data, error } = await supabase
        .from('posts')
        .insert([newPost])
        .select()

      if (error) {
        return { post: null, error }
      }

      if (!data || !data[0]) {
        return { post: null, error: { message: 'Post creation failed - no data returned' } }
      }

      const postId = data[0].id

      // 2단계: 카테고리 관계 생성
      if (categoryIds && categoryIds.length > 0) {
        const categoryRelations = categoryIds.map(categoryId => ({
          post_id: postId,
          category_id: categoryId
        }))

        const { error: categoryError } = await supabase
          .from('post_categories')
          .insert(categoryRelations)

        if (categoryError) {
          // 포스트는 생성되었지만 카테고리 연결 실패
          console.error('Category relation error:', categoryError)
        }
      }

      return { post: data[0], error: null }
      
    } catch (error) {
      return { post: null, error }
    }
  },

  // 포스트 수정 (작성자만)
  async updatePost(postId, postData) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: { message: '로그인이 필요합니다.' } }
    }

    // categoryIds를 제외한 포스트 데이터 준비
    const { categoryIds, ...postDataWithoutCategoryIds } = postData

    // 한국 시간 기준으로 현재 시간 생성
    const koreanTime = dateUtils.getKoreanTime()

    // 발행 상태 처리
    if (postDataWithoutCategoryIds.status === 'published') {
      // 발행 상태로 변경될 때마다 항상 현재 시간으로 published_at 설정
      postDataWithoutCategoryIds.published_at = koreanTime
    } else if (postDataWithoutCategoryIds.status === 'draft') {
      // 초안으로 변경 시 published_at을 null로 설정
      postDataWithoutCategoryIds.published_at = null
    }

    // 항상 updated_at은 현재 시간으로 업데이트
    postDataWithoutCategoryIds.updated_at = koreanTime

    const { data, error } = await supabase
      .from('posts')
      .update(postDataWithoutCategoryIds)
      .eq('id', postId)
      .eq('author_id', user.id) // 작성자만 수정 가능
      .select()
      .single()

    // 카테고리 관계 업데이트
    if (!error && categoryIds !== undefined) {
      // 기존 카테고리 관계 삭제
      await supabase
        .from('post_categories')
        .delete()
        .eq('post_id', postId)

      // 새 카테고리 관계 추가
      if (categoryIds.length > 0) {
        const categoryRelations = categoryIds.map(categoryId => ({
          post_id: postId,
          category_id: categoryId
        }))

        await supabase
          .from('post_categories')
          .insert(categoryRelations)
      }
    }

    return { post: data, error }
  },

  // 포스트 삭제 (작성자만)
  async deletePost(postId) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: { message: '로그인이 필요합니다.' } }
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('author_id', user.id) // 작성자만 삭제 가능

    return { error }
  },

  // Slug로 포스트 조회 - 단일 쿼리로 최적화
  async getPostBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          categories:post_categories(
            category:categories(*)
          )
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (error) {
        return { post: null, error }
      }

      const post = {
        ...data,
        categories: (data.categories || [])
          .map(rel => rel?.category)
          .filter(cat => cat && cat.id && cat.name && cat.slug)
          .map(cat => ({
            ...cat,
            color: cat.color || '#6b7280' // 기본 색상 설정
          })) || [],
        excerpt: data.excerpt && data.excerpt.trim() 
          ? data.excerpt 
          : utils.generateExcerpt(data.content || '', 150)
      }

      return { post, error: null }
      
    } catch (error) {
      return { post: null, error }
    }
  },

  // ID로 포스트 조회 (편집용)
  async getPostById(postId) {
    try {
      // 1단계: 포스트 조회
      const { data: posts, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .limit(1)

      if (postError) {
        return { post: null, error: postError }
      }

      if (!posts || posts.length === 0) {
        return { post: null, error: { message: 'Post not found' } }
      }

      const post = posts[0]
      let categories = []

      // 2단계: 카테고리 정보 조회
      try {
        const { data: categoryRelations, error: categoryError } = await supabase
          .from('post_categories')
          .select(`
            category_id,
            categories (
              id,
              name,
              slug,
              color
            )
          `)
          .eq('post_id', post.id)

        if (!categoryError && categoryRelations) {
          categories = categoryRelations.map(rel => rel.categories).filter(Boolean)
        } else {
          categories = []
        }
      } catch (categoryError) {
        categories = []
      }

      const postWithCategories = {
        ...post,
        categories,
        categoryIds: categories.map(cat => cat.id), // 편집용으로 카테고리 ID 배열 추가
        // excerpt가 없거나 비어있으면 content에서 생성
        excerpt: post.excerpt && post.excerpt.trim() 
          ? post.excerpt 
          : utils.generateExcerpt(post.content || '', 150)
      }

      return { post: postWithCategories, error: null }
      
    } catch (error) {
      return { post: null, error }
    }
  },
}

// 카테고리 관련 서비스
export const categoriesService = {
  // 모든 카테고리 조회
  async getAllCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    return { categories: data || [], error }
  },

  // 카테고리별 포스트 수 조회
  async getCategoriesWithPostCount() {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        post_count:post_categories(count)
      `)

    return { categories: data || [], error }
  }
}

// 유틸리티 함수들
export const utils = {
  // 읽기 시간 계산 (대략적)
  calculateReadingTime(content) {
    const wordsPerMinute = 200 // 한국어 기준
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  },

  generateExcerpt(content, maxLength = 150) {
    if (!content) return ''
    
    let plainText = content
      // HTML 태그 제거
      .replace(/<[^>]*>/g, '')
      // 마크다운 헤더 제거 (# ## ### 등)
      .replace(/^#{1,6}\s+/gm, '')
      // 마크다운 굵은 글씨 제거 (**text** 또는 __text__)
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      // 마크다운 이탤릭 제거 (*text* 또는 _text_)
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      // 마크다운 인라인 코드 제거 (`code`)
      .replace(/`([^`]+)`/g, '$1')
      // 마크다운 코드 블럭 제거 (```code```)
      .replace(/```[\s\S]*?```/g, '')
      // 마크다운 링크 제거 [text](url)
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // 마크다운 이미지 제거 ![alt](url)
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
      // 마크다운 인용문 제거 (> text)
      .replace(/^>\s*/gm, '')
      // 마크다운 리스트 제거 (- text, * text, + text)
      .replace(/^[\s]*[-\*\+]\s+/gm, '')
      // 마크다운 순서 리스트 제거 (1. text)
      .replace(/^[\s]*\d+\.\s+/gm, '')
      // 구분선 제거 (--- 또는 ***)
      .replace(/^[-\*]{3,}$/gm, '')
      // 여러 개의 공백과 줄바꿈을 하나로
      .replace(/\s+/g, ' ')
      .trim()

    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...'
      : plainText
  },

  // 태그 문자열을 배열로 변환
  parseTagsString(tagsString) {
    return tagsString
      ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag)
      : []
  },

  // 태그 배열을 문자열로 변환
  stringifyTags(tagsArray) {
    return Array.isArray(tagsArray) ? tagsArray.join(', ') : ''
  },

  // 슬러그 생성
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }
} 