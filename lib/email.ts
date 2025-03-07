import sgMail from "@sendgrid/mail"

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

type EmailTemplate = "verification" | "reset-link" | "contact-form" | "new-device-login" | "mfa-otp"

type EmailData =
  | string
  | {
      subject: string
      body: string
      senderName?: string
      senderEmail?: string
      deviceName?: string
      browser?: string
      os?: string
      ip?: string
      time?: string
      location?: string
      otp?: string
    }

const templates = {
  verification: {
    subject: "Потвърдете вашия Dark River акаунт",
    text: (otp: string) => `Вашият код за потвърждение е: ${otp}. Този код ще изтече след 10 минути.`,
    html: (otp: string) => `
    <div style="font-family: monospace; background-color: black; color: white; padding: 20px;">
      <h1 style="color: white;">Dark River - Потвърждение на акаунт</h1>
      <p>Вашият код за потвърждение е:</p>
      <div style="background-color: #1a1a1a; padding: 20px; margin: 20px 0; font-size: 24px; letter-spacing: 5px;">
        ${otp}
      </div>
      <p>Този код ще изтече след 10 минути.</p>
      <p style="color: #666;">SYSTEM VERSION 2.4.1 // КЛАСИФИЦИРАНО</p>
    </div>
  `,
  },
  "reset-link": {
    subject: "Нулиране на вашия Dark River код за достъп",
    text: (resetUrl: string) =>
      `Кликнете върху следния линк, за да нулирате вашия код за достъп: ${resetUrl}

Този линк ще изтече след 1 час.`,
    html: (resetUrl: string) => `
    <div style="font-family: monospace; background-color: black; color: white; padding: 20px;">
      <h1 style="color: white;">Dark River - Нулиране на код за достъп</h1>
      <p>Кликнете върху бутона по-долу, за да нулирате вашия код за достъп:</p>
      <div style="margin: 20px 0;">
        <a href="${resetUrl}" style="display: inline-block; background-color: white; color: black; padding: 12px 24px; text-decoration: none; font-family: monospace; font-weight: bold;">
          НУЛИРАНЕ НА КОД ЗА ДОСТЪП
        </a>
      </div>
      <p>Или копирайте и поставете този URL във вашия браузър:</p>
      <div style="background-color: #1a1a1a; padding: 20px; margin: 20px 0; word-break: break-all; font-size: 12px;">
        ${resetUrl}
      </div>
      <p>Този линк ще изтече след 1 час.</p>
      <p>Ако не сте поискали това нулиране, моля, игнорирайте този имейл.</p>
      <p style="color: #666;">SYSTEM VERSION 2.4.1 // КЛАСИФИЦИРАНО</p>
    </div>
  `,
  },
  "contact-form": {
    subject: (data: EmailData) => {
      if (typeof data === "string") return "Изпратена форма за контакт"
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
      <h1 style="color: white;">Dark River - Изпратена форма за контакт</h1>
      <p><strong>От:</strong> ${data.senderName || "Анонимен"} (${data.senderEmail || "Не е предоставен имейл"})</p>
      <p><strong>Тема:</strong> ${data.subject}</p>
      <div style="background-color: #1a1a1a; padding: 20px; margin: 20px 0; white-space: pre-wrap;">
        ${data.body}
      </div>
      <p style="color: #666;">SYSTEM VERSION 2.4.1 // КЛАСИФИЦИРАНО</p>
    </div>
  `
    },
  },
  "new-device-login": {
    subject: "Сигнал за сигурност: Вход от ново местоположение",
    text: (data: EmailData) => {
      if (typeof data === "string") return data
      return `Регистриран е вход във вашия Dark River акаунт от ново местоположение.

Устройство: ${data.deviceName}
Браузър: ${data.browser}
Операционна система: ${data.os}
IP адрес: ${data.ip}
Местоположение: ${data.location || "Неизвестно"}
Време: ${data.time}

Ако това сте вие, можете да игнорирате това съобщение. Ако не разпознавате тази активност, моля, променете паролата си незабавно.`
    },
    html: (data: EmailData) => {
      if (typeof data === "string") return `<p>${data}</p>`

      return `
    <div style="font-family: monospace; background-color: black; color: white; padding: 20px;">
      <h1 style="color: white;">Dark River - Сигнал за сигурност</h1>
      <p>Регистриран е вход във вашия Dark River акаунт от ново местоположение.</p>
      <div style="background-color: #1a1a1a; padding: 20px; margin: 20px 0;">
        <p><strong>Устройство:</strong> ${data.deviceName}</p>
        <p><strong>Браузър:</strong> ${data.browser}</p>
        <p><strong>Операционна система:</strong> ${data.os}</p>
        <p><strong>IP адрес:</strong> ${data.ip}</p>
        <p><strong>Местоположение:</strong> ${data.location || "Неизвестно"}</p>
        <p><strong>Време:</strong> ${data.time}</p>
      </div>
      <p>Ако това сте вие, можете да игнорирате това съобщение.</p>
      <p>Ако не разпознавате тази активност, моля, променете паролата си незабавно.</p>
      <p style="color: #666;">SYSTEM VERSION 2.4.1 // КЛАСИФИЦИРАНО</p>
    </div>
  `
    },
  },
  "mfa-otp": {
    subject: "Dark River - Код за двуфакторна автентикация",
    text: (data: EmailData) => {
      if (typeof data === "string")
        return `Вашият код за двуфакторна автентикация е: ${data}. Този код ще изтече след 10 минути.`
      return `Вашият код за двуфакторна автентикация е: ${data.otp}. Този код ще изтече след 10 минути.`
    },
    html: (data: EmailData) => {
      const otp = typeof data === "string" ? data : data.otp

      return `
    <div style="font-family: monospace; background-color: black; color: white; padding: 20px;">
      <h1 style="color: white;">Dark River - Код за двуфакторна автентикация</h1>
      <p>Вашият код за двуфакторна автентикация е:</p>
      <div style="background-color: #1a1a1a; padding: 20px; margin: 20px 0; font-size: 24px; letter-spacing: 5px;">
        ${otp}
      </div>
      <p>Този код ще изтече след 10 минути.</p>
      <p>Ако не сте опитали да влезете в акаунта си, моля, променете паролата си незабавно.</p>
      <p style="color: #666;">SYSTEM VERSION 2.4.1 // КЛАСИФИЦИРАНО</p>
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

