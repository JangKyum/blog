export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
      <div className="text-center">
        {/* 로딩 스피너 */}
        <div className="relative mb-8">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-purple-500 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        
        {/* 로딩 텍스트 */}
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          페이지를 불러오는 중...
        </h2>
        <p className="text-gray-500 text-sm">
          잠시만 기다려주세요
        </p>
        
        {/* 프로그레스 바 */}
        <div className="w-64 mx-auto mt-6">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
} 