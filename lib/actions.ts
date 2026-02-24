"use server"

import {cookies} from "next/headers"
import {redirect} from "next/navigation"
import * as jose from "jose"
import {JWT_SECRET} from "./constants"
import {revalidatePath} from "next/cache"

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
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;
        if (!token) return null

        const secret = new TextEncoder().encode(JWT_SECRET)

        try {
            const {payload} = await jose.jwtVerify(token, secret)
            return payload.user as User
        } catch (jwtError) {
            console.error("JWT verification failed:", jwtError)
            cookieStore.delete("auth-token")
            return null
        }
    } catch (error) {
        console.error("Error getting current user:", error)
        const cookieStore = await cookies()
        cookieStore.delete("auth-token")
        return null
    }
}

// Server action to log out
export async function logoutAction() {
    const cookieStore = await cookies()
    cookieStore.delete("auth-token")
    revalidatePath("/")
    redirect("/")
}
