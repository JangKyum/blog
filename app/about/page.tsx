import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, Heart, Coffee, Zap } from "lucide-react"
import { getCategoryColor } from "@/lib/category-colors"

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

  const additionalSkills = ["Python", "Tailwind CSS", "PostgreSQL", "MongoDB", "AWS"]

  const getAdditionalSkillColor = (skill: string) => {
    switch (skill) {
      case "Python":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "Tailwind CSS":
        return "bg-cyan-100 text-cyan-800 border-cyan-200"
      case "PostgreSQL":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "MongoDB":
        return "bg-green-100 text-green-800 border-green-200"
      case "AWS":
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
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="border-0 bg-gradient-to-br from-white to-blue-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
                  <Code className="h-4 w-4 text-white" />
                </div>
                개발자 소개
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                안녕하세요! 웹 개발에 열정을 가진 개발자입니다. 사용자 경험을 중시하며, 깔끔하고 효율적인 코드를
                작성하는 것을 좋아합니다.
              </p>
              <p className="text-muted-foreground">
                새로운 기술을 배우고 공유하는 것을 즐기며, 이 블로그를 통해 개발 경험과 지식을 나누고 있습니다.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-white to-blue-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
                  <Heart className="h-4 w-4 text-white" />
                </div>
                관심사
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>웹 성능 최적화</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>사용자 경험 (UX/UI)</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>모던 웹 기술</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>오픈소스 기여</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skills Section */}
        <Card className="mt-8 border-0 bg-gradient-to-br from-white to-blue-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle>기술 스택</CardTitle>
            <CardDescription>현재 사용하고 있는 주요 기술들입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">프론트엔드 & 백엔드</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} className={getCategoryColor(skill)}>
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">기타 기술</h4>
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

        {/* Blog Info */}
        <Card className="mt-8 border-0 bg-gradient-to-br from-white to-blue-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
                <Coffee className="h-4 w-4 text-white" />
              </div>
              블로그에 대해
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              이 블로그는 개발하면서 배운 것들, 겪은 문제들과 해결 과정, 그리고 새로운 기술에 대한 탐구를 기록하는
              공간입니다.
            </p>
            <p className="text-muted-foreground">
              주로 React, Next.js, TypeScript 등 프론트엔드 기술에 대한 글을 작성하지만, 백엔드나 DevOps 관련 내용도
              다룹니다.
            </p>
            <p className="text-muted-foreground">
              모든 글은 실제 경험을 바탕으로 작성되며, 독자들에게 도움이 되는 실용적인 정보를 제공하려고 노력합니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
