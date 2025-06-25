"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CalendarDays, Clock, ArrowLeft, Eye, Heart, Tag, Share2 } from "lucide-react"
import { postsService } from "@/lib/posts"

export default function PostPage() {
  const params = useParams()
  const encodedSlug = params?.slug
  const slug = encodedSlug ? decodeURIComponent(encodedSlug) : ""
  
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadPost() {
      if (!slug) return
      
      setLoading(true)
      const { post, error } = await postsService.getPostBySlug(slug)
      
      if (error) {
        setError("포스트를 불러오는데 실패했습니다.")
      } else {
        setPost(post)
      }
      
      setLoading(false)
    }
    
    loadPost()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">포스트를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">포스트를 찾을 수 없습니다</h1>
          <p className="text-gray-600 mb-6">요청하신 포스트가 존재하지 않거나 삭제되었습니다.</p>
          <Link href="/articles">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              목록으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              목록으로 돌아가기
            </Link>
          </Button>
        </div>

        {/* 메인 콘텐츠 */}
        <Card className="mb-8 border-2 border-gray-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
          <CardContent className="p-8">
            {/* 대표 이미지 */}
            {post.featured_image_url && (
              <div className="mb-8">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {/* 포스트 헤더 */}
            <div className="space-y-6 mb-8">
              <div>
                {/* 카테고리 */}
                {post.categories && post.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.categories.map((category) => (
                      <Badge
                        key={category.id}
                        variant="secondary"
                        className="font-medium border"
                        style={{ 
                          backgroundColor: `${category.color}15`, 
                          color: category.color,
                          borderColor: `${category.color}40`
                        }}
                      >
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* 제목 */}
                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                  {post.title}
                </h1>

                {/* 요약 */}
                {post.excerpt && (
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}
              </div>

              {/* 메타 정보 */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Avatar className="mr-2 h-8 w-8">
                    <AvatarFallback>{post.author_name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  {post.author_name}
                </div>
                <div className="flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {post.published_at}
                </div>
                {post.reading_time && (
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    {post.reading_time}분 읽기
                  </div>
                )}
                <div className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  {post.view_count?.toLocaleString() || 0}회 조회
                </div>
                {post.like_count > 0 && (
                  <div className="flex items-center">
                    <Heart className="mr-2 h-4 w-4" />
                    {post.like_count}
                  </div>
                )}
              </div>
            </div>

            {/* 포스트 내용 */}
            <div className="prose prose-lg max-w-none">
              <div 
                className="leading-relaxed"
                style={{ 
                  lineHeight: '1.8',
                  fontSize: '1.1rem'
                }}
                dangerouslySetInnerHTML={{ 
                  __html: post.content.replace(/\n/g, '<br />') 
                }}
              />
            </div>

            {/* 태그 */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">태그</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-sm border-gray-300 hover:border-gray-400 transition-colors">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 공유 버튼 */}
            <div className="mt-8 pt-6 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">공유하기</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href)
                      // 간단한 피드백을 위해 알림 표시 (선택사항)
                    }}
                  >
                    링크 복사
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 하단 네비게이션 */}
        <div className="text-center">
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              더 많은 글 보기
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 