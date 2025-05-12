import { notFound } from 'next/navigation';
import { getFoldersByUserId, getChatsByFolderId } from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { FolderClientPage } from '../../../../components/folder-client-page';

export default async function FolderPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return notFound();
  const params = await props.params;
  const { id } = params;
  const folders = await getFoldersByUserId(session.user.id);
  const folder = folders.find((f: any) => f.id === id);
  if (!folder) return notFound();
  const chats = await getChatsByFolderId({ userId: session.user.id, folderId: folder.id });

  return (
    <FolderClientPage
      initialFolderName={folder.name}
      initialChats={chats}
      folderId={folder.id}
      session={session}
      defaultChatModel={DEFAULT_CHAT_MODEL}
    />
  );
} 