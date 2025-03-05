import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StageManager } from "@/components/admin/stage-manager"
import { UserManager } from "@/components/admin/user-manager"
import { WarningsManager } from "@/components/admin/warnings-manager"
import { StatisticsPanel } from "@/components/admin/statistics-panel"

export const metadata = {
  title: "Dark River | Admin Dashboard",
  description: "Administrative dashboard for Dark River platform management",
}

export default async function AdminDashboard() {
  const session = await getSession()

  if (!session?.isAdmin) {
    redirect("/")
  }

  return (
    <>
      <Navbar userName={session.name} isAdmin={session.isAdmin} isDonor={session.isDonor} />
      <main className="flex min-h-screen flex-col bg-black p-4 text-white">
        <div className="mx-auto w-full max-w-6xl flex-1 py-20">
          <div className="mb-6">
            <h1 className="font-mono text-3xl font-bold tracking-tighter text-white">АДМИН ПАНЕЛ</h1>
            <p className="mt-2 text-sm text-zinc-400">Управлявайте вашата Dark River система</p>
          </div>

          <Tabs defaultValue="statistics" className="space-y-6">
            <TabsList className="bg-zinc-950 border border-zinc-800">
              <TabsTrigger
                value="statistics"
                className="font-mono data-[state=active]:bg-white data-[state=active]:text-black"
              >
                СТАТИСТИКА
              </TabsTrigger>
              <TabsTrigger
                value="stages"
                className="font-mono data-[state=active]:bg-white data-[state=active]:text-black"
              >
                ЕТАПИ
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="font-mono data-[state=active]:bg-white data-[state=active]:text-black"
              >
                ПОТРЕБИТЕЛИ
              </TabsTrigger>
              <TabsTrigger
                value="warnings"
                className="font-mono data-[state=active]:bg-white data-[state=active]:text-black"
              >
                ПРЕДУПРЕЖДЕНИЯ
              </TabsTrigger>
            </TabsList>

            <TabsContent value="statistics" className="space-y-4">
              <StatisticsPanel />
            </TabsContent>

            <TabsContent value="stages" className="space-y-4">
              <StageManager />
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <UserManager />
            </TabsContent>

            <TabsContent value="warnings" className="space-y-4">
              <WarningsManager />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  )
}

