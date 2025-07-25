"use client"

import { useState, memo, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Code } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Articles", href: "/articles" },
  { name: "Admin", href: "/admin" },
]

// 네비게이션 아이템 컴포넌트 메모이제이션
const NavigationItem = memo(function NavigationItem({ 
  item, 
  pathname, 
  onClick 
}: { 
  item: { name: string; href: string }, 
  pathname: string,
  onClick?: () => void 
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "text-sm font-medium transition-all duration-200 hover:text-blue-500 relative",
        pathname === item.href
          ? "text-blue-500 after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-blue-500 after:to-purple-500 after:rounded-full"
          : "text-gray-600 hover:text-blue-500",
      )}
    >
      {item.name}
    </Link>
  )
})

// 모바일 네비게이션 아이템 메모이제이션
const MobileNavigationItem = memo(function MobileNavigationItem({ 
  item, 
  pathname, 
  onClick 
}: { 
  item: { name: string; href: string }, 
  pathname: string,
  onClick: () => void 
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "text-lg font-medium transition-colors hover:text-primary",
        pathname === item.href ? "text-primary" : "text-muted-foreground",
      )}
    >
      {item.name}
    </Link>
  )
})

const Header = memo(function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const handleMobileMenuClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 group-hover:from-purple-500 group-hover:to-pink-500 transition-all duration-300">
            <Code className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            codedot 블로그
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigation.map((item) => (
            <NavigationItem 
              key={item.href} 
              item={item} 
              pathname={pathname} 
            />
          ))}
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">메뉴 열기</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>메뉴</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col space-y-4 mt-8">
              {navigation.map((item) => (
                <MobileNavigationItem 
                  key={item.href} 
                  item={item} 
                  pathname={pathname} 
                  onClick={handleMobileMenuClose}
                />
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
})

export default Header
