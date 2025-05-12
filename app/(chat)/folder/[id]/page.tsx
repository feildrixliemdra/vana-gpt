import { notFound } from 'next/navigation';
import { getFoldersByUserId, getChatsByFolderId } from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';
import { FolderChatListClient } from '@/components/folder-chat-list-client';
import { Chat } from '@/components/chat';
import { cookies } from 'next/headers';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import type { UIMessage } from 'ai';
import { DataStreamHandler } from '@/components/data-stream-handler';

export default async function FolderPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return notFound();
  const folders = await getFoldersByUserId(session.user.id);
  const folder = folders.find((f: any) => f.id === params.id);
  if (!folder) return notFound();
  const chats = await getChatsByFolderId({ userId: session.user.id, folderId: folder.id });

  // Generate a new chat ID for the Chat UI
  const newChatId = crypto.randomUUID();
  const initialMessages: UIMessage[] = [];
  const initialChatModel = DEFAULT_CHAT_MODEL;
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
        folderId={folder.id}
      />
      <DataStreamHandler id={newChatId} />
      <div className="w-full md:max-w-3xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">{folder.name}</h1>
        <div className="w-full bg-muted rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Chats in this project</h2>
          {chats.length === 0 ? (
            <div className="text-muted-foreground">No chats in this folder.</div>
          ) : (
            <FolderChatListClient initialChats={chats} folderId={folder.id} />
          )}
        </div>
      </div>
    </>
  );
} 