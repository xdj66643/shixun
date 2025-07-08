"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, Video, CheckCircle, AlertCircle } from "lucide-react"
import { detectionService } from "@/lib/api/detection"

export default function VideoUploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // 验证文件类型
      if (!selectedFile.type.startsWith("video/")) {
        setError("请选择视频文件")
        return
      }

      // 验证文件大小 (例如限制为100MB)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError("文件大小不能超过100MB")
        return
      }

      setFile(selectedFile)
      setError("")
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("请选择要上传的视频文件")
      return
    }

    setUploading(true)
    setError("")
    setSuccess("")
    setUploadProgress(0)

    try {
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await detectionService.uploadVideo(file)

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.success) {
        setSuccess("视频上传成功！正在进行病害检测...")
        setTimeout(() => {
          router.push("/detection/results")
        }, 2000)
      } else {
        setError(response.message || "上传失败")
      }
    } catch (err) {
      setError("上传失败，请重试")
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">视频上传</h1>
        <p className="text-gray-600 mt-2">上传道路视频进行智能病害检测</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>选择视频文件</CardTitle>
          <CardDescription>支持 MP4、AVI、MOV 等格式，文件大小不超过100MB</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <Label htmlFor="video-file">选择视频文件</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <Input
                id="video-file"
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              <label htmlFor="video-file" className="cursor-pointer flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">点击选择视频文件</p>
                  <p className="text-sm text-gray-500">或将文件拖拽到此处</p>
                </div>
              </label>
            </div>

            {file && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Video className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                    {!uploading && (
                      <Button variant="outline" size="sm" onClick={() => setFile(null)}>
                        移除
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>上传进度</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            <Button onClick={handleUpload} disabled={!file || uploading} className="w-full">
              {uploading ? "上传中..." : "开始上传"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>检测说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• 系统将自动分析视频中的道路状况</p>
            <p>• 检测包括裂缝、坑洞、路面破损等常见病害</p>
            <p>• 检测完成后将生成详细的分析报告</p>
            <p>• 支持多种视频格式，建议使用高清视频以获得更好的检测效果</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
