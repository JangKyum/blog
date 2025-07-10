"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Save, Eye, AlertCircle, ArrowLeft, Plus } from "lucide-react"
import { postsService, categoriesService, utils } from "@/lib/posts"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import ImageUpload from "@/components/ui/image-upload"
import MarkdownPreview from "@/components/markdown-preview"
import { PageLoadingSpinner } from "@/components/loading-spinner"

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

export default function NewPostPage() {
  const router = useRouter()
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
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // 인증 체크
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  // 카테고리 목록 불러오기
  useEffect(() => {
    async function loadCategories() {
      const { categories, error } = await categoriesService.getAllCategories()
      if (error) {
        setError("카테고리를 불러오는데 실패했습니다.")
      } else {
        setCategories(categories as Category[])
        
        // 카테고리가 없으면 기본 카테고리 생성 제안
        if (categories.length === 0) {
          setError("카테고리가 없습니다. 먼저 카테고리를 생성해주세요.")
        }
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

  // 포스트 저장
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

      const { post, error } = await postsService.createPost(postData)
      
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

  if (loading) {
    return <PageLoadingSpinner text="새 포스트 작성 페이지 준비 중..." />
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
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
          <h1 className="text-3xl font-bold">새 포스트 작성</h1>
          <p className="text-gray-600 mt-2">블로그에 새로운 글을 작성하세요.</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-4 space-y-6">
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
                    onChange={(url) => handleInputChange('featured_image_url', url)}
                    label="대표 이미지"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="lg:col-span-2 space-y-5">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">발행 설정</CardTitle>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">포스트 정보</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">글자 수</span>
                    <Badge variant="outline" className="text-xs">
                      {formData.content.length.toLocaleString()}자
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">읽기 시간</span>
                    <Badge variant="outline" className="text-xs">
                      {utils.calculateReadingTime(formData.content)}분
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">카테고리</span>
                    <Badge variant="outline" className="text-xs">
                      {selectedCategories.length}개
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">태그</span>
                    <Badge variant="outline" className="text-xs">
                      {utils.parseTagsString(formData.tags).length}개
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">카테고리</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    사용 가능한 카테고리가 없습니다. 관리자에게 카테고리 생성을 요청해주세요.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {/* 선택된 카테고리 표시 */}
                    {selectedCategories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pb-2 border-b border-gray-100">
                        {selectedCategories.map(categoryId => {
                          const category = categories.find(c => String(c.id) === String(categoryId))
                          if (!category) return null
                          return (
                            <Badge 
                              key={categoryId} 
                              variant="secondary"
                              className="text-xs"
                              style={{ 
                                backgroundColor: `${category.color}15`, 
                                color: category.color,
                                borderColor: `${category.color}40`
                              }}
                            >
                              {category.name}
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                    
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={selectedCategories.map(id => String(id)).includes(String(category.id))}
                          onCheckedChange={() => handleCategoryToggle(category.id)}
                        />
                        <Label
                          htmlFor={`category-${category.id}`}
                          className="flex items-center space-x-2 cursor-pointer text-sm"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span>{category.name}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">태그</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div>
                  <Label htmlFor="tags" className="text-sm">태그 (쉼표로 구분)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="React, TypeScript, 웹개발"
                    className="mt-2"
                  />
                  {formData.tags && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {utils.parseTagsString(formData.tags).map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">작성 팁</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs text-gray-600 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5 text-sm">•</span>
                    <span>제목은 검색에 최적화된 키워드를 포함하세요</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5 text-sm">•</span>
                    <span>메타 설명은 150-160자 내외로 작성하세요</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5 text-sm">•</span>
                    <span>적절한 헤더(H1, H2, H3)로 구조를 만드세요</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5 text-sm">•</span>
                    <span>대표 이미지는 1200x630px 비율을 권장합니다</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5 text-sm">•</span>
                    <span>태그는 3-5개 정도가 적당합니다</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 