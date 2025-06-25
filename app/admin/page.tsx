"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileText, BarChart3, Eye, Edit, Trash2, Save, Send, LogOut, User, Plus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { postsService } from "@/lib/posts"
import { format } from "date-fns"

interface DashboardStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalViews: number
}

interface RecentPost {
  id: string
  title: string
  status: string
  view_count: number
  created_at: string
  slug: string
}

export default function AdminPage() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  
  // 상태 관리
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0
  })
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // 인증 체크
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  // 대시보드 데이터 로딩
  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  async function loadDashboardData() {
    setIsLoading(true)
    try {
      // 전체 포스트 데이터 가져오기
      const { posts: allPosts } = await postsService.getAllPostsForAdmin(1, 100)
      
      // 통계 계산
      const publishedPosts = allPosts?.filter(post => post.status === 'published') || []
      const draftPosts = allPosts?.filter(post => post.status === 'draft') || []
      const totalViews = publishedPosts.reduce((sum, post) => sum + (post.view_count || 0), 0)

      setStats({
        totalPosts: allPosts?.length || 0,
        publishedPosts: publishedPosts.length,
        draftPosts: draftPosts.length,
        totalViews
      })

      // 최근 포스트 설정 (최대 5개)
      const recent = allPosts?.slice(0, 5).map(post => ({
        id: post.id,
        title: post.title,
        status: post.status,
        view_count: post.view_count || 0,
        created_at: post.created_at,
        slug: post.slug
      })) || []

      setRecentPosts(recent)
    } catch (err) {
      setError("대시보드 데이터를 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    router.push("/")
  }

  if (loading || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">관리자 대시보드</h1>
              <p className="text-gray-600 mt-2">블로그 관리 및 통계를 확인하세요</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                {user.email}
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* 통계 카드 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 글 수</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts}</div>
              <p className="text-xs text-muted-foreground">
                발행: {stats.publishedPosts}개, 초안: {stats.draftPosts}개
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 조회수</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                발행된 글 기준
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">발행된 글</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.publishedPosts}</div>
              <p className="text-xs text-muted-foreground">
                전체의 {stats.totalPosts > 0 ? Math.round((stats.publishedPosts / stats.totalPosts) * 100) : 0}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">초안</CardTitle>
              <Save className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draftPosts}</div>
              <p className="text-xs text-muted-foreground">
                작성 중인 글
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* 최근 글 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>최근 글</CardTitle>
                  <CardDescription>최근에 작성된 글들을 관리하세요</CardDescription>
                </div>
                <Button asChild size="sm">
                  <Link href="/admin/posts">
                    전체 보기
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPosts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    작성된 글이 없습니다.
                  </div>
                ) : (
                  recentPosts.map((post) => (
                    <div key={post.id} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="space-y-2 flex-1 min-w-0">
                        <h4 className="font-medium line-clamp-1 pr-2">{post.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <Badge variant={post.status === "published" ? "default" : "secondary"} className="text-xs">
                            {post.status === "published" ? "발행됨" : "초안"}
                          </Badge>
                          <span className="text-muted-foreground">조회수: {post.view_count}</span>
                          <span className="text-muted-foreground">
                            {format(new Date(post.created_at), "MM/dd")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        {post.status === 'published' && (
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/posts/${post.slug}`} target="_blank">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/posts/${post.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* 빠른 작업 */}
          <Card>
            <CardHeader>
              <CardTitle>빠른 작업</CardTitle>
              <CardDescription>자주 사용하는 기능들에 빠르게 접근하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full justify-start" size="lg">
                <Link href="/admin/posts/new">
                  <Plus className="mr-2 h-4 w-4" />
                  새 글 작성
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full justify-start" size="lg">
                <Link href="/admin/posts">
                  <FileText className="mr-2 h-4 w-4" />
                  모든 글 관리
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full justify-start" size="lg">
                <Link href="/" target="_blank">
                  <Eye className="mr-2 h-4 w-4" />
                  블로그 보기
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
