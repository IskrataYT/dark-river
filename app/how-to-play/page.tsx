import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Mail, Send, AlertTriangle, Info, File } from "lucide-react"

export const metadata = {
  title: "Dark River | How to Play",
  description: "Learn how to play Dark River",
}

export default async function HowToPlayPage() {
  const session = await getSession()

  if (!session) {
    redirect("/auth")
  }

  return (
    <>
      <Navbar userName={session.name} isAdmin={session.isAdmin} />
      <main className="flex min-h-screen flex-col bg-black p-4 text-white">
        <div className="mx-auto w-full max-w-4xl flex-1 py-20">
          <div className="mb-8">
            <h1 className="font-mono text-4xl font-bold tracking-tighter text-white">HOW TO PLAY</h1>
            <p className="mt-2 text-zinc-400">A guide to navigating the Dark River experience</p>
          </div>

          <div className="space-y-8 font-mono">
            <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
              <div className="mb-4 flex items-center">
                <Info className="mr-3 h-6 w-6 text-blue-500" />
                <h2 className="text-2xl font-bold">Introduction</h2>
              </div>
              <p className="text-zinc-300">
                Dark River is an interactive narrative experience where you play as an agent investigating a mysterious
                organization. Your mission unfolds through a series of email exchanges, and your responses determine how
                the story progresses.
              </p>
            </section>

            <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
              <div className="mb-4 flex items-center">
                <Mail className="mr-3 h-6 w-6 text-green-500" />
                <h2 className="text-2xl font-bold">The Terminal</h2>
              </div>
              <p className="text-zinc-300 mb-4">
                The main interface for Dark River is the Terminal, which functions as an email client. Here&apos;s how
                to use it:
              </p>
              <ul className="space-y-4 text-zinc-300">
                <li className="flex">
                  <span className="mr-2 font-bold">1.</span>
                  <span>
                    <strong>Inbox:</strong> Check your inbox for new messages. These will contain instructions,
                    information, and clues about your mission.
                  </span>
                </li>
                <li className="flex">
                  <span className="mr-2 font-bold">2.</span>
                  <span>
                    <strong>Compose:</strong> Click the COMPOSE button to write and send a response. Your responses
                    should address the questions or tasks in the messages you receive.
                  </span>
                </li>
                <li className="flex">
                  <span className="mr-2 font-bold">3.</span>
                  <span>
                    <strong>Sent:</strong> Review messages you&apos;ve sent in the SENT folder. This can help you keep
                    track of your previous responses.
                  </span>
                </li>
              </ul>
            </section>

            <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
              <div className="mb-4 flex items-center">
                <File className="mr-3 h-6 w-6 text-yellow-500" />
                <h2 className="text-2xl font-bold">Investigation Notes</h2>
              </div>
              <p className="text-zinc-300 mb-4">
                The Notes feature helps you keep track of important information during your investigation:
              </p>
              <ul className="space-y-4 text-zinc-300">
                <li className="flex">
                  <span className="mr-2 font-bold">1.</span>
                  <span>
                    <strong>Create Notes:</strong> Click the NOTES button in the navigation bar to access your
                    investigation notes. Create new notes to record important information, clues, and theories.
                  </span>
                </li>
                <li className="flex">
                  <span className="mr-2 font-bold">2.</span>
                  <span>
                    <strong>Auto-Save:</strong> Your notes are automatically saved as you type, ensuring no information
                    is lost.
                  </span>
                </li>
                <li className="flex">
                  <span className="mr-2 font-bold">3.</span>
                  <span>
                    <strong>Organization:</strong> Keep your investigation organized by creating separate notes for
                    different aspects of your investigation.
                  </span>
                </li>
              </ul>
            </section>

            <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
              <div className="mb-4 flex items-center">
                <Send className="mr-3 h-6 w-6 text-purple-500" />
                <h2 className="text-2xl font-bold">Progressing Through the Story</h2>
              </div>
              <p className="text-zinc-300 mb-4">
                To advance in Dark River, you need to send the right responses to the emails you receive:
              </p>
              <ul className="space-y-4 text-zinc-300">
                <li className="flex">
                  <span className="mr-2 font-bold">1.</span>
                  <span>
                    <strong>Read Carefully:</strong> Pay close attention to the content of each message. Look for clues,
                    instructions, or questions that need to be addressed.
                  </span>
                </li>
                <li className="flex">
                  <span className="mr-2 font-bold">2.</span>
                  <span>
                    <strong>Craft Your Response:</strong> Write a response that addresses the content of the message.
                    Your response should include specific keywords or phrases related to the task at hand.
                  </span>
                </li>
                <li className="flex">
                  <span className="mr-2 font-bold">3.</span>
                  <span>
                    <strong>Trigger Next Stage:</strong> If your response contains the correct information, you&apos;ll
                    receive a new message that advances the story. If not, you&apos;ll need to try again with a
                    different approach.
                  </span>
                </li>
              </ul>
            </section>

            <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
              <div className="mb-4 flex items-center">
                <AlertTriangle className="mr-3 h-6 w-6 text-yellow-500" />
                <h2 className="text-2xl font-bold">Tips and Hints</h2>
              </div>
              <ul className="space-y-4 text-zinc-300">
                <li className="flex">
                  <span className="mr-2 font-bold">•</span>
                  <span>If you&apos;re stuck, re-read previous messages for clues you might have missed.</span>
                </li>
                <li className="flex">
                  <span className="mr-2 font-bold">•</span>
                  <span>
                    Sometimes, the solution might involve external knowledge or research. Don&apos;t be afraid to look
                    things up.
                  </span>
                </li>
                <li className="flex">
                  <span className="mr-2 font-bold">•</span>
                  <span>
                    Pay attention to the tone and style of the messages you receive. Matching this in your responses can
                    sometimes help.
                  </span>
                </li>
                <li className="flex">
                  <span className="mr-2 font-bold">•</span>
                  <span>
                    If you&apos;re consistently unable to progress, try being more direct or explicit in your responses.
                  </span>
                </li>
              </ul>
            </section>

            <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-center text-zinc-300">
                Need more help? Visit our{" "}
                <Link href="/contact" className="text-white underline hover:text-zinc-300">
                  contact page
                </Link>{" "}
                to get in touch with our support team.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

