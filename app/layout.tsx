import React from "react"
import { Metadata } from "next"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { AuthProvider } from "@/contexts/auth-context"
import ClientAdSenseScript from "@/components/client-adsense-script"

export const metadata: Metadata = {
  title: "codedot 블로그",
  description: "개발과 기술에 대한 이야기를 나누는 공간입니다.",
  generator: 'Next.js',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
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
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
        {/* AdSense 스크립트를 지연 로드 */}
        <ClientAdSenseScript />
      </body>
    </html>
  )
}
