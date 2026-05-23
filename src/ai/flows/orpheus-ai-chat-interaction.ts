'use server';
/**
 * @fileOverview A flow for real-time, interactive chat with Orpheus AI using an AI Proxy.
 *
 * This implementation uses the official 'openai' library to ensure maximum compatibility
 * with the Proxy endpoint.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import OpenAI from "openai";

const OrpheusAIChatInteractionInputSchema = z.object({
  message: z.string().describe("The user's chat message to Orpheus AI."),
  model: z.string().optional().describe("The AI model to use."),
  history: z.array(z.object({
    role: z.enum(["user", "ai", "system"]),
    content: z.string()
  })).optional().describe("The previous message history."),
});
export type OrpheusAIChatInteractionInput = z.infer<typeof OrpheusAIChatInteractionInputSchema>;

const OrpheusAIChatInteractionOutputSchema = z
  .string()
  .describe("The AI's full response to the user message.");
export type OrpheusAIChatInteractionOutput = z.infer<
  typeof OrpheusAIChatInteractionOutputSchema
>;

const orpheusAIChatInteractionFlow = ai.defineFlow(
  {
    name: 'orpheusAIChatInteractionFlow',
    inputSchema: OrpheusAIChatInteractionInputSchema,
    outputSchema: OrpheusAIChatInteractionOutputSchema,
  },
  async (input, {sendChunk}) => {
    const isOpenRouter = !!process.env.OPENROUTER_API_KEY && !process.env.OPENROUTER_API_KEY.startsWith('sk-hc-');
    const apiKey = isOpenRouter ? process.env.OPENROUTER_API_KEY : (process.env.HACK_CLUB_AI_KEY || process.env.OPENROUTER_API_KEY);
    
    if (!apiKey) {
      throw new Error('AI API key (OPENROUTER_API_KEY or HACK_CLUB_AI_KEY) is not set.');
    }

    const baseURL = isOpenRouter 
      ? 'https://openrouter.ai/api/v1'
      : 'https://ai.hackclub.com/proxy/v1';

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
      defaultHeaders: {
        "HTTP-Referer": "https://orpheus-gilt.vercel.app",
        "X-Title": "Orpheus AI",
      }
    });

    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `You are Orpheus, a helpful and knowledgeable AI assistant. 
          
          Your personality: Professional, clear, and supportive.
          Your mission: Help users with their questions and tasks efficiently.
          
          Guidelines for interaction:
          - Use rich markdown formatting (H3 headers, bolding, lists, code blocks).
          - Always provide structured, easy-to-read answers.`
        },
        ...(input.history || []).map(m => ({
          role: (m.role === 'ai' ? 'assistant' : m.role) as any,
          content: m.content
        })),
        {
          role: 'user',
          content: input.message
        }
      ];

      const stream = await openai.chat.completions.create({
        model: input.model || 'google/gemini-3.5-flash',
        messages: messages,
        stream: true,
      });

      let fullContent = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullContent += content;
          if (sendChunk) sendChunk(content);
        }
      }

      return fullContent || 'I processed your request, but the stars were silent. Try again?';
    } catch (error) {
      console.error('AI Proxy Error:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to connect to Orpheus: ${message}`);
    }
  }
);

export async function orpheusAIChatInteraction(
  input: OrpheusAIChatInteractionInput
): Promise<OrpheusAIChatInteractionOutput> {
  return orpheusAIChatInteractionFlow(input);
}

/**
 * Streaming version of the interaction flow.
 * Directly uses OpenAI client to ensure maximum compatibility with Next.js 15 streaming.
 */
export async function* orpheusAIChatInteractionStream(
  input: OrpheusAIChatInteractionInput
) {
  const isOpenRouter = !!process.env.OPENROUTER_API_KEY && !process.env.OPENROUTER_API_KEY.startsWith('sk-hc-');
  const apiKey = isOpenRouter ? process.env.OPENROUTER_API_KEY : (process.env.HACK_CLUB_AI_KEY || process.env.OPENROUTER_API_KEY);
  
  if (!apiKey) throw new Error('AI API key not set.');

  const baseURL = isOpenRouter 
    ? 'https://openrouter.ai/api/v1'
    : 'https://ai.hackclub.com/proxy/v1';

  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
    defaultHeaders: {
      "HTTP-Referer": "https://orpheus-gilt.vercel.app",
      "X-Title": "Orpheus AI",
    }
  });

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `You are Orpheus, a helpful and knowledgeable AI assistant. 
      Professional, clear, and supportive. Use rich markdown formatting.`
    },
    ...(input.history || []).map(m => ({
      role: (m.role === 'ai' ? 'assistant' : m.role) as any,
      content: m.content
    })),
    { role: 'user', content: input.message }
  ];

  try {
    const stream = await openai.chat.completions.create({
      model: input.model || 'google/gemini-3.5-flash',
      messages: messages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) yield content;
    }
  } catch (error) {
    console.error('[Orpheus] Direct Stream Error:', error);
    throw error;
  }
}
