"use server"

import {cookies} from "next/headers"
import {redirect} from "next/navigation"
import * as jose from "jose"
import {JWT_SECRET} from "./constants"
import {revalidatePath} from "next/cache"
import {cache} from "react"
import { db } from '@/backend/lib/db';

// Type for the user
export type User = {
    id: string
    name: string
    email: string
    picture: string
    verified_email: boolean
}

// Server action to get the current user
export const getCurrentUser = cache(async function getCurrentUser(): Promise<User | null> {
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
    } catch (error: any) {
        if (error.digest === "DYNAMIC_SERVER_USAGE") {
            throw error;
        }
        console.error("Error getting current user:", error)
        try {
            const cookieStore = await cookies()
            cookieStore.delete("auth-token")
        } catch(e) {}
        return null
    }
});

// Server action to log out
export async function logoutAction() {
    const cookieStore = await cookies()
    cookieStore.delete("auth-token")
    revalidatePath("/")
    redirect("/")
}


export const getUserData = cache(async () => {
    const user = await getCurrentUser();
    if (!user) return { user: null, pendingApprovalsCount: 0, isAdmin: false };

    try {
        const allApprovers = await db.getApprovers();
        const groupsUserBelongsTo = allApprovers
            .filter(
                (a) =>
                    a.type === 'group' &&
                    a.group_emails?.some((e) => e.toLowerCase() === user.email.toLowerCase()),
            )
            .map((g) => g.email);

        const directApprovals = await db.getApprovalsByApprover(user.email);
        const groupApprovals = (
            await Promise.all(groupsUserBelongsTo.map((ge) => db.getApprovalsByApprover(ge)))
        ).flat();

        const approvalMap = new Map();
        [...directApprovals, ...groupApprovals].forEach((a) => {
            if (a.status === 'pending') approvalMap.set(a.id, a);
        });

        const pendingApprovals = Array.from(approvalMap.values());
        const requestsStatus = await Promise.all(
            pendingApprovals.map(async (approval) => {
                const req = await db.getRequestById(approval.request_id);
                return req?.status === 'pending' ? 1 : 0;
            }),
        );

        const pendingApprovalsCount = requestsStatus.reduce((acc: number, curr) => acc + curr, 0);
        const isAdmin = await db.isAdmin(user.email);

        return { user, pendingApprovalsCount, isAdmin };
    } catch (err) {
        console.error('Error fetching header data:', err);
        return { user, pendingApprovalsCount: 0, isAdmin: false };
    }
});

