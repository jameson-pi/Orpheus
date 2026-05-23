'use server';
import { db } from '@/db';
import { conversations, messages } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';

export async function getConversations() {
  if (!db) return [];
  const { data: session } = await auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return [];

  try {
    return await db.select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
  } catch (error) {
    console.error('Failed to get conversations', error);
    return [];
  }
}

export async function createConversation(title: string) {
  if (!db) {
    console.error("No database connection available.");
    return null;
  }
  const { data: session } = await auth.getSession();
  const userId = session?.user?.id;
  if (!userId) {
    console.error("User not authenticated.");
    return null;
  }

  try {
    const [conv] = await db.insert(conversations).values({ title, userId }).returning();
    revalidatePath('/');
    return conv;
  } catch (error) {
    console.error('Failed to create conversation', error);
    return null;
  }
}

export async function getMessages(conversationId: string) {
  if (!db) return [];
  const { data: session } = await auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return [];

  try {
    // Basic security check: ensure conversation belongs to user
    const [conv] = await db.select().from(conversations).where(
      and(eq(conversations.id, conversationId), eq(conversations.userId, userId))
    ).limit(1);
    
    if (!conv) return [];

    return await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  } catch (error) {
    console.error('Failed to get messages', error);
    return [];
  }
}

export async function addMessage(conversationId: string, role: string, content: string) {
  if (!db) {
    console.error("No database connection available.");
    return null;
  }
  const { data: session } = await auth.getSession();
  const userId = session?.user?.id;
  if (!userId) {
    console.error("User not authenticated.");
    return null;
  }

  try {
    // Security check: ensure conversation belongs to user
    const [conv] = await db.select().from(conversations).where(
      and(eq(conversations.id, conversationId), eq(conversations.userId, userId))
    ).limit(1);
    
    if (!conv) return null;

    const [msg] = await db.insert(messages).values({
      conversationId,
      role,
      content
    }).returning();
    await db.update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversationId));
    // revalidatePath('/'); // We omit revalidation here to prevent interrupting active streams
    return msg;
  } catch (error) {
    console.error('Failed to add message', error);
    return null;
  }
}

export async function updateConversationTitle(id: string, title: string) {
  if (!db) return null;
  const { data: session } = await auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return null;

  try {
    const [updated] = await db.update(conversations)
      .set({ title, updatedAt: new Date() })
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))
      .returning();
    revalidatePath('/');
    return updated;
  } catch (error) {
    console.error('Failed to update conversation title', error);
    return null;
  }
}
