"use client"

import { useEffect } from 'react'
import Script from 'next/script'

export default function ClientAdSenseScript() {
  return (
    <Script
      id="google-adsense"
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6125842877688455"
      crossOrigin="anonymous"
      strategy="lazyOnload" // 지연 로딩
    />
  )
} 