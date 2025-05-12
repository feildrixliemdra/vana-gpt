"use client";
import { useEffect, useState } from 'react';
import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { FolderChatListClient } from '@/components/folder-chat-list-client';
import type { Session } from 'next-auth';
import type { UIMessage } from 'ai';

interface FolderClientPageProps {
  initialFolderName: string;
  initialChats: any[];
  folderId: string;
  session: Session;
  defaultChatModel: string;
}

export function FolderClientPage({ initialFolderName, initialChats, folderId, session, defaultChatModel }: FolderClientPageProps) {
  const [folderName, setFolderName] = useState<string>(initialFolderName);
  const [chats, setChats] = useState<any[]>(initialChats);

  useEffect(() => {
    function onFolderRenamed() {
      fetch(`/api/folder/${folderId}`)
        .then(res => res.json())
        .then(data => setFolderName(data?.name || ''));
    }
    window.addEventListener('folder-renamed', onFolderRenamed);
    return () => window.removeEventListener('folder-renamed', onFolderRenamed);
  }, [folderId]);

  // Optionally, add useEffect for chats if you want to refetch on certain events

  // Generate a new chat ID for the Chat UI
  const newChatId = typeof window !== 'undefined' && window.crypto ? window.crypto.randomUUID() : Math.random().toString(36).slice(2);
  const initialMessages: UIMessage[] = [];
  const initialChatModel = defaultChatModel;
  const initialVisibilityType = 'private';
  const isReadonly = false;
  const autoResume = false;

  return (
    <>
      <Chat
        id={newChatId}
        initialMessages={initialMessages}
        initialChatModel={initialChatModel}
        initialVisibilityType={initialVisibilityType}
        isReadonly={isReadonly}
        session={session}
        autoResume={autoResume}
        folderId={folderId}
      />
      <DataStreamHandler id={newChatId} />
      <div className="w-full md:max-w-3xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">{folderName}</h1>
        <div className="w-full bg-sidebar rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Chats in this project</h2>
          {chats.length === 0 ? (
            <div className="text-muted-foreground">No chats in this folder.</div>
          ) : (
            <FolderChatListClient initialChats={chats} folderId={folderId} />
          )}
        </div>
      </div>
    </>
  );
} 