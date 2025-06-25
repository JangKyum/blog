import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Eye } from "lucide-react"
import { postsService, categoriesService } from "@/lib/posts"
import ArticlesClient from "./articles-client"

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

async function getInitialData() {
  try {
    const [postsResult, categoriesResult] = await Promise.all([
      postsService.getAllPosts(1, 12),
      categoriesService.getAllCategories()
    ])

    return {
      posts: postsResult.posts || [],
      categories: categoriesResult.categories || [],
      totalPages: postsResult.totalPages || 1
    }
  } catch (err) {
    return {
      posts: [],
      categories: [],
      totalPages: 1
    }
  }
}

export default async function ArticlesPage() {
  const { posts, categories, totalPages } = await getInitialData()

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
        initialCategories={categories}
        initialTotalPages={totalPages}
      />
    </div>
  )
}
