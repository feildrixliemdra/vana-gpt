'use client';

import type { User } from 'next-auth';
import { useRouter } from 'next/navigation';

import { MessageIcon, PlusIcon } from '@/components/icons';
import { SidebarHistory } from '@/components/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useState } from 'react';
import { FolderIcon, FolderPlus } from 'lucide-react';

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const [showFolderPrompt, setShowFolderPrompt] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  async function handleCreateFolder() {
    if (!newFolderName) return;
    await fetch('/api/folder', {
      method: 'POST',
      body: JSON.stringify({ name: newFolderName }),
      headers: { 'Content-Type': 'application/json' },
    });
    setNewFolderName('');
    setShowFolderPrompt(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('folder-created'));
    }
  }

  return (
    <Sidebar className="group-data-[side=left]:border-r-0 bg-sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-3 items-center"
            >
              <span className="text-2xl font-semibold px-2 hover:bg-muted rounded-md cursor-pointer">
                VanaGPT
              </span>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  type="button"
                  className="p-2 h-fit"
                >
                  <PlusIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                className='cursor-pointer'
                  onClick={() => {
                    setOpenMobile(false);
                    router.push('/');
                    router.refresh();
                  }}
                >
                 <MessageIcon/> New Chat
                </DropdownMenuItem>
                <DropdownMenuItem
                className='cursor-pointer'
                  onClick={() => {
                    setShowFolderPrompt(true);
                  }}
                >
                  <FolderPlus /> New Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {showFolderPrompt && (
            <div className="absolute left-0 right-0 top-16 bg-background p-4 shadow-lg z-50 flex flex-col gap-2 border rounded-md">
              <input
                className="border rounded px-2 py-1"
                placeholder="New folder name"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                autoFocus
              />
              <div className="flex flex-row gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => setShowFolderPrompt(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleCreateFolder}>
                  Create
                </Button>
              </div>
            </div>
          )}
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
