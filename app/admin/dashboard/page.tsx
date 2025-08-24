"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  QrCode,
  Scan,
  Users,
  Download,
  Search,
  LogOut,
  UserCheck,
  Calendar,
  TrendingUp,
  RefreshCw,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  UserPlus,
  Camera,
  FileSpreadsheet,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { type User, authService, attendanceService } from "@/lib/auth"
import { ProfileEditModal } from "@/components/profile-edit-modal"
import { AddStudentModal } from "@/components/add-student-modal"
import { UserInfoModal } from "@/components/user-info-modal"

import { SimpleAvatar } from "@/components/simple-avatar"
import { ErrorHandler } from "@/lib/error-handler"

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [scanResult, setScanResult] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isScanning, setIsScanning] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState("")
  const [manualStudentId, setManualStudentId] = useState("")
  const [students, setStudents] = useState<User[]>([])
  const [todayAttendance, setTodayAttendance] = useState<any[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [scannedUser, setScannedUser] = useState<User | null>(null)
  const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false)
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false)
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  const router = useRouter()

  const subjects = [
    "Data Structures",
    "Database Systems",
    "Web Development",
    "Algorithms",
    "Software Engineering",
    "Computer Networks",
    "Operating Systems",
    "Machine Learning",
  ]

  const departments = [
    "Computer Science Engineering",
    "Electronics and Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Information Technology",
  ]

  useEffect(() => {
    const user = authService.getCurrentUser()
    if (!user) {
      router.push("/")
      return
    }

    if (user.role !== "admin") {
      router.push("/user/dashboard")
      return
    }

    setCurrentUser(user)
    loadData()

    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [router])

  const loadData = async () => {
    try {
      const allStudents = await authService.getAllUsers()
      setStudents(allStudents)

      const attendance = await attendanceService.getTodayAttendance()
      setTodayAttendance(attendance)
    } catch (error) {
      console.error("Failed to load data:", error)
    }
  }

  const handleScan = async () => {
    if (!selectedSubject) {
      alert("Please select a subject first!")
      return
    }

    setIsScanning(true)

    // Simulate QR code scanning
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock scan result - get a random student
    const mockUser = students[Math.floor(Math.random() * students.length)]
    if (mockUser) {
      const mockScanResult = JSON.stringify({
        userId: mockUser.id,
        userName: mockUser.fullName,
        email: mockUser.email,
        registrationNumber: mockUser.registrationNumber,
        timestamp: Date.now(),
        type: "SMARTATTEND_USER",
      })
      setScanResult(mockScanResult)
      setScannedUser(mockUser)
      setIsUserInfoModalOpen(true)
    }

    setIsScanning(false)
  }

  const handleMarkAttendanceFromModal = async () => {
    if (scannedUser && selectedSubject && currentUser) {
      const result = await attendanceService.markAttendance(scannedUser.id, selectedSubject, currentUser.id)
      if (result.success) {
        alert(`✅ Attendance marked successfully for ${scannedUser.fullName}!`)
        await loadData() // Refresh data
        setIsUserInfoModalOpen(false)
        setScannedUser(null)
        setScanResult("")
      } else {
        alert(`❌ ${result.error}`)
      }
    }
  }

  const handleManualAttendance = async () => {
    if (!manualStudentId || !selectedSubject) {
      alert("Please enter student ID and select subject!")
      return
    }

    const student = students.find(
      (s) => s.id === manualStudentId || s.studentId === manualStudentId || s.registrationNumber === manualStudentId,
    )
    if (!student) {
      alert("Student not found!")
      return
    }

    const result = await attendanceService.markAttendance(student.id, selectedSubject, currentUser?.id || "")
    if (result.success) {
      alert(`✅ Attendance marked successfully for ${student.fullName}!`)
      setManualStudentId("")
      await loadData()
    } else {
      alert(`❌ ${result.error}`)
    }
  }

  const handleLogout = () => {
    authService.logout()
    router.push("/")
  }

  const exportToExcel = () => {
    // Create CSV content
    const csvContent = [
      ["Name", "Registration Number", "Email", "Department", "ACM Member", "ACM Role", "Attendance %", "Status"].join(
        ",",
      ),
      ...filteredStudents.map((student) =>
        [
          student.fullName,
          student.registrationNumber || "N/A",
          student.email,
          student.department,
          student.acmMember ? "Yes" : "No",
          student.acmRole || "N/A",
          `${getAttendancePercentage(student.id)}%`,
          student.isActive ? "Active" : "Inactive",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `students_report_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportDailyAttendance = () => {
    attendanceService.exportDailyAttendance(selectedDate)
  }

  const handleExportUserAttendance = (userId: string) => {
    attendanceService.exportUserAttendance(userId)
  }

  const getAttendancePercentage = (userId: string) => {
    const stats = attendanceService.getAttendanceStats(userId)
    return stats.percentage
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment = filterDepartment === "all" || student.department === filterDepartment

    return matchesSearch && matchesDepartment
  })

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 85) return "text-green-600"
    if (percentage >= 75) return "text-yellow-600"
    return "text-red-600"
  }

  const getAttendanceBadge = (percentage: number) => {
    if (percentage >= 85) return "bg-green-100 text-green-700 border-green-200"
    if (percentage >= 75) return "bg-yellow-100 text-yellow-700 border-yellow-200"
    return "bg-red-100 text-red-700 border-red-200"
  }

  const handleDeleteUser = async (userId: string) => {
    if (currentUser && userId === currentUser.id) {
      alert("You cannot delete your own account from the dashboard.")
      return
    }
    if (window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
      const result = await authService.deleteUser(userId)
      if (result.success) {
        alert("User deleted successfully!")
        await loadData()
      } else {
        alert(`Error: ${result.error}`)
      }
    }
  }

  const stats = [
    {
      title: "Total Students",
      value: students.length.toString(),
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      gradient: "from-blue-500 to-cyan-500",
      trend: "up",
    },
    {
      title: "Present Today",
      value: todayAttendance.length.toString(),
      change: "+5.2%",
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      gradient: "from-green-500 to-emerald-500",
      trend: "up",
    },
    {
      title: "Attendance Rate",
      value: students.length > 0 ? `${Math.round((todayAttendance.length / students.length) * 100)}%` : "0%",
      change: "+2.1%",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      gradient: "from-purple-500 to-pink-500",
      trend: "up",
    },
    {
      title: "Active Subjects",
      value: subjects.length.toString(),
      change: "0%",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      gradient: "from-orange-500 to-red-500",
      trend: "neutral",
    },
  ]

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-100">
      {/* Enhanced Header */}
      <header className="bg-white/90 backdrop-blur-xl shadow-lg border-b border-white/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl blur opacity-75 animate-pulse-glow"></div>
                <div className="relative bg-white p-3 rounded-xl shadow-lg">
                  <QrCode className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  SmartAttend Admin
                </h1>
                <p className="text-sm text-gray-600 font-medium">Administrative Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Enhanced Time and Date Display */}
              <div className="hidden md:flex items-center space-x-6 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-white/30">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 font-mono">{currentTime.toLocaleTimeString()}</div>
                    <div className="text-xs text-gray-600">Live Time</div>
                  </div>
                </div>
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-900">
                    {currentTime.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-xs text-gray-600">Today</div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div onClick={() => setIsEditModalOpen(true)}>
                  <SimpleAvatar
                    src={currentUser.profileImage || "/placeholder.svg"}
                    fallback={ErrorHandler.handleSplitError(currentUser.fullName, "A")}
                    className="h-10 w-10 ring-2 ring-purple-200 cursor-pointer hover:ring-purple-400 transition-all duration-300"
                    size="md"
                  />
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-semibold text-gray-900">{ErrorHandler.handleNullValue(currentUser.fullName, "Admin")}</div>
                  <div className="text-xs text-gray-500">System Administrator</div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 bg-white/80 backdrop-blur-sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Overview */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="bg-white/90 backdrop-blur-xl border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 card-hover"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 font-semibold">{stat.title}</p>
                    <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center space-x-1">
                      <span
                        className={`text-sm font-semibold ${
                          stat.trend === "up"
                            ? "text-green-600"
                            : stat.trend === "down"
                              ? "text-red-600"
                              : "text-gray-600"
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500">vs last week</span>
                    </div>
                  </div>
                  <div className={`p-4 bg-gradient-to-br ${stat.gradient} rounded-2xl shadow-lg`}>
                    <stat.icon className="h-10 w-10 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="scan" className="space-y-6">
          <TabsList className="bg-white/90 backdrop-blur-xl border border-white/30 shadow-lg p-2 rounded-2xl">
            <TabsTrigger
              value="scan"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-xl px-6 py-3 font-semibold transition-all duration-300"
            >
              QR Scanner
            </TabsTrigger>
            <TabsTrigger
              value="students"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-xl px-6 py-3 font-semibold transition-all duration-300"
            >
              Student Management
            </TabsTrigger>
            <TabsTrigger
              value="attendance"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-xl px-6 py-3 font-semibold transition-all duration-300"
            >
              Today's Attendance
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-xl px-6 py-3 font-semibold transition-all duration-300"
            >
              Reports & Export
            </TabsTrigger>
          </TabsList>

          {/* QR Scanner Tab */}
          <TabsContent value="scan">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-xl border-white/30 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Scan className="h-6 w-6 text-orange-600" />
                    <span>QR Code Scanner</span>
                  </CardTitle>
                  <CardDescription>Scan student QR codes to mark attendance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Select Subject</label>
                      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger className="h-12 bg-white/70 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl">
                          <SelectValue placeholder="Choose subject for attendance" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-md rounded-xl">
                          {subjects.map((subject) => (
                            <SelectItem key={subject} value={subject} className="hover:bg-orange-50 rounded-lg">
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="relative bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-3xl border-2 border-dashed border-orange-200">
                    <div className="text-center">
                      {isScanning ? (
                        <div className="space-y-6">
                          <div className="relative">
                            <div className="w-24 h-24 mx-auto">
                              <Camera className="h-24 w-24 text-orange-600 animate-pulse" />
                              <div className="absolute inset-0 border-4 border-orange-600 rounded-full animate-ping opacity-20"></div>
                            </div>
                          </div>
                          <p className="text-orange-700 font-semibold text-lg">Scanning for QR codes...</p>
                          <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <Camera className="h-24 w-24 mx-auto text-gray-400" />
                          <div>
                            <p className="text-gray-600 font-semibold text-lg mb-2">
                              Position QR code within the frame
                            </p>
                            <p className="text-sm text-gray-500">Make sure the subject is selected above</p>
                          </div>
                          <Button
                            onClick={handleScan}
                            disabled={!selectedSubject}
                            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <Scan className="h-5 w-5 mr-2" />
                            Start Scanning
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {scanResult && (
                    <div className="p-6 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-2xl">
                      <div className="flex items-center space-x-4">
                        <CheckCircle2 className="h-8 w-8 text-teal-600" />
                        <div>
                          <p className="text-lg font-semibold text-teal-800">QR Code Detected!</p>
                          <p className="text-sm text-teal-600">Student information loaded successfully</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-xl border-white/30 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Edit className="h-6 w-6 text-teal-600" />
                    <span>Manual Attendance</span>
                  </CardTitle>
                  <CardDescription>Mark attendance manually if needed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Student ID / Registration Number
                      </label>
                      <Input
                        placeholder="Enter student ID or registration number"
                        value={manualStudentId}
                        onChange={(e) => setManualStudentId(e.target.value)}
                        className="h-12 bg-white/70 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl text-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Subject</label>
                      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger className="h-12 bg-white/70 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-md rounded-xl">
                          {subjects.map((subject) => (
                            <SelectItem key={subject} value={subject} className="hover:bg-orange-50 rounded-lg">
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    onClick={handleManualAttendance}
                    className="w-full h-14 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <UserCheck className="h-5 w-5 mr-2" />
                    Mark Attendance
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Student Management Tab */}
          <TabsContent value="students">
            <Card className="bg-white/90 backdrop-blur-xl border-white/30 shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-6 w-6 text-orange-600" />
                      <span>Student Management</span>
                    </CardTitle>
                    <CardDescription>View and manage student records</CardDescription>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg rounded-xl px-4 py-2"
                      onClick={() => setIsAddStudentModalOpen(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Student
                    </Button>
                    <Button
                      onClick={exportToExcel}
                      className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Excel
                    </Button>
                    
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Search students by name, email, or registration number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 h-12 bg-white/70 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl"
                      />
                    </div>
                    <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                      <SelectTrigger className="w-full sm:w-64 h-12 bg-white/70 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl">
                        <SelectValue placeholder="Filter by department" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-md rounded-xl">
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="h-12 px-4 bg-transparent" onClick={loadData}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {filteredStudents.map((student) => {
                      const attendancePercentage = getAttendancePercentage(student.id)
                      return (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-6 bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                        >
                          <div className="flex items-center space-x-6">
                            <SimpleAvatar
                              src={student.profileImage || "/placeholder.svg"}
                              fallback={ErrorHandler.handleSplitError(student.fullName)}
                              className="h-16 w-16 ring-2 ring-gray-200"
                              size="lg"
                            />

                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="text-xl font-bold text-gray-900">{ErrorHandler.handleNullValue(student.fullName, "Unknown Student")}</div>
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    student.isActive ? "bg-green-500" : "bg-gray-400"
                                  } animate-pulse`}
                                ></div>
                                {student.acmMember && student.acmRole && (
                                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
                                    ACM {student.acmRole}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-gray-600 mb-1">{ErrorHandler.handleNullValue(student.email)}</div>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>Reg: {ErrorHandler.handleNullValue(student.registrationNumber)}</span>
                                <span>•</span>
                                <span>{ErrorHandler.handleNullValue(student.department)}</span>
                                {student.studentId && (
                                  <>
                                    <span>•</span>
                                    <span>ID: {student.studentId}</span>
                                  </>
                                )}
                                <span>•</span>
                                <span>Joined: {new Date(student.joinDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <div className={`text-3xl font-bold ${getAttendanceColor(attendancePercentage)}`}>
                                {attendancePercentage}%
                              </div>
                              <Badge className={`${getAttendanceBadge(attendancePercentage)} text-sm font-semibold`}>
                                {attendancePercentage >= 85
                                  ? "Excellent"
                                  : attendancePercentage >= 75
                                    ? "Good"
                                    : "At Risk"}
                              </Badge>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-orange-50"
                                onClick={() => {
                                  setSelectedUser(student)
                                  setIsEditModalOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-teal-50"
                                onClick={() => {
                                  setScannedUser(student)
                                  setIsUserInfoModalOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-red-50"
                                onClick={() => handleExportUserAttendance(student.id)}
                              >
                                <FileSpreadsheet className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-red-50 text-red-600"
                                onClick={() => handleDeleteUser(student.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {filteredStudents.length === 0 && (
                      <div className="text-center py-16">
                        <Users className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                        <p className="text-gray-600 font-semibold text-xl mb-2">No students found</p>
                        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Today's Attendance Tab */}
          <TabsContent value="attendance">
            <Card className="bg-white/90 backdrop-blur-xl border-white/30 shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-6 w-6 text-teal-600" />
                      <span>Today's Attendance</span>
                    </CardTitle>
                    <CardDescription>Students who marked attendance today</CardDescription>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className="bg-teal-100 text-teal-700 border-teal-200 px-4 py-2 text-lg font-semibold">
                      {todayAttendance.length} students present
                    </Badge>
                    <Button variant="outline" size="sm" className="hover:bg-teal-50 bg-transparent" onClick={loadData}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayAttendance.map((record, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-6 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200 rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className="flex items-center space-x-6">
                        <SimpleAvatar
                          src={`/placeholder.svg?height=56&width=56&text=${ErrorHandler.handleSplitError(record.userName)}`}
                          fallback={ErrorHandler.handleSplitError(record.userName)}
                          className="h-14 w-14 ring-2 ring-teal-200"
                          size="lg"
                        />

                        <div>
                          <div className="text-xl font-bold text-gray-900">{ErrorHandler.handleNullValue(record.userName, "Unknown User")}</div>
                          <div className="text-gray-600 flex items-center space-x-3">
                            <span>Reg: {ErrorHandler.handleNullValue(authService.getUserById(record.userId)?.registrationNumber)}</span>
                            <span>•</span>
                            <span>{ErrorHandler.handleNullValue(record.subject)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="text-lg font-bold text-teal-700 flex items-center space-x-2">
                            <Clock className="h-5 w-5" />
                            <span>{record.time}</span>
                          </div>
                          <Badge className="bg-teal-100 text-teal-800 border-teal-200 mt-2 font-semibold">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Present
                          </Badge>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-teal-100"
                          onClick={() => {
                            const user = authService.getUserById(record.userId)
                            if (user) {
                              setScannedUser(user)
                              setIsUserInfoModalOpen(true)
                            }
                          }}
                        >
                          <Eye className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {todayAttendance.length === 0 && (
                    <div className="text-center py-16">
                      <XCircle className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                      <p className="text-gray-600 font-semibold text-xl mb-2">No attendance records for today</p>
                      <p className="text-gray-500">Students will appear here once they mark attendance</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports & Export Tab */}
          <TabsContent value="reports">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-xl border-white/30 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileSpreadsheet className="h-6 w-6 text-orange-600" />
                    <span>Daily Attendance Export</span>
                  </CardTitle>
                  <CardDescription>Export attendance records for a specific date</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Select Date</label>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="h-12 bg-white/70 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl text-lg"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleExportDailyAttendance}
                    className="w-full h-14 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Export Daily Attendance
                  </Button>

                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                    <p className="text-sm text-orange-800 font-medium">Export includes:</p>
                    <ul className="text-xs text-orange-700 mt-2 space-y-1">
                      <li>• Student names and registration numbers</li>
                      <li>• Subject and time information</li>
                      <li>• Attendance status and marked by</li>
                      <li>• Complete daily summary</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-xl border-white/30 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-6 w-6 text-teal-600" />
                    <span>Student Reports</span>
                  </CardTitle>
                  <CardDescription>Export individual student attendance details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Individual student reports can be exported from the Student Management tab by clicking the
                      spreadsheet icon next to each student.
                    </p>
                  </div>

                  <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl">
                    <p className="text-sm text-teal-800 font-medium">Individual reports include:</p>
                    <ul className="text-xs text-teal-700 mt-2 space-y-1">
                      <li>• Complete student information</li>
                      <li>• ACM membership details</li>
                      <li>• Attendance statistics and percentage</li>
                      <li>• Detailed attendance history</li>
                      <li>• Subject-wise breakdown</li>
                    </ul>
                  </div>

                  <Button
                    onClick={exportToExcel}
                    className="w-full h-14 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Export All Students
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Info Modal for Scanned QR */}
      <UserInfoModal
        user={scannedUser}
        isOpen={isUserInfoModalOpen}
        onClose={() => {
          setIsUserInfoModalOpen(false)
          setScannedUser(null)
        }}
        onMarkAttendance={handleMarkAttendanceFromModal}
        selectedSubject={selectedSubject}
      />

      {/* Profile Edit Modal for Selected Student */}
      {selectedUser && (
        <ProfileEditModal
          user={selectedUser}
          isOpen={isEditModalOpen && !!selectedUser}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedUser(null)
          }}
          onUpdate={async (updatedUser) => {
            await loadData() // Refresh the student list
            setIsEditModalOpen(false)
            setSelectedUser(null)
          }}
        />
      )}

      {/* Admin Profile Edit Modal */}
      <ProfileEditModal
        user={currentUser}
        isOpen={isEditModalOpen && !selectedUser}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={(updatedUser) => {
          setCurrentUser(updatedUser)
          setIsEditModalOpen(false)
        }}
      />

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        onStudentAdded={async () => {
          await loadData() // Refresh the student list after adding
          setIsAddStudentModalOpen(false)
        }}
      />
    </div>
  )
}
