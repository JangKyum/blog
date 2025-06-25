import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ArrowRight, Eye } from "lucide-react"
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

async function getRecentPosts() {
  try {
    const { posts, error } = await postsService.getRecentPosts(6)
    if (error) {
      return []
    }
    return posts || []
  } catch (err) {
    return []
  }
}

export default async function HomePage() {
  const recentPosts = await getRecentPosts()

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

        {recentPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">아직 작성된 글이 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <Card
                key={post.id}
                className="group hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 bg-white hover:border-blue-300 hover:-translate-y-1 hover:shadow-blue-100/50 rounded-xl h-full flex flex-col"
              >
                <CardHeader className="flex-1">
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
                              <span className="truncate max-w-[80px]">{category.name}</span>
                            </Badge>
                          ))}
                          {post.categories.length > 2 && (
                            <Badge variant="secondary" className="text-xs border border-gray-300 bg-gray-100">
                              +{post.categories.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <CardTitle className="line-clamp-2 min-h-[3rem] leading-relaxed">
                        <Link 
                          href={`/posts/${post.slug}`} 
                          className="hover:text-primary transition-colors"
                        >
                          {post.title}
                        </Link>
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-3 text-gray-600 mt-3 leading-relaxed min-h-[4.5rem]">
                    {post.excerpt || '내용 미리보기가 없습니다.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* 메타 정보 */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(post.published_at).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
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
