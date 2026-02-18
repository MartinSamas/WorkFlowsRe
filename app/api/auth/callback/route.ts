import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL, JWT_SECRET } from "@/lib/constants"
import * as jose from "jose"
import { createAuthResponse, COOKIE_CONFIG, UI_CONFIG } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  try {
    // Get the authorization code and state from the URL
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")

    // Log all parameters for debugging
    console.log("OAuth Callback Parameters:", {
      code: code ? "present" : "missing",
      state: state ? "present" : "missing",
      error,
      errorDescription,
      savedState: cookies().get("oauth_state")?.value ? "present" : "missing",
      codeVerifier: cookies().get("code_verifier")?.value ? "present" : "missing",
    })

    // Check if the user denied the authorization
    if (error) {
      console.error("OAuth error:", error, errorDescription)
      return createAuthResponse("Authentication Cancelled", "AUTH_CANCELLED")
    }

    // Verify the state to prevent CSRF attacks
    const savedState = cookies().get("oauth_state")?.value
    const codeVerifier = cookies().get("code_verifier")?.value

    if (!code) {
      console.error("Missing authorization code")
      return createAuthResponse("Authentication Error", "AUTH_ERROR:missing_code")
    }

    if (!state || !savedState || state !== savedState) {
      console.error("Invalid state parameter")
      return createAuthResponse("Authentication Error", "AUTH_ERROR:invalid_state")
    }

    // Exchange the code for an access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code: code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
        code_verifier: codeVerifier || "",
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error("Error obtaining token:", errorData)
      return createAuthResponse("Authentication Error", "AUTH_ERROR:token_exchange_failed")
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token
    const idToken = tokenData.id_token

    // Get user information from Google
    const userResponse = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!userResponse.ok) {
      const errorData = await userResponse.text()
      console.error("Error obtaining user data:", errorData)
      return createAuthResponse("Authentication Error", "AUTH_ERROR:user_data_failed")
    }

    const userData = await userResponse.json()

    const user = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      verified_email: userData.verified_email,
      picture: userData.picture || UI_CONFIG.DEFAULT_PROFILE_IMAGE,
    }

    // Create a JWT for the user
    const secret = new TextEncoder().encode(JWT_SECRET)
    const token = await new jose.SignJWT({ user })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret)

    // Save the token in a cookie
    cookies().set("auth-token", token, COOKIE_CONFIG.AUTH_TOKEN)

    // Clear the state and code_verifier cookies
    cookies().delete("oauth_state")
    cookies().delete("code_verifier")

    // Close the popup immediately without showing a message
    return createAuthResponse("Authentication Successful", "AUTH_SUCCESS")
  } catch (error) {
    console.error("Error in authentication callback:", error)
    return createAuthResponse("Authentication Error", "AUTH_ERROR:server_error", 500)
  }
}
