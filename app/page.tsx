"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ArrowRight, Eye, Tag } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { postsService } from "@/lib/posts"

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

export default function HomePage() {
  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadRecentPosts() {
      try {
        const { posts, error } = await postsService.getRecentPosts(6)
        if (error) {
          setError("최근 글을 불러오는데 실패했습니다.")
        } else {
          setRecentPosts(posts || [])
        }
      } catch (err) {
        setError("최근 글을 불러오는데 실패했습니다.")
      } finally {
        setLoading(false)
      }
    }

    loadRecentPosts()
  }, [])

  return (
    <div className="container py-8 md:py-12">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20">
        <div className="space-y-6">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200">
            <span className="text-sm font-medium text-blue-600">👋 Welcome to my blog</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            개발 여정과 <br />
            기술 탐구
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            웹 개발, 새로운 기술, 그리고 개발자로서의 성장 과정을 기록하는 공간입니다
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Link href="/articles">
                모든 글 보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="border-blue-300 text-blue-600 hover:bg-blue-50">
              <Link href="/about">About</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">최근 글</h2>
          <Button variant="ghost" asChild>
            <Link href="/articles">
              모든 글 보기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
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
          </div>
        ) : recentPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">아직 작성된 글이 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <Card
                key={post.id}
                className="group hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 bg-white hover:border-blue-300 hover:-translate-y-1 hover:shadow-blue-100/50 rounded-xl"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      {/* 카테고리 표시 */}
                      {post.categories && post.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.categories.slice(0, 2).map((category: Category) => (
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
                        <Link 
                          href={`/posts/${post.slug}`} 
                          className="hover:text-primary transition-colors"
                        >
                          {post.title}
                        </Link>
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-3 text-gray-600 mt-3 leading-relaxed">
                    {post.excerpt || '내용 미리보기가 없습니다.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* 메타 정보 */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-4">
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
