'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Calendar, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarLinksProps {
  pendingApprovalsCount?: number;
  isAdmin?: boolean;
}

export function SidebarLinks({ pendingApprovalsCount, isAdmin }: SidebarLinksProps) {
  const pathname = usePathname();

  const links = [
    { href: '/requests', label: 'Holiday requests', icon: Calendar },
    {
      href: '/approvals',
      label: 'Approvals',
      icon: CheckSquare,
      badge: pendingApprovalsCount,
    },
  ];

  return (
    <ul className="space-y-0.5">
      {links.map((link) => {
        const isActive = pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                'group flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center shrink-0 w-[36px] h-[36px] mr-2 rounded-md transition-colors duration-[400ms] text-[#11162e]',
                  isActive ? 'bg-[rgba(53,140,255,0.2)]' : 'group-hover:bg-[rgba(53,140,255,0.2)]'
                )}
              >
                <Icon className="h-[1.6rem] w-[1.6rem]" strokeWidth={1} />
              </div>
              <span className="flex-1 leading-snug">
                {link.label} {link.badge !== undefined && link.badge > 0 && <strong>{link.badge}</strong>}
              </span>
            </Link>
          </li>
        );
      })}

      {isAdmin && (
        <li>
          <Link
            href="/dashboard"
            className={cn(
              'group flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname.startsWith('/dashboard')
                ? 'text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center shrink-0 w-[36px] h-[36px] mr-2 rounded-md transition-colors duration-[400ms] text-[#11162e]',
                pathname.startsWith('/dashboard')
                  ? 'bg-[rgba(53,140,255,0.2)]'
                  : 'group-hover:bg-[rgba(53,140,255,0.2)]'
              )}
            >
              <Settings className="h-[1.6rem] w-[1.6rem]" strokeWidth={1} />
            </div>
            <span>Dashboard</span>
          </Link>
        </li>
      )}
    </ul>
  );
}
