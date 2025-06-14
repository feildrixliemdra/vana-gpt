import 'server-only';

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  type SQL,
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import {
  user,
  chat,
  type User,
  document,
  type Suggestion,
  suggestion,
  message,
  vote,
  type DBMessage,
  type Chat,
  stream,
  folder,
  userSuggestedAction,
  type UserSuggestedAction,
} from './schema';
import type { ArtifactKind } from '@/components/artifact';
import { generateUUID } from '../utils';
import { generateHashedPassword } from './utils';
import type { VisibilityType } from '@/components/visibility-selector';
import { ChatSDKError } from '../errors';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get user by email',
    );
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db.insert(user).values({ email, password: hashedPassword });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to create user');
  }
}

export async function createGuestUser() {
  const email = `guest-${Date.now()}`;
  const password = generateHashedPassword(generateUUID());

  try {
    return await db.insert(user).values({ email, password }).returning({
      id: user.id,
      email: user.email,
    });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create guest user',
    );
  }
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      visibility,
    });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save chat');
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));
    await db.delete(stream).where(eq(stream.chatId, id));

    const [chatsDeleted] = await db
      .delete(chat)
      .where(eq(chat.id, id))
      .returning();
    return chatsDeleted;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete chat by id',
    );
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<any>) =>
      db
        .select()
        .from(chat)
        .where(
          whereCondition
            ? and(whereCondition, eq(chat.userId, id))
            : eq(chat.userId, id),
        )
        .orderBy(desc(chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Array<Chat> = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          'not_found:database',
          `Chat with id ${startingAfter} not found`,
        );
      }

      filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          'not_found:database',
          `Chat with id ${endingBefore} not found`,
        );
      }

      filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get chats by user id',
    );
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get chat by id');
  }
}

export async function saveMessages({
  messages,
}: {
  messages: Array<DBMessage>;
}) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save messages');
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get messages by chat id',
    );
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === 'up' })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === 'up',
    });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to vote message');
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get votes by chat id',
    );
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db
      .insert(document)
      .values({
        id,
        title,
        kind,
        content,
        userId,
        createdAt: new Date(),
      })
      .returning();
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save document');
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get documents by id',
    );
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get document by id',
    );
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp),
        ),
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)))
      .returning();
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete documents by id after timestamp',
    );
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to save suggestions',
    );
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get suggestions by document id',
    );
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get message by id',
    );
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
        );
    }
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete messages by chat id after timestamp',
    );
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update chat visibility by id',
    );
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: { id: string; differenceInHours: number }) {
  try {
    const twentyFourHoursAgo = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000,
    );

    const [stats] = await db
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(
        and(
          eq(chat.userId, id),
          gte(message.createdAt, twentyFourHoursAgo),
          eq(message.role, 'user'),
        ),
      )
      .execute();

    return stats?.count ?? 0;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get message count by user id',
    );
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    await db
      .insert(stream)
      .values({ id: streamId, chatId, createdAt: new Date() });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create stream id',
    );
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const streamIds = await db
      .select({ id: stream.id })
      .from(stream)
      .where(eq(stream.chatId, chatId))
      .orderBy(asc(stream.createdAt))
      .execute();

    return streamIds.map(({ id }) => id);
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get stream ids by chat id',
    );
  }
}

export async function getFoldersByUserId(userId: string) {
  try {
    return await db.select().from(folder).where(eq(folder.userId, userId));
  } catch (error) {
    console.error('Failed to get folders by user id from database');
    throw error;
  }
}

export async function createFolder({ id, userId, name, createdAt, updatedAt }: { id: string, userId: string, name: string, createdAt: Date, updatedAt: Date }) {
  try {
    await db.insert(folder).values({ id, userId, name, createdAt, updatedAt });
    return { id, userId, name, createdAt, updatedAt };
  } catch (error) {
    console.error('Failed to create folder in database');
    throw error;
  }
}

export async function updateFolderName({ id, userId, name, updatedAt }: { id: string, userId: string, name: string, updatedAt: Date }) {
  try {
    await db.update(folder).set({ name, updatedAt }).where(and(eq(folder.id, id), eq(folder.userId, userId)));
    return { success: true };
  } catch (error) {
    console.error('Failed to update folder name in database');
    throw error;
  }
}

export async function deleteFolder({ id, userId }: { id: string, userId: string }) {
  try {
    await db.transaction(async (trx) => {
      // Unassign all chats from this folder (do not delete chats)
      await trx.update(chat).set({ folderId: null }).where(and(eq(chat.folderId, id), eq(chat.userId, userId)));
      // Now delete the folder
      await trx.delete(folder).where(and(eq(folder.id, id), eq(folder.userId, userId)));
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to delete folder in database');
    throw error;
  }
}

export async function addChatToFolder({ folderId, chatId, userId }: { folderId: string, chatId: string, userId: string }) {
  try {
    // Check ownership
    const chatExists = await db.select().from(chat).where(and(eq(chat.id, chatId), eq(chat.userId, userId)));
    if (!chatExists.length) throw new Error('Not found or unauthorized');
    await db.update(chat).set({ folderId }).where(eq(chat.id, chatId));
    return { success: true };
  } catch (error) {
    console.error('Failed to add chat to folder in database');
    throw error;
  }
}

export async function removeChatFromFolder({ chatId, userId }: { chatId: string, userId: string }) {
  try {
    // Check ownership
    const chatExists = await db.select().from(chat).where(and(eq(chat.id, chatId), eq(chat.userId, userId)));
    if (!chatExists.length) throw new Error('Not found or unauthorized');
    await db.update(chat).set({ folderId: null }).where(eq(chat.id, chatId));
    return { success: true };
  } catch (error) {
    console.error('Failed to remove chat from folder in database');
    throw error;
  }
}

export async function getChatsByFolderId({ userId, folderId }: { userId: string, folderId: string }) {
  try {
    return await db.select().from(chat).where(and(eq(chat.userId, userId), eq(chat.folderId, folderId)));
  } catch (error) {
    console.error('Failed to get chats by folder id from database');
    throw error;
  }
}

export async function getChatsByFolderIdApi({ userId, folderId }: { userId: string, folderId: string }) {
  try {
    return await db.select().from(chat).where(and(eq(chat.userId, userId), eq(chat.folderId, folderId)));
  } catch (error) {
    console.error('Failed to get chats by folder id from database (API)');
    throw error;
  }
}

export async function updateChatTitle({ id, userId, title }: { id: string, userId: string, title: string }) {
  try {
    await db.update(chat).set({ title }).where(and(eq(chat.id, id), eq(chat.userId, userId)));
    return { success: true };
  } catch (error) {
    console.error('Failed to update chat title in database');
    throw error;
  }
}

export async function getUserSuggestedActions(userId: string): Promise<UserSuggestedAction[]> {
  try {
    return await db.select().from(userSuggestedAction).where(eq(userSuggestedAction.userId, userId)).orderBy(asc(userSuggestedAction.createdAt));
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get user suggested actions');
  }
}

export async function createUserSuggestedAction({ userId, title, label, action }: { userId: string; title: string; label: string; action: string; }) {
  // Enforce max 6 actions per user
  const countResult: { count: number }[] = await db.select({ count: count(userSuggestedAction.id) }).from(userSuggestedAction).where(eq(userSuggestedAction.userId, userId));
  if ((countResult[0]?.count ?? 0) >= 6) {
    throw new ChatSDKError('bad_request:database', 'Maximum of 6 suggested actions allowed');
  }
  try {
    return await db.insert(userSuggestedAction).values({ userId, title, label, action, createdAt: new Date(), updatedAt: new Date() }).returning();
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to create user suggested action');
  }
}

export async function updateUserSuggestedAction({ id, userId, title, label, action }: { id: string; userId: string; title: string; label: string; action: string; }) {
  try {
    const [updated] = await db.update(userSuggestedAction)
      .set({ title, label, action, updatedAt: new Date() })
      .where(and(eq(userSuggestedAction.id, id), eq(userSuggestedAction.userId, userId)))
      .returning();
    if (!updated) throw new Error('Not found or not authorized');
    return updated;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to update user suggested action');
  }
}

export async function deleteUserSuggestedAction({ id, userId }: { id: string; userId: string; }) {
  try {
    const [deleted] = await db.delete(userSuggestedAction)
      .where(and(eq(userSuggestedAction.id, id), eq(userSuggestedAction.userId, userId)))
      .returning();
    if (!deleted) throw new Error('Not found or not authorized');
    return deleted;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to delete user suggested action');
  }
}
