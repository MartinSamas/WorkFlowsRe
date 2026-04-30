'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { SidebarLinks } from '@/components/sidebar-links';
import { NewRequestDialog } from '@/components/new-request-dialog';

export function MobileNav({
  pendingApprovalsCount,
  isAdmin,
}: {
  pendingApprovalsCount?: number;
  isAdmin?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="mr-4 sm:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5 focus:outline-none"
          aria-label="Menu"
        >
          <span className="block w-6 h-[2px] bg-white rounded-sm"></span>
          <span className="block w-6 h-[2px] bg-white rounded-sm"></span>
          <span className="block w-6 h-[2px] bg-white rounded-sm"></span>
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[280px] bg-white">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SheetDescription className="sr-only">
          Mobile navigation menu for WorkFlowsRe.
        </SheetDescription>
        <div className="flex flex-col h-full">
          {/* Logo / Header inside the sheet */}
          <div className="flex items-center gap-3 px-4 pt-5 pb-4 border-b">
            <div className="flex-shrink-0 bg-blue-500 rounded h-8 w-8 flex items-center justify-center overflow-hidden">
              <i className="icon icon-interface-list-layout flex w-full h-full items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 100 100"
                  xmlSpace="preserve"
                  className="w-full h-full"
                >
                  <path fill="none" d="M5 5h90v90H5z" />
                  <path
                    fill="#fff"
                    d="M78.34 67.547c-5.382 0-9.864 3.888-10.809 9H24.339c-6.735 0-6.993-6.292-7-7v-9c0-6.735 6.292-6.993 7-7H40.53c.944 5.112 5.428 9 10.81 9s9.864-3.888 10.809-9H77.34c8.701 0 11-7.195 11-11v-9c0-8.701-7.195-11-11-11H35.148c-.944-5.112-5.427-9-10.809-9-6.065 0-11 4.935-11 11s4.935 11 11 11c5.382 0 9.865-3.888 10.809-9H77.33c.718.007 7.01.265 7.01 7v8.99c-.007.717-.265 7.01-7 7.01H62.148c-.944-5.112-5.427-9-10.809-9s-9.865 3.888-10.81 9h-16.19c-3.805 0-11 2.299-11 11v9c0 3.805 2.299 11 11 11h43.192c.944 5.112 5.427 9 10.809 9 6.065 0 11-4.935 11-11s-4.935-11-11-11m-54.001-36c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7m27.001 13c3.859 0 7 3.14 7 7s-3.141 7-7 7-7-3.141-7-7c-.001-3.86 3.14-7 7-7m27 41c-3.859 0-7-3.141-7-7s3.141-7 7-7 7 3.141 7 7-3.141 7-7 7"
                  />
                  <path
                    fill="#fff"
                    d="M23.063 31.055 18.5 26.492l2.828-2.828 1.749 1.749 4.961-4.913 2.815 2.843zm26.668 26.462-4.564-4.564 2.829-2.828 1.749 1.749 4.961-4.913 2.815 2.843zM76.74 84.526l-4.562-4.563 2.828-2.828 1.748 1.749 4.962-4.913 2.814 2.842z"
                  />
                </svg>
              </i>
            </div>
            <span className="font-medium text-sm text-gray-800">Workflow</span>
          </div>

          <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
            <div onClick={() => setOpen(false)}>
              <SidebarLinks pendingApprovalsCount={pendingApprovalsCount} isAdmin={isAdmin} />
            </div>
            <div className="mt-4">
              <NewRequestDialog />
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}

