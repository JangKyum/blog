import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CalendarDays, Clock, ArrowLeft, Eye, Heart, Tag, Share2 } from "lucide-react"
import { postsService } from "@/lib/posts"
import ShareButton from "./share-button"
import ViewCounter from "@/components/view-counter"
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

async function getPost(slug) {
  const decodedSlug = decodeURIComponent(slug)
  const { post, error } = await postsService.getPostBySlug(decodedSlug)
  
  if (error || !post) {
    notFound()
  }
  
  return post
}

function formatContent(content) {
  if (!content) return ''
  
  return content
    .split('\n')
    .map((paragraph, index) => {
      if (paragraph.trim() === '') {
        return `<br key="${index}" />`
      }
      return `<p key="${index}" class="mb-4 leading-relaxed">${paragraph}</p>`
    })
    .join('')
}

export async function generateMetadata({ params }) {
  try {
    const resolvedParams = await params
    const post = await getPost(resolvedParams.slug)
    return {
      title: post.title,
      description: post.meta_description || post.excerpt || post.title,
      openGraph: {
        title: post.title,
        description: post.meta_description || post.excerpt || post.title,
        type: 'article',
        publishedTime: post.published_at,
        images: post.featured_image ? [post.featured_image] : [],
      },
    }
  } catch (error) {
    return {
      title: '포스트를 찾을 수 없습니다',
      description: '요청한 포스트를 찾을 수 없습니다.',
    }
  }
}

export default async function PostPage({ params }) {
  const resolvedParams = await params
  const post = await getPost(resolvedParams.slug)

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

              </div>

              {/* 메타 정보 */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Avatar className="mr-2 h-8 w-8">
                    <AvatarFallback>{post.author_name?.substring(0, 2) || 'UN'}</AvatarFallback>
                  </Avatar>
                  {post.author_name || 'Unknown'}
                </div>
                <div className="flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {formatDistanceToNow(new Date(post.published_at), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </div>
                {post.reading_time && (
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    {post.reading_time}분 읽기
                  </div>
                )}
                <div className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  <ViewCounter 
                    slug={resolvedParams.slug} 
                    initialViewCount={post.view_count || 0}
                  />회 조회
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
                  __html: formatContent(post.content) 
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
                <ShareButton />
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