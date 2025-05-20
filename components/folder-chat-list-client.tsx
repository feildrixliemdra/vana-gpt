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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { SquarePen } from 'lucide-react';

console.log('FOLDER CHAT LIST CLIENT MOUNTED');

export function FolderChatListClient({ chats, setChats, folderId }: { chats: any[]; setChats: React.Dispatch<React.SetStateAction<any[]>>; folderId: string }) {
  const [creating, setCreating] = useState(false);
  const [folderName, setFolderName] = useState<string | null>(null);
  const [renameDialogChatId, setRenameDialogChatId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameChatId, setRenameChatId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  
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

  const handleRenameChat = async () => {
    if (!renameChatId) return;
    setRenaming(true);
    try {
      console.log('Renaming chat:', renameChatId, 'to', newTitle);
      const res = await fetch('/api/chat', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: renameChatId, title: newTitle }),
      });
      if (!res.ok) throw new Error('Failed to rename chat');
      setChats((prev) => prev.map((chat) => chat.id === renameChatId ? { ...chat, title: newTitle } : chat));
      setShowRenameDialog(false);
      toast.success('Chat renamed successfully');
    } catch (e) {
      toast.error('Failed to rename chat');
    } finally {
      setRenaming(false);
    }
  };

  return (
    <>
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
                  className="cursor-pointer"
                  onClick={() => {
                    setShowRenameDialog(true);
                    setRenameChatId(chat.id);
                    setNewTitle(chat.title);
                  }}
                >
                  <SquarePen /> Rename
                </DropdownMenuItem>
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
              disabled={renaming || !newTitle.trim() || chats.find(c => c.id === renameChatId)?.title === newTitle}
            >
              {renaming ? 'Saving...' : 'Save'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 