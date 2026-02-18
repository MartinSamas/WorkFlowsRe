"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import * as jose from "jose"
import { JWT_SECRET } from "./constants"
import { revalidatePath } from "next/cache"

// Type for the user
export type User = {
  id: string
  name: string
  email: string
  picture: string
  verified_email: boolean
}

// Server action to get the current user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = cookies().get("auth-token")?.value
    if (!token) return null

    const secret = new TextEncoder().encode(JWT_SECRET)

    try {
      const { payload } = await jose.jwtVerify(token, secret)
      return payload.user as User
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError)
      cookies().delete("auth-token")
      return null
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    cookies().delete("auth-token")
    return null
  }
}

// Server action to log out
export async function logoutAction() {
  cookies().delete("auth-token")
  revalidatePath("/")
  redirect("/")
}
