import { type NextRequest, NextResponse } from "next/server"
import { AttendanceModel } from "@/lib/models/Attendance"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any

    // Get today's attendance
    const result = await AttendanceModel.getTodayAttendance()

    if (result.success) {
      return NextResponse.json({
        success: true,
        attendance: result.data
      })
    } else {
      return NextResponse.json({ error: result.error || "Failed to fetch today's attendance" }, { status: 500 })
    }
  } catch (error) {
    console.error("Get today attendance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
