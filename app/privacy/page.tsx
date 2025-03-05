import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export const metadata = {
  title: "Dark River | Политика за поверителност",
  description: "Политика за поверителност на Dark River",
}

export default async function PrivacyPage() {
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
            <h1 className="font-mono text-4xl font-bold tracking-tighter text-white">ПОЛИТИКА ЗА ПОВЕРИТЕЛНОСТ</h1>
            <p className="mt-2 text-zinc-400">Последна актуализация: 1 март, 2025</p>
          </div>

          <div className="space-y-6 font-mono">
            <section className="space-y-4">
              <h2 className="text-xl font-bold">1. ВЪВЕДЕНИЕ</h2>
              <p className="text-zinc-300">
                Dark River ("ние", "нашият" или "нас") е ангажиран със защитата на вашата поверителност. Тази Политика
                за поверителност обяснява как събираме, използваме и защитаваме вашата информация, когато използвате
                нашата услуга.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">2. ИНФОРМАЦИЯ, КОЯТО СЪБИРАМЕ</h2>
              <p className="text-zinc-300">Събираме следните видове информация:</p>
              <ul className="list-disc pl-6 text-zinc-300">
                <li>
                  <strong>Информация за акаунта:</strong> Когато създавате акаунт, събираме вашето име, имейл адрес и
                  парола.
                </li>
                <li>
                  <strong>Данни за използване:</strong> Събираме информация за това как взаимодействате с нашата услуга,
                  включително вашия прогрес през наратива.
                </li>
                <li>
                  <strong>Комуникации:</strong> Ако се свържете с нас директно, може да получим допълнителна информация
                  за вас, като вашето име, имейл адрес и съдържанието на вашето съобщение.
                </li>
                <li>
                  <strong>Бележки от разследването:</strong> Съхраняваме бележките, които създавате по време на вашето
                  разследване, за да ви помогнем да следите важна информация. Тези бележки са лични и достъпни само за
                  вас.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">3. КАК ИЗПОЛЗВАМЕ ВАШАТА ИНФОРМАЦИЯ</h2>
              <p className="text-zinc-300">Използваме събраната информация, за да:</p>
              <ul className="list-disc pl-6 text-zinc-300">
                <li>Предоставяме, поддържаме и подобряваме нашата услуга</li>
                <li>Създаваме и управляваме вашия акаунт</li>
                <li>Проследяваме вашия прогрес през наратива</li>
                <li>Отговаряме на ваши запитвания и предоставяме поддръжка</li>
                <li>Изпращаме ви актуализации и административни съобщения</li>
                <li>Наблюдаваме и анализираме модели на използване и тенденции</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">4. ДАННИ ЗА СЪОБЩЕНИЯТА В ОБЩНОСТТА</h2>
              <p className="text-zinc-300">
                Когато използвате нашата платформа за съобщения в общността, събираме и съхраняваме:
              </p>
              <ul className="list-disc pl-6 text-zinc-300">
                <li>Съдържание на съобщенията и времеви печати</li>
                <li>Данни за взаимодействие между потребителите</li>
                <li>Действия по модерация и история</li>
                <li>Записи за участие в общността</li>
              </ul>
              <p className="text-zinc-300">Тази информация се използва за:</p>
              <ul className="list-disc pl-6 text-zinc-300">
                <li>Предоставяне и поддържане на услугата за съобщения</li>
                <li>Прилагане на правилата на общността</li>
                <li>Защита на безопасността на потребителите и интегритета на платформата</li>
                <li>Подобряване на потребителското изживяване</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">5. СИГУРНОСТ НА ДАННИТЕ</h2>
              <p className="text-zinc-300">
                Прилагаме подходящи технически и организационни мерки за защита на вашата лична информация срещу
                неоторизиран достъп, промяна, разкриване или унищожаване. Въпреки това, никой метод на предаване по
                интернет или електронно съхранение не е 100% сигурен, и не можем да гарантираме абсолютна сигурност.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">6. ЗАПАЗВАНЕ НА ДАННИ</h2>
              <p className="text-zinc-300">
                Ще запазим вашата лична информация само за времето, необходимо за изпълнение на целите, описани в тази
                Политика за поверителност, освен ако по-дълъг период на запазване не се изисква или позволява от закона.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">7. ВАШИТЕ ПРАВА</h2>
              <p className="text-zinc-300">
                В зависимост от вашето местоположение, може да имате определени права относно вашата лична информация,
                включително:
              </p>
              <ul className="list-disc pl-6 text-zinc-300">
                <li>Правото на достъп до личната информация, която съхраняваме за вас</li>
                <li>Правото да поискате корекция на неточна информация</li>
                <li>Правото да поискате изтриване на вашата лична информация</li>
                <li>Правото да възразите срещу обработката на вашата лична информация</li>
                <li>Правото на преносимост на данните</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">8. БИСКВИТКИ И ТЕХНОЛОГИИ ЗА ПРОСЛЕДЯВАНЕ</h2>
              <p className="text-zinc-300">
                Използваме бисквитки и подобни технологии за проследяване, за да следим активността в нашата услуга и да
                съхраняваме определена информация. Можете да инструктирате вашия браузър да отказва всички бисквитки или
                да показва кога се изпраща бисквитка.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">9. ПРОМЕНИ В ТАЗИ ПОЛИТИКА ЗА ПОВЕРИТЕЛНОСТ</h2>
              <p className="text-zinc-300">
                Може да актуализираме нашата Политика за поверителност от време на време. Ще ви уведомим за всякакви
                промени, като публикуваме новата Политика за поверителност на тази страница и актуализираме датата
                "Последна актуализация".
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">10. СВЪРЖЕТЕ СЕ С НАС</h2>
              <p className="text-zinc-300">
                Ако имате въпроси относно тази Политика за поверителност, моля свържете се с нас на{" "}
                <Link href="/contact" className="text-white underline hover:text-zinc-300">
                  нашата страница за контакт
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

