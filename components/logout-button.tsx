import { logoutAction } from "@/lib/actions"

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="text-sm text-white/60 hover:text-white transition-colors"
        aria-label="Sign out"
      >
        Sign out
      </button>
    </form>
  )
}
