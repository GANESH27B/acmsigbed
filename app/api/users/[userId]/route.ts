import { type NextRequest, NextResponse } from "next/server"
import { UserModel } from "@/lib/models/User"
import jwt, { JwtPayload as OfficialJwtPayload } from "jsonwebtoken"

// Ensure JWT_SECRET is set in your environment variables
if (!process.env.JWT_SECRET) {
  throw new Error("FATAL_ERROR: JWT_SECRET is not defined.")
}
const JWT_SECRET = process.env.JWT_SECRET

// Define a clear type for our JWT payload
interface AppJwtPayload extends OfficialJwtPayload {
  userId: string
  role: "admin" | "user" // Or other roles you have
}

// Type for our authorized handler, passing decoded token in context
type AuthorizedHandler = (
  request: NextRequest,
  context: { params: { userId:string }; decoded: AppJwtPayload }
) => Promise<NextResponse>

// Authorization Higher-Order Function to wrap our route handlers
const withAuthorization = (
  handler: AuthorizedHandler,
  allowed: Array<"admin" | "self">
) => {
  return async (
    request: NextRequest,
    context: { params: Promise<{ userId: string }> }
  ) => {
    try {
      const awaitedParams = await context.params;
      const authHeader = request.headers.get("authorization")
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const token = authHeader.substring(7)
      let decoded: AppJwtPayload
      try {
        decoded = jwt.verify(token, JWT_SECRET) as AppJwtPayload
      } catch (err) {
        return NextResponse.json(
          { error: "Invalid or expired token" },
          { status: 401 }
        )
      }

      const isOwner = decoded.userId === awaitedParams.userId
      const isAdmin = decoded.role === "admin"

      const isAllowed =
        (allowed.includes("admin") && isAdmin) ||
        (allowed.includes("self") && isOwner)

      if (!isAllowed) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }

      // If authorized, call the actual route handler
      return await handler(request, { params: awaitedParams, decoded })
    } catch (error: any) {
      console.error("API Route Error:", error)
      if (error instanceof SyntaxError) {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
      }
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
}

// Helper to map DB user to Frontend user format
const mapUserToFrontend = (dbUser: any) => ({
  id: dbUser.id,
  fullName: dbUser.full_name,
  email: dbUser.email,
  role: dbUser.role,
  department: dbUser.department,
  profileImage: dbUser.profile_image,
  phone: dbUser.phone,
  address: dbUser.address,
  dateOfBirth: dbUser.date_of_birth,
  studentId: dbUser.student_id,
  registrationNumber: dbUser.registration_number,
  joinDate: dbUser.join_date,
  isActive: dbUser.is_active,
  lastLogin: dbUser.last_login,
  acmMember: dbUser.acm_member,
  acmRole: dbUser.acm_role,
  year: dbUser.year,
  section: dbUser.section,
})

// Helper to map frontend keys to database keys for updates
const mapToDbUpdates = (updates: any): any => {
  const keyMap: { [key: string]: string } = {
    fullName: "full_name",
    email: "email",
    phone: "phone",
    address: "address",
    dateOfBirth: "date_of_birth",
    department: "department",
    profileImage: "profile_image",
    studentId: "student_id",
    registrationNumber: "registration_number",
    acmMember: "acm_member",
    acmRole: "acm_role",
    year: "year",
    section: "section",
  }

  return Object.keys(updates).reduce((acc, key) => {
    if (keyMap[key]) {
      acc[keyMap[key]] = updates[key]
    }
    return acc
  }, {} as any)
}

// --- Route Handlers ---

const getUserHandler: AuthorizedHandler = async (request, context) => {
  const result = await UserModel.findById(context.params.userId)
  if (result.success && result.data) {
    const frontendUser = mapUserToFrontend(result.data)
    return NextResponse.json({ success: true, user: frontendUser })
  }
  return NextResponse.json({ error: "User not found" }, { status: 404 })
}

const updateUserHandler: AuthorizedHandler = async (request, context) => {
  const updates = await request.json()
  // Sanitize: convert empty string dateOfBirth to null
  if ("dateOfBirth" in updates && updates.dateOfBirth === "") {
    updates.dateOfBirth = null
  }
  const dbUpdates = mapToDbUpdates(updates)

  // Security: Non-admins cannot change their own role or other sensitive fields.
  if (context.decoded.role !== "admin" && "role" in dbUpdates) {
    delete dbUpdates.role
  }

  const result = await UserModel.updateById(context.params.userId, dbUpdates)
  if (result.success && result.user) {
    const frontendUser = mapUserToFrontend(result.user)
    return NextResponse.json({ success: true, user: frontendUser })
  }
  // Return the real error message for debugging
  return NextResponse.json(
    { error: result.error || "Failed to update user" },
    { status: 500 }
  )
}

const deleteUserHandler: AuthorizedHandler = async (request, context) => {
  const result = await UserModel.deleteById(context.params.userId)
  if (result.success) {
    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    })
  }
  return NextResponse.json(
    { error: result.error || "User not found or failed to delete" },
    { status: 404 }
  )
}

// Export the wrapped handlers
export const GET = withAuthorization(getUserHandler, ["admin", "self"])
export const PATCH = withAuthorization(updateUserHandler, ["admin", "self"])
export const DELETE = withAuthorization(deleteUserHandler, ["admin"])