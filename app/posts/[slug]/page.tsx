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
import AdSense from "@/components/adsense"
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import 'highlight.js/styles/github.css'
import { Suspense } from "react"
import Image from "next/image"
import { dateUtils } from "@/lib/utils"

async function getPost(slug: string) {
  const decodedSlug = decodeURIComponent(slug)
  const { post, error } = await postsService.getPostBySlug(decodedSlug)
  
  if (error || !post) {
    notFound()
  }
  
  return post
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const resolvedParams = await params
    const post = await getPost(resolvedParams.slug)
    return {
      title: `${post.title} | codedot 블로그`,
      description: post.excerpt || post.title,
      openGraph: {
        title: post.title,
        description: post.excerpt || post.title,
        type: 'article',
        images: post.featured_image_url ? [
          {
            url: post.featured_image_url,
            width: 1200,
            height: 630,
            alt: post.title,
          }
        ] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt || post.title,
        images: post.featured_image_url ? [post.featured_image_url] : undefined,
      },
    }
  } catch (error) {
    return {
      title: 'Post Not Found | codedot 블로그',
      description: '요청하신 포스트를 찾을 수 없습니다.',
    }
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  let post
  
  try {
    post = await getPost(resolvedParams.slug)
  } catch (error) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">포스트를 찾을 수 없습니다</h1>
          <p className="text-gray-600">요청하신 포스트가 존재하지 않습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <article>
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
            {/* 대표 이미지 - Next.js Image로 최적화 */}
            {post.featured_image_url && (
              <div className="mb-8 relative w-full h-64 md:h-80 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={post.featured_image_url}
                  alt={post.title}
                  fill
                  className="object-cover transition-opacity duration-300"
                  priority={true} // LCP 최적화를 위한 우선 로딩
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  style={{ objectFit: 'cover' }}
                />
              </div>
            )}

            {/* 포스트 헤더 */}
            <div className="space-y-6 mb-8">
              <div>
                {/* 카테고리 */}
                {post.categories && post.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.categories.map((category: any) => (
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
                  {dateUtils.formatKoreanDateTime(post.published_at)}
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

            {/* Google AdSense 광고 - 포스트 내용 전에 */}
            <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>}>
              <AdSense adSlot="6423205401" />
            </Suspense>

            {/* 포스트 내용 - ReactMarkdown 사용 */}
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={{
                  // 코드 블록 스타일링
                  code({ node, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '')
                    const isInline = !match
                    return isInline ? (
                      <code 
                        className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono" 
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-gray-100 rounded-lg p-4 overflow-x-auto my-4">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    )
                  },
                  // 제목 스타일링
                  h1({ children }) {
                    return (
                      <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900">
                        {children}
                      </h1>
                    )
                  },
                  h2({ children }) {
                    return (
                      <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">
                        {children}
                      </h2>
                    )
                  },
                  h3({ children }) {
                    return (
                      <h3 className="text-xl font-medium mt-5 mb-2 text-gray-700">
                        {children}
                      </h3>
                    )
                  },
                  // 문단 스타일링
                  p({ children }) {
                    return (
                      <p className="mb-4 leading-relaxed text-gray-700 text-lg">
                        {children}
                      </p>
                    )
                  },
                  // 리스트 스타일링
                  ul({ children }) {
                    return (
                      <ul className="mb-4 ml-6 space-y-2 list-disc">
                        {children}
                      </ul>
                    )
                  },
                  ol({ children }) {
                    return (
                      <ol className="mb-4 ml-6 space-y-2 list-decimal">
                        {children}
                      </ol>
                    )
                  },
                  li({ children }) {
                    return (
                      <li className="text-gray-700 leading-relaxed">
                        {children}
                      </li>
                    )
                  },
                  // 인용문 스타일링
                  blockquote({ children }) {
                    return (
                      <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-600 bg-blue-50 py-2 rounded-r">
                        {children}
                      </blockquote>
                    )
                  },
                  // 링크 스타일링
                  a({ href, children }) {
                    return (
                      <a 
                        href={href} 
                        className="text-blue-600 hover:text-blue-800 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    )
                  },
                  // 테이블 스타일링
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto my-4">
                        <table className="min-w-full border border-gray-300 rounded-lg">
                          {children}
                        </table>
                      </div>
                    )
                  },
                  th({ children }) {
                    return (
                      <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left">
                        {children}
                      </th>
                    )
                  },
                  td({ children }) {
                    return (
                      <td className="border border-gray-300 px-4 py-2">
                        {children}
                      </td>
                    )
                  },
                  // 구분선 스타일링
                  hr() {
                    return <hr className="my-8 border-gray-300" />
                  },
                  // 이미지 최적화 - Next.js Image 사용
                  img({ src, alt }) {
                    // src가 유효한 문자열인지 확인
                    if (!src || typeof src !== 'string') {
                      return null
                    }
                    
                    return (
                      <div className="relative w-full my-4 rounded-lg overflow-hidden">
                        <Image 
                          src={src} 
                          alt={alt || ''} 
                          width={800}
                          height={400}
                          className="rounded-lg shadow-md"
                          sizes="(max-width: 768px) 100vw, 800px"
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                        />
                      </div>
                    )
                  },
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Google AdSense 광고 - 포스트 내용 후 */}
            <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>}>
              <AdSense adSlot="4291623071" />
            </Suspense>

            {/* 태그 */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">태그</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string, index: number) => (
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
      </article>
    </div>
  )
} 