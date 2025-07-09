"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, TrendingUp, Users, Clock, Search, Filter, RefreshCw } from "lucide-react"
import { trafficService } from "@/lib/api/traffic"

interface Hotzone {
  id: string
  name: string
  location: {
    lat: number
    lng: number
    address: string
  }
  trafficFlow: number
  peakHours: string[]
  status: "normal" | "busy" | "congested"
  lastUpdated: string
  averageSpeed: number
  vehicleCount: number
}

export default function HotzonesPage() {
  const [hotzones, setHotzones] = useState<Hotzone[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedHotzone, setSelectedHotzone] = useState<Hotzone | null>(null)

  useEffect(() => {
    loadHotzones()
  }, [])

  const loadHotzones = async () => {
    try {
      const response = await trafficService.getHotzones()
      setHotzones(response)
    } catch (error) {
      console.error("加载热点数据失败:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-800"
      case "busy":
        return "bg-yellow-100 text-yellow-800"
      case "congested":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "normal":
        return "正常"
      case "busy":
        return "繁忙"
      case "congested":
        return "拥堵"
      default:
        return "未知"
    }
  }

  const filteredHotzones = hotzones.filter(
    (hotzone) =>
      hotzone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotzone.location.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
          <h1 className="text-3xl font-bold text-gray-900">交通热点</h1>
          <p className="text-gray-600 mt-2">实时监控城市交通热点区域</p>
        </div>
        <Button onClick={loadHotzones} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新数据
        </Button>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总热点数</p>
                <p className="text-2xl font-bold">{hotzones.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">正常</p>
                <p className="text-2xl font-bold">{hotzones.filter((h) => h.status === "normal").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">繁忙</p>
                <p className="text-2xl font-bold">{hotzones.filter((h) => h.status === "busy").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">拥堵</p>
                <p className="text-2xl font-bold">{hotzones.filter((h) => h.status === "congested").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 热点列表 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>热点区域</CardTitle>
                  <CardDescription>实时交通热点监控</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="搜索热点..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    筛选
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredHotzones.map((hotzone) => (
                  <Card
                    key={hotzone.id}
                    className={`cursor-pointer transition-colors ${
                      selectedHotzone?.id === hotzone.id ? "ring-2 ring-blue-500" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedHotzone(hotzone)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{hotzone.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{hotzone.location.address}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {hotzone.vehicleCount} 车辆
                              </div>
                              <div className="flex items-center">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                {hotzone.averageSpeed} km/h
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {new Date(hotzone.lastUpdated).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(hotzone.status)}>{getStatusText(hotzone.status)}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 热点详情 */}
        <div className="lg:col-span-1">
          {selectedHotzone ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{selectedHotzone.name}</CardTitle>
                  <CardDescription>热点详细信息</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">位置信息</h4>
                    <p className="text-sm text-gray-600">{selectedHotzone.location.address}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedHotzone.location.lat.toFixed(6)}, {selectedHotzone.location.lng.toFixed(6)}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">交通状况</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">当前状态</span>
                        <Badge className={getStatusColor(selectedHotzone.status)}>
                          {getStatusText(selectedHotzone.status)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">车辆数量</span>
                        <span className="text-sm font-medium">{selectedHotzone.vehicleCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">平均速度</span>
                        <span className="text-sm font-medium">{selectedHotzone.averageSpeed} km/h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">交通流量</span>
                        <span className="text-sm font-medium">{selectedHotzone.trafficFlow}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">高峰时段</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedHotzone.peakHours.map((hour, index) => (
                        <Badge key={index} variant="secondary">
                          {hour}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">最后更新</h4>
                    <p className="text-sm text-gray-600">{new Date(selectedHotzone.lastUpdated).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>实时地图</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">地图视图</p>
                      <p className="text-xs text-gray-500">
                        {selectedHotzone.location.lat.toFixed(4)}, {selectedHotzone.location.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">选择热点查看详情</h3>
                <p className="text-gray-600">从左侧列表中选择一个热点区域来查看详细信息</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
