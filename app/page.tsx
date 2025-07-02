import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ArrowRight, Eye } from "lucide-react"
import { postsService, utils } from "@/lib/posts"
import { Suspense, memo } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { dateUtils } from "@/lib/utils"

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

// 안전한 색상 처리 함수
function getSafeColor(color: string | null | undefined): string {
  if (!color || color.trim() === '') {
    return '#6b7280' // gray-500 기본색
  }
  return color
}

// 로딩 스켈레톤 컴포넌트
function PostCardsSkeleton() {
  return (
    <div className="space-y-8">
      <LoadingSpinner size="lg" text="최근 글을 불러오는 중..." />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-full flex flex-col animate-pulse">
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
        ))}
      </div>
    </div>
  )
}

// 포스트 카드 컴포넌트 메모이제이션
const PostCard = memo(function PostCard({ post }: { post: Post }) {
  // excerpt에서 마크다운 문법 제거
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
            {/* 메타 정보 */}
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  {dateUtils.formatSimpleDate(post.published_at)}
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

// 최근 포스트 섹션 컴포넌트
async function RecentPosts() {
  const recentPosts = await getRecentPosts()
  
  if (recentPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">아직 작성된 글이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {recentPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

async function getRecentPosts() {
  try {
    const { posts, error } = await postsService.getRecentPosts(6)
    if (error) {
      console.error('Failed to fetch recent posts:', error)
      return []
    }
    return posts || []
  } catch (err) {
    console.error('Failed to fetch recent posts:', err)
    return []
  }
}

// 조회수 실시간 반영을 위해 캐시 비활성화
export const revalidate = 0

export default async function HomePage() {
  return (
    <div className="container py-8 md:py-12">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-12">
        <div className="space-y-6">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200">
            <span className="text-sm font-medium text-blue-600">👋 Welcome to my blog</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          배우고, 부수고, 다시 만드는 중
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            웹 개발, 새로운 기술, 그리고 개발자로서의 성장 과정을 기록하는 공간입니다
            <br />
            <Link href="/about" className="text-blue-500 hover:text-blue-600 transition-colors text-base font-medium">
              더 자세한 소개 보기 →
            </Link>
          </p>
          
          <div className="flex justify-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Link href="/articles">
                글 둘러보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">최근 글</h2>
          <p className="text-gray-600 mt-2">새로 작성된 글들을 확인해보세요</p>
        </div>

        <Suspense fallback={<PostCardsSkeleton />}>
          <RecentPosts />
        </Suspense>
      </section>

      {/* CTA Section */}
      <section className="text-center py-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
        <div className="space-y-6">
          <h3 className="text-2xl font-bold mb-4">개발 여정을 함께 해보세요</h3>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            실무 경험, 새로운 기술 탐구, 그리고 성장 스토리가 기다리고 있습니다
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-pink-500 transition-all duration-300">
            <Link href="/articles">
              전체 아카이브 탐색
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
