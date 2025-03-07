export async function sendEmail(subject: string, body: string) {
  try {
    const response = await fetch("/api/emails/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subject, body }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Failed to send email")
    }
    return data
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}

