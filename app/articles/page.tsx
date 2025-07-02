import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Eye } from "lucide-react"
import { postsService, categoriesService } from "@/lib/posts"
import ArticlesClient from "./articles-client"

// 조회수 실시간 반영을 위해 캐시 비활성화
export const revalidate = 0

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

async function getInitialData(searchTerm: string = '', selectedCategory: string = '', page: number = 1) {
  try {
    const [postsResult, categoriesResult] = await Promise.all([
      (postsService as any).getAllPosts(page, 12, searchTerm || undefined, selectedCategory || undefined),
      categoriesService.getAllCategories()
    ])

    return {
      posts: postsResult.posts || [],
      categories: categoriesResult.categories || [],
      totalCount: postsResult.totalCount || 0,
      totalPages: postsResult.totalPages || 1,
      currentPage: postsResult.currentPage || 1
    }
  } catch (err) {
    console.error('초기 데이터 로드 실패:', err)
    return {
      posts: [],
      categories: [],
      totalCount: 0,
      totalPages: 1,
      currentPage: 1
    }
  }
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  const searchTerm = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : ''
  const selectedCategory = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : ''
  const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) || 1 : 1

  const { posts, categories, totalCount, totalPages, currentPage } = await getInitialData(searchTerm, selectedCategory, page)

  return (
    <div className="container py-8 md:py-12">
      {/* Header */}
      <div className="text-center mb-6">
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

      {/* Client-side interactive components */}
      <ArticlesClient 
        initialPosts={posts}
        categories={categories}
        totalCount={totalCount}
        totalPages={totalPages}
        currentPage={currentPage}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
      />
    </div>
  )
}
