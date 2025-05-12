import { NextRequest, NextResponse } from 'next/server';
import { getFoldersByUserId } from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const param = await params;
  const folders = await getFoldersByUserId(session.user.id);
  const folder = folders.find((f: any) => f.id === param.id);
  if (!folder) {
    return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
  }
  return NextResponse.json(folder);
} 