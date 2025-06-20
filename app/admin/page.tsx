"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileText, BarChart3, Eye, Edit, Trash2, Save, Send } from "lucide-react"

// 샘플 통계 데이터
const stats = [
  {
    title: "총 글 수",
    value: "24",
    description: "지난 달 대비 +3",
    icon: FileText,
  },
  {
    title: "총 조회수",
    value: "12,543",
    description: "지난 달 대비 +15%",
    icon: Eye,
  },
  {
    title: "평균 읽기 시간",
    value: "6분",
    description: "지난 달과 동일",
    icon: BarChart3,
  },
]

// 샘플 최근 글 데이터 (새로운 카테고리 포함)
const recentPosts = [
  {
    id: 1,
    title: "Next.js 15의 새로운 기능들",
    status: "published",
    views: 1234,
    date: "2024-12-10",
    category: "Next.js",
  },
  {
    id: 2,
    title: "Vue 3 Composition API 완벽 가이드",
    status: "published",
    views: 987,
    date: "2024-12-08",
    category: "Vue",
  },
  {
    id: 3,
    title: "Angular 18 새로운 기능 정리",
    status: "draft",
    views: 0,
    date: "2024-12-05",
    category: "Angular",
  },
]

const getStatColor = (title: string) => {
  switch (title) {
    case "총 글 수":
      return "from-blue-500 to-purple-500"
    case "총 조회수":
      return "from-green-500 to-blue-500"
    case "평균 읽기 시간":
      return "from-orange-500 to-red-500"
    default:
      return "from-gray-400 to-gray-600"
  }
}

export default function AdminPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")

  const handleSaveDraft = () => {
    console.log("초안 저장:", { title, content, tags })
    // 여기에 초안 저장 로직 구현
  }

  const handlePublish = () => {
    console.log("글 게시:", { title, content, tags })
    // 여기에 글 게시 로직 구현
  }

  return (
    <div className="container py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200 mb-4">
          <span className="text-sm font-medium text-orange-600">⚡ Admin Panel</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-2">블로그 관리 및 새 글 작성</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.title}
              className="border-0 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-lg transition-all duration-300"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${getStatColor(stat.title)}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <CardTitle>최근 글</CardTitle>
            <CardDescription>최근에 작성된 글들을 관리하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="space-y-2 flex-1 min-w-0">
                    <h4 className="font-medium line-clamp-1 pr-2">{post.title}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Badge variant={post.status === "published" ? "default" : "secondary"} className="text-xs">
                        {post.status === "published" ? "게시됨" : "초안"}
                      </Badge>
                      <span className="text-muted-foreground">조회수: {post.views}</span>
                      <span className="text-muted-foreground">{new Date(post.date).toLocaleDateString("ko-KR")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* New Post Form */}
        <Card>
          <CardHeader>
            <CardTitle>새 글 작성</CardTitle>
            <CardDescription>새로운 블로그 글을 작성하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                제목
              </label>
              <Input
                id="title"
                placeholder="글 제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tags" className="text-sm font-medium">
                태그
              </label>
              <Input
                id="tags"
                placeholder="태그를 쉼표로 구분하여 입력하세요"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                내용
              </label>
              <Textarea
                id="content"
                placeholder="글 내용을 작성하세요..."
                className="min-h-[200px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-4">
              {/* <Button variant="outline" onClick={handleSaveDraft} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                초안 저장
              </Button> */}
              <Button
                onClick={handlePublish}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-blue-500 hover:to-purple-500"
              >
                <Send className="mr-2 h-4 w-4" />
                게시하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
