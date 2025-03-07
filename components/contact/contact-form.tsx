"use client"

import type React from "react"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Неуспешно изпращане на съобщение")
      }

      setSuccess(true)
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "Нещо се обърка")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <h2 className="font-mono text-xl font-bold">Съобщението е изпратено</h2>
        <p className="mt-2 text-zinc-400">Благодарим ви за съобщението. Ще ви отговорим възможно най-скоро.</p>
        <Button onClick={() => setSuccess(false)} className="mt-4">
          Изпрати ново съобщение
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded border border-red-800 bg-red-950/50 p-3 text-sm text-red-500">{error}</div>}

      <div className="space-y-2">
        <Label htmlFor="name">Име</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border-zinc-800 bg-black"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Имейл</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="border-zinc-800 bg-black"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Тема</Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="border-zinc-800 bg-black"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Съобщение</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="min-h-[150px] border-zinc-800 bg-black"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Изпращане...
          </>
        ) : (
          "Изпрати съобщение"
        )}
      </Button>
    </form>
  )
}

