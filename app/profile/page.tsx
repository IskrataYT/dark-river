import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { Navbar } from "@/components/layout/navbar"
import { ProfileForm } from "@/components/profile/profile-form"
import { Footer } from "@/components/layout/footer"
import { DeviceManager } from "@/components/profile/device-manager"
import { MFASetup } from "@/components/profile/mfa-setup" // Assuming MFASetup is a new component
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, User } from "lucide-react"

export const metadata = {
  title: "Dark River | Профил",
  description: "Управлявайте вашия профил в Dark River - актуализирайте информацията за вашия агент",
}

export default async function Profile() {
  const session = await getSession()

  if (!session) {
    redirect("/auth")
  }

  return (
    <>
      <Navbar userName={session.name} isAdmin={session.isAdmin} isDonor={session.isDonor} />
      <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white py-16">
        <div className="relative w-full max-w-3xl px-4">
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10"></div>
          <div className="relative z-10 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="p-6 text-center border-b border-zinc-800">
              <h1 className="font-mono text-3xl font-bold tracking-tighter text-white">ПРОФИЛ НА АГЕНТА</h1>
              <p className="mt-2 text-sm text-zinc-400">Управление на достъп и сигурност</p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
              <div className="border-b border-zinc-800">
                <TabsList className="h-14 w-full rounded-none bg-zinc-950 p-0">
                  <TabsTrigger
                    value="profile"
                    className="flex-1 data-[state=active]:bg-black data-[state=active]:shadow-none rounded-none h-full border-r border-zinc-800"
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span className="font-mono text-xs">ЛИЧНИ ДАННИ</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="flex-1 data-[state=active]:bg-black data-[state=active]:shadow-none rounded-none h-full"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    <span className="font-mono text-xs">СИГУРНОСТ</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="profile" className="p-6">
                <ProfileForm initialName={session.name} userEmail={session.email} />
              </TabsContent>

              <TabsContent value="security" className="p-6">
                <div className="space-y-8">
                  <DeviceManager />
                  <div className="border-t border-zinc-800 pt-6">
                    <MFASetup />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="p-6 text-center text-xs text-zinc-600 border-t border-zinc-800">
              <p>Поддържайте кодовете си за достъп защитени и редовно актуализирани.</p>
              <p className="mt-2">SYSTEM VERSION 2.4.1 // CLASSIFIED</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

