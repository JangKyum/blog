export default function ArticlesLoading() {
  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 스켈레톤 */}
        <div className="text-center mb-12 animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg mb-4 w-48 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
        </div>

        {/* 검색 바 스켈레톤 */}
        <div className="mb-8 animate-pulse">
          <div className="h-10 bg-gray-200 rounded-lg w-full max-w-md mx-auto"></div>
        </div>

        {/* 카테고리 필터 스켈레톤 */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded-full w-20"></div>
          ))}
        </div>

        {/* 포스트 카드들 스켈레톤 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border shadow-sm p-6 animate-pulse">
              {/* 카테고리 스켈레톤 */}
              <div className="flex gap-2 mb-4">
                <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                <div className="h-5 bg-gray-200 rounded-full w-12"></div>
              </div>
              
              {/* 제목 스켈레톤 */}
              <div className="h-6 bg-gray-200 rounded mb-3"></div>
              
              {/* 설명 스켈레톤 */}
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              
              {/* 메타 정보 스켈레톤 */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>

        {/* 페이지네이션 스켈레톤 */}
        <div className="flex justify-center items-center gap-2 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 w-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
