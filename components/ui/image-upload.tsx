"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"
import { storage } from "@/lib/supabase"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onClear?: () => void
  label?: string
  className?: string
}

export default function ImageUpload({ 
  value, 
  onChange, 
  onClear, 
  label = "이미지 업로드", 
  className = "" 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 파일 선택 핸들러
  const handleFileSelect = (file: File) => {
    // 파일 유효성 검사
    const validation = storage.validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error || "잘못된 파일입니다.")
      return
    }

    uploadFile(file)
  }

  // 파일 업로드 실행
  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setError("")

    try {
      const result = await storage.uploadImage(file)
      
      if (result.success && result.url) {
        onChange(result.url)
      } else {
        setError(result.error || "업로드에 실패했습니다.")
      }
    } catch (err) {
      setError("업로드 중 오류가 발생했습니다.")
    } finally {
      setIsUploading(false)
    }
  }

  // 파일 입력 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // 파일 선택 버튼 클릭
  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  // 이미지 제거
  const handleClear = () => {
    if (onClear) {
      onClear()
    } else {
      onChange("")
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <Label>{label}</Label>
      
      {/* 현재 이미지 미리보기 */}
      {value && (
        <div className="relative">
          <div className="relative w-full h-48 border-2 border-gray-200 rounded-lg overflow-hidden">
            <img
              src={value}
              alt="업로드된 이미지"
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 업로드 영역 */}
      {!value && (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
            ${isDragging 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-sm text-gray-600">업로드 중...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  클릭하거나 파일을 여기로 드래그하세요
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG, GIF, WebP (최대 5MB)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* URL 직접 입력 */}
      <div className="space-y-2">
        <Label htmlFor="image-url" className="text-sm text-gray-600">
          또는 이미지 URL 직접 입력
        </Label>
        <Input
          id="image-url"
          type="url"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          disabled={isUploading}
        />
      </div>

      {/* 에러 메시지 */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-600">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
} 