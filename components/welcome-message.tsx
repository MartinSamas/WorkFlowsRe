import { LogoutButton } from "./logout-button"
import Image from "next/image"
import type { User } from "@/lib/actions"

export function WelcomeMessage({ user }: { user: User }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border animate-slide-up">
      {/* UserProfile integrated directly */}
      <div className="flex items-center gap-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden">
          <Image
            src={user.picture || "/placeholder.svg"}
            alt={user.name}
            fill
            className="object-cover"
            sizes="48px"
            priority
          />
        </div>
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-1.5">
            <h3 className="font-medium text-lg">{user.name}</h3>
            {user.verified_email && (
              <svg viewBox="0 0 24 24" aria-label="Verified email" className="w-5 h-5 text-blue-500 fill-blue-500">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            )}
          </div>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      <div className="mt-6 mb-4">
        <h2 className="text-base font-medium text-gray-600">
          Welcome back, <span className="font-semibold">{user.name}</span>
        </h2>
      </div>

      <div className="flex justify-start">
        <LogoutButton />
      </div>
    </div>
  )
}
