/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // 이미지 최적화 활성화
    unoptimized: false,
    // 외부 이미지 도메인 허용
    domains: ['images.unsplash.com', 'via.placeholder.com', 'picsum.photos'],
    // 원격 이미지 패턴
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // 이미지 포맷 최적화
    formats: ['image/webp', 'image/avif'],
  },
  // 성능 최적화 설정
  experimental: {
    // 빠른 페이지 전환을 위한 추측 기반 프리로딩
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', '@supabase/supabase-js'],
  },
  // 컴파일러 최적화
  compiler: {
    // React 컴포넌트 최적화
    reactRemoveProperties: process.env.NODE_ENV === 'production',
    // 개발 모드에서 콘솔 제거
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // 정적 자산 압축
  compress: true,
  // 빌드 시 불필요한 소스맵 제거
  productionBrowserSourceMaps: false,
  // 페이지 간 전환 최적화
  poweredByHeader: false,
  // Webpack 최적화
  webpack: (config, { dev, isServer }) => {
    // 프로덕션 빌드 최적화
    if (!dev && !isServer) {
      // 번들 크기 분석을 위한 설정
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: false,
          vendors: false,
          // React 라이브러리 분리
          react: {
            name: 'react',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            priority: 40,
          },
          // Supabase 분리
          supabase: {
            name: 'supabase',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            priority: 35,
          },
          // UI 라이브러리 분리  
          ui: {
            name: 'ui',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
            priority: 30,
          },
          // 벤더 라이브러리 분리
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            priority: 20,
            maxSize: 200000,
          },
          // 공통 컴포넌트 분리
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      }
      
      // 불필요한 모듈 제거
      config.resolve.alias = {
        ...config.resolve.alias,
        // moment.js 대신 day.js 사용 권장
        'moment': false,
      }
    }
    
    // 개발 모드 최적화
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      }
    }
    
    return config
  },
  // 헤더 최적화
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default nextConfig
