'use server';
import { db } from '@/db';
import { conversations, messages } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
export async function getConversations() {
  if (!db) return [];
  try {
    return await db.select().from(conversations).orderBy(desc(conversations.updatedAt));
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
  try {
    const [conv] = await db.insert(conversations).values({ title }).returning();
    revalidatePath('/');
    return conv;
  } catch (error) {
    console.error('Failed to create conversation', error);
    return null;
  }
}
export async function getMessages(conversationId: string) {
  if (!db) return [];
  try {
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
  try {
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
  try {
    const [updated] = await db.update(conversations)
      .set({ title, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    revalidatePath('/');
    return updated;
  } catch (error) {
    console.error('Failed to update conversation title', error);
    return null;
  }
}
