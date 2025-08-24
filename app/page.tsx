"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  QrCode,
  BarChart3,
  Shield,
  Database,
  Smartphone,
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Globe,
  Star,
  Award,
  TrendingUp,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth"
import { ForgotPasswordModal } from "@/components/forgot-password-modal"

export default function LandingPage() {
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      if (currentUser.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/user/dashboard")
      }
    }
  }, [router])

  const features = [
    {
      icon: QrCode,
      title: "Smart QR Scanning",
      description: "Dynamic QR codes with real-time validation and security",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Database,
      title: "Offline Sync",
      description: "Seamless offline functionality with automatic synchronization",
      color: "text-green-600",
      bgColor: "bg-green-50",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "AI-powered insights with predictive attendance patterns",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Military-grade encryption with biometric authentication",
      color: "text-red-600",
      bgColor: "bg-red-50",
      gradient: "from-red-500 to-orange-500",
    },
    {
      icon: Smartphone,
      title: "Cross-Platform",
      description: "Native mobile apps with responsive web interface",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      icon: Clock,
      title: "Real-Time Updates",
      description: "Instant notifications with live attendance tracking",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      gradient: "from-orange-500 to-yellow-500",
    },
  ]

  const stats = [
    { number: "50K+", label: "Active Students", icon: Users, gradient: "from-blue-500 to-purple-500" },
    { number: "99.9%", label: "System Uptime", icon: CheckCircle, gradient: "from-green-500 to-emerald-500" },
    { number: "200+", label: "Universities", icon: Globe, gradient: "from-purple-500 to-pink-500" },
    { number: "24/7", label: "Live Support", icon: Zap, gradient: "from-orange-500 to-red-500" },
  ]

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Dean of Engineering",
      content: "SmartAttend has revolutionized our attendance management. The accuracy and efficiency are remarkable.",
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60&text=SJ",
    },
    {
      name: "Prof. Michael Chen",
      role: "Computer Science Department",
      content: "The analytics features provide incredible insights into student engagement patterns.",
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60&text=MC",
    },
    {
      name: "Lisa Rodriguez",
      role: "Student Council President",
      content: "As a student, I love how quick and easy it is to mark attendance. No more paper rolls!",
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60&text=LR",
    },
  ]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await authService.login(loginForm.email, loginForm.password)

      if (result.success && result.user) {
        if (result.user.role === "admin") {
          router.push("/admin/dashboard")
        } else {
          router.push("/user/dashboard")
        }
      } else {
        setError(result.error || "Login failed")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-green-400/30 to-blue-600/30 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Enhanced Header */}
      <header className="relative z-10 bg-white/90 backdrop-blur-xl shadow-lg border-b border-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-75 animate-pulse-glow"></div>
                <div className="relative bg-white p-3 rounded-xl shadow-lg">
                  <QrCode className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
                  SmartAttend
                </h1>
                <p className="text-sm text-gray-600 font-medium">Next-Generation Attendance System</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <div className="flex items-center space-x-2 text-sm text-gray-600 font-medium">
                <Award className="h-4 w-4 text-yellow-500" />
                <span>KL University Certified</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-green-600 font-medium">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span>All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Enhanced Left Side - Hero Content */}
          <div className="space-y-10 animate-slide-up">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-6 py-3 rounded-full text-sm font-semibold border border-blue-200/50 shadow-lg">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <span>Trusted by 200+ Universities Worldwide</span>
                <TrendingUp className="h-4 w-4" />
              </div>

              <h2 className="text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                WELCOME TO ACM SIGBED
              </h2>

              
            </div>

            

            

            
          </div>

          {/* Enhanced Right Side - Auth Forms */}
          <div className="max-w-lg mx-auto w-full animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <Card className="bg-white/95 backdrop-blur-xl border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
              <CardHeader className="text-center pb-8 relative">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Sign In</CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  Access your smart attendance dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="login-email" className="text-sm font-semibold text-gray-700 flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        Email Address
                      </Label>
                      <div className="relative">
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="Enter your email address"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          className="h-14 bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl text-lg pl-12"
                          required
                        />
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="login-password" className="text-sm font-semibold text-gray-700 flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          className="h-14 bg-white/70 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl text-lg pl-12 pr-12"
                          required
                        />
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl text-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Signing In...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <span>Sign In</span>
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setIsForgotPasswordOpen(true)}
                      className="w-full text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Forgot your password?
                    </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal isOpen={isForgotPasswordOpen} onClose={() => setIsForgotPasswordOpen(false)} />
    </div>
  )
}
