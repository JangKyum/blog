"use client"

import { useEffect } from 'react'

interface AdSenseProps {
  adSlot: string
  adFormat?: string
  fullWidthResponsive?: boolean
  style?: React.CSSProperties
}

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

export default function AdSense({ 
  adSlot, 
  adFormat = "auto", 
  fullWidthResponsive = true,
  style = { display: 'block' }
}: AdSenseProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (err) {
      console.error('AdSense error:', err)
    }
  }, [])

  return (
    <div className="my-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="text-xs text-gray-500 mb-2 text-center">광고</div>
      <ins 
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-6125842877688455"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
      />
    </div>
  )
} 