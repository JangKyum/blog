import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  text?: string
}

export function LoadingSpinner({ 
  size = "md", 
  className,
  text = "로딩 중..."
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl"
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className="relative">
        <div 
          className={cn(
            "animate-spin rounded-full border-2 border-gray-200",
            sizeClasses[size]
          )}
          style={{
            borderTopColor: "hsl(var(--primary))",
            borderRightColor: "transparent",
            borderBottomColor: "transparent",
            borderLeftColor: "transparent"
          }}
        />
        <div 
          className={cn(
            "absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-primary/20 to-transparent",
            sizeClasses[size]
          )}
        />
      </div>
      {text && (
        <p className={cn(
          "font-medium text-gray-600 animate-pulse",
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  )
}

interface PageLoadingSpinnerProps {
  text?: string
  className?: string
}

export function PageLoadingSpinner({ 
  text = "페이지를 불러오는 중...",
  className 
}: PageLoadingSpinnerProps) {
  return (
    <div className={cn(
      "flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100",
      className
    )}>
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" text="" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">{text}</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            잠시만 기다려주세요. 곧 준비됩니다.
          </p>
        </div>
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

interface InlineLoadingSpinnerProps {
  text?: string
  className?: string
}

export function InlineLoadingSpinner({ 
  text = "불러오는 중...",
  className 
}: InlineLoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center py-8", className)}>
      <LoadingSpinner size="md" text={text} />
    </div>
  )
} 