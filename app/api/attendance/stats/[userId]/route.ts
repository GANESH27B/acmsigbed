import { type NextRequest, NextResponse } from "next/server"
import { AttendanceModel } from "@/lib/models/Attendance"
import jwt from "jsonwebtoken"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const awaitedParams = await context.params;
    // Get authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
    
    // Check if user is admin or requesting their own data
    if (decoded.role !== "admin" && decoded.userId !== awaitedParams.userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Get attendance stats
    const stats = await AttendanceModel.getAttendanceStats(awaitedParams.userId)

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error("Get attendance stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
