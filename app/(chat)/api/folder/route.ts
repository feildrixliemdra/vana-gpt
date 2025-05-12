import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import {
  getFoldersByUserId,
  createFolder,
  updateFolderName,
  deleteFolder,
  addChatToFolder,
  removeChatFromFolder,
} from '@/lib/db/queries';

function generateUUID() {
  return crypto.randomUUID();
}

// List folders for the authenticated user
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const folders = await getFoldersByUserId(session.user.id);
  return NextResponse.json(folders);
}

// Create a new folder
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  const newFolder = {
    id: generateUUID(),
    userId: session.user.id,
    name,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await createFolder(newFolder);
  return NextResponse.json(newFolder);
}

// Update folder name
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, name } = await req.json();
  if (!id || !name) return NextResponse.json({ error: 'ID and name are required' }, { status: 400 });
  await updateFolderName({ id, userId: session.user.id, name, updatedAt: new Date() });
  return NextResponse.json({ success: true });
}

// Delete folder
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, folderId, chatId } = await req.json();
  if (folderId && chatId) {
    // Remove chat from folder
    await removeChatFromFolder({ chatId, userId: session.user.id });
    return NextResponse.json({ success: true });
  }
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  await deleteFolder({ id, userId: session.user.id });
  return NextResponse.json({ success: true });
}

// Add chat to folder
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { folderId, chatId } = await req.json();
  if (!folderId || !chatId) return NextResponse.json({ error: 'folderId and chatId are required' }, { status: 400 });
  try {
    await addChatToFolder({ folderId, chatId, userId: session.user.id });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add chat to folder' }, { status: 404 });
  }
} 