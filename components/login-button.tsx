"use client"

import { useState, useEffect } from "react"
import { UI_CONFIG } from "@/lib/auth-utils"

export function LoginButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Listen for messages from the popup when authentication succeeds or fails
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return

      if (event.data === "AUTH_SUCCESS") {
        setIsLoading(false)
        setError(null)
        // Reload the page to show updated authentication status
        window.location.reload()
      }

      if (typeof event.data === "string" && event.data.startsWith("AUTH_ERROR")) {
        setIsLoading(false)

        // Extract the specific error code if it exists
        const errorCode = event.data.split(":")[1]
        let errorMessage = "Authentication error. Please try again."

        // Provide more specific messages based on the error code
        if (errorCode === "invalid_state") {
          errorMessage = "Security verification failed. Please try again."
        } else if (errorCode === "token_exchange_failed") {
          errorMessage = "Could not complete authentication with Google. Please try again."
        } else if (errorCode === "user_data_failed") {
          errorMessage = "Could not retrieve your profile information. Please try again."
        } else if (errorCode === "missing_code") {
          errorMessage = "Authentication code missing. Please try again."
        }

        setError(errorMessage)
      }

      if (event.data === "AUTH_CANCELLED") {
        setIsLoading(false)
        // No need to show an error for cancellation
        setError(null)
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  const handleLogin = () => {
    setIsLoading(true)
    setError(null)

    // URL to start the Google authentication process
    const authUrl = "/api/auth/login"

    // Open a popup for authentication using the config values
    const { width, height } = UI_CONFIG.POPUP
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const popup = window.open(
      authUrl,
      "Sign in with Google",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`,
    )

    // If the popup is blocked, show a message
    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      setIsLoading(false)
      setError("Popup blocked. Please allow popups for this site and try again.")
      return
    }

    // Check if the popup is manually closed
    const checkPopup = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkPopup)
        setIsLoading(false)
      }
    }, 500)
  }

  return (
    <div className="space-y-3 animate-slide-up">
      <button
        onClick={handleLogin}
        disabled={isLoading}
        className="mx-auto block bg-white hover:bg-gray-100 text-gray-700 py-2 px-4 rounded w-64 border border-gray-300 shadow-sm"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Connecting...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            {/* Google logo */}
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>Login with Google</span>
          </span>
        )}
      </button>

      {error && <p className="text-center text-sm text-red-500">{error}</p>}
    </div>
  )
}
