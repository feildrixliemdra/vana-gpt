'use client';

import { useEffect, useState } from 'react';
import { ChatItem } from '@/components/sidebar-history-item';
import { MessageIcon, PlusIcon } from '@/components/icons';
import { toast } from 'sonner';

export function FolderChatListClient({ initialChats, folderId }: { initialChats: any[]; folderId: string }) {
  const [chats, setChats] = useState(initialChats);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    function onFolderCreated() {
      fetch(`/api/folder/${folderId}/chats`)
        .then(res => res.json())
        .then(setChats);
    }
    window.addEventListener('folder-created', onFolderCreated);
    return () => {
      window.removeEventListener('folder-created', onFolderCreated);
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
      setChats(updated);
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

  return (
    <ul className="space-y-2">
      {chats.map((chat: any) => (
        <div key={chat.id} className="flex items-center gap-2">
          <MessageIcon />
          <ChatItem chat={chat} isActive={false} onDelete={handleDeleteChat} />
        </div>
      ))}
    </ul>
  );
} 