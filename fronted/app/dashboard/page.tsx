"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Activity,
  Camera,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Upload,
  BarChart3,
  ArrowUpRight,
  CheckCircle,
  Clock,
  Zap,
  Shield,
  ChevronRight,
  Calendar,
  Users,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface DashboardStats {
  totalVideos: number
  totalDefects: number
  totalHotzones: number
  totalTrajectories: number
  processedDefects: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVideos: 0,
    totalDefects: 0,
    totalHotzones: 0,
    totalTrajectories: 0,
    processedDefects: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:8080/api/detection/dashboard/stats')
      .then(res => res.json())
      .then(res => {
        // 兼容后端返回 { data: {...} } 或直接返回 {...}
        if (res.data) {
          setStats(res.data)
        } else {
          setStats(res)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const statsCards = [
    {
      title: "检测视频",
      value: stats.totalVideos,
      description: "已上传视频总数",
      icon: Camera,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "发现病害",
      value: stats.totalDefects,
      description: "检测到的病害总数",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      trend: "-8%",
      trendUp: false,
    },
    {
      title: "交通热点",
      value: stats.totalHotzones,
      description: "监控热点区域",
      icon: MapPin,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      trend: "+3%",
      trendUp: true,
    },
    {
      title: "已处理病害",
      value: stats.processedDefects,
      description: "已处理的病害总数",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      trend: "+24%",
      trendUp: true,
    },
  ]

  const quickActions = [
    {
      title: "上传检测视频",
      description: "上传道路视频进行AI病害检测分析",
      icon: Upload,
      href: "/detection/upload",
      iconBg: "bg-blue-500",
    },
    {
      title: "查看检测结果",
      description: "查看已完成的病害检测分析报告",
      icon: Camera,
      href: "/detection/results",
      iconBg: "bg-green-500",
    },
    {
      title: "交通与可视化分析",
      description: "查看交通热点与数据可视化大屏",
      icon: BarChart3,
      href: "/dashboard.html",
      iconBg: "bg-purple-500",
    },
    {
      title: "病害处理",
      description: "进入病害处理页面",
      icon: Shield,
      href: "/detection/process",
      iconBg: "bg-red-500",
    },
  ]

  const systemStatus = [
    { name: "AI检测服务", status: "正常", icon: CheckCircle, color: "text-green-600" },
    { name: "数据库连接", status: "正常", icon: CheckCircle, color: "text-green-600" },
    { name: "视频处理", status: "正常", icon: CheckCircle, color: "text-green-600" },
    { name: "数据同步", status: "同步中", icon: Clock, color: "text-yellow-600" },
  ]

  const recentActivities = [
    {
      title: "新视频上传完成",
      description: "道路检测视频 #156 处理完成",
      time: "2分钟前",
      icon: Activity,
      color: "text-blue-600",
    },
    {
      title: "检测到路面病害",
      description: "在视频 #154 中发现3处路面裂缝",
      time: "5分钟前",
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      title: "系统性能优化",
      description: "AI模型推理速度提升15%",
      time: "1小时前",
      icon: Zap,
      color: "text-yellow-600",
    },
    {
      title: "安全检查完成",
      description: "系统安全扫描未发现异常",
      time: "2小时前",
      icon: Shield,
      color: "text-green-600",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">加载仪表板数据...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 mt-0 pt-0">
      {/* 顶部信息栏 */}
      <div className="flex flex-wrap items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-slate-700">系统运行正常</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date().toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <Users className="w-4 h-4" />
          <span>在线用户: 24</span>
        </div>
        <div className="ml-auto">
          <Badge variant="outline" className="bg-white">
            <Eye className="w-3 h-3 mr-1" />
            实时监控
          </Badge>
        </div>
      </div>

      {/* 仪表板概览 */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">仪表板概览</h1>
          <p className="text-slate-600 text-sm mt-1">实时监控道路状况和交通数据分析</p>
        </div>
        <Button variant="outline" size="sm">
          <ArrowUpRight className="w-4 h-4 mr-1" />
          查看报告
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <Card key={index} className={cn("border-0 shadow-sm hover:shadow-md transition-all duration-200", card.borderColor)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">{card.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{(card.value ?? 0).toLocaleString()}</p>
                  <div className="flex items-center space-x-2">
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", card.trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>{card.trend}</span>
                    <span className="text-xs text-slate-500">{card.description}</span>
                  </div>
                </div>
                <div className={cn("p-2.5 rounded-lg", card.bgColor)}>
                  <card.icon className={cn("h-5 w-5", card.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 快速操作和系统状态 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 快速操作 */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">快速操作</CardTitle>
                  <CardDescription className="text-sm">选择您要执行的常用操作</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-xs">
                  查看全部
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <Link key={index} href={action.href}>
                    <Card className="border-0 bg-gradient-to-br from-slate-50 to-white hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow", action.iconBg)}>
                            <action.icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors text-sm">{action.title}</h3>
                            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{action.description}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* 系统状态 */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>系统状态</span>
            </CardTitle>
            <CardDescription className="text-sm">各服务模块运行状态</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {systemStatus.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center space-x-2.5">
                  <item.icon className={cn("h-4 w-4", item.color)} />
                  <span className="font-medium text-slate-900 text-sm">{item.name}</span>
                </div>
                <Badge variant={item.status === "正常" ? "default" : "secondary"} className="text-xs">{item.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 最近活动 */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">最近活动</CardTitle>
              <CardDescription className="text-sm">系统最新动态和重要事件</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs">
              查看全部
              <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <activity.icon className={cn("h-4 w-4", activity.color)} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm">{activity.title}</p>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{activity.description}</p>
                  <p className="text-xs text-slate-400 mt-2">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
