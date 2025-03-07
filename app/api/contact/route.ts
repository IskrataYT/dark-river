import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"
import { z } from "zod"

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = contactSchema.parse(body)

    await sendEmail("support@darkriver.site", "contact-form", {
      subject: validatedData.subject,
      body: validatedData.message,
      senderName: validatedData.name,
      senderEmail: validatedData.email,
    })

    return NextResponse.json({ message: "Message sent successfully" })
  } catch (error) {
    console.error("Contact form error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

