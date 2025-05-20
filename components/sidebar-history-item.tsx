'use client';

import type { Chat } from '@/lib/db/schema';
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from './ui/sidebar';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  MoreHorizontalIcon,
  TrashIcon,
} from './icons';
import { memo, useState } from 'react';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { FolderOutput } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { SquarePen } from 'lucide-react';
import { toast } from 'sonner';

const PureChatItem = ({
  chat,
  isActive,
  onDelete,
  setOpenMobile,
  folders,
  currentFolderId,
  onRename,
}: {
  chat: Chat;
  isActive: boolean;
  onDelete?: (chatId: string) => void;
  setOpenMobile?: (open: boolean) => void;
  folders?: any[];
  currentFolderId?: string;
  onRename?: (chatId: string, newTitle: string) => void;
}) => {
  const { visibilityType, setVisibilityType } = useChatVisibility({
    chatId: chat.id,
    initialVisibilityType: chat.visibility,
  });
  const [assigning, setAssigning] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [newTitle, setNewTitle] = useState(chat.title);
  const [renaming, setRenaming] = useState(false);

  async function handleAssignFolder(folderId: string) {
    setAssigning(true);
    await fetch('/api/folder', {
      method: 'PUT',
      body: JSON.stringify({ folderId, chatId: chat.id }),
      headers: { 'Content-Type': 'application/json' },
    });
    setAssigning(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('folder-created'));
    }
  }

  async function handleRemoveFromFolder(folderId: string) {
    setAssigning(true);
    await fetch('/api/folder', {
      method: 'DELETE',
      body: JSON.stringify({ folderId, chatId: chat.id }),
      headers: { 'Content-Type': 'application/json' },
    });
    setAssigning(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('folder-created'));
    }
  }

  async function handleRenameChat() {
    setRenaming(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: chat.id, title: newTitle }),
      });
      if (!res.ok) throw new Error('Failed to rename chat');
      setShowRenameDialog(false);
      if (onRename) onRename(chat.id, newTitle);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('chat-renamed'));
      }
      toast.success('Chat renamed successfully');
    } catch (e) {
      toast.error('Failed to rename chat');
    } finally {
      setRenaming(false);
    }
  }

  return (
    <SidebarMenuItem className='flex flex-row justify-between w-full group/menu-item'>
      <SidebarMenuButton asChild isActive={isActive} className=''>
        <Link href={`/chat/${chat.id}`} onClick={() => setOpenMobile?.(false)}>
          <span>{chat.title}</span>
        </Link>
      </SidebarMenuButton>

      <DropdownMenu modal={true}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mr-0.5"
            showOnHover={!isActive}
          >
            <MoreHorizontalIcon />
            <span className="sr-only">More</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="bottom" align="end">
          {/* Assign to folder */}
          {folders && folders.length > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                <span>Move to Folder</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {folders.map((folder) => (
                    <DropdownMenuItem
                      key={folder.id}
                      className="cursor-pointer"
                      onClick={() => handleAssignFolder(folder.id)}
                      disabled={assigning}
                    >
                      {folder.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}
          {/* Remove from folder if in a folder */}
          {typeof chat.folderId === 'string' && (
            <DropdownMenuItem
              className="cursor-pointer text-warning"
              onClick={() => handleRemoveFromFolder(chat.folderId as string)}
              disabled={assigning}
            >
              <FolderOutput />
              Remove from Folder
            </DropdownMenuItem>
          )}
          {/* share chat */}
          {/* <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <ShareIcon />
              <span>Share</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  className="cursor-pointer flex-row justify-between"
                  onClick={() => {
                    setVisibilityType('private');
                  }}
                >
                  <div className="flex flex-row gap-2 items-center">
                    <LockIcon size={12} />
                    <span>Private</span>
                  </div>
                  {visibilityType === 'private' ? (
                    <CheckCircleFillIcon />
                  ) : null}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer flex-row justify-between"
                  onClick={() => {
                    setVisibilityType('public');
                  }}
                >
                  <div className="flex flex-row gap-2 items-center">
                    <GlobeIcon />
                    <span>Public</span>
                  </div>
                  {visibilityType === 'public' ? <CheckCircleFillIcon /> : null}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub> */}

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              setShowRenameDialog(true);
              setNewTitle(chat.title);
            }}
          >
            <SquarePen /> Rename
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
            onSelect={() => onDelete?.(chat.id)}
          >
            <TrashIcon />
            <span>Delete Chat</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a new title for the chat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="w-full border rounded px-2 py-1 mt-2"
            autoFocus
            maxLength={80}
            disabled={renaming}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowRenameDialog(false)} disabled={renaming}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRenameChat}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={renaming || !newTitle.trim() || newTitle === chat.title}
            >
              {renaming ? 'Saving...' : 'Save'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarMenuItem>
  );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) return false;
  // Always re-render if folders prop changes
  if (prevProps.folders !== nextProps.folders) return false;
  // Re-render if chat title changes
  if (prevProps.chat.title !== nextProps.chat.title) return false;
  return true;
});
