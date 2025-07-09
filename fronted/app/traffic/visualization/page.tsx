"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Activity, MapPin, RefreshCw, Download } from "lucide-react"
import { trafficService } from "@/lib/api/traffic"

interface TrafficStatistics {
  id: string
  date: string
  totalVehicles: number
  averageSpeed: number
  peakHour: string
  congestionLevel: number
  accidents: number
}

interface Trajectory {
  id: string
  vehicleId: string
  startTime: string
  endTime: string
  route: Array<{
    lat: number
    lng: number
    timestamp: string
    speed: number
  }>
  distance: number
  duration: number
}

export default function VisualizationPage() {
  const [statistics, setStatistics] = useState<TrafficStatistics[]>([])
  const [trajectories, setTrajectories] = useState<Trajectory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("today")

  useEffect(() => {
    loadData()
  }, [selectedPeriod])

  const loadData = async () => {
    try {
      const [statsResponse, trajectoriesResponse] = await Promise.all([
        trafficService.getStatistics(),
        trafficService.getTrajectories(),
      ])
      setStatistics(statsResponse)
      setTrajectories(trajectoriesResponse)
    } catch (error) {
      console.error("加载数据失败:", error)
    } finally {
      setLoading(false)
    }
  }

  // 模拟图表数据
  const chartData = statistics.slice(0, 7).map((stat) => ({
    date: new Date(stat.date).toLocaleDateString(),
    vehicles: stat.totalVehicles,
    speed: stat.averageSpeed,
    congestion: stat.congestionLevel,
  }))

  const totalVehicles = statistics.reduce((sum, stat) => sum + stat.totalVehicles, 0)
  const avgSpeed =
    statistics.length > 0 ? statistics.reduce((sum, stat) => sum + stat.averageSpeed, 0) / statistics.length : 0
  const totalAccidents = statistics.reduce((sum, stat) => sum + stat.accidents, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">数据可视化</h1>
          <p className="text-gray-600 mt-2">交通统计数据和车辆轨迹分析</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新数据
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出报告
          </Button>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总车辆数</p>
                <p className="text-2xl font-bold">{totalVehicles.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">平均速度</p>
                <p className="text-2xl font-bold">{avgSpeed.toFixed(1)} km/h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">轨迹数量</p>
                <p className="text-2xl font-bold">{trajectories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-red-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">事故数量</p>
                <p className="text-2xl font-bold">{totalAccidents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="statistics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="statistics">交通统计</TabsTrigger>
          <TabsTrigger value="trajectories">车辆轨迹</TabsTrigger>
          <TabsTrigger value="heatmap">热力图</TabsTrigger>
        </TabsList>

        <TabsContent value="statistics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 车辆流量图表 */}
            <Card>
              <CardHeader>
                <CardTitle>车辆流量趋势</CardTitle>
                <CardDescription>过去7天的车辆流量变化</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">车辆流量图表</p>
                    <div className="mt-4 space-y-2">
                      {chartData.slice(0, 3).map((data, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span>{data.date}</span>
                          <span>{data.vehicles} 辆</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 平均速度图表 */}
            <Card>
              <CardHeader>
                <CardTitle>平均速度变化</CardTitle>
                <CardDescription>不同时段的平均行驶速度</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">速度趋势图表</p>
                    <div className="mt-4 space-y-2">
                      {chartData.slice(0, 3).map((data, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span>{data.date}</span>
                          <span>{data.speed} km/h</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 详细统计表格 */}
          <Card>
            <CardHeader>
              <CardTitle>详细统计数据</CardTitle>
              <CardDescription>按日期显示的交通统计信息</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">日期</th>
                      <th className="text-left p-2">车辆总数</th>
                      <th className="text-left p-2">平均速度</th>
                      <th className="text-left p-2">高峰时段</th>
                      <th className="text-left p-2">拥堵程度</th>
                      <th className="text-left p-2">事故数量</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statistics.slice(0, 10).map((stat) => (
                      <tr key={stat.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{new Date(stat.date).toLocaleDateString()}</td>
                        <td className="p-2">{stat.totalVehicles.toLocaleString()}</td>
                        <td className="p-2">{stat.averageSpeed} km/h</td>
                        <td className="p-2">{stat.peakHour}</td>
                        <td className="p-2">
                          <div className="flex items-center">
                            <div
                              className={`w-3 h-3 rounded-full mr-2 ${
                                stat.congestionLevel > 70
                                  ? "bg-red-500"
                                  : stat.congestionLevel > 40
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                              }`}
                            ></div>
                            {stat.congestionLevel}%
                          </div>
                        </td>
                        <td className="p-2">{stat.accidents}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trajectories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 轨迹列表 */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>车辆轨迹</CardTitle>
                  <CardDescription>选择轨迹查看详情</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {trajectories.slice(0, 10).map((trajectory) => (
                      <Card key={trajectory.id} className="cursor-pointer hover:bg-gray-50">
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Activity className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">车辆 {trajectory.vehicleId}</p>
                              <p className="text-xs text-gray-500">
                                {(trajectory.distance / 1000).toFixed(1)} km • {Math.round(trajectory.duration / 60)}{" "}
                                分钟
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(trajectory.startTime).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 轨迹地图 */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>轨迹地图</CardTitle>
                  <CardDescription>车辆行驶路径可视化</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">轨迹地图视图</h3>
                      <p className="text-gray-600">显示车辆行驶轨迹和路径分析</p>
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">总轨迹数</p>
                          <p className="text-2xl font-bold text-blue-600">{trajectories.length}</p>
                        </div>
                        <div>
                          <p className="font-medium">平均距离</p>
                          <p className="text-2xl font-bold text-green-600">
                            {trajectories.length > 0
                              ? (
                                  trajectories.reduce((sum, t) => sum + t.distance, 0) /
                                  trajectories.length /
                                  1000
                                ).toFixed(1)
                              : 0}{" "}
                            km
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>交通热力图</CardTitle>
              <CardDescription>显示交通密度分布和热点区域</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-red-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">交通热力图</h3>
                  <p className="text-gray-600 mb-4">基于车辆密度和流量的热力分布</p>

                  <div className="flex items-center justify-center space-x-8 text-sm">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                      <span>低密度</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                      <span>中密度</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                      <span>高密度</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
