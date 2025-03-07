import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export const metadata = {
  title: "Dark River | Общи условия",
  description: "Общи условия за Dark River",
}

export default async function TermsPage() {
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
            <h1 className="font-mono text-4xl font-bold tracking-tighter text-white">ОБЩИ УСЛОВИЯ</h1>
            <p className="mt-2 text-zinc-400">Последна актуализация: 1 март, 2025</p>
          </div>

          <div className="space-y-6 font-mono">
            <section className="space-y-4">
              <h2 className="text-xl font-bold">1. ПРИЕМАНЕ НА УСЛОВИЯТА</h2>
              <p className="text-zinc-300">
                С достъпа и използването на платформата Dark River, вие потвърждавате, че сте прочели, разбрали и се
                съгласявате да бъдете обвързани с тези Общи условия. Ако не сте съгласни с тези условия, не трябва да
                достъпвате или използвате нашите услуги.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">2. ОПИСАНИЕ НА УСЛУГАТА</h2>
              <p className="text-zinc-300">
                Dark River предоставя интерактивно наративно преживяване чрез симулирана комуникационна платформа.
                Нашата услуга е предназначена само за развлекателни и образователни цели.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">3. ПОТРЕБИТЕЛСКИ АКАУНТИ</h2>
              <p className="text-zinc-300">
                За достъп до определени функции на Dark River трябва да създадете акаунт. Вие сте отговорни за
                поддържането на поверителността на информацията за вашия акаунт и за всички дейности, които се извършват
                под вашия акаунт.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">4. БЕЛЕЖКИ ОТ РАЗСЛЕДВАНЕТО</h2>
              <p className="text-zinc-300">
                Функцията за бележки от разследването е предоставена за ваше удобство при проследяване на информация по
                време на разследването. Вие сте отговорни за съдържанието на вашите бележки. Ние не наблюдаваме
                съдържанието на вашите бележки, но си запазваме правото да премахнем всяко съдържание, което нарушава
                тези условия.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">5. ПОВЕДЕНИЕ НА ПОТРЕБИТЕЛИТЕ</h2>
              <p className="text-zinc-300">
                Съгласявате се да не използвате Dark River за незаконни цели или по начин, който би могъл да повреди,
                деактивира или влоши услугата. Не трябва да се опитвате да получите неоторизиран достъп до която и да е
                част от услугата или до която и да е система или мрежа, свързана с Dark River.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">6. ИНТЕЛЕКТУАЛНА СОБСТВЕНОСТ</h2>
              <p className="text-zinc-300">
                Цялото съдържание, функции и функционалност на Dark River, включително, но не само текст, графики, лога
                и софтуер, са собственост на Dark River и са защитени от авторско право, търговска марка и други закони
                за интелектуална собственост.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">7. ПРЕКРАТЯВАНЕ</h2>
              <p className="text-zinc-300">
                Запазваме си правото да прекратим или преустановим вашия акаунт и достъп до Dark River по наша преценка,
                без предизвестие, за поведение, което считаме за нарушение на тези Общи условия или е вредно за други
                потребители, за нас или за трети страни, или по каквато и да е друга причина.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">8. ПРАВИЛА НА ОБЩНОСТТА</h2>
              <p className="text-zinc-300">
                С използването на платформата за общност на Dark River, вие се съгласявате да следвате нашите правила и
                насоки на общността. Тези правила са създадени, за да създадат безопасна и продуктивна среда за всички
                потребители. Нарушаването на тези правила може да доведе до:
              </p>
              <ul className="list-disc pl-6 text-zinc-300">
                <li>Премахване на съдържание</li>
                <li>Временно или постоянно заглушаване</li>
                <li>Временно или постоянно прекратяване на акаунта</li>
              </ul>
              <p className="text-zinc-300">
                За пълен списък с правилата и насоките на общността, моля, посетете нашата{" "}
                <Link href="/rules" className="text-white underline hover:text-zinc-300">
                  страница с правила
                </Link>
                .
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">9. ОТКАЗ ОТ ГАРАНЦИИ</h2>
              <p className="text-zinc-300">
                Dark River се предоставя "както е" и "както е налична". Не даваме никакви гаранции, изрични или
                подразбиращи се, относно работата или наличността на услугата.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">10. ОГРАНИЧЕНИЕ НА ОТГОВОРНОСТТА</h2>
              <p className="text-zinc-300">
                В никакъв случай Dark River няма да носи отговорност за каквито и да било непреки, случайни, специални,
                последващи или наказателни щети, произтичащи от вашето използване или невъзможност да използвате
                услугата.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">11. ПРОМЕНИ В УСЛОВИЯТА</h2>
              <p className="text-zinc-300">
                Запазваме си правото да модифицираме тези Общи условия по всяко време. Ще предоставим известие за
                значителни промени, като публикуваме новите Общи условия на тази страница.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">12. ПРИЛОЖИМО ПРАВО</h2>
              <p className="text-zinc-300">
                Тези Общи условия се уреждат и тълкуват в съответствие със законите на юрисдикцията, в която оперира
                Dark River, без оглед на нейните стълкновителни норми.
              </p>
            </section>

            <div className="mt-8 border-t border-zinc-800 pt-6">
              <p className="text-zinc-400">
                За въпроси относно тези Общи условия, моля свържете се с нас на{" "}
                <Link href="/contact" className="text-white underline hover:text-zinc-300">
                  нашата страница за контакт
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

