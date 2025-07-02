"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Clock,
  Calendar,
  User,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { postsService } from "@/lib/posts"
import { useAuth } from "@/contexts/auth-context"
import { PageLoadingSpinner, InlineLoadingSpinner } from "@/components/loading-spinner"
import { dateUtils } from "@/lib/utils"

interface Post {
  id: string
  title: string
  content: string
  excerpt?: string
  status: 'published' | 'draft' | 'archived'
  categories: Array<{ 
    id?: string 
    name?: string 
    slug?: string 
    color?: string
    category?: {
      id: string
      name: string
      slug: string
      color?: string
    }
  }>
  view_count: number
  created_at: string
  updated_at: string
  slug: string
  published_at?: string
}

// Date 포맷팅을 위한 안전한 유틸리티 함수 - 한국 시간대 적용
function formatDate(dateString: string | null): string {
  return dateUtils.formatSimpleDate(dateString)
}

// 작성일/발행일을 구분해서 표시하는 함수
function getDisplayDate(post: Post): string {
  // 발행된 포스트는 발행일, 초안은 작성일 표시
  if (post.status === 'published' && post.published_at) {
    return dateUtils.formatSimpleDate(post.published_at)
  }
  return dateUtils.formatSimpleDate(post.created_at)
}

export default function AdminPostsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  
  // 상태 관리
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [mounted, setMounted] = useState(false)
  
  // 필터 및 검색
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  // 삭제할 포스트 ID
  const [deletePostId, setDeletePostId] = useState<string | null>(null)

  // 마운트 상태 설정
  useEffect(() => {
    setMounted(true)
  }, [])

  // 인증 체크
  useEffect(() => {
    if (!loading && !user && mounted) {
      router.push("/auth/login")
    }
  }, [user, loading, router, mounted])

  // 포스트 목록 불러오기
  useEffect(() => {
    if (user && mounted) {
      loadPosts()
    }
  }, [user, currentPage, statusFilter, mounted])

  // 검색어 변경 시 디바운스 적용
  useEffect(() => {
    if (!user || !mounted) return
    
    const timer = setTimeout(() => {
      setCurrentPage(1) // 검색 시 첫 페이지로 이동
      loadPosts()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Success/Error 메시지 자동 제거
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  async function loadPosts() {
    setIsLoading(true)
    setError("")
    
    try {
      const status = statusFilter === "all" ? null : statusFilter
      const search = searchTerm.trim()
      const { posts, error, totalPages, totalCount } = await postsService.getAllPostsForAdmin(
        currentPage,
        10,
        status as any,
        (search === '' ? null : search) as any
      )
      
      if (error) {
        setError(typeof error === 'string' ? error : (error as any)?.message || '포스트를 불러오는데 실패했습니다.')
      } else {
        setPosts((posts as Post[]) || [])
        setTotalPages(totalPages || 1)
        setTotalCount(totalCount || 0)
      }
    } catch (err) {
      setError("포스트를 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  // 포스트 삭제
  async function handleDeletePost(postId: string) {
    try {
      const { error } = await postsService.deletePost(postId)
      
      if (error) {
        setError(error.message)
      } else {
        setSuccess("포스트가 삭제되었습니다.")
        await loadPosts() // 목록 새로고침
      }
    } catch (err) {
      setError("포스트 삭제 중 오류가 발생했습니다.")
    }
    setDeletePostId(null)
  }

  // 페이지 변경
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage)
    }
  }

  // 포스트 상태에 따른 배지 색상
  function getStatusBadge(status: string) {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500">발행됨</Badge>
      case 'draft':
        return <Badge variant="secondary">초안</Badge>
      case 'archived':
        return <Badge variant="outline">보관됨</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading || !mounted) {
    return <PageLoadingSpinner text="관리자 페이지 준비 중..." />
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
              <h1 className="text-3xl font-bold">포스트 관리</h1>
              <p className="text-gray-600 mt-2">블로그 포스트를 작성하고 관리하세요.</p>
            </div>
            <Button asChild>
              <Link href="/admin/posts/new">
                <Plus className="mr-2 h-4 w-4" />
                새 포스트 작성
              </Link>
            </Button>
          </div>
        </div>

        {/* 알림 메시지 */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        )}

        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="포스트 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="published">발행됨</SelectItem>
                    <SelectItem value="draft">초안</SelectItem>
                    <SelectItem value="archived">보관됨</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 포스트 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>포스트 목록</CardTitle>
            <CardDescription>
              총 {totalCount}개의 포스트 (페이지 {currentPage}/{totalPages})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <InlineLoadingSpinner text="포스트를 불러오는 중..." />
            ) : posts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? '검색 결과가 없습니다.' : '포스트가 없습니다.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">제목</TableHead>
                      <TableHead className="w-[100px]">상태</TableHead>
                      <TableHead className="w-[150px]">카테고리</TableHead>
                      <TableHead className="w-[80px]">조회수</TableHead>
                      <TableHead className="w-[100px]">작성일</TableHead>
                      <TableHead className="w-[100px]">수정일</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="max-w-[300px]">
                          <div className="space-y-1">
                            <div className="font-medium truncate">{post.title}</div>
                            {post.excerpt && (
                              <div className="text-sm text-gray-500 line-clamp-2 max-w-[280px]">
                                {post.excerpt}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[100px]">
                          {getStatusBadge(post.status)}
                        </TableCell>
                        <TableCell className="max-w-[150px]">
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(post.categories) && post.categories.slice(0, 2).map((category) => {
                              // 카테고리 데이터 정규화
                              const categoryData = category?.category || category
                              const categoryId = categoryData?.id
                              const categoryName = categoryData?.name
                              
                              if (!categoryId || !categoryName) return null
                              
                              return (
                                <Badge
                                  key={categoryId}
                                  variant="outline"
                                  className="text-xs max-w-[60px]"
                                >
                                  <span className="truncate">{categoryName}</span>
                                </Badge>
                              )
                            })}
                            {Array.isArray(post.categories) && post.categories.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{post.categories.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[80px]">
                          <div className="flex items-center text-sm text-gray-500">
                            <Eye className="mr-1 h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{post.view_count || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[100px]">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="mr-1 h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{getDisplayDate(post)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[100px]">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="mr-1 h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{formatDate(post.updated_at)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[50px]">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/posts/${post.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  수정
                                </Link>
                              </DropdownMenuItem>
                              {post.status === 'published' && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/posts/${post.slug}`} target="_blank">
                                    <Eye className="mr-2 h-4 w-4" />
                                    보기
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setDeletePostId(post.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                삭제
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* 개선된 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  이전
                </Button>
                
                {/* 페이지 번호들 */}
                <div className="flex space-x-1">
                  {(() => {
                    const maxVisiblePages = 5
                    const pageNumbers = []
                    
                    if (totalPages <= maxVisiblePages) {
                      // 총 페이지가 5개 이하인 경우 모든 페이지 표시
                      for (let i = 1; i <= totalPages; i++) {
                        pageNumbers.push(i)
                      }
                    } else {
                      // 총 페이지가 5개 초과인 경우
                      let startPage = Math.max(1, currentPage - 2)
                      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
                      
                      // 끝 페이지가 총 페이지에 가까우면 시작 페이지 조정
                      if (endPage === totalPages) {
                        startPage = Math.max(1, endPage - maxVisiblePages + 1)
                      }
                      
                      for (let i = startPage; i <= endPage; i++) {
                        pageNumbers.push(i)
                      }
                    }
                    
                    return pageNumbers.map((pageNum) => (
                      <Button
                        key={`admin-page-${pageNum}`}
                        variant={pageNum === currentPage ? 'default' : 'outline'}
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
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || isLoading}
                >
                  다음
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 삭제 확인 다이얼로그 */}
        <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>포스트 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                이 포스트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDeletePost(deletePostId as string)}
                className="bg-red-600 hover:bg-red-700"
              >
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
} 