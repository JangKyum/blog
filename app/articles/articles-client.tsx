"use client"

import { useState, useEffect, useMemo, memo } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Search, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { postsService, categoriesService, utils } from "@/lib/posts"
import { LoadingSpinner } from "@/components/loading-spinner"
import { dateUtils } from "@/lib/utils"

// 타입 정의
interface Category {
  id: string
  name: string
  slug: string
  color: string
}

interface Post {
  id: string
  title: string
  excerpt: string
  slug: string
  author_name: string
  published_at: string
  reading_time: number
  view_count: number
  categories: Category[]
}

interface ArticlesClientProps {
  initialPosts: Post[]
  categories: Category[]
  totalCount: number
  totalPages: number
  currentPage: number
  searchTerm?: string
  selectedCategory?: string
}

// 안전한 색상 처리 함수
function getSafeColor(color: string | null | undefined): string {
  if (!color || color.trim() === '') {
    return '#6b7280' // gray-500 기본색
  }
  return color
}

// 안전한 날짜 포맷팅 함수 - 한국 시간대 적용
function formatDate(dateString: string): string {
  return dateUtils.formatSimpleDate(dateString)
}

// 로딩 스켈레톤 컴포넌트
function PostCardSkeleton() {
  return (
    <Card className="h-full flex flex-col animate-pulse">
      <CardHeader className="flex-1">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded w-4/5"></div>
        </div>
        <div className="space-y-2 mt-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </CardContent>
    </Card>
  )
}

// 메모이제이션된 포스트 카드 컴포넌트
const PostCard = memo(function PostCard({ post }: { post: Post }) {
  const cleanExcerpt = post.excerpt 
    ? utils.generateExcerpt(post.excerpt, 150)
    : '내용 미리보기가 없습니다.'

  return (
    <Link href={`/posts/${post.slug}`} prefetch={true} className="block h-full">
      <Card className="group h-full border-2 border-gray-200 bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:border-gray-300 rounded-xl flex flex-col cursor-pointer">
        <CardHeader className="flex-1 flex flex-col">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              {/* 카테고리 표시 */}
              {post.categories && post.categories.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.categories
                    .filter(category => category && category.id)
                    .slice(0, 2)
                    .map((category) => {
                      const safeColor = getSafeColor(category?.color)
                      return (
                        <Badge 
                          key={category.id} 
                          variant="secondary" 
                          className="text-xs font-medium border"
                          style={{ 
                            backgroundColor: `${safeColor}15`, 
                            color: safeColor,
                            borderColor: `${safeColor}40`
                          }}
                        >
                          <span className="truncate max-w-[80px]">{category?.name || '카테고리'}</span>
                        </Badge>
                      )
                    })}
                  {post.categories.filter(cat => cat && cat.id).length > 2 && (
                    <Badge variant="secondary" className="text-xs border border-gray-300 bg-gray-100">
                      +{post.categories.filter(cat => cat && cat.id).length - 2}
                    </Badge>
                  )}
                </div>
              )}
              
              <CardTitle className="line-clamp-2 h-[3.5rem] leading-[1.75rem] flex items-start group-hover:text-primary transition-colors">
                {post.title}
              </CardTitle>
            </div>
          </div>
          <CardDescription className="line-clamp-3 text-gray-600 mt-3 leading-relaxed h-[4rem] flex-1">
            {cleanExcerpt}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 mt-auto">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  {formatDate(post.published_at)}
                </div>
                {post.reading_time && (
                  <div className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    {post.reading_time}분
                  </div>
                )}
              </div>
              <div className="flex items-center">
                <Eye className="mr-1 h-3 w-3" />
                {post.view_count || 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
})

function PostsGrid({ posts, isLoading }: { posts: Post[], isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSpinner size="lg" text="포스트를 불러오는 중..." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">검색 결과가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

export default function ArticlesClient({ 
  initialPosts, 
  categories, 
  totalCount, 
  totalPages, 
  currentPage,
  searchTerm: initialSearchTerm = '',
  selectedCategory: initialSelectedCategory = ''
}: ArticlesClientProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [selectedCategory, setSelectedCategory] = useState(initialSelectedCategory)
  const [page, setPage] = useState(currentPage)
  const [isLoading, setIsLoading] = useState(false)
  const [totalPages_, setTotalPages] = useState(totalPages)
  const [totalCount_, setTotalCount] = useState(totalCount)

  const fetchPosts = async (pageNum: number, search: string, category: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', pageNum.toString())
      if (search) params.set('search', search)
      if (category && category.trim() !== '') params.set('category', category)

      const response = await fetch(`/api/posts?${params}`)
      if (!response.ok) throw new Error('Failed to fetch posts')
      
      const data = await response.json()
      
      setPosts(data.posts || [])
      setTotalPages(data.totalPages || 0)
      setTotalCount(data.totalCount || 0)
      setPage(pageNum)
      
      // URL 업데이트 (새로고침 없이)
      const url = new URL(window.location.href)
      if (search) url.searchParams.set('search', search)
      else url.searchParams.delete('search')
      if (category && category.trim() !== '') url.searchParams.set('category', category)
      else url.searchParams.delete('category')
      if (pageNum > 1) url.searchParams.set('page', pageNum.toString())
      else url.searchParams.delete('page')
      
      window.history.replaceState({}, '', url.toString())
    } catch (error) {
      console.error('포스트 조회 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 검색어 변경 시에만 디바운스 적용
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== initialSearchTerm) {
        fetchPosts(1, searchTerm, selectedCategory)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm]) // selectedCategory 제거하여 중복 호출 방지

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages_ && newPage !== page) {
      fetchPosts(newPage, searchTerm, selectedCategory)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategory(categorySlug)
    
    // 즉시 fetchPosts 호출하여 카테고리 변경을 반영
    fetchPosts(1, searchTerm, categorySlug)
  }

  return (
    <div className="space-y-8">
      {/* 검색 및 필터 */}
      <div className="space-y-4">
        {/* 검색바 */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="글 제목으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 카테고리 필터 */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategoryChange('')}
            className="rounded-full"
          >
            전체
          </Button>
          {categories
            .filter(category => category && category.id && category.slug)
            .map((category) => {
              const safeColor = getSafeColor(category?.color)
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.slug ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryChange(category.slug)}
                  className="rounded-full"
                  style={selectedCategory === category.slug ? {
                    backgroundColor: safeColor,
                    borderColor: safeColor,
                    color: 'white'
                  } : {
                    borderColor: `${safeColor}40`,
                    color: safeColor
                  }}
                >
                  {category?.name || '카테고리'}
                </Button>
              )
            })}
        </div>

        {/* 결과 요약 */}
        <div className="text-sm text-gray-600">
          {isLoading ? (
            <span>검색 중...</span>
          ) : (
            <span>총 {totalCount_}개의 글이 있습니다.</span>
          )}
        </div>
      </div>

      {/* 포스트 그리드 */}
      <PostsGrid posts={posts} isLoading={isLoading} />

      {/* 페이지네이션 */}
      {totalPages_ > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
            이전
          </Button>
          
          {/* 페이지 번호들 */}
          <div className="flex space-x-1">
            {(() => {
              const maxVisiblePages = 5
              const pageNumbers = []
              
              if (totalPages_ <= maxVisiblePages) {
                // 총 페이지가 5개 이하인 경우 모든 페이지 표시
                for (let i = 1; i <= totalPages_; i++) {
                  pageNumbers.push(i)
                }
              } else {
                // 총 페이지가 5개 초과인 경우
                let startPage = Math.max(1, page - 2)
                let endPage = Math.min(totalPages_, startPage + maxVisiblePages - 1)
                
                // 끝 페이지가 총 페이지에 가까우면 시작 페이지 조정
                if (endPage === totalPages_) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1)
                }
                
                for (let i = startPage; i <= endPage; i++) {
                  pageNumbers.push(i)
                }
              }
              
              return pageNumbers.map((pageNum) => (
                <Button
                  key={`page-${pageNum}`}
                  variant={pageNum === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  disabled={isLoading}
                  className="w-10"
                >
                  {pageNum}
                </Button>
              ))
            })()}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages_ || isLoading}
          >
            다음
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
} 