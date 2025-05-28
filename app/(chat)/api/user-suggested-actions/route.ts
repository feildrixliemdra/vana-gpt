import { NextRequest, NextResponse } from 'next/server';
import {
  getUserSuggestedActions,
  createUserSuggestedAction,
  updateUserSuggestedAction,
  deleteUserSuggestedAction,
} from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const actions = await getUserSuggestedActions(session.user.id);
  return NextResponse.json(actions);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { title, label, action } = await req.json();
  try {
    const created = await createUserSuggestedAction({
      userId: session.user.id,
      title,
      label,
      action,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id, title, label, action } = await req.json();
  try {
    const updated = await updateUserSuggestedAction({
      id,
      userId: session.user.id,
      title,
      label,
      action,
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await req.json();
  try {
    const deleted = await deleteUserSuggestedAction({
      id,
      userId: session.user.id,
    });
    return NextResponse.json(deleted);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
} 