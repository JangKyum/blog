'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import 'highlight.js/styles/github.css'
import { Eye, Edit3 } from 'lucide-react'

export default function MarkdownPreview({ 
  value, 
  onChange, 
  placeholder = "마크다운 내용을 입력하세요...", 
  rows = 15,
  label = "내용"
}) {
  return (
    <div>
      {label && <Label className="text-base font-medium mb-3 block">{label}</Label>}
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            편집
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            미리보기
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="mt-4">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-2">
            마크다운 문법을 지원합니다. 미리보기 탭에서 결과를 확인할 수 있습니다.
          </p>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-4">
          <div className="min-h-[400px] p-4 border rounded-lg bg-gray-50">
            {value ? (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                  components={{
                    // 코드 블록 스타일링
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <pre className="bg-gray-100 rounded-lg p-4 overflow-x-auto my-4">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      ) : (
                        <code 
                          className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono" 
                          {...props}
                        >
                          {children}
                        </code>
                      )
                    },
                    // 제목 스타일링
                    h1({ children }) {
                      return (
                        <h1 className="text-2xl font-bold mt-6 mb-3 text-gray-900">
                          {children}
                        </h1>
                      )
                    },
                    h2({ children }) {
                      return (
                        <h2 className="text-xl font-semibold mt-5 mb-2 text-gray-800">
                          {children}
                        </h2>
                      )
                    },
                    h3({ children }) {
                      return (
                        <h3 className="text-lg font-medium mt-4 mb-2 text-gray-700">
                          {children}
                        </h3>
                      )
                    },
                    // 문단 스타일링
                    p({ children }) {
                      return (
                        <p className="mb-3 leading-relaxed text-gray-700">
                          {children}
                        </p>
                      )
                    },
                    // 리스트 스타일링
                    ul({ children }) {
                      return (
                        <ul className="mb-3 ml-4 space-y-1 list-disc">
                          {children}
                        </ul>
                      )
                    },
                    ol({ children }) {
                      return (
                        <ol className="mb-3 ml-4 space-y-1 list-decimal">
                          {children}
                        </ol>
                      )
                    },
                    li({ children }) {
                      return (
                        <li className="text-gray-700 leading-relaxed">
                          {children}
                        </li>
                      )
                    },
                    // 인용문 스타일링
                    blockquote({ children }) {
                      return (
                        <blockquote className="border-l-4 border-blue-500 pl-4 my-3 italic text-gray-600 bg-blue-50 py-2 rounded-r">
                          {children}
                        </blockquote>
                      )
                    },
                    // 링크 스타일링
                    a({ href, children }) {
                      return (
                        <a 
                          href={href} 
                          className="text-blue-600 hover:text-blue-800 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      )
                    },
                    // 테이블 스타일링
                    table({ children }) {
                      return (
                        <div className="overflow-x-auto my-3">
                          <table className="min-w-full border border-gray-300 rounded-lg">
                            {children}
                          </table>
                        </div>
                      )
                    },
                    th({ children }) {
                      return (
                        <th className="border border-gray-300 px-3 py-2 bg-gray-100 font-semibold text-left text-sm">
                          {children}
                        </th>
                      )
                    },
                    td({ children }) {
                      return (
                        <td className="border border-gray-300 px-3 py-2 text-sm">
                          {children}
                        </td>
                      )
                    },
                    // 구분선 스타일링
                    hr() {
                      return <hr className="my-6 border-gray-300" />
                    },
                    // 이미지 스타일링
                    img({ src, alt }) {
                      return (
                        <img 
                          src={src} 
                          alt={alt} 
                          className="max-w-full h-auto rounded-lg shadow-md my-3"
                        />
                      )
                    },
                  }}
                >
                  {value}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-500">
                내용을 입력하면 미리보기가 표시됩니다.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 