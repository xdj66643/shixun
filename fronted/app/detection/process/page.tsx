"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Shield } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { AlertTriangle } from "lucide-react"

interface Defect {
  id: string
  defect_type: string
  severity: "low" | "medium" | "high"
  position: string
  confidence: number
  area?: number
  image_path?: string
  video_path?: string
  processed?: boolean // 新增字段，表示病害是否已处理
}

function FaceAuthModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          setStream(s)
          if (videoRef.current) videoRef.current.srcObject = s
        })
        .catch(() => setError("无法访问摄像头"))
    }
    return () => {
      stream?.getTracks().forEach(track => track.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleCaptureAndAuth = async () => {
    setLoading(true)
    setError("")
    const video = videoRef.current
    const canvas = canvasRef.current
    if (video && canvas) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(async (blob) => {
        if (blob) {
          const formData = new FormData()
          formData.append("faceImage", blob, "face.jpg")
          try {
            const res = await fetch("/api/auth/login/face", {
              method: "POST",
              body: formData,
            })
            const data = await res.json()
            if (data.code === 0) {
              onSuccess()
              onClose()
            } else {
              setError(data.message || "识别失败")
            }
          } catch {
            setError("识别请求失败")
          }
        }
        setLoading(false)
      }, "image/jpeg")
    }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-sm flex flex-col items-center">
        <video ref={videoRef} autoPlay playsInline style={{ width: 320, height: 240, borderRadius: 8, background: '#000' }} />
        <canvas ref={canvasRef} style={{ display: "none" }} />
        <Button className="mt-4 w-full" onClick={handleCaptureAndAuth} disabled={loading}>
          {loading ? "识别中..." : "开始人脸识别认证"}
        </Button>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        <Button variant="ghost" className="mt-2 w-full" onClick={onClose}>取消</Button>
      </div>
    </div>
  )
}

export default function DefectProcessPage() {
  const [videos, setVideos] = useState<any[]>([])
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null)
  const [defects, setDefects] = useState<Defect[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [authOpen, setAuthOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")

  useEffect(() => {
    // 获取所有视频
    fetch("/api/detection/videos")
      .then(res => res.json())
      .then(res => setVideos(res.data || []))
      .catch(() => setVideos([]))
  }, [])

  useEffect(() => {
    if (!selectedVideo) {
      setDefects([])
      setLoading(false)
      return
    }
    setLoading(true)
    fetch(`/api/detection/defects?videoId=${selectedVideo.id}`)
      .then(res => res.json())
      .then(res => setDefects(res.data || []))
      .catch(() => setDefects([]))
      .finally(() => setLoading(false))
  }, [selectedVideo])

  const handleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleProcess = () => {
    if (selected.length === 0) return
    setAuthOpen(true)
  }

  const handleAuthSuccess = async () => {
    // 调用后端处理接口
    await fetch('/api/detection/defect/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ defectIds: selected }),
    })
    setSuccessMsg("病害处理成功！")
    setSelected([])
    // 处理后刷新病害列表
    if (selectedVideo) {
      setLoading(true)
      fetch(`/api/detection/defects?videoId=${selectedVideo.id}`)
        .then(res => res.json())
        .then(res => setDefects(res.data || []))
        .catch(() => setDefects([]))
        .finally(() => setLoading(false))
    }
    setTimeout(() => setSuccessMsg(""), 2000)
  }

  return (
    <div className="max-w-5xl mx-auto mt-8 space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-500">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">病害处理</CardTitle>
              <CardDescription className="text-sm">管理和处理检测到的道路病害信息</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            {successMsg && <div className="text-green-600 font-bold mb-2">{successMsg}</div>}
            <div className="flex flex-col md:flex-row gap-6">
              {/* 视频选择列表 */}
              <div className="md:w-1/3">
                <div className="font-semibold mb-2">检测视频</div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {videos.map((video) => (
                    <Card
                      key={video.id}
                      className={`cursor-pointer transition-colors ${selectedVideo?.id === video.id ? "ring-2 ring-blue-500" : "hover:bg-gray-50"}`}
                      onClick={() => setSelectedVideo(video)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{video.filename || video.sourcePath || "未知文件名"}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500">{video.defectCount} 个病害</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, "0")}` : "未知"} • {video.size ? `${(video.size / 1024 / 1024).toFixed(2)} MB` : "未知"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              {/* 病害多选列表 */}
              <div className="md:w-2/3">
                {loading ? (
                  <div className="text-slate-500">加载中...</div>
                ) : defects.length === 0 ? (
                  <div className="text-slate-500">暂无病害数据</div>
                ) : (
                  <div className="space-y-2">
                    {defects.map(defect => (
                      <label key={defect.id} className="flex items-center space-x-3 p-2 rounded hover:bg-slate-50 cursor-pointer border border-slate-100">
                        <input
                          type="checkbox"
                          checked={selected.includes(defect.id)}
                          onChange={() => handleSelect(defect.id)}
                          className="accent-red-500"
                          disabled={defect.processed}
                        />
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          <span className="font-medium">{defect.defect_type}</span>
                          <span className="text-xs text-slate-500">{defect.position}</span>
                          <span className="text-xs text-slate-500">置信度: {(defect.confidence * 100).toFixed(1)}%</span>
                          <span className="text-xs text-slate-500">{(defect.confidence*100) > 40 ? "严重" : "轻微"}</span>
                          {defect.processed && <span className="text-green-600 ml-2">已处理</span>}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            <Button onClick={handleProcess} disabled={selected.length === 0}>处理</Button>
            <Link href="/dashboard">
              <Button variant="outline">返回仪表板</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      <FaceAuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} />
    </div>
  )
} 