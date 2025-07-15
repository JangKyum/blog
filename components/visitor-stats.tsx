'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Users, Eye, TrendingUp, TrendingDown, Calendar, ExternalLink, Minus, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react'

export default function VisitorStats({ compact = false }) {
  const [stats, setStats] = useState(null)
  const [overallStats, setOverallStats] = useState(null)
  const [popularPages7days, setPopularPages7days] = useState(null)
  const [popularPages30days, setPopularPages30days] = useState(null)
  const [trends, setTrends] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('daily')
  const [isExpanded, setIsExpanded] = useState(!compact)

  useEffect(() => {
    loadStats(activeTab)
    loadOverallStats()
    loadPopularPages()
    loadTrends()
  }, [activeTab])

  const loadStats = async (period) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics/stats?period=${period}&limit=30`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('통계 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadOverallStats = async () => {
    try {
      const response = await fetch('/api/analytics/stats', {
        method: 'POST'
      })
      if (response.ok) {
        const data = await response.json()
        setOverallStats(data)
      }
    } catch (error) {
      console.error('전체 통계 로드 실패:', error)
    }
  }

  const loadPopularPages = async () => {
    try {
      // 7일 데이터 로드
      const response7days = await fetch('/api/analytics/popular-pages?days=7&limit=5')
      if (response7days.ok) {
        const data7days = await response7days.json()
        setPopularPages7days(data7days)
      }

      // 30일 데이터 로드
      const response30days = await fetch('/api/analytics/popular-pages?days=30&limit=5')
      if (response30days.ok) {
        const data30days = await response30days.json()
        setPopularPages30days(data30days)
      }
    } catch (error) {
      console.error('인기 페이지 로드 실패:', error)
    }
  }

  const loadTrends = async () => {
    try {
      const response = await fetch('/api/analytics/trends?current_days=7&previous_days=7')
      if (response.ok) {
        const data = await response.json()
        setTrends(data)
      }
    } catch (error) {
      console.error('트렌드 로드 실패:', error)
    }
  }

  const formatDate = (dateString, period) => {
    const date = new Date(dateString)
    
    if (period === 'daily') {
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
    } else if (period === 'weekly') {
      return `${date.getMonth() + 1}/${date.getDate()}`
    } else if (period === 'monthly') {
      return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' })
    }
    return dateString
  }

  const formatTooltipLabel = (value, period) => {
    const date = new Date(value)
    
    if (period === 'daily') {
      return date.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } else if (period === 'weekly') {
      return `${date.toLocaleDateString('ko-KR')} 주`
    } else if (period === 'monthly') {
      return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })
    }
    return value
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading && !stats) {
    return (
      <div className="space-y-4">
        {compact ? (
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    )
  }

  // 컴팩트 모드일 때의 렌더링
  if (compact) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <CardTitle>방문자 통계</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 축소된 상태에서 보여줄 기본 통계 */}
          {overallStats && (
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{overallStats.totalVisits.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">총 방문</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{overallStats.uniqueVisitors.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">총 방문자</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{overallStats.todayVisits.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">오늘 방문</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{overallStats.todayUniqueVisitors.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">오늘 방문자</p>
              </div>
            </div>
          )}
          
          {/* 확장된 상태에서만 표시 */}
          {isExpanded && (
            <div className="mt-6 space-y-6">
              {/* 차트 */}
              <div className="border rounded-lg p-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">방문자 차트</h4>
                    <TabsList className="grid w-fit grid-cols-3">
                      <TabsTrigger value="daily">일별</TabsTrigger>
                      <TabsTrigger value="weekly">주별</TabsTrigger>
                      <TabsTrigger value="monthly">월별</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="daily" className="space-y-4">
                    {stats && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">
                            총 {stats.totalVisits.toLocaleString()}회 방문
                          </Badge>
                        </div>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={stats.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date"
                              tickFormatter={(value) => formatDate(value, 'daily')}
                            />
                            <YAxis />
                            <Tooltip 
                              labelFormatter={(value) => formatTooltipLabel(value, 'daily')}
                              formatter={(value) => [`${value}회 방문`, '방문 수']}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="count" 
                              stroke="#3b82f6" 
                              strokeWidth={2}
                              dot={{ fill: '#3b82f6' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="weekly" className="space-y-4">
                    {stats && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">
                            총 {stats.totalVisits.toLocaleString()}회 방문
                          </Badge>
                        </div>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={stats.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date"
                              tickFormatter={(value) => formatDate(value, 'weekly')}
                            />
                            <YAxis />
                            <Tooltip 
                              labelFormatter={(value) => formatTooltipLabel(value, 'weekly')}
                              formatter={(value) => [`${value}회 방문`, '방문 수']}
                            />
                            <Bar 
                              dataKey="count" 
                              fill="#10b981"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="monthly" className="space-y-4">
                    {stats && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">
                            총 {stats.totalVisits.toLocaleString()}회 방문
                          </Badge>
                        </div>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={stats.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date"
                              tickFormatter={(value) => formatDate(value, 'monthly')}
                            />
                            <YAxis />
                            <Tooltip 
                              labelFormatter={(value) => formatTooltipLabel(value, 'monthly')}
                              formatter={(value) => [`${value}회 방문`, '방문 수']}
                            />
                            <Bar 
                              dataKey="count" 
                              fill="#8b5cf6"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              {/* 트렌드 카드 */}
              {trends && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    {getTrendIcon(trends.trend)}
                    <h4 className="font-semibold">7일 트렌드</h4>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">최근 7일</p>
                      <p className="text-lg font-bold">{trends.currentPeriodVisits.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">이전 7일</p>
                      <p className="text-lg font-bold">{trends.previousPeriodVisits.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">성장률</p>
                      <p className={`text-lg font-bold ${getTrendColor(trends.trend)}`}>
                        {trends.growthRate > 0 ? '+' : ''}{trends.growthRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 인기 페이지 */}
              {(popularPages7days || popularPages30days) && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">인기 페이지</h4>
                  <Tabs defaultValue="30days" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="7days">7일</TabsTrigger>
                      <TabsTrigger value="30days">30일</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="7days" className="mt-3">
                      <div className="space-y-2">
                        {popularPages7days && popularPages7days.pages.length > 0 ? (
                          popularPages7days.pages.slice(0, 5).map((page, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{page.pathname}</p>
                                <p className="text-xs text-muted-foreground">
                                  {page.totalVisits.toLocaleString()}회 방문
                                </p>
                              </div>
                              <Button variant="ghost" size="sm" asChild>
                                <a href={page.pathname} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            데이터가 없습니다.
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="30days" className="mt-3">
                      <div className="space-y-2">
                        {popularPages30days && popularPages30days.pages.length > 0 ? (
                          popularPages30days.pages.slice(0, 5).map((page, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{page.pathname}</p>
                                <p className="text-xs text-muted-foreground">
                                  {page.totalVisits.toLocaleString()}회 방문
                                </p>
                              </div>
                              <Button variant="ghost" size="sm" asChild>
                                <a href={page.pathname} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            데이터가 없습니다.
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // 전체 모드 (기존 코드 유지)
  return (
    <div className="space-y-6">
      {/* 전체 통계 카드 */}
      {overallStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 방문 수</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.totalVisits.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                전체 누적 방문 수
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 방문자 수</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.uniqueVisitors.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                고유 방문자 수
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">오늘 방문 수</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.todayVisits.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                오늘 총 방문 수
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">오늘 방문자 수</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.todayUniqueVisitors.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                오늘 고유 방문자 수
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 트렌드 카드 */}
      {trends && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getTrendIcon(trends.trend)}
              7일 방문 트렌드
            </CardTitle>
            <CardDescription>
              지난 7일과 그 이전 7일 비교
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm font-medium">현재 기간 (최근 7일)</p>
                <p className="text-2xl font-bold">{trends.currentPeriodVisits.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">이전 기간 (그 전 7일)</p>
                <p className="text-2xl font-bold">{trends.previousPeriodVisits.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">성장률</p>
                <p className={`text-2xl font-bold ${getTrendColor(trends.trend)}`}>
                  {trends.growthRate > 0 ? '+' : ''}{trends.growthRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 차트 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>방문자 통계</CardTitle>
            <CardDescription>
              기간별 방문자 수를 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="daily">일별</TabsTrigger>
                <TabsTrigger value="weekly">주별</TabsTrigger>
                <TabsTrigger value="monthly">월별</TabsTrigger>
              </TabsList>
              
              <TabsContent value="daily" className="space-y-4">
                {stats && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">일별 방문자 수</h3>
                      <Badge variant="outline">
                        총 {stats.totalVisits.toLocaleString()}회 방문
                      </Badge>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={stats.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date"
                          tickFormatter={(value) => formatDate(value, 'daily')}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value) => formatTooltipLabel(value, 'daily')}
                          formatter={(value) => [`${value}회 방문`, '방문 수']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="weekly" className="space-y-4">
                {stats && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">주별 방문자 수</h3>
                      <Badge variant="outline">
                        총 {stats.totalVisits.toLocaleString()}회 방문
                      </Badge>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date"
                          tickFormatter={(value) => formatDate(value, 'weekly')}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value) => formatTooltipLabel(value, 'weekly')}
                          formatter={(value) => [`${value}회 방문`, '방문 수']}
                        />
                        <Bar 
                          dataKey="count" 
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="monthly" className="space-y-4">
                {stats && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">월별 방문자 수</h3>
                      <Badge variant="outline">
                        총 {stats.totalVisits.toLocaleString()}회 방문
                      </Badge>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date"
                          tickFormatter={(value) => formatDate(value, 'monthly')}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value) => formatTooltipLabel(value, 'monthly')}
                          formatter={(value) => [`${value}회 방문`, '방문 수']}
                        />
                        <Bar 
                          dataKey="count" 
                          fill="#8b5cf6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* 인기 페이지 */}
        <Card>
          <CardHeader>
            <CardTitle>인기 페이지</CardTitle>
            <CardDescription>
              기간별 인기 페이지 순위
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="30days" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="7days">최근 7일</TabsTrigger>
                <TabsTrigger value="30days">최근 30일</TabsTrigger>
              </TabsList>
              
              <TabsContent value="7days" className="space-y-4 mt-4">
                {popularPages7days && popularPages7days.pages.length > 0 ? (
                  popularPages7days.pages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="min-w-[24px] h-6 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{page.pathname}</p>
                          <p className="text-sm text-muted-foreground">
                            {page.totalVisits.toLocaleString()}회 방문 · {page.uniqueVisitors.toLocaleString()}명 방문자
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={page.pathname} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    데이터가 없습니다.
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="30days" className="space-y-4 mt-4">
                {popularPages30days && popularPages30days.pages.length > 0 ? (
                  popularPages30days.pages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="min-w-[24px] h-6 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{page.pathname}</p>
                          <p className="text-sm text-muted-foreground">
                            {page.totalVisits.toLocaleString()}회 방문 · {page.uniqueVisitors.toLocaleString()}명 방문자
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={page.pathname} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    데이터가 없습니다.
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