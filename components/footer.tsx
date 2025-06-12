import Link from "next/link"
import { Code, Github, BookOpen } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="container py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo and Description */}
          <div className="flex flex-col items-center md:items-start space-y-3">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
                <Code className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                codedot 블로그
              </span>
            </Link>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              개발과 기술에 대한 이야기를 나누는 공간입니다.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex flex-col items-center space-y-3">
            <h3 className="text-sm font-semibold">연결</h3>
            <div className="flex space-x-3">
              <Link href="#" className="p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors">
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link href="#" className="p-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors">
                <BookOpen className="h-4 w-4" />
                <span className="sr-only">Notion</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} codedot 블로그. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
