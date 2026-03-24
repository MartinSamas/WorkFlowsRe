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
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-l-[3px] border-blue-500 pl-[9px]'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-l-[3px] border-transparent pl-[9px]',
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 leading-snug">{link.label}</span>
              {link.badge !== undefined && link.badge > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-[11px] font-bold bg-blue-500 text-white rounded-full">
                  {link.badge}
                </span>
              )}
            </Link>
          </li>
        );
      })}

      {isAdmin && (
        <li>
          <Link
            href="/dashboard"
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors border-l-[3px] pl-[9px]',
              pathname.startsWith('/dashboard')
                ? 'bg-blue-50 text-blue-700 border-blue-500'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-transparent',
            )}
          >
            <Settings className="h-4 w-4 flex-shrink-0" />
            <span>Dashboard</span>
          </Link>
        </li>
      )}
    </ul>
  );
}
