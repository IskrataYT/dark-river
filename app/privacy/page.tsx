import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export const metadata = {
  title: "Dark River | Privacy Policy",
  description: "Privacy Policy for Dark River",
}

export default async function PrivacyPage() {
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
            <h1 className="font-mono text-4xl font-bold tracking-tighter text-white">PRIVACY POLICY</h1>
            <p className="mt-2 text-zinc-400">Last updated: March 1, 2025</p>
          </div>

          <div className="space-y-6 font-mono">
            <section className="space-y-4">
              <h2 className="text-xl font-bold">1. INTRODUCTION</h2>
              <p className="text-zinc-300">
                Dark River (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, and safeguard your information when you use our
                service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">2. INFORMATION WE COLLECT</h2>
              <p className="text-zinc-300">We collect the following types of information:</p>
              <ul className="list-disc pl-6 text-zinc-300">
                <li>
                  <strong>Account Information:</strong> When you create an account, we collect your name, email address,
                  and password.
                </li>
                <li>
                  <strong>Usage Data:</strong> We collect information about how you interact with our service, including
                  your progress through the narrative.
                </li>
                <li>
                  <strong>Communications:</strong> If you contact us directly, we may receive additional information
                  about you, such as your name, email address, and the contents of your message.
                </li>
                <li>
                  <strong>Investigation Notes:</strong> We store the notes you create during your investigation to help
                  you track important information. These notes are private and only accessible to you.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">3. HOW WE USE YOUR INFORMATION</h2>
              <p className="text-zinc-300">We use the information we collect to:</p>
              <ul className="list-disc pl-6 text-zinc-300">
                <li>Provide, maintain, and improve our service</li>
                <li>Create and manage your account</li>
                <li>Track your progress through the narrative</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Send you updates and administrative messages</li>
                <li>Monitor and analyze usage patterns and trends</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">4. DATA SECURITY</h2>
              <p className="text-zinc-300">
                We implement appropriate technical and organizational measures to protect your personal information
                against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission
                over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">5. DATA RETENTION</h2>
              <p className="text-zinc-300">
                We will retain your personal information only for as long as necessary to fulfill the purposes outlined
                in this Privacy Policy, unless a longer retention period is required or permitted by law.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">6. YOUR RIGHTS</h2>
              <p className="text-zinc-300">
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-6 text-zinc-300">
                <li>The right to access the personal information we hold about you</li>
                <li>The right to request correction of inaccurate information</li>
                <li>The right to request deletion of your personal information</li>
                <li>The right to object to processing of your personal information</li>
                <li>The right to data portability</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">7. COOKIES AND TRACKING TECHNOLOGIES</h2>
              <p className="text-zinc-300">
                We use cookies and similar tracking technologies to track activity on our service and hold certain
                information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being
                sent.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">8. CHANGES TO THIS PRIVACY POLICY</h2>
              <p className="text-zinc-300">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
                Privacy Policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">9. CONTACT US</h2>
              <p className="text-zinc-300">
                If you have any questions about this Privacy Policy, please contact us at{" "}
                <Link href="/contact" className="text-white underline hover:text-zinc-300">
                  our contact page
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

