import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getChatsByFolderIdApi } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const folderId = searchParams.get('folderId');
  if (!folderId) {
    return new Response('Folder ID is required', { status: 400 });
  }
  
  const chats = await getChatsByFolderIdApi({ userId: session.user.id, folderId });
  return new Response(JSON.stringify(chats), { status: 200 });
} 