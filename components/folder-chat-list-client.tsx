'use client';

import { useEffect, useState } from 'react';
import { MessageIcon, PlusIcon, MoreHorizontalIcon, TrashIcon } from '@/components/icons';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FolderOutput } from 'lucide-react';
export function FolderChatListClient({ initialChats, folderId }: { initialChats: any[]; folderId: string }) {
  const [chats, setChats] = useState(Array.isArray(initialChats) ? initialChats : []);
  const [creating, setCreating] = useState(false);
  const [folderName, setFolderName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFolderName() {
      try {
        const res = await fetch(`/api/folder/${folderId}`);
        if (res.ok) {
          const data = await res.json();
          setFolderName(data?.name || null);
        }
      } catch (e) {
        setFolderName(null);
      }
    }
    fetchFolderName();
    function onFolderCreated() {
      fetch(`/api/folder/${folderId}/chats`)
        .then(res => res.json())
        .then(setChats);
    }
    function onFolderRenamed() {
      fetchFolderName();
    }
    window.addEventListener('folder-created', onFolderCreated);
    window.addEventListener('folder-renamed', onFolderRenamed);
    return () => {
      window.removeEventListener('folder-created', onFolderCreated);
      window.removeEventListener('folder-renamed', onFolderRenamed);
    };
  }, [folderId]);

  async function handleNewChat() {
    setCreating(true);
    const chatId = crypto.randomUUID();
    const messageId = crypto.randomUUID();
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: chatId,
        message: {
          id: messageId,
          createdAt: new Date().toISOString(),
          role: 'user',
          content: 'New chat started',
          parts: [{ text: 'New chat started', type: 'text' }],
        },
        selectedChatModel: 'chat-model',
        selectedVisibilityType: 'private',
        folderId,
      }),
    });
    if (res.ok) {
      // Refetch chats in this folder
      const updated = await fetch(`/api/folder/${folderId}/chats`).then(r => r.json());
      console.log('Fetched chats:', updated);

      setChats(Array.isArray(updated) ? updated : []);
      window.dispatchEvent(new Event('folder-created'));
    }
    setCreating(false);
  }

  async function handleDeleteChat(chatId: string) {
    await fetch(`/api/chat?id=${chatId}`, { method: 'DELETE' });
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    window.dispatchEvent(new Event('folder-created'));
    toast.success('Chat deleted successfully');
  }

  async function handleRemoveFromFolder(chatId: string) {
    await fetch('/api/folder', {
      method: 'DELETE',
      body: JSON.stringify({ folderId, chatId }),
      headers: { 'Content-Type': 'application/json' },
    });
    // Refetch chats in this folder
    const updated = await fetch(`/api/folder/${folderId}/chats`).then(r => r.json());
    setChats(Array.isArray(updated) ? updated : []);
    window.dispatchEvent(new Event('folder-created'));
    toast.success('Chat removed from folder');
  }

  return (
    <ul className="space-y-2">
      {Array.isArray(chats) && chats.map((chat: any) => (
        <div key={chat.id} className="flex items-center gap-2">
          <MessageIcon />
          <span className="flex-1 truncate">{chat.title}</span>
          <DropdownMenu >
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-muted rounded">
                <MoreHorizontalIcon />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer text-warning"
                onClick={() => handleRemoveFromFolder(chat.id)}
              >
               <FolderOutput /> Remove from Folder
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
                onClick={() => handleDeleteChat(chat.id)}
              >
                <TrashIcon />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </ul>
  );
} 