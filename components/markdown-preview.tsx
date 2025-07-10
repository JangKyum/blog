'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import 'highlight.js/styles/github.css'
import { 
  Eye, 
  Edit3, 
  Bold, 
  Italic, 
  Link, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Table,
  LucideIcon
} from 'lucide-react'
import Image from "next/image"

interface MarkdownPreviewProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  label?: string
}

interface ToolbarButton {
  icon: LucideIcon
  title: string
  action: () => void
  type?: never
}

interface Separator {
  type: 'separator'
  icon?: never
  title?: never
  action?: never
}

type ToolbarItem = ToolbarButton | Separator

export default function MarkdownPreview({ 
  value, 
  onChange, 
  placeholder = "마크다운 내용을 입력하세요...", 
  rows = 15,
  label = "내용"
}: MarkdownPreviewProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 텍스트 삽입 헬퍼 함수
  const insertText = useCallback((prefix: string, suffix: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const textToInsert = selectedText || placeholder
    
    const newText = value.substring(0, start) + prefix + textToInsert + suffix + value.substring(end)
    onChange(newText)
    
    // 커서 위치 조정
    setTimeout(() => {
      const newCursorPos = start + prefix.length + textToInsert.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }, 0)
  }, [value, onChange])

  // 라인 시작에 텍스트 삽입 (헤더, 리스트 등)
  const insertLinePrefix = useCallback((prefix: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const lines = value.split('\n')
    let currentLineStart = 0
    let lineIndex = 0
    
    // 현재 라인 찾기
    for (let i = 0; i < lines.length; i++) {
      if (currentLineStart + lines[i].length >= start) {
        lineIndex = i
        break
      }
      currentLineStart += lines[i].length + 1 // +1 for newline
    }
    
    lines[lineIndex] = prefix + lines[lineIndex]
    const newText = lines.join('\n')
    onChange(newText)
    
    // 커서 위치 조정
    setTimeout(() => {
      const newCursorPos = start + prefix.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }, 0)
  }, [value, onChange])

  // 구분선 삽입
  const insertHorizontalRule = useCallback(() => {
    insertText('\n\n---\n\n', '', '')
  }, [insertText])

  // 표 삽입
  const insertTable = useCallback(() => {
    const tableMarkdown = `
| 헤더1 | 헤더2 | 헤더3 |
|-------|-------|-------|
| 셀1   | 셀2   | 셀3   |
| 셀4   | 셀5   | 셀6   |
`
    insertText(tableMarkdown, '', '')
  }, [insertText])

  // 툴바 버튼들
  const toolbarButtons: ToolbarItem[] = [
    {
      icon: Heading1,
      title: '헤더 1',
      action: () => insertLinePrefix('# '),
    },
    {
      icon: Heading2,
      title: '헤더 2',
      action: () => insertLinePrefix('## '),
    },
    {
      icon: Heading3,
      title: '헤더 3',
      action: () => insertLinePrefix('### '),
    },
    { type: 'separator' },
    {
      icon: Bold,
      title: '볼드',
      action: () => insertText('**', '**', '볼드 텍스트'),
    },
    {
      icon: Italic,
      title: '이탤릭',
      action: () => insertText('*', '*', '이탤릭 텍스트'),
    },
    { type: 'separator' },
    {
      icon: Link,
      title: '링크',
      action: () => insertText('[', '](url)', '링크 텍스트'),
    },
    {
      icon: ImageIcon,
      title: '이미지',
      action: () => insertText('![', '](image-url)', '이미지 설명'),
    },
    { type: 'separator' },
    {
      icon: List,
      title: '순서없는 리스트',
      action: () => insertLinePrefix('- '),
    },
    {
      icon: ListOrdered,
      title: '순서있는 리스트',
      action: () => insertLinePrefix('1. '),
    },
    { type: 'separator' },
    {
      icon: Quote,
      title: '인용문',
      action: () => insertLinePrefix('> '),
    },
    {
      icon: Code,
      title: '코드 블록',
      action: () => insertText('\n```\n', '\n```\n', '코드'),
    },
    { type: 'separator' },
    {
      icon: Minus,
      title: '구분선',
      action: insertHorizontalRule,
    },
    {
      icon: Table,
      title: '표',
      action: insertTable,
    },
  ]

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
          {/* 툴바 */}
          <div className="border rounded-t-lg bg-gray-50 p-2">
            <div className="flex flex-wrap items-center gap-1">
              {toolbarButtons.map((button, index) => {
                if (button.type === 'separator') {
                  return <Separator key={index} orientation="vertical" className="h-6 mx-1" />
                }
                
                const Icon = button.icon
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={button.action}
                    title={button.title}
                    className="h-8 w-8 p-0 hover:bg-gray-200"
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                )
              })}
            </div>
          </div>
          
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="font-mono text-sm rounded-t-none border-t-0"
          />
          <p className="text-xs text-gray-500 mt-2">
            마크다운 문법을 지원합니다. 툴바 버튼을 사용하여 쉽게 포맷팅할 수 있습니다.
          </p>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-4">
          {/* 실제 포스트와 같은 스타일 적용 */}
          <div className="min-h-[400px] border rounded-lg bg-white">
            <div className="p-8">
              {value ? (
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight, rehypeRaw]}
                    components={{
                      code({ node, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '')
                        const isInline = !match
                        return isInline ? (
                          <code 
                            className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono" 
                            {...props}
                          >
                            {children}
                          </code>
                        ) : (
                          <pre className="bg-gray-100 rounded-lg p-4 overflow-x-auto my-4">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        )
                      },
                      h1({ children }) {
                        return (
                          <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900">
                            {children}
                          </h1>
                        )
                      },
                      h2({ children }) {
                        return (
                          <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">
                            {children}
                          </h2>
                        )
                      },
                      h3({ children }) {
                        return (
                          <h3 className="text-xl font-medium mt-5 mb-2 text-gray-700">
                            {children}
                          </h3>
                        )
                      },
                      p({ children }) {
                        return (
                          <p className="mb-4 leading-relaxed text-gray-700 text-lg">
                            {children}
                          </p>
                        )
                      },
                      ul({ children }) {
                        return (
                          <ul className="mb-4 ml-6 space-y-2 list-disc">
                            {children}
                          </ul>
                        )
                      },
                      ol({ children }) {
                        return (
                          <ol className="mb-4 ml-6 space-y-2 list-decimal">
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
                      blockquote({ children }) {
                        return (
                          <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-600 bg-blue-50 py-2 rounded-r">
                            {children}
                          </blockquote>
                        )
                      },
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
                      table({ children }) {
                        return (
                          <div className="overflow-x-auto my-4">
                            <table className="min-w-full border border-gray-300 rounded-lg">
                              {children}
                            </table>
                          </div>
                        )
                      },
                      th({ children }) {
                        return (
                          <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left">
                            {children}
                          </th>
                        )
                      },
                      td({ children }) {
                        return (
                          <td className="border border-gray-300 px-4 py-2">
                            {children}
                          </td>
                        )
                      },
                      hr() {
                        return <hr className="my-8 border-gray-300" />
                      },
                      img({ src, alt }) {
                        if (!src || typeof src !== 'string') {
                          return null
                        }
                        
                        return (
                          <div className="relative w-full my-4 rounded-lg overflow-hidden">
                            <Image 
                              src={src} 
                              alt={alt || ''} 
                              width={800}
                              height={400}
                              className="rounded-lg shadow-md"
                              sizes="(max-width: 768px) 100vw, 800px"
                              placeholder="blur"
                              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                            />
                          </div>
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 