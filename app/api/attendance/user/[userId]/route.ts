import { type NextRequest, NextResponse } from "next/server"
import { AttendanceModel } from "@/lib/models/Attendance"
import jwt from "jsonwebtoken"

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
    
    // Check if user is admin or requesting their own data
    if (decoded.role !== "admin" && decoded.userId !== params.userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Get user attendance
    const result = await AttendanceModel.getUserAttendance(params.userId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        attendance: result.data
      })
    } else {
      return NextResponse.json({ error: result.error || "Failed to fetch user attendance" }, { status: 500 })
    }
  } catch (error) {
    console.error("Get user attendance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 