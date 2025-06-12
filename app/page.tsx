import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import { getCategoryColor } from "@/lib/category-colors"

// 샘플 블로그 포스트 데이터
const recentPosts = [
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
    title: "TypeScript 5.0 새로운 기능 정리",
    description: "TypeScript 5.0에서 추가된 새로운 기능들과 변경사항을 정리했습니다.",
    date: "2024-12-05",
    readTime: "6분",
    category: "TypeScript",
    slug: "typescript-5-new-features",
  },
  {
    id: 4,
    title: "Tailwind CSS 최적화 팁",
    description: "Tailwind CSS를 더 효율적으로 사용하기 위한 최적화 팁들을 공유합니다.",
    date: "2024-12-03",
    readTime: "4분",
    category: "CSS",
    slug: "tailwind-css-optimization-tips",
  },
  {
    id: 5,
    title: "웹 성능 최적화 체크리스트",
    description: "웹사이트 성능을 향상시키기 위한 필수 체크리스트를 정리했습니다.",
    date: "2024-12-01",
    readTime: "7분",
    category: "Performance",
    slug: "web-performance-checklist",
  },
]

export default function HomePage() {
  return (
    <div className="container py-8 md:py-12">
      {/* Hero Section */}
      <section className="relative text-center py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"></div>
        <div className="absolute inset-0 opacity-40 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]"></div>
        <div className="relative max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 mb-6">
            <span className="text-sm font-medium text-blue-600">✨ Welcome to codedot blog</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            안녕하세요!
            <span className="inline-block animate-bounce ml-2">👋</span>
            <br />
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              codedot 블로그
            </span>
            에 오신 것을 환영합니다
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            개발과 기술에 대한 깊이 있는 이야기를 나누는 공간입니다. 최신 웹 기술부터 개발 경험까지 다양한 주제를
            다룹니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Link href="/articles">
                모든 글 보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="border-blue-300 text-blue-600 hover:bg-blue-50">
              <Link href="/about">About</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">최근 글</h2>
          <Button variant="ghost" asChild>
            <Link href="/articles">
              모든 글 보기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recentPosts.map((post) => (
            <Card
              key={post.id}
              className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm hover:bg-white/90 hover:-translate-y-1"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getCategoryColor(post.category)}>{post.category}</Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {post.readTime}
                  </div>
                </div>
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
                  {new Date(post.date).toLocaleDateString("ko-KR")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
