export default function PostLoading() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="animate-pulse">
        {/* 카드 스켈레톤 */}
        <div className="mb-8 border-2 border-gray-200 bg-white shadow-lg rounded-xl">
          <div className="p-8">
            {/* 대표 이미지 스켈레톤 */}
            <div className="mb-8 w-full h-64 md:h-80 bg-gray-200 rounded-lg"></div>

            {/* 포스트 헤더 스켈레톤 */}
            <div className="space-y-6 mb-8">
              <div>
                {/* 카테고리 스켈레톤 */}
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </div>

                {/* 제목 스켈레톤 */}
                <div className="space-y-3 mb-4">
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>

              {/* 메타 정보 스켈레톤 */}
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
            </div>

            {/* 광고 스켈레톤 */}
            <div className="h-32 bg-gray-100 rounded-lg mb-8"></div>

            {/* 포스트 내용 스켈레톤 */}
            <div className="space-y-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  {(i + 1) % 3 === 0 && <div className="h-2"></div>}
                </div>
              ))}
            </div>

            {/* 하단 광고 스켈레톤 */}
            <div className="h-32 bg-gray-100 rounded-lg mt-8"></div>
          </div>
        </div>
      </div>
    </div>
  )
} 