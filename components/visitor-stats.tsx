'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Users, Eye, TrendingUp, TrendingDown, Calendar, ExternalLink, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react'

// 타입 정의
interface PageStats {
  pathname: string
  totalVisits: number
  uniqueVisitors: number
  title?: string // 포스트 제목 (URL 대신 표시)
}

interface OverallStats {
  totalVisits?: number
  uniqueVisitors?: number
  todayVisits?: number
  todayUniqueVisitors?: number
}

interface Trends {
  growthRate?: number
}

interface StatsData {
  date: string
  totalVisits: number
  uniqueVisitors: number
}

interface StatsResponse {
  data: StatsData[]
  totalVisits: number
  uniqueVisitors: number
}

interface PopularPagesListProps {
  pages: PageStats[]
}

// 인기 페이지 목록 컴포넌트
function PopularPagesList({ pages }: PopularPagesListProps) {
  if (!pages || pages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        데이터가 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {pages.map((page, index) => (
        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="min-w-[24px] h-6 flex items-center justify-center">
              {index + 1}
            </Badge>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {page.title || page.pathname}
              </p>
              <p className="text-sm text-muted-foreground">
                {(page.totalVisits || 0).toLocaleString()}회 방문 · {(page.uniqueVisitors || 0).toLocaleString()}명 방문자
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <a href={page.pathname} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      ))}
    </div>
  )
}

interface VisitorStatsProps {
  compact?: boolean
}

export default function VisitorStats({ compact = false }: VisitorStatsProps) {
  const [stats, setStats] = useState<StatsResponse>({ data: [], totalVisits: 0, uniqueVisitors: 0 })
  const [overallStats, setOverallStats] = useState<OverallStats>({})
  const [popularPages7days, setPopularPages7days] = useState<PageStats[]>([])
  const [popularPages30days, setPopularPages30days] = useState<PageStats[]>([])
  const [trends, setTrends] = useState<Trends>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('daily')
  const [isExpanded, setIsExpanded] = useState(!compact)

  useEffect(() => {
    loadAllData()
  }, [activeTab])

  const loadAllData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      await Promise.all([
        loadStats(activeTab),
        loadOverallStats(),
        loadPopularPages(),
        loadTrends()
      ])
    } catch (err) {
      console.error('데이터 로드 실패:', err)
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async (period: string) => {
    try {
      const response = await fetch(`/api/analytics/stats?period=${period}&limit=30`)
      if (response.ok) {
        const data = await response.json()
        setStats(data || { data: [], totalVisits: 0, uniqueVisitors: 0 })
      } else {
        throw new Error(`통계 로드 실패: ${response.status}`)
      }
    } catch (error) {
      console.error('통계 로드 실패:', error)
      setStats({ data: [], totalVisits: 0, uniqueVisitors: 0 })
    }
  }

  const loadOverallStats = async () => {
    try {
      const response = await fetch('/api/analytics/stats?overall=true')
      if (response.ok) {
        const data = await response.json()
        setOverallStats(data || {})
      }
    } catch (error) {
      console.error('전체 통계 로드 실패:', error)
      setOverallStats({})
    }
  }

  const loadPopularPages = async () => {
    try {
      const [response7days, response30days] = await Promise.all([
        fetch('/api/analytics/popular-pages?days=7&limit=10'),
        fetch('/api/analytics/popular-pages?days=30&limit=10')
      ])
      
      if (response7days.ok) {
        const data7days = await response7days.json()
        setPopularPages7days(data7days.pages || [])
      }
      
      if (response30days.ok) {
        const data30days = await response30days.json()
        setPopularPages30days(data30days.pages || [])
      }
    } catch (error) {
      console.error('인기 페이지 로드 실패:', error)
      setPopularPages7days([])
      setPopularPages30days([])
    }
  }

  const loadTrends = async () => {
    try {
      const response = await fetch('/api/analytics/trends')
      if (response.ok) {
        const data = await response.json()
        setTrends(data || {})
      }
    } catch (error) {
      console.error('트렌드 로드 실패:', error)
      setTrends({})
    }
  }

  // 날짜 포맷 함수 - 탭에 따라 다른 형식 사용
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ''
    
    const month = date.getMonth() + 1
    const day = date.getDate()
    const year = date.getFullYear()
    
    // 탭에 따라 다른 형식 사용
    if (activeTab === 'monthly') {
      return `${year}년 ${month}월`
    }
    
    // 일별, 주별: 월/일 형식
    return `${month}/${day}`
  }

  if (compact && !isExpanded) {
    return (
      <Card className="mb-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <CardTitle className="text-lg">방문자 통계</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsExpanded(true)}
              className="h-8 w-8 p-0"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{(overallStats.totalVisits || 0).toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">총 방문</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{(overallStats.uniqueVisitors || 0).toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">순 방문자</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* 축약 모드일 때 접기 버튼 */}
      {compact && (
        <div className="flex justify-end mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(false)}
            className="h-8 w-8 p-0"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* 전체 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 방문수</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(overallStats.totalVisits || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              오늘: {(overallStats.todayVisits || 0).toLocaleString()}회
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">순 방문자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(overallStats.uniqueVisitors || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              오늘: {(overallStats.todayUniqueVisitors || 0).toLocaleString()}명
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">성장률</CardTitle>
            {(trends.growthRate || 0) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(trends.growthRate || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(trends.growthRate || 0) >= 0 ? '+' : ''}{(trends.growthRate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              최근 7일 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 일일 방문</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.data && stats.data.length > 0 
                ? Math.round((stats.totalVisits || 0) / stats.data.length).toLocaleString()
                : '0'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              최근 {activeTab === 'daily' ? '30일' : activeTab === 'weekly' ? '12주' : '12개월'} 평균
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 에러 상태 */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>데이터 로드 중 오류가 발생했습니다: {error}</p>
              <Button onClick={loadAllData} className="mt-2">
                다시 시도
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 방문 추이 차트 */}
        <Card>
          <CardHeader>
            <CardTitle>방문 추이</CardTitle>
            <CardDescription>시간별 방문 패턴</CardDescription>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="daily">일별</TabsTrigger>
                <TabsTrigger value="weekly">주별</TabsTrigger>
                <TabsTrigger value="monthly">월별</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-muted-foreground">로딩 중...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.data || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey={activeTab === 'daily' ? 'visitDate' : activeTab === 'weekly' ? 'weekStart' : 'monthStart'}
                    tickFormatter={formatDate}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => formatDate(value)}
                    formatter={(value, name) => [
                      (value || 0).toLocaleString(),
                      name === 'totalVisits' ? '총 방문' : name === 'uniqueVisitors' ? '순 방문자' : '페이지뷰'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalVisits" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    data={stats.data?.filter(item => item && typeof item.totalVisits === 'number') || []}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="uniqueVisitors" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    data={stats.data?.filter(item => item && typeof item.uniqueVisitors === 'number') || []}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* 방문수 막대 차트 */}
        <Card>
          <CardHeader>
            <CardTitle>방문량 분포</CardTitle>
            <CardDescription>기간별 방문량 비교</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-muted-foreground">로딩 중...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.data?.filter(item => item && typeof item.totalVisits === 'number') || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey={activeTab === 'daily' ? 'visitDate' : activeTab === 'weekly' ? 'weekStart' : 'monthStart'}
                    tickFormatter={formatDate}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => formatDate(value)}
                    formatter={(value, name) => [
                      (value || 0).toLocaleString(),
                      name === 'totalVisits' ? '총 방문' : '페이지뷰'
                    ]}
                  />
                  <Bar dataKey="totalVisits" fill="#8884d8" />
                  <Bar dataKey="pageViews" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 인기 페이지 - 별도 섹션으로 분리 */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>인기 페이지</CardTitle>
            <CardDescription>가장 많이 방문된 페이지</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="7days" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="7days">최근 7일</TabsTrigger>
                <TabsTrigger value="30days">최근 30일</TabsTrigger>
              </TabsList>
              
              <TabsContent value="7days" className="mt-4">
                {popularPages7days.length > 0 ? (
                  <PopularPagesList pages={popularPages7days} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>7일 데이터를 불러오는 중...</p>
                    <p className="text-sm mt-2">데이터가 없거나 로딩 중입니다.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="30days" className="mt-4">
                {popularPages30days.length > 0 ? (
                  <PopularPagesList pages={popularPages30days} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>30일 데이터를 불러오는 중...</p>
                    <p className="text-sm mt-2">데이터가 없거나 로딩 중입니다.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 