import { NextResponse } from "next/server"
import { GOOGLE_CLIENT_ID, GOOGLE_CALLBACK_URL } from "@/lib/constants"
import { generateRandomString } from "@/lib/utils"
import { createCodeChallenge, COOKIE_CONFIG } from "@/lib/auth-utils"

// Add console logging to debug the OAuth flow
export async function GET() {
  // Generate a random state to prevent CSRF attacks
  const state = generateRandomString(32)

  // Generate a code_verifier and code_challenge for PKCE (Proof Key for Code Exchange)
  const codeVerifier = generateRandomString(64)
  const codeChallenge = createCodeChallenge(codeVerifier)

  // Log the OAuth parameters for debugging
  console.log("OAuth Login Parameters:", {
    clientId: GOOGLE_CLIENT_ID,
    redirectUri: GOOGLE_CALLBACK_URL,
    state,
    codeChallenge,
  })

  // Save these values in cookies to verify them in the callback
  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_CALLBACK_URL)}&scope=openid%20email%20profile&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256&access_type=offline&prompt=consent`,
  )

  response.cookies.set("oauth_state", state, COOKIE_CONFIG.OAUTH_STATE)
  response.cookies.set("code_verifier", codeVerifier, COOKIE_CONFIG.OAUTH_STATE)

  return response
}
