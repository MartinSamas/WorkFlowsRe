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
      <div className="flex flex-1 w-full relative pt-6 pr-8 pb-6 pl-6">
        <div className="shrink-0 hidden sm:block sticky top-[96px] h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide">
          <Sidebar className="border-none h-full" />
        </div>
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-[20px] shadow-[0px_8px_24px_#DCDEED] border border-gray-200/60 min-h-[calc(100vh-120px)] p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
