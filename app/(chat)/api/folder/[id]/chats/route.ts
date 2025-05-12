import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getChatsByFolderIdApi } from '@/lib/db/queries';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }
  const folderId = params.id;
  const chats = await getChatsByFolderIdApi({ userId: session.user.id, folderId });
  return new Response(JSON.stringify(chats), { status: 200 });
} 