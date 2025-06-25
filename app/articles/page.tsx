"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Search, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { postsService, categoriesService } from "@/lib/posts"

// 타입 정의
interface Category {
  id: string
  name: string
  slug: string
  color: string
  description?: string
}

interface Post {
  id: string
  title: string
  excerpt: string
  slug: string
  author_name: string
  published_at: string
  reading_time?: number
  view_count?: number
  categories?: Category[]
}

export default function ArticlesPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isSearching, setIsSearching] = useState(false)

  const postsPerPage = 12

  // 포스트 로드 함수
  const loadPosts = async (page = 1, category: string | null = null, search = "") => {
    setLoading(true)
    try {
      let result: any
      if (search.trim()) {
        setIsSearching(true)
        result = await postsService.searchPosts(search, page, postsPerPage)
        // searchPosts에는 totalPages가 없으므로 임시로 계산
        if (result.posts) {
          const estimatedTotalPages = result.posts.length === postsPerPage ? page + 1 : page
          setTotalPages(estimatedTotalPages)
        }
      } else {
        setIsSearching(false)
        result = await postsService.getAllPosts(page, postsPerPage, category as any)
        if (result.totalPages) {
          setTotalPages(result.totalPages)
        }
      }

      if (result.error) {
        setError("글을 불러오는데 실패했습니다.")
      } else {
        setPosts(result.posts || [])
        setCurrentPage(page)
      }
    } catch (err) {
      setError("글을 불러오는데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  // 카테고리 로드
  useEffect(() => {
    async function loadCategories() {
      try {
        const { categories } = await categoriesService.getAllCategories()
        setCategories(categories || [])
      } catch (err) {
        setCategories([])
      }
    }
    loadCategories()
  }, [])

  // 초기 로드
  useEffect(() => {
    loadPosts()
  }, [])

  // 검색 처리
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    if (value.trim()) {
      loadPosts(1, null, value)
    } else {
      loadPosts(1, selectedCategory)
    }
  }

  // 카테고리 필터
  const handleCategoryFilter = (categorySlug: string | null) => {
    setSelectedCategory(categorySlug)
    setSearchTerm("")
    loadPosts(1, categorySlug)
  }

  // 페이지 변경
  const handlePageChange = (page: number) => {
    loadPosts(page, selectedCategory, searchTerm)
  }

  return (
    <div className="container py-8 md:py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-blue-100 border border-green-200 mb-6">
          <span className="text-sm font-medium text-green-600">📚 All Articles</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
          Articles
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          개발과 기술에 대한 다양한 주제의 글들을 모아놓았습니다
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="글 검색..." 
            className="pl-10 h-12 text-base border-2 border-gray-200 focus:border-blue-400 rounded-xl shadow-sm" 
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-wrap justify-center gap-3">
              {/* 전체 카테고리 태그 */}
              <div
                className={`
                  inline-flex items-center px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-md
                  ${selectedCategory === null 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                    : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
                onClick={() => handleCategoryFilter(null)}
              >
                <span className="mr-2">🏠</span>
                전체
                <span className="ml-2 text-xs opacity-75">
                  {posts.length}
                </span>
              </div>

              {/* 개별 카테고리 태그들 */}
              {categories.map((category) => {
                const isSelected = selectedCategory === category.slug
                return (
                  <div
                    key={category.id}
                    className={`
                      inline-flex items-center px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-md
                      ${isSelected 
                        ? 'text-white shadow-lg ring-2 ring-white ring-opacity-60' 
                        : 'bg-white border-2 text-gray-600 hover:shadow-md'
                      }
                    `}
                    style={{
                      backgroundColor: isSelected ? category.color : 'white',
                      borderColor: isSelected ? category.color : '#e5e7eb',
                      color: isSelected ? 'white' : category.color
                    }}
                    onClick={() => handleCategoryFilter(category.slug)}
                  >
                    <div 
                      className={`w-2 h-2 rounded-full mr-2 ${isSelected ? 'bg-white' : ''}`}
                      style={{ 
                        backgroundColor: isSelected ? 'white' : category.color 
                      }}
                    />
                    {category.name}
                    {/* 포스트 개수 표시 (선택사항) */}
                    <span className={`ml-2 text-xs ${isSelected ? 'text-white opacity-75' : 'text-gray-400'}`}>
                      {/* 실제 개수는 나중에 추가 가능 */}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* 활성 필터 표시 */}
            {(selectedCategory || searchTerm) && (
              <div className="flex justify-center mt-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-sm text-blue-700">
                    {searchTerm ? `검색: "${searchTerm}"` : `필터: ${categories.find(c => c.slug === selectedCategory)?.name}`}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedCategory(null)
                      setSearchTerm("")
                      loadPosts(1, null)
                    }}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse border-2 border-gray-200 bg-white rounded-xl">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => loadPosts()} className="mt-4">
            다시 시도
          </Button>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {isSearching ? "검색 결과가 없습니다." : "아직 작성된 글이 없습니다."}
          </p>
        </div>
      ) : (
        <>
          {/* Articles Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="group hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 bg-white hover:border-blue-300 hover:-translate-y-1 hover:shadow-blue-100/50 rounded-xl"
              >
                <CardHeader>
                  <div className="space-y-2">
                    {/* 카테고리 */}
                    {post.categories && post.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.categories.slice(0, 2).map((category) => (
                          <Badge 
                            key={category.id} 
                            variant="secondary" 
                            className="text-xs font-medium border"
                            style={{ 
                              backgroundColor: `${category.color}15`, 
                              color: category.color,
                              borderColor: `${category.color}40`
                            }}
                          >
                            {category.name}
                          </Badge>
                        ))}
                        {post.categories.length > 2 && (
                          <Badge variant="secondary" className="text-xs border border-gray-300 bg-gray-100">
                            +{post.categories.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <CardTitle className="line-clamp-2">
                      <Link href={`/posts/${post.slug}`} className="hover:text-primary transition-colors">
                        {post.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-3 text-gray-600 mt-3 leading-relaxed">
                      {post.excerpt || '내용 미리보기가 없습니다.'}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {format(new Date(post.published_at), "MM/dd", { locale: ko })}
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
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                이전
              </Button>
              
              <div className="flex space-x-1">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    )
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2">...</span>
                  }
                  return null
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                다음
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Total Count */}
          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              {isSearching 
                ? `"${searchTerm}" 검색 결과: ${posts.length}개`
                : `총 ${posts.length}개의 글이 있습니다`
              }
            </p>
          </div>
        </>
      )}
    </div>
  )
}
