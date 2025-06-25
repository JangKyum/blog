import { supabase } from './supabase'

// 포스트 관련 서비스 함수들
export const postsService = {
  // 모든 공개된 포스트 조회 (페이지네이션 포함)
  async getAllPosts(page = 1, limit = 10, category = null) {
    let query = supabase
      .from('posts')
      .select(`
        *,
        categories:post_categories(
          category:categories(*)
        )
      `, { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    const { data, error, count } = await query

    // 카테고리 필터링 (서버에서 할 수 없으므로 클라이언트에서 처리)
    let filteredData = data || []
    if (category && data) {
      filteredData = data.filter(post => 
        post.categories?.some(rel => rel.category?.slug === category)
      )
    }

    // 카테고리 데이터 정리 및 excerpt 자동 생성
    const formattedData = filteredData.map(post => ({
      ...post,
      categories: post.categories?.map(rel => rel.category) || [],
      // excerpt가 없거나 비어있으면 content에서 생성
      excerpt: post.excerpt && post.excerpt.trim() 
        ? post.excerpt 
        : utils.generateExcerpt(post.content || '', 150)
    }))

    return {
      posts: formattedData,
      error,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    }
  },

  // 최근 포스트 조회
  async getRecentPosts(limit = 5) {
    try {
      // 1단계: 기본 포스트 조회
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit)

      if (postsError) {
        return { posts: [], error: postsError }
      }

      if (!posts || posts.length === 0) {
        return { posts: [], error: null }
      }

      // 2단계: 각 포스트에 대해 카테고리 정보 추가
      const postsWithCategories = await Promise.all(
        posts.map(async (post) => {
          let categories = []
          
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
              // 백업 방법: 더 단순한 카테고리 조회
              const { data: simpleCategories } = await supabase
                .from('post_categories')
                .select('category_id')
                .eq('post_id', post.id)
              
              if (simpleCategories && simpleCategories.length > 0) {
                const categoryIds = simpleCategories.map(rel => rel.category_id)
                const { data: categoryDetails } = await supabase
                  .from('categories')
                  .select('*')
                  .in('id', categoryIds)
                
                categories = categoryDetails || []
              }
            }
          } catch (categoryError) {
            categories = []
          }

          return {
            ...post,
            categories,
            // excerpt가 없거나 비어있으면 content에서 생성
            excerpt: post.excerpt && post.excerpt.trim() 
              ? post.excerpt 
              : utils.generateExcerpt(post.content || '', 150)
          }
        })
      )

      return { posts: postsWithCategories, error: null }
      
    } catch (error) {
      return { posts: [], error }
    }
  },

  // Slug로 포스트 조회
  async getPostBySlug(slug) {
    try {
      // 1단계: Slug로 포스트 조회
      const { data: posts, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .limit(1)

      if (postError) {
        return { post: null, error: postError }
      }

      if (!posts || posts.length === 0) {
        // 모든 포스트에서 찾아보기 (디버깅용)
        const { data: allPosts } = await supabase
          .from('posts')
          .select('*')
          .eq('slug', slug)
          .limit(1)
        
        if (!allPosts || allPosts.length === 0) {
          return { post: null, error: { message: 'Post not found' } }
        }
        
        return { post: null, error: { message: 'Post not published' } }
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
          // 백업 방법
          const { data: simpleCategories } = await supabase
            .from('post_categories')
            .select('category_id')
            .eq('post_id', post.id)
          
          if (simpleCategories && simpleCategories.length > 0) {
            const categoryIds = simpleCategories.map(rel => rel.category_id)
            const { data: categoryDetails } = await supabase
              .from('categories')
              .select('*')
              .in('id', categoryIds)
            
            categories = categoryDetails || []
          }
        }
      } catch (categoryError) {
        categories = []
      }

      // 3단계: 조회수 증가
      try {
        await supabase
          .from('posts')
          .update({ view_count: (post.view_count || 0) + 1 })
          .eq('id', post.id)
      } catch (viewError) {
        // 조회수 업데이트 실패는 치명적이지 않음
      }

      const postWithCategories = {
        ...post,
        categories,
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
      
      // 1단계: 포스트 생성
      const newPost = {
        ...postDataWithoutCategoryIds,
        author_id: user.id,
        author_name: authorName, // author_name 추가
        slug: utils.generateSlug(postData.title),
        published_at: postData.status === 'published' ? new Date().toISOString() : null,
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

      // 2단계: 카테고리 연결
      if (categoryIds && categoryIds.length > 0) {
        const validCategoryIds = categoryIds
          .map(id => String(id))
          .filter(id => id && id.trim() !== '')

        if (validCategoryIds.length > 0) {
          const categoryRelations = validCategoryIds.map(categoryId => ({
            post_id: data[0].id,
            category_id: categoryId
          }))

          let successCount = 0
          let errorCount = 0

          // 각 카테고리를 개별적으로 삽입
          for (const relation of categoryRelations) {
            try {
              const { data: relationData, error: relationError } = await supabase
                .from('post_categories')
                .insert([relation])
                .select()

              if (relationError) {
                errorCount++
                if (relationError.code === '42501' || relationError.message?.includes('permission')) {
                  console.error('❌ 데이터베이스 권한 문제: post_categories 테이블에 INSERT 권한이 없습니다.')
                  console.error('해결 방법: Supabase Dashboard에서 fix-permissions.sql 실행')
                  break
                }
              } else {
                successCount++
              }
            } catch (err) {
              errorCount++
              if (err.message?.includes('403') || err.message?.includes('Forbidden')) {
                console.error('❌ 403 Forbidden: 카테고리 저장 권한이 없습니다.')
                console.error('📝 해결 방법:')
                console.error('1. Supabase Dashboard → SQL Editor')
                console.error('2. fix-permissions.sql 파일 내용 실행')
                console.error('3. 또는 임시로 temp-disable-rls.sql 실행')
                break
              }
            }
          }

          if (errorCount === categoryRelations.length) {
            console.warn('포스트는 생성되었지만 카테고리 연결에 완전히 실패했습니다.')
          } else if (errorCount > 0) {
            console.warn('포스트는 생성되었지만 일부 카테고리 연결에 실패했습니다.')
          }
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

    // 발행 상태가 변경될 때 published_at 업데이트
    if (postDataWithoutCategoryIds.status === 'published' && !postDataWithoutCategoryIds.published_at) {
      postDataWithoutCategoryIds.published_at = new Date().toISOString()
    }

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

  // 관리자용: 모든 포스트 조회 (초안 포함)
  async getAllPostsForAdmin(page = 1, limit = 10, status = null) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: { message: '로그인이 필요합니다.' } }
    }

    let query = supabase
      .from('posts')
      .select(`
        *,
        categories:post_categories(
          category:categories(*)
        )
      `)
      .eq('author_id', user.id)
      .order('updated_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    // excerpt 자동 생성
    const formattedData = (data || []).map(post => ({
      ...post,
      categories: post.categories?.map(rel => rel.category) || [],
      // excerpt가 없거나 비어있으면 content에서 생성
      excerpt: post.excerpt && post.excerpt.trim() 
        ? post.excerpt 
        : utils.generateExcerpt(post.content || '', 150)
    }))

    return {
      posts: formattedData,
      error,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    }
  },

  // 검색 기능
  async searchPosts(searchTerm, page = 1, limit = 10) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        categories:post_categories(
          category:categories(*)
        )
      `)
      .eq('status', 'published')
      .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`)
      .order('published_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    // 카테고리 데이터 정리 및 excerpt 자동 생성
    const formattedData = (data || []).map(post => ({
      ...post,
      categories: post.categories?.map(rel => rel.category) || [],
      // excerpt가 없거나 비어있으면 content에서 생성
      excerpt: post.excerpt && post.excerpt.trim() 
        ? post.excerpt 
        : utils.generateExcerpt(post.content || '', 150)
    }))

    return { posts: formattedData, error }
  }
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

  // 요약 생성
  generateExcerpt(content, maxLength = 150) {
    const plainText = content.replace(/<[^>]*>/g, '').trim()
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