"use server"

import { z } from "zod"
import { sendEmail } from "@/lib/email"

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

export async function sendContactMessage(formData: {
  name: string
  email: string
  subject: string
  message: string
}) {
  try {
    // Validate form data
    const validatedData = contactFormSchema.parse(formData)

    // Format the message for email
    const emailSubject = `[Dark River Contact] ${validatedData.subject}`
    const emailBody = `
Name: ${validatedData.name}
Email: ${validatedData.email}

Message:
${validatedData.message}
    `

    // Send email to support
    await sendEmail("support@darkriver.site", "contact-form", {
      subject: emailSubject,
      body: emailBody,
      senderName: validatedData.name,
      senderEmail: validatedData.email,
    })

    return { success: true }
  } catch (error) {
    console.error("Contact form submission error:", error)
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message)
    }
    throw new Error("Failed to send message. Please try again later.")
  }
}

