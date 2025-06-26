import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, Heart, Coffee, Zap } from "lucide-react"
import { getCategoryColor } from "@/lib/category-colors"
import AdSense from "@/components/adsense"

export default function AboutPage() {
  const skills = [
    "React",
    "Next.js",
    "Vue",
    "Angular",
    "TypeScript",
    "JavaScript",
    "CSS",
    "Performance",
  ]

  const additionalSkills = ["Figma", "Tailwind CSS", "Git & GitHub", "Vercel"]

  const getAdditionalSkillColor = (skill: string) => {
    switch (skill) {
      case "Figma":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "Tailwind CSS":
        return "bg-cyan-100 text-cyan-800 border-cyan-200"
      case "Git & GitHub":
        return "bg-green-100 text-green-800 border-green-200"
      case "Vercel":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 mb-6">
            <span className="text-sm font-medium text-purple-600">👨‍💻 About Me</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            About
          </h1>
          <p className="text-xl text-gray-600">개발자로서의 여정과 이야기를 소개합니다</p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Developer Introduction - Full Width */}
          <Card className="border-0 bg-gradient-to-br from-white to-blue-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
                  <Code className="h-5 w-5 text-white" />
                </div>
                개발자 소개
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600 text-base leading-relaxed">
                안녕하세요! 처음엔 단순히 만들어보고 싶다는 마음으로 시작했지만,
                지금은 계속 배우고 성장해 나가는 과정 자체가 좋아졌습니다.
              </p>
              <p className="text-gray-600 text-base leading-relaxed">
                무언가를 개발할 때는 기능을 구현하는 것뿐 아니라
                사용자가 어떻게 느낄지, 같이 일하는 사람이 어떻게 이해할지를 함께 고민합니다.
              </p>
              <p className="text-gray-600 text-base leading-relaxed">
                혼자 차근차근 쌓아가는 것도, 다른 사람과 함께 만들어가는 것도 좋아하며
                작은 변화라도 기록하며 나아가고 있습니다.
              </p>
            </CardContent>
          </Card>

          {/* Interests & Skills Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Interests - Compact */}
            <Card className="border-0 bg-gradient-to-br from-white to-purple-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg pb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                  관심사
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-3 w-3 text-purple-500" />
                  <span>웹 성능 최적화</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-3 w-3 text-purple-500" />
                  <span>사용자 경험 (UX/UI)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-3 w-3 text-purple-500" />
                  <span>재사용 가능한 컴포넌트</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-3 w-3 text-purple-500" />
                  <span>사이드 프로젝트 개발</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-3 w-3 text-purple-500" />
                  <span>기록과 공유</span>
                </div>
              </CardContent>
            </Card>

            {/* Skills Section - Spans 2 columns */}
            <Card className="md:col-span-2 border-0 bg-gradient-to-br from-white to-green-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">기술 스택</CardTitle>
                <CardDescription>현재 사용하고 있는 주요 기술들</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-3">프론트엔드 & 백엔드</h4>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge key={skill} className={getCategoryColor(skill)}>
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-3">기타 기술</h4>
                    <div className="flex flex-wrap gap-2">
                      {additionalSkills.map((skill) => (
                        <Badge key={skill} className={getAdditionalSkillColor(skill)}>
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Blog Info */}
          <Card className="border-0 bg-gradient-to-br from-white to-orange-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                  <Coffee className="h-5 w-5 text-white" />
                </div>
                블로그에 대해
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600 text-base leading-relaxed">
                이 블로그는 제가 개발하면서 직접 겪었던 문제, 배운 기술, 삽질했던 기록들을 남기는 곳입니다.
              </p>
              <p className="text-gray-600 text-base leading-relaxed">
                처음부터 잘하진 못했지만, 작업하면서 배운 것들을 차곡차곡 정리하다 보니,
                지금은 저만의 개발 흐름이 조금씩 생겼습니다.
              </p>
              <p className="text-gray-600 text-base leading-relaxed">
                꼭 전문가만 쓰는 블로그가 아니라, 저처럼 천천히 배우고, 계속 해보려는 사람들에게도
                작은 도움이 되면 좋겠습니다.
              </p>
            </CardContent>
          </Card>

          {/* Google AdSense 광고 - About 페이지 하단 */}
          <AdSense adSlot="7029710060" />
        </div>
      </div>
    </div>
  )
}
