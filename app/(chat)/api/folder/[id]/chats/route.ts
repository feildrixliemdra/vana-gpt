import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getChatsByFolderId } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const folderId = params.id;
  if (!folderId) return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 });

  try {
    const chats = await getChatsByFolderId({ userId: session.user.id, folderId });
    return NextResponse.json(chats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
} 