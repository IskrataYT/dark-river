import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Mail, Send, AlertTriangle, Info, File } from "lucide-react"

export const metadata = {
  title: "Dark River | Как да играя",
  description: "Научете как да играете Dark River",
}

export default async function HowToPlayPage() {
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
            <h1 className="font-mono text-4xl font-bold tracking-tighter text-white">КАК ДА ИГРАЯ</h1>
            <p className="mt-2 text-zinc-400">Ръководство за навигиране в Dark River</p>
          </div>

          <div className="space-y-8 font-mono">
            <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
              <div className="mb-4 flex items-center">
                <Info className="mr-3 h-6 w-6 text-blue-500" />
                <h2 className="text-2xl font-bold">Въведение</h2>
              </div>
              <p className="text-zinc-300">
                Dark River е интерактивно наративно преживяване, където играете като агент, разследващ мистериозна
                организация. Вашата мисия се разкрива чрез поредица от имейл разменки, и вашите отговори определят как
                историята ще се развие.
              </p>
            </section>

            <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
              <div className="mb-4 flex items-center">
                <Mail className="mr-3 h-6 w-6 text-green-500" />
                <h2 className="text-2xl font-bold">Терминалът</h2>
              </div>
              <p className="text-zinc-300 mb-4">
                Основният интерфейс на Dark River е Терминалът, който функционира като имейл клиент. Ето как да го
                използвате:
              </p>
              <ul className="space-y-4 text-zinc-300">
                <li className="flex">
                  <span className="mr-2 font-bold">1.</span>
                  <span>
                    <strong>Входяща поща:</strong> Проверявайте входящата си поща за нови съобщения. Те ще съдържат
                    инструкции, информация и улики за вашата мисия.
                  </span>
                </li>
                <li className="flex">
                  <span className="mr-2 font-bold">2.</span>
                  <span>
                    <strong>Съставяне:</strong> Натиснете бутона СЪСТАВЯНЕ, за да напишете и изпратите отговор. Вашите
                    отговори трябва да адресират въпросите или задачите в получените съобщения.
                  </span>
                </li>
                <li className="flex">
                  <span className="mr-2 font-bold">3.</span>
                  <span>
                    <strong>Изпратени:</strong> Преглеждайте изпратените съобщения в папката ИЗПРАТЕНИ. Това може да ви
                    помогне да следите предишните си отговори.
                  </span>
                </li>
              </ul>
            </section>

            <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
              <div className="mb-4 flex items-center">
                <File className="mr-3 h-6 w-6 text-yellow-500" />
                <h2 className="text-2xl font-bold">Бележки от разследването</h2>
              </div>
              <p className="text-zinc-300 mb-4">
                Функцията за бележки ви помага да следите важна информация по време на разследването:
              </p>
              <ul className="space-y-4 text-zinc-300">
                <li className="flex">
                  <span className="mr-2 font-bold">1.</span>
                  <span>
                    <strong>Създаване на бележки:</strong> Натиснете бутона БЕЛЕЖКИ в навигационната лента, за да
                    достъпите бележките си от разследването. Създавайте нови бележки, за да записвате важна информация,
                    улики и теории.
                  </span>
                </li>
                <li className="flex">
                  <span className="mr-2 font-bold">2.</span>
                  <span>
                    <strong>Автоматично запазване:</strong> Вашите бележки се запазват автоматично докато пишете,
                    осигурявайки, че никаква информация не е загубена.
                  </span>
                </li>
                <li className="flex">
                  <span className="mr-2 font-bold">3.</span>
                  <span>
                    <strong>Организация:</strong> Поддържайте разследването си организирано, като създавате отделни
                    бележки за различни аспекти на разследването.
                  </span>
                </li>
              </ul>
            </section>

            <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
              <div className="mb-4 flex items-center">
                <Send className="mr-3 h-6 w-6 text-purple-500" />
                <h2 className="text-2xl font-bold">Напредване в историята</h2>
              </div>
              <p className="text-zinc-300 mb-4">
                За да напреднете в Dark River, трябва да изпращате правилните отговори на получените имейли:
              </p>
              <ul className="space-y-4 text-zinc-300">
                <li className="flex">
                  <span className="mr-2 font-bold">1.</span>
                  <span>
                    <strong>Четете внимателно:</strong> Обръщайте специално внимание на съдържанието на всяко съобщение.
                    Търсете улики, инструкции или въпроси, които трябва да бъдат адресирани.
                  </span>
                </li>
                <li className="flex">
                  <span className="mr-2 font-bold">2.</span>
                  <span>
                    <strong>Съставете отговора си:</strong> Напишете отговор, който адресира съдържанието на
                    съобщението. Вашият отговор трябва да включва специфични ключови думи или фрази, свързани със
                    задачата.
                  </span>
                </li>
                <li className="flex">
                  <span className="mr-2 font-bold">3.</span>
                  <span>
                    <strong>Отключване на следващ етап:</strong> Ако отговорът ви съдържа правилната информация, ще
                    получите ново съобщение, което придвижва историята напред. Ако не, ще трябва да опитате отново с
                    различен подход.
                  </span>
                </li>
              </ul>
            </section>

            <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
              <div className="mb-4 flex items-center">
                <AlertTriangle className="mr-3 h-6 w-6 text-yellow-500" />
                <h2 className="text-2xl font-bold">Съвети и подсказки</h2>
              </div>
              <ul className="space-y-4 text-zinc-300">
                <li className="flex">
                  <span className="mr-2 font-bold">•</span>
                  <span>
                    Ако сте затруднени, препрочетете предишните съобщения за улики, които може да сте пропуснали.
                  </span>
                </li>
                <li className="flex">
                  <span className="mr-2 font-bold">•</span>
                  <span>
                    Понякога решението може да включва външни знания или проучване. Не се страхувайте да потърсите
                    информация.
                  </span>
                </li>
                <li className="flex">
                  <span className="mr-2 font-bold">•</span>
                  <span>
                    Обръщайте внимание на тона и стила на получените съобщения. Съответствието с тях в отговорите ви
                    понякога може да помогне.
                  </span>
                </li>
                <li className="flex">
                  <span className="mr-2 font-bold">•</span>
                  <span>
                    Ако постоянно не успявате да напреднете, опитайте да бъдете по-директни или експлицитни в отговорите
                    си.
                  </span>
                </li>
              </ul>
            </section>

            <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-center text-zinc-300">
                Нуждаете се от повече помощ? Посетете нашата{" "}
                <Link href="/contact" className="text-white underline hover:text-zinc-300">
                  страница за контакт
                </Link>{" "}
                за връзка с нашия екип за поддръжка.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

