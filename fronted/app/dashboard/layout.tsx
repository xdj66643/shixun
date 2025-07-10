"use client"

import React, { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  Camera,
  MapPin,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Bell,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface User {
  id: string
  username: string
  email: string
  avatar?: string
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [detectionOpen, setDetectionOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("auth-token")
    const userInfo = localStorage.getItem("user-info")
    if (!token) {
      router.push("/auth/login")
      return
    }
    if (userInfo) {
      setUser(JSON.parse(userInfo))
    }
  }, [router])

  const navigation = [
    {
      name: "仪表板",
      href: "/dashboard",
      icon: LayoutDashboard,
      current: pathname === "/dashboard",
    },
    {
      name: "病害检测",
      icon: Camera,
      current: pathname.startsWith("/detection"),
      children: [
        { name: "检测首页", href: "/detection", current: pathname === "/detection" },
        { name: "上传视频", href: "/detection/upload", current: pathname === "/detection/upload" },
        { name: "分析结果", href: "/detection/results", current: pathname === "/detection/results" },
        { name: "任务派发", href: "/detection/dispatch", current: pathname === "/detection/dispatch" },
        { name: "处理结果", href: "/detection/upload-result", current: pathname === "/detection/upload-result" },
      ],
    },
    {
      name: "交通热点",
      href: "/traffic/hotzones",
      icon: MapPin,
      current: pathname.startsWith("/traffic"),
    },
    {
      name: "数据可视化",
      href: "/traffic/visualization",
      icon: BarChart3,
      current: pathname === "/traffic/visualization",
    },
  ]

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50">
      {/* 侧边栏 */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-56 h-screen bg-gradient-to-b from-blue-600 to-blue-400 shadow-xl transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ transitionProperty: 'transform', transitionDuration: '300ms' }}
      >
        {/* 侧边栏头部 */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-blue-200/30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-300/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <h1 className="text-lg font-bold text-white tracking-wide">智慧道路系统</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white hover:bg-white/10"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        {/* 导航菜单 */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) =>
            item.children ? (
              <div key={item.name} className="space-y-1">
                <button
                  className={cn(
                    "flex items-center w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group",
                    item.current
                      ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
                      : "text-blue-100 hover:bg-white/10 hover:text-yellow-200",
                  )}
                  onClick={() => setDetectionOpen(!detectionOpen)}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.name}</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", detectionOpen ? "rotate-180" : "")} />
                </button>
                {detectionOpen && (
                  <div className="ml-8 space-y-1 animate-in slide-in-from-top-2 duration-200">
                    {item.children.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className={cn(
                          "flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 group",
                          sub.current
                            ? "bg-white/30 text-white font-semibold border-l-2 border-yellow-300"
                            : "text-blue-50 hover:bg-white/10 hover:text-yellow-200 hover:translate-x-1",
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <ChevronRight className="mr-2 h-3 w-3 opacity-60" />
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group",
                  item.current
                    ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
                    : "text-blue-100 hover:bg-white/10 hover:text-yellow-200",
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            )
          )}
        </nav>
        {/* 侧边栏底部 */}
        <div className="p-4 border-t border-blue-200/30">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-100">系统运行正常</span>
            </div>
            <div className="mt-2 text-xs text-blue-200">最后更新: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
      {/* 侧边栏遮罩，sidebarOpen时显示，点击关闭侧边栏 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* 主内容区 */}
      <div>
        {/* 顶部导航栏 */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm h-16 flex items-center px-4 sm:px-6 lg:px-8 justify-between">
          {/* 左侧：移动端菜单按钮+搜索框 */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden md:flex items-center space-x-2 bg-slate-100 rounded-lg px-3 py-2 min-w-[300px]">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索功能、数据..."
                className="bg-transparent border-none outline-none text-sm flex-1 text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>
          {/* 右侧：通知+用户菜单 */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>设置</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  localStorage.removeItem("auth-token")
                  localStorage.removeItem("user-info")
                  router.push("/auth/login")
                }} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>退出登录</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        {/* 主内容 */}
        <main className="px-4 py-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
