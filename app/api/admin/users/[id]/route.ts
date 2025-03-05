import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import connectDB from "@/lib/db"
import { User } from "@/lib/models/user"
import { z } from "zod"

const updateUserSchema = z.object({
  isAdmin: z.boolean().optional(),
  isModerator: z.boolean().optional(),
  isMuted: z.boolean().optional(),
  muteExpiresAt: z.string().datetime().optional().nullable(),
  isDonor: z.boolean().optional(),
  donorSince: z.string().optional().nullable(),
  donationNotes: z.string().optional(),
})

// Update user roles/status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Log the update request details
    console.log(`[Admin API] Updating user ${params.id} with:`, body)

    const validatedData = updateUserSchema.parse(body)

    await connectDB()

    // Prevent self-modification of admin status
    if (params.id === session.id && validatedData.isAdmin === false) {
      return NextResponse.json({ error: "Cannot remove own admin status" }, { status: 400 })
    }

    const user = await User.findByIdAndUpdate(params.id, { $set: validatedData }, { new: true }).select("-password")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log(`[Admin API] User updated successfully:`, {
      id: user._id,
      isDonor: user.isDonor,
      donorSince: user.donorSince,
      isAdmin: user.isAdmin,
      isModerator: user.isModerator,
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Failed to update user:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete user
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Prevent self-deletion
    if (params.id === session.id) {
      return NextResponse.json({ error: "Cannot delete own account" }, { status: 400 })
    }

    await connectDB()
    const user = await User.findByIdAndDelete(params.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Failed to delete user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

