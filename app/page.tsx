import { LoginButton } from "@/components/login-button"
import { getCurrentUser } from "@/lib/actions"
import { redirect } from "next/navigation"
import Image from "next/image"

export default async function Home() {
  const user = await getCurrentUser()

  if (user) {
    redirect("/requests")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-lg space-y-8 flex flex-col items-center animate-[fade-in_0.5s_ease-in-out]">
        <div className="w-24 h-24 relative">
          <Image
              src="https://taskman.ui42.sk/images/taskman-logo.svg"
              alt="ui42 logo"
              layout="fill"

              className="w-full h-full invert"
              unoptimized
          />
        </div>

        <div className="text-center space-y-2 mt-4">
          <h1 className="text-3xl font-bold">Workflows</h1>
        </div>

        <div className="w-full mt-8">
          <LoginButton />
        </div>
      </div>
    </main>
  )
}
