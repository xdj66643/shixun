"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Camera, MapPin, TrendingUp, Users, AlertTriangle, Upload, BarChart3 } from "lucide-react"
import Link from "next/link"
import { detectionService } from "@/lib/api/detection"
import { trafficService } from "@/lib/api/traffic"

interface DashboardStats {
  totalVideos: number
  totalDefects: number
  totalHotzones: number
  totalTrajectories: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVideos: 0,
    totalDefects: 0,
    totalHotzones: 0,
    totalTrajectories: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [videos, hotzones, trajectories] = await Promise.all([
        detectionService.getVideos(),
        trafficService.getHotzones(),
        trafficService.getTrajectories(),
      ])

      // 计算总病害数
      let totalDefects = 0
      for (const video of videos) {
        const defects = await detectionService.getDefects(video.id)
        totalDefects += defects.length
      }

      setStats({
        totalVideos: videos.length,
        totalDefects,
        totalHotzones: hotzones.length,
        totalTrajectories: trajectories.length,
      })
    } catch (error) {
      console.error("加载仪表板数据失败:", error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      title: "上传检测视频",
      description: "上传道路视频进行病害检测",
      icon: Upload,
      href: "/detection/upload",
      color: "bg-blue-500",
    },
    {
      title: "查看检测结果",
      description: "查看已完成的病害检测结果",
      icon: Camera,
      href: "/detection/results",
      color: "bg-green-500",
    },
    {
      title: "交通热点分析",
      description: "查看城市交通热点区域",
      icon: MapPin,
      href: "/traffic/hotzones",
      color: "bg-orange-500",
    },
    {
      title: "数据可视化",
      description: "查看交通统计和轨迹分析",
      icon: BarChart3,
      href: "/traffic/visualization",
      color: "bg-purple-500",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">智慧道路系统仪表板</h1>
        <p className="text-gray-600 mt-2">实时监控道路状况和交通数据</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">检测视频</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVideos}</div>
            <p className="text-xs text-muted-foreground">已上传视频总数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">发现病害</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.totalDefects}</div>
            <p className="text-xs text-muted-foreground">检测到的病害总数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">交通热点</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHotzones}</div>
            <p className="text-xs text-muted-foreground">监控热点区域</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">车辆轨迹</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTrajectories}</div>
            <p className="text-xs text-muted-foreground">追踪轨迹数量</p>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
          <CardDescription>选择您要执行的操作</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 系统状态 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>系统状态</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">检测服务</span>
              <Badge variant="default">正常运行</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">数据库连接</span>
              <Badge variant="default">正常</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">人脸识别服务</span>
              <Badge variant="default">正常</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">交通数据同步</span>
              <Badge variant="secondary">同步中</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Activity className="h-4 w-4 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm">新视频上传完成</p>
                  <p className="text-xs text-gray-500">2分钟前</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <div className="flex-1">
                  <p className="text-sm">检测到3处路面病害</p>
                  <p className="text-xs text-gray-500">5分钟前</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm">用户登录成功</p>
                  <p className="text-xs text-gray-500">10分钟前</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
