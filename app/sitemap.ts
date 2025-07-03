import { MetadataRoute } from 'next'
import { postsService } from '@/lib/posts'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 모든 발행된 포스트 가져오기
  const { posts } = await (postsService as any).getAllPosts(1, 1000)
  
  // 기본 사이트 URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://codedot-blog.vercel.app'
  
  // 포스트 사이트맵 엔트리 생성
  const postEntries: MetadataRoute.Sitemap = posts.map((post: any) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.published_at || post.created_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // 정적 페이지들
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // 모든 엔트리 결합
  return [
    ...staticPages,
    ...postEntries,
  ]
} 