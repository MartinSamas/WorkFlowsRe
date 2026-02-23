import { cookies } from 'next/headers';
import * as jose from 'jose';
import { JWT_SECRET } from '@/lib/constants';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  picture: string;
  verified_email: boolean;
};

export async function authenticateRequest(): Promise<AuthUser | null> {
  try {
    const token = (await cookies()).get('auth-token')?.value;
    if (!token) return null;

    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload.user as AuthUser;
  } catch {
    return null;
  }
}
