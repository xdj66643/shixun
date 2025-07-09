"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Video, AlertTriangle, Calendar, MapPin, Download, Search, Eye } from "lucide-react"
import { detectionService } from "@/lib/api/detection"

interface DetectionVideo {
  id: string
  filename: string
  uploadTime: string
  status: "processing" | "completed" | "failed"
  defectCount: number
  duration: number
  size: number
}

interface Defect {
  id: string
  type: string
  severity: "low" | "medium" | "high"
  location: string
  timestamp: number
  confidence: number
}

export default function DetectionResultsPage() {
  const [videos, setVideos] = useState<DetectionVideo[]>([])
  const [selectedVideo, setSelectedVideo] = useState<DetectionVideo | null>(null)
  const [defects, setDefects] = useState<Defect[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    try {
      const response = await detectionService.getVideos()
      setVideos(response)
    } catch (error) {
      console.error("加载视频列表失败:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadDefects = async (videoId: string) => {
    try {
      const response = await detectionService.getDefects(videoId)
      setDefects(response)
    } catch (error) {
      console.error("加载病害数据失败:", error)
    }
  }

  const handleVideoSelect = (video: DetectionVideo) => {
    setSelectedVideo(video)
    loadDefects(video.id)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const filteredVideos = videos.filter((video) => video.filename.toLowerCase().includes(searchTerm.toLowerCase()))

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">检测结果</h1>
        <p className="text-gray-600 mt-2">查看视频检测结果和病害分析</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 视频列表 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>检测视频</CardTitle>
              <CardDescription>选择视频查看详细结果</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索视频..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredVideos.map((video) => (
                    <Card
                      key={video.id}
                      className={`cursor-pointer transition-colors ${
                        selectedVideo?.id === video.id ? "ring-2 ring-blue-500" : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleVideoSelect(video)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Video className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{video.filename}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getStatusColor(video.status)}>
                                {video.status === "completed"
                                  ? "已完成"
                                  : video.status === "processing"
                                    ? "处理中"
                                    : "失败"}
                              </Badge>
                              {video.status === "completed" && (
                                <span className="text-xs text-gray-500">{video.defectCount} 个病害</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDuration(video.duration)} • {formatFileSize(video.size)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 检测结果详情 */}
        <div className="lg:col-span-2">
          {selectedVideo ? (
            <div className="space-y-6">
              {/* 视频信息 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedVideo.filename}</CardTitle>
                      <CardDescription>上传时间: {new Date(selectedVideo.uploadTime).toLocaleString()}</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        预览
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        下载报告
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{selectedVideo.defectCount}</p>
                      <p className="text-sm text-gray-600">发现病害</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{formatDuration(selectedVideo.duration)}</p>
                      <p className="text-sm text-gray-600">视频时长</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{formatFileSize(selectedVideo.size)}</p>
                      <p className="text-sm text-gray-600">文件大小</p>
                    </div>
                    <div className="text-center">
                      <Badge className={getStatusColor(selectedVideo.status)}>
                        {selectedVideo.status === "completed"
                          ? "检测完成"
                          : selectedVideo.status === "processing"
                            ? "处理中"
                            : "检测失败"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 病害列表 */}
              <Card>
                <CardHeader>
                  <CardTitle>检测到的病害</CardTitle>
                  <CardDescription>按时间顺序显示检测到的道路病害</CardDescription>
                </CardHeader>
                <CardContent>
                  {defects.length > 0 ? (
                    <div className="space-y-4">
                      {defects.map((defect) => (
                        <Card key={defect.id} className="border-l-4 border-l-red-500">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                  <AlertTriangle className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{defect.type}</h4>
                                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                    <div className="flex items-center">
                                      <Calendar className="w-4 h-4 mr-1" />
                                      {formatDuration(defect.timestamp)}
                                    </div>
                                    <div className="flex items-center">
                                      <MapPin className="w-4 h-4 mr-1" />
                                      {defect.location}
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">
                                    置信度: {(defect.confidence * 100).toFixed(1)}%
                                  </p>
                                </div>
                              </div>
                              <Badge className={getSeverityColor(defect.severity)}>
                                {defect.severity === "high" ? "严重" : defect.severity === "medium" ? "中等" : "轻微"}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">未检测到病害</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">选择视频查看结果</h3>
                <p className="text-gray-600">从左侧列表中选择一个视频来查看详细的检测结果</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
