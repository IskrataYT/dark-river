import sgMail from "@sendgrid/mail"

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

type EmailTemplate = "verification" | "reset-link" | "contact-form"

type EmailData =
  | string
  | {
      subject: string
      body: string
      senderName?: string
      senderEmail?: string
    }

const templates = {
  verification: {
    subject: "Verify your Dark River account",
    text: (otp: string) => `Your verification code is: ${otp}. This code will expire in 10 minutes.`,
    html: (otp: string) => `
      <div style="font-family: monospace; background-color: black; color: white; padding: 20px;">
        <h1 style="color: white;">Dark River - Account Verification</h1>
        <p>Your verification code is:</p>
        <div style="background-color: #1a1a1a; padding: 20px; margin: 20px 0; font-size: 24px; letter-spacing: 5px;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p style="color: #666;">SYSTEM VERSION 2.4.1 // CLASSIFIED</p>
      </div>
    `,
  },
  "reset-link": {
    subject: "Reset your Dark River access code",
    text: (resetUrl: string) =>
      `Click the following link to reset your access code: ${resetUrl}\n\nThis link will expire in 1 hour.`,
    html: (resetUrl: string) => `
      <div style="font-family: monospace; background-color: black; color: white; padding: 20px;">
        <h1 style="color: white;">Dark River - Access Code Reset</h1>
        <p>Click the button below to reset your access code:</p>
        <div style="margin: 20px 0;">
          <a href="${resetUrl}" style="display: inline-block; background-color: white; color: black; padding: 12px 24px; text-decoration: none; font-family: monospace; font-weight: bold;">
            RESET ACCESS CODE
          </a>
        </div>
        <p>Or copy and paste this URL into your browser:</p>
        <div style="background-color: #1a1a1a; padding: 20px; margin: 20px 0; word-break: break-all; font-size: 12px;">
          ${resetUrl}
        </div>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this reset, please ignore this email.</p>
        <p style="color: #666;">SYSTEM VERSION 2.4.1 // CLASSIFIED</p>
      </div>
    `,
  },
  "contact-form": {
    subject: (data: EmailData) => {
      if (typeof data === "string") return "Contact Form Submission"
      return data.subject
    },
    text: (data: EmailData) => {
      if (typeof data === "string") return data
      return data.body
    },
    html: (data: EmailData) => {
      if (typeof data === "string") return `<p>${data}</p>`

      return `
      <div style="font-family: monospace; background-color: black; color: white; padding: 20px;">
        <h1 style="color: white;">Dark River - Contact Form Submission</h1>
        <p><strong>From:</strong> ${data.senderName || "Anonymous"} (${data.senderEmail || "No email provided"})</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <div style="background-color: #1a1a1a; padding: 20px; margin: 20px 0; white-space: pre-wrap;">
          ${data.body}
        </div>
        <p style="color: #666;">SYSTEM VERSION 2.4.1 // CLASSIFIED</p>
      </div>
    `
    },
  },
}

export async function sendEmail(to: string, template: EmailTemplate, data: EmailData) {
  const subject =
    typeof templates[template].subject === "function" ? templates[template].subject(data) : templates[template].subject

  const text =
    typeof templates[template].text === "function" ? templates[template].text(data) : templates[template].text

  const html =
    typeof templates[template].html === "function" ? templates[template].html(data) : templates[template].html

  const msg = {
    to,
    from: "noreply@darkriver.site",
    subject,
    text,
    html,
    replyTo: typeof data === "object" && data.senderEmail ? data.senderEmail : undefined,
  }

  try {
    await sgMail.send(msg)
  } catch (error) {
    console.error("Error sending email:", error)
    throw new Error("Failed to send email")
  }
}

