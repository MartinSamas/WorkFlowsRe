"use client"

import { useState, useEffect } from "react"
import { UI_CONFIG } from "@/lib/auth-utils"
import Image from "next/image";

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
            <Image
                src="/google.svg"
                alt="Google Logo"
                width={20}
                height={20}
                className="w-5 h-5"
            />
            <span>Login with Google</span>
          </span>
        )}
      </button>

      {error && <p className="text-center text-sm text-red-500">{error}</p>}
    </div>
  )
}
