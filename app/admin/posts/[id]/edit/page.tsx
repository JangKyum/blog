"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Save, Eye, AlertCircle, ArrowLeft, Trash2 } from "lucide-react"
import { postsService, categoriesService, utils } from "@/lib/posts"
import { useAuth } from "@/contexts/auth-context"
import ImageUpload from "@/components/ui/image-upload"
import MarkdownPreview from "@/components/markdown-preview"

interface Category {
  id: string | number
  name: string
  color: string
}

interface FormData {
  title: string
  content: string
  status: string
  tags: string
  featured_image_url: string
  meta_description: string
}

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id
  const { user, loading } = useAuth()
  
  // 폼 상태
  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    status: "draft",
    tags: "",
    featured_image_url: "",
    meta_description: ""
  })
  
  // 카테고리 관련 상태
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  
  // UI 상태
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPost, setIsLoadingPost] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // 인증 체크
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  // 포스트 데이터 불러오기
  useEffect(() => {
    async function loadPost() {
      if (!postId) return
      
      setIsLoadingPost(true)
      try {
        const { post, error } = await postsService.getPostById(postId)
        if (error) {
          setError("포스트를 불러오는데 실패했습니다.")
          return
        }
        
        // 폼 데이터 설정
        setFormData({
          title: post.title || "",
          content: post.content || "",
          status: post.status || "draft",
          tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
          featured_image_url: post.featured_image_url || "",
          meta_description: post.meta_description || ""
        })
        
        // 카테고리 설정
        if (post.categories) {
          const categoryIds = post.categories.map((cat: any) => String(cat.id))
          setSelectedCategories(categoryIds)
        }
        
      } catch (err) {
        setError("포스트를 불러오는데 실패했습니다.")
      } finally {
        setIsLoadingPost(false)
      }
    }

    loadPost()
  }, [postId])

  // 카테고리 목록 불러오기
  useEffect(() => {
    async function loadCategories() {
      const { categories, error } = await categoriesService.getAllCategories()
      if (error) {
        setError("카테고리를 불러오는데 실패했습니다.")
      } else {
        setCategories(categories as Category[])
      }
    }
    loadCategories()
  }, [])

  // 폼 입력 핸들러
  function handleInputChange(field: keyof FormData, value: string) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 카테고리 선택 핸들러
  function handleCategoryToggle(categoryId: string | number) {
    setSelectedCategories(prev => {
      // 타입 일관성을 위해 모든 ID를 문자열로 변환
      const stringId = String(categoryId)
      const stringPrev = prev.map(id => String(id))
      
      const newSelection = stringPrev.includes(stringId)
        ? stringPrev.filter(id => id !== stringId)
        : [...stringPrev, stringId]
      return newSelection
    })
  }

  // 포스트 업데이트
  async function handleSubmit(status = "draft") {
    if (!formData.title.trim() || !formData.content.trim()) {
      setError("제목과 내용을 입력해주세요.")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const postData = {
        ...formData,
        status,
        tags: utils.parseTagsString(formData.tags),
        reading_time: utils.calculateReadingTime(formData.content),
        categoryIds: selectedCategories,
        meta_description: formData.meta_description || formData.title
      }

      const { post, error } = await postsService.updatePost(postId, postData)
      
      if (error) {
        const errorMessage = typeof error === 'string' 
          ? error 
          : (error as any)?.message 
          ? (error as any).message 
          : '오류가 발생했습니다.'
        setError(errorMessage)
      } else {
        setSuccess(`포스트가 ${status === 'published' ? '발행' : '저장'}되었습니다!`)
        setTimeout(() => {
          router.push("/admin/posts")
        }, 1500)
      }
    } catch (err) {
      setError("포스트 저장 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  // 포스트 삭제
  async function handleDelete() {
    if (!confirm("정말로 이 포스트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const { error } = await postsService.deletePost(postId)
      
      if (error) {
        const errorMessage = typeof error === 'string' 
          ? error 
          : (error as any)?.message 
          ? (error as any).message 
          : '오류가 발생했습니다.'
        setError(errorMessage)
      } else {
        setSuccess("포스트가 삭제되었습니다.")
        setTimeout(() => {
          router.push("/admin/posts")
        }, 1000)
      }
    } catch (err) {
      setError("포스트 삭제 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  if (loading || isLoadingPost) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/posts")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            포스트 목록으로
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">포스트 수정</h1>
              <p className="text-gray-600 mt-2">기존 포스트를 수정하세요.</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">제목 *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="포스트 제목을 입력하세요"
                    className="mt-1"
                  />
                </div>

                <div>
                  <MarkdownPreview
                    value={formData.content}
                    onChange={(value: string) => handleInputChange('content', value)}
                    placeholder="포스트 내용을 입력하세요. Markdown을 지원합니다."
                    rows={15}
                    label="내용 *"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    예상 읽기 시간: {utils.calculateReadingTime(formData.content)}분
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO 설정</CardTitle>
                <CardDescription>검색 엔진 최적화를 위한 설정입니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="meta_description">메타 설명</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => handleInputChange('meta_description', e.target.value)}
                    placeholder="검색 결과에 표시될 설명 (160자 이내)"
                    rows={2}
                    className="mt-1"
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.meta_description.length}/160
                  </p>
                </div>

                <div>
                  <ImageUpload
                    value={formData.featured_image_url}
                    onChange={(value) => handleInputChange('featured_image_url', value)}
                    label="대표 이미지"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>발행 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSubmit("draft")}
                    disabled={isLoading}
                    variant="outline"
                    className="flex-1"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    초안 저장
                  </Button>
                  <Button
                    onClick={() => handleSubmit("published")}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    발행
                  </Button>
                </div>
                
                <div className="text-sm text-gray-500">
                  현재 상태: <span className="font-medium">{formData.status === 'published' ? '발행됨' : '초안'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>카테고리</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategories.map(id => String(id)).includes(String(category.id))}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                      />
                      <Label
                        htmlFor={`category-${category.id}`}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>태그</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="React, TypeScript, 웹개발"
                    className="mt-1"
                  />
                  {formData.tags && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {utils.parseTagsString(formData.tags).map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 