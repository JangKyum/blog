import React from "react"
import { Metadata } from "next"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { AuthProvider } from "@/contexts/auth-context"
import ClientAdSenseScript from "@/components/client-adsense-script"
import { Toaster } from "sonner"
import VisitTracker from "@/components/visit-tracker"

export const metadata: Metadata = {
  title: "codedot 블로그",
  description: "개발과 기술에 대한 이야기를 나누는 공간입니다.",
  generator: 'Next.js',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.png', sizes: '96x96', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: [
      { url: '/favicon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: "codedot 블로그",
    description: "개발과 기술에 대한 이야기를 나누는 공간입니다.",
    url: 'https://your-domain.com',
    siteName: 'codedot 블로그',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "codedot 블로그",
    description: "개발과 기술에 대한 이야기를 나누는 공간입니다.",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        {/* DNS Prefetch for external resources */}
        <link rel="dns-prefetch" href="//pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="" />
        
        {/* 구조화된 데이터 - Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "codedot 블로그",
              "description": "개발과 기술에 대한 이야기를 나누는 공간입니다.",
              "url": "https://codedot-blog.vercel.app",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://codedot-blog.vercel.app/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <VisitTracker />
        </AuthProvider>
        {/* AdSense 스크립트를 지연 로드 */}
        <ClientAdSenseScript />
        <Toaster 
          position="top-right"
          richColors
          closeButton
          duration={3000}
        />
      </body>
    </html>
  )
}
