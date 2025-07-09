"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, Mail, User, Lock, Eye, EyeOff, RefreshCw } from "lucide-react"
import { authService } from "@/lib/api/auth"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">智慧道路系统</CardTitle>
          <CardDescription>选择登录方式</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="password">密码登录</TabsTrigger>
              <TabsTrigger value="code">验证码</TabsTrigger>
              <TabsTrigger value="face">人脸识别</TabsTrigger>
            </TabsList>
            <TabsContent value="password">
              <PasswordLoginForm onSuccess={() => router.push("/dashboard")} />
            </TabsContent>
            <TabsContent value="code">
              <CodeLoginForm onSuccess={() => router.push("/dashboard")} />
            </TabsContent>
            <TabsContent value="face">
              <FaceLoginCamera />
            </TabsContent>
          </Tabs>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              还没有账号？{" "}
              <Link href="/auth/register" className="text-blue-600 hover:underline">
                立即注册
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PasswordLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [captchaImage, setCaptchaImage] = useState("")
  const [captchaLoading, setCaptchaLoading] = useState(false)
  const [captchaId, setCaptchaId] = useState<string>("")

  const handlePasswordLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    // 不要在这里 setError("")
    const formData = new FormData(e.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string
    const captchaCode = formData.get("captcha") as string
    try {
      const response = await authService.login({
        username,
        password,
        captcha: captchaCode,
        captchaId: captchaId,
      })
      if (response.success) {
        setError("")
        localStorage.setItem("auth-token", response.token || "")
        localStorage.setItem("user-info", JSON.stringify(response.user || { username }))
        onSuccess()
      } else {
        setError(response.message || "登录失败")
        generateCaptcha()
      }
    } catch (err) {
      setError("登录失败，请重试")
      generateCaptcha()
    } finally {
      setLoading(false)
    }
  }

  const generateCaptcha = async () => {
    setCaptchaLoading(true)
    try {
      const response = await authService.generateCaptcha()
      if (response.image) {
        setCaptchaImage(response.image)
        setCaptchaId(response.captchaId || "")
        //setError("")
      } else {
        setError("获取验证码失败")
      }
    } catch (err) {
      setError("获取验证码失败，请重试")
      console.error("Generate captcha error:", err)
    } finally {
      setCaptchaLoading(false)
    }
  }

  // 删除自动请求验证码的 useEffect
  // useEffect(() => {
  //   generateCaptcha()
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])

  return (
    <form onSubmit={handlePasswordLogin} className="space-y-4">
      {error && (
        <Alert className="mb-4" variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="username">用户名</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="请输入用户名"
            className="pl-10"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">密码</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="请输入密码"
            className="pl-10 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="captcha">验证码</Label>
        <div className="flex space-x-2">
          <Input
            id="captcha"
            name="captcha"
            type="text"
            placeholder="请输入验证码"
            required
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={generateCaptcha}
            disabled={captchaLoading}
            className="px-3 bg-transparent"
          >
            {captchaLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "获取验证码"}
          </Button>
        </div>
        {captchaImage && (
          <div className="mt-2">
            <img
              src={captchaImage || "/placeholder.svg"}
              alt="验证码"
              className="h-12 border rounded cursor-pointer hover:opacity-80"
              onClick={generateCaptcha}
              title="点击刷新验证码"
            />
            <p className="text-xs text-gray-500 mt-1">点击图片刷新验证码</p>
          </div>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "登录中..." : "登录"}
      </Button>
    </form>
  )
}

function CodeLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [contact, setContact] = useState("")
  const [code, setCode] = useState("")

  const handleCodeLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    // 不要在这里 setError("")
    try {
      const response = await authService.loginWithCode({
        target: contact,
        code: code,
        type: contact.includes("@") ? "EMAIL" : "PHONE"
      })
      if (response.success) {
        setError("")
        localStorage.setItem("auth-token", response.token || "")
        localStorage.setItem("user-info", JSON.stringify(response.user || {}))
        onSuccess()
      } else {
        setError(response.message || "登录失败")
      }
    } catch (err) {
      setError("登录失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  const sendVerificationCode = async () => {
    try {
      const response = await authService.sendCode({ contact })
      if (response.success) {
        setError("")
        // 可以添加成功提示
      } else {
        setError(response.message || "发送验证码失败")
      }
    } catch (err) {
      setError("发送验证码失败")
    }
  }

  return (
    <form onSubmit={handleCodeLogin} className="space-y-4">
      {error && (
        <Alert className="mb-4" variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="contact">邮箱/手机号</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="contact"
            name="contact"
            type="text"
            placeholder="请输入邮箱或手机号"
            className="pl-10"
            required
            value={contact}
            onChange={e => setContact(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="code">验证码</Label>
        <div className="flex space-x-2">
          <Input
            id="code"
            name="code"
            type="text"
            placeholder="请输入验证码"
            required
            value={code}
            onChange={e => setCode(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={sendVerificationCode}
          >
            发送验证码
          </Button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "登录中..." : "登录"}
      </Button>
    </form>
  )
}

function FaceLoginCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(s => {
        setStream(s)
        if (videoRef.current) videoRef.current.srcObject = s
      })
      .catch(() => setError("无法访问摄像头"))
    return () => {
      stream?.getTracks().forEach(track => track.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCaptureAndLogin = async () => {
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
              localStorage.setItem("auth-token", data.data.token)
              localStorage.setItem("user-info", JSON.stringify(data.data.user))
              window.location.href = "/dashboard"
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

  return (
    <div className="flex flex-col items-center space-y-4">
      <video ref={videoRef} autoPlay playsInline style={{ width: 320, height: 240, borderRadius: 8, background: '#000' }} />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <button
        type="button"
        onClick={handleCaptureAndLogin}
        disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "识别中..." : "开始识别"}
      </button>
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  )
}
