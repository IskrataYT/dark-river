import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"

export const metadata = {
  title: "Dark River | Правила на общността",
  description: "Правила и насоки за общността на Dark River",
}

export default async function RulesPage() {
  const session = await getSession()

  if (!session) {
    redirect("/auth")
  }

  return (
    <>
      <Navbar userName={session.name} isAdmin={session.isAdmin} isDonor={session.isDonor} />
      <main className="flex min-h-screen flex-col bg-black p-4 text-white">
        <div className="mx-auto w-full max-w-4xl flex-1 py-20">
          <div className="mb-8">
            <h1 className="font-mono text-4xl font-bold tracking-tighter text-white">ПРАВИЛА НА ОБЩНОСТТА</h1>
            <p className="mt-2 text-zinc-400">Насоки за участие в общността на Dark River</p>
          </div>

          <div className="space-y-6 font-mono">
            <section className="space-y-4">
              <h2 className="text-xl font-bold">1. ОБЩО ПОВЕДЕНИЕ</h2>
              <p className="text-zinc-300">
                От всички членове на общността на Dark River се очаква да поддържат професионално и уважително поведение
                по всяко време. Това включва:
              </p>
              <ul className="list-disc pl-6 text-zinc-300">
                <li>Отнасяне с уважение към всички членове на общността</li>
                <li>Избягване на обиден език и неподходящо съдържание</li>
                <li>Въздържане от тормоз или малтретиране от всякакъв вид</li>
                <li>Поддържане на интегритета на наратива на разследването</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">2. НАСОКИ ЗА СЪОБЩЕНИЯ</h2>
              <p className="text-zinc-300">
                Платформата за съобщения в общността е предоставена за сътрудничество и дискусия. Потребителите трябва:
              </p>
              <ul className="list-disc pl-6 text-zinc-300">
                <li>Да се придържат към темата и да допринасят смислено към дискусиите</li>
                <li>Да избягват спам или прекомерно изпращане на съобщения</li>
                <li>Да не споделят лична информация или чувствителни данни</li>
                <li>Да докладват неподходящо поведение на модераторите</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">3. ОГРАНИЧЕНИЯ ЗА СЪДЪРЖАНИЕТО</h2>
              <p className="text-zinc-300">Следното съдържание е строго забранено:</p>
              <ul className="list-disc pl-6 text-zinc-300">
                <li>Експлицитно или съдържание за възрастни</li>
                <li>Реч на омразата или дискриминационно съдържание</li>
                <li>Лични атаки или тормоз</li>
                <li>Неоторизирана реклама или промоция</li>
                <li>Съдържание, което нарушава права на интелектуална собственост</li>
                <li>Злонамерени връзки или заплахи за сигурността</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">4. МОДЕРАЦИЯ</h2>
              <p className="text-zinc-300">
                Dark River прилага активна модерация за поддържане на стандартите на общността:
              </p>
              <ul className="list-disc pl-6 text-zinc-300">
                <li>Модераторите могат да премахват неподходящо съдържание без предупреждение</li>
                <li>Потребителите могат да бъдат временно заглушени за нарушения на правилата</li>
                <li>Повторни нарушения могат да доведат до постоянно прекратяване на достъпа</li>
                <li>Всички решения на модераторите са окончателни</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">5. ПОВЕРИТЕЛНОСТ И СИГУРНОСТ</h2>
              <p className="text-zinc-300">За защита на всички потребители са въведени следните мерки за сигурност:</p>
              <ul className="list-disc pl-6 text-zinc-300">
                <li>Всички комуникации се наблюдават за съответствие</li>
                <li>Не споделяйте лична или чувствителна информация</li>
                <li>Докладвайте незабавно проблеми със сигурността</li>
                <li>Поддържайте поверителността на вашето разследване</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">6. ПРИЛАГАНЕ</h2>
              <p className="text-zinc-300">Нарушенията на правилата ще бъдат третирани както следва:</p>
              <ul className="list-disc pl-6 text-zinc-300">
                <li>Първо нарушение: Предупреждение</li>
                <li>Второ нарушение: Временно заглушаване (24 часа)</li>
                <li>Трето нарушение: Удължено заглушаване (7 дни)</li>
                <li>Тежки или повторни нарушения: Постоянно прекратяване на достъпа</li>
              </ul>
            </section>

            <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-center text-zinc-400">
                За въпроси относно тези правила или за докладване на нарушения, моля свържете се с нас чрез нашата{" "}
                <Link href="/contact" className="text-white underline hover:text-zinc-300">
                  страница за контакт
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

