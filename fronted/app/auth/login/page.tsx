"use client"

import type React from "react"

import { useState } from "react"
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [captchaImage, setCaptchaImage] = useState("")
  const [captchaLoading, setCaptchaLoading] = useState(false)
  const [captchaId, setCaptchaId] = useState<string>("")

  // 用户名密码登录（带验证码）
  const handlePasswordLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

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
        localStorage.setItem("auth-token", response.token || "")
        localStorage.setItem("user-info", JSON.stringify(response.user || { username }))
        router.push("/dashboard")
      } else {
        setError(response.message || "登录失败")
        // 登录失败后刷新验证码
        generateCaptcha()
      }
    } catch (err) {
      setError("登录失败，请重试")
      generateCaptcha()
    } finally {
      setLoading(false)
    }
  }

  // 验证码登录
  const handleCodeLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const contact = formData.get("contact") as string
    const code = formData.get("code") as string

    try {
      const response = await authService.loginWithCode({
        target: contact,
        code: code,
        type: contact.includes("@") ? "EMAIL" : "PHONE"
      })

      if (response.success) {
        localStorage.setItem("auth-token", response.token || "")
        localStorage.setItem("user-info", JSON.stringify(response.user || {}))
        router.push("/dashboard")
      } else {
        setError(response.message || "登录失败")
      }
    } catch (err) {
      setError("登录失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  // 发送验证码
  const sendVerificationCode = async (contact: string) => {
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

  // 人脸登录
  const handleFaceLogin = async (file: File) => {
    setLoading(true)
    setError("")

    try {
      const response = await authService.loginWithFace(file)

      if (response.success) {
        localStorage.setItem("auth-token", response.token || "")
        localStorage.setItem("user-info", JSON.stringify(response.user || {}))
        router.push("/dashboard")
      } else {
        setError(response.message || "人脸识别失败")
      }
    } catch (err) {
      setError("人脸识别失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  // 生成验证码
  const generateCaptcha = async () => {
    setCaptchaLoading(true)
    try {
      const response = await authService.generateCaptcha()
      if (response.image) {
        setCaptchaImage(response.image)
        setCaptchaId(response.captchaId || "")
        setError("")
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">智慧道路系统</CardTitle>
          <CardDescription>选择登录方式</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="password">密码登录</TabsTrigger>
              <TabsTrigger value="code">验证码</TabsTrigger>
              <TabsTrigger value="face">人脸识别</TabsTrigger>
            </TabsList>

            <TabsContent value="password">
              <form onSubmit={handlePasswordLogin} className="space-y-4">
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
            </TabsContent>

            <TabsContent value="code">
              <form onSubmit={handleCodeLogin} className="space-y-4">
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
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">验证码</Label>
                  <div className="flex space-x-2">
                    <Input id="code" name="code" type="text" placeholder="请输入验证码" required />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const contact = (document.getElementById("contact") as HTMLInputElement)?.value
                        if (contact) sendVerificationCode(contact)
                      }}
                    >
                      发送验证码
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "登录中..." : "登录"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="face">
              <div className="space-y-4">
                <div className="text-center">
                  <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-4">请上传人脸照片进行识别登录</p>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFaceLogin(file)
                  }}
                  disabled={loading}
                />
                <Button className="w-full" disabled={loading}>
                  {loading ? "识别中..." : "开始人脸识别"}
                </Button>
              </div>
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
