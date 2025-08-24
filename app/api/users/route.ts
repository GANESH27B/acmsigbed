import { type NextRequest, NextResponse } from "next/server"
import { UserModel } from "@/lib/models/User"
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
    
    // Check if user is admin
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Access denied. Admin only." }, { status: 403 })
    }

    // Get all users
    const result = await UserModel.findAll()
    
    if (result.success) {
      // Map database users to frontend format
      const frontendUsers = result.data?.map((user: any) => ({
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        department: user.department,
        profileImage: user.profile_image,
        phone: user.phone,
        address: user.address,
        dateOfBirth: user.date_of_birth,
        studentId: user.student_id,
        registrationNumber: user.registration_number,
        joinDate: user.join_date,
        isActive: user.is_active,
        lastLogin: user.last_login,
        acmMember: user.acm_member,
        acmRole: user.acm_role,
        year: user.year,
        section: user.section,
      })) || []
      
      return NextResponse.json({
        success: true,
        users: frontendUsers
      })
    } else {
      return NextResponse.json({ error: result.error || "Failed to fetch users" }, { status: 500 })
    }
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 