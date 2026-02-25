import Image from 'next/image';
import { getCurrentUser } from '@/lib/actions';
import { LogoutButton } from '@/components/logout-button';

export async function Header() {
  const user = await getCurrentUser();

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <span className="font-semibold text-sm">WorkFlows</span>

        <div className="flex items-center gap-3">
          {/* Profile picture */}
          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-200 flex items-center justify-center">
            {user.picture ? (
              <Image
                src={user.picture}
                alt={user.name}
                fill
                className="object-cover"
                sizes="32px"
              />
            ) : (
              <span className="text-xs font-medium text-gray-600">{initials}</span>
            )}
          </div>

          {/* Name */}
          <span className="hidden sm:block text-sm font-medium">{user.name}</span>

          {/* Logout */}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
