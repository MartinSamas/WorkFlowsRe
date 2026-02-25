'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavLinksProps {
  pendingApprovalsCount?: number;
}

export function NavLinks({ pendingApprovalsCount }: NavLinksProps) {
  const pathname = usePathname();

  const links = [
    { href: '/requests', label: 'My Requests' },
    { href: '/approvals', label: 'Approvals', badge: pendingApprovalsCount },
  ];

  return (
    <nav className="flex items-center gap-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors',
            pathname.startsWith(link.href)
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted',
          )}
        >
          {link.label}
          {link.badge !== undefined && link.badge > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-primary text-primary-foreground rounded-full">
              {link.badge}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
