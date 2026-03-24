import type React from 'react';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { getCurrentUser } from '@/lib/actions';
import { redirect } from 'next/navigation';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex flex-col bg-background pt-[72px]">
      <Header />
      <div className="flex flex-1 max-w-7xl mx-auto w-full relative">
        <div className="shrink-0 hidden sm:block sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto scrollbar-hide">
          <Sidebar className="border-none h-full" />
        </div>
        <main className="flex-1 min-w-0 p-6 sm:pl-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200/60 min-h-[calc(100vh-8rem)] p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
