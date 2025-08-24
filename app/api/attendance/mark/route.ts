import { type NextRequest, NextResponse } from "next/server"
import { AttendanceModel } from "@/lib/models/Attendance"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any

    const { userId, subject, markedBy } = await request.json()

    // Validate input
    if (!userId || !subject) {
      return NextResponse.json({ error: "User ID and subject are required" }, { status: 400 })
    }

    // Mark attendance
    const result = await AttendanceModel.markAttendance(userId, subject, markedBy || decoded.userId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Attendance marked successfully"
      })
    } else {
      return NextResponse.json({ error: result.error || "Failed to mark attendance" }, { status: 500 })
    }
  } catch (error) {
    console.error("Mark attendance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
