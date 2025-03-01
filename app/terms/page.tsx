import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export const metadata = {
  title: "Dark River | Terms of Service",
  description: "Terms of Service for Dark River",
}

export default async function TermsPage() {
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
            <h1 className="font-mono text-4xl font-bold tracking-tighter text-white">TERMS OF SERVICE</h1>
            <p className="mt-2 text-zinc-400">Last updated: March 1, 2025</p>
          </div>

          <div className="space-y-6 font-mono">
            <section className="space-y-4">
              <h2 className="text-xl font-bold">1. ACCEPTANCE OF TERMS</h2>
              <p className="text-zinc-300">
                By accessing and using the Dark River platform, you acknowledge that you have read, understood, and
                agree to be bound by these Terms of Service. If you do not agree to these terms, you must not access or
                use our services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">2. DESCRIPTION OF SERVICE</h2>
              <p className="text-zinc-300">
                Dark River provides an interactive narrative experience through a simulated communication platform. Our
                service is designed for entertainment and educational purposes only.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">3. USER ACCOUNTS</h2>
              <p className="text-zinc-300">
                To access certain features of Dark River, you must create an account. You are responsible for
                maintaining the confidentiality of your account information and for all activities that occur under your
                account.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">4. INVESTIGATION NOTES</h2>
              <p className="text-zinc-300">
                The investigation notes feature is provided for your convenience to track information during your
                investigation. You are responsible for the content of your notes. We do not monitor the content of your
                notes but reserve the right to remove any content that violates these terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">5. USER CONDUCT</h2>
              <p className="text-zinc-300">
                You agree not to use Dark River for any unlawful purpose or in any way that could damage, disable, or
                impair the service. You must not attempt to gain unauthorized access to any part of the service or any
                system or network connected to Dark River.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">6. INTELLECTUAL PROPERTY</h2>
              <p className="text-zinc-300">
                All content, features, and functionality of Dark River, including but not limited to text, graphics,
                logos, and software, are owned by Dark River and are protected by copyright, trademark, and other
                intellectual property laws.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">7. TERMINATION</h2>
              <p className="text-zinc-300">
                We reserve the right to terminate or suspend your account and access to Dark River at our sole
                discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to
                other users, us, or third parties, or for any other reason.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">8. DISCLAIMER OF WARRANTIES</h2>
              <p className="text-zinc-300">
                Dark River is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We make no
                warranties, expressed or implied, regarding the operation or availability of the service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">9. LIMITATION OF LIABILITY</h2>
              <p className="text-zinc-300">
                In no event shall Dark River be liable for any indirect, incidental, special, consequential, or punitive
                damages resulting from your use of or inability to use the service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">10. CHANGES TO TERMS</h2>
              <p className="text-zinc-300">
                We reserve the right to modify these Terms of Service at any time. We will provide notice of significant
                changes by posting the new Terms of Service on this page.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">11. GOVERNING LAW</h2>
              <p className="text-zinc-300">
                These Terms of Service shall be governed by and construed in accordance with the laws of the
                jurisdiction in which Dark River operates, without regard to its conflict of law provisions.
              </p>
            </section>

            <div className="mt-8 border-t border-zinc-800 pt-6">
              <p className="text-zinc-400">
                For questions about these Terms of Service, please contact us at{" "}
                <Link href="/contact" className="text-white underline hover:text-zinc-300">
                  our contact page
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

