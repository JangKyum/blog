import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, Search } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

// 샘플 블로그 포스트 데이터 (확장된 버전)
const allPosts = [
  {
    id: 1,
    title: "Next.js 15의 새로운 기능들",
    description: "Next.js 15에서 추가된 새로운 기능들과 개선사항들을 살펴보겠습니다.",
    date: "2024-12-10",
    readTime: "5분",
    category: "Next.js",
    slug: "nextjs-15-new-features",
  },
  {
    id: 2,
    title: "React Server Components 완벽 가이드",
    description: "React Server Components의 개념부터 실제 구현까지 상세히 알아보겠습니다.",
    date: "2024-12-08",
    readTime: "8분",
    category: "React",
    slug: "react-server-components-guide",
  },
  {
    id: 3,
    title: "Vue 3 Composition API 완벽 가이드",
    description: "Vue 3의 Composition API를 활용한 효율적인 컴포넌트 작성 방법을 알아봅니다.",
    date: "2024-12-05",
    readTime: "6분",
    category: "Vue",
    slug: "vue-3-composition-api",
  },
  {
    id: 4,
    title: "Angular 18 새로운 기능들",
    description: "Angular 18에서 추가된 새로운 기능들과 개선사항들을 살펴보겠습니다.",
    date: "2024-12-03",
    readTime: "4분",
    category: "Angular",
    slug: "angular-18-new-features",
  },
  {
    id: 5,
    title: "JavaScript ES2024 새로운 기능",
    description: "JavaScript ES2024에서 추가된 새로운 기능들을 정리했습니다.",
    date: "2024-12-01",
    readTime: "7분",
    category: "JavaScript",
    slug: "javascript-es2024-features",
  },
  {
    id: 6,
    title: "TypeScript 5.0 새로운 기능 정리",
    description: "TypeScript 5.0에서 추가된 새로운 기능들과 변경사항을 정리했습니다.",
    date: "2024-11-28",
    readTime: "9분",
    category: "TypeScript",
    slug: "typescript-5-new-features",
  },
  {
    id: 7,
    title: "Node.js 백엔드 아키텍처 설계",
    description: "확장 가능한 Node.js 백엔드 아키텍처를 설계하는 방법을 다룹니다.",
    date: "2024-11-25",
    readTime: "12분",
    category: "Node.js",
    slug: "nodejs-backend-architecture",
  },
  {
    id: 8,
    title: "CSS Grid vs Flexbox 완벽 비교",
    description: "CSS Grid와 Flexbox의 차이점과 각각의 사용 사례를 비교 분석합니다.",
    date: "2024-11-22",
    readTime: "6분",
    category: "CSS",
    slug: "css-grid-vs-flexbox",
  },
]

export default function ArticlesPage() {
  return (
    <div className="container py-8 md:py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-blue-100 border border-green-200 mb-6">
          <span className="text-sm font-medium text-green-600">📚 All Articles</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
          Articles
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          개발과 기술에 대한 다양한 주제의 글들을 모아놓았습니다
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="글 검색..." className="pl-10" />
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {allPosts.map((post) => (
          <Card
            key={post.id}
            className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm hover:bg-white hover:-translate-y-1"
          >
            <CardHeader>
              <CardTitle className="line-clamp-2">
                <Link href={`/articles/${post.slug}`} className="hover:text-primary transition-colors">
                  {post.title}
                </Link>
              </CardTitle>
              <CardDescription className="line-clamp-3">{post.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-3 w-3" />
                {format(new Date(post.date), "PPP", { locale: ko })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      <div className="text-center mt-12">
        <p className="text-muted-foreground">총 {allPosts.length}개의 글이 있습니다</p>
      </div>
    </div>
  )
}
