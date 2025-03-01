"use client"

import type React from "react"

import { useState } from "react"
import { sendContactMessage } from "@/lib/actions/contact-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, AlertCircle } from "lucide-react"

interface ContactFormProps {
  userEmail: string
  userName: string
}

export function ContactForm({ userEmail, userName }: ContactFormProps) {
  const [name, setName] = useState(userName)
  const [email, setEmail] = useState(userEmail)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await sendContactMessage({
        name,
        email,
        subject,
        message,
      })

      setIsSubmitted(true)
      setSubject("")
      setMessage("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
        <h2 className="mb-2 font-mono text-xl font-bold">MESSAGE SENT</h2>
        <p className="mb-6 text-center text-zinc-400">
          Thank you for contacting us. We will respond to your inquiry as soon as possible.
        </p>
        <Button onClick={() => setIsSubmitted(false)} className="bg-white font-mono text-black hover:bg-zinc-200">
          SEND ANOTHER MESSAGE
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center rounded-md border border-red-800 bg-red-950/30 p-4 text-red-500">
          <AlertCircle className="mr-2 h-5 w-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="font-mono text-xs text-zinc-400">
            NAME
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-zinc-800 bg-black font-mono text-white"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="font-mono text-xs text-zinc-400">
            EMAIL
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-zinc-800 bg-black font-mono text-white"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject" className="font-mono text-xs text-zinc-400">
          SUBJECT
        </Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="border-zinc-800 bg-black font-mono text-white"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="font-mono text-xs text-zinc-400">
          MESSAGE
        </Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[200px] border-zinc-800 bg-black font-mono text-white"
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-white font-mono text-black transition-colors hover:bg-zinc-200"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <span className="mr-2">SENDING</span>
            <span className="loading">...</span>
          </span>
        ) : (
          "SEND MESSAGE"
        )}
      </Button>
    </form>
  )
}

