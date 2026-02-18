import { logoutAction } from "@/lib/actions"

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
        aria-label="Sign out"
      >
        Sign out
      </button>
    </form>
  )
}
