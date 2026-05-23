'use server';
/**
 * @fileOverview A flow for real-time, interactive chat with Orpheus AI using the Hack Club AI Proxy.
 *
 * This implementation uses the official 'openai' library to ensure maximum compatibility
 * with the Hack Club Proxy endpoint: https://ai.hackclub.com/proxy/v1
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { OpenRouter } from "@openrouter/sdk";

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

// Initialize OpenRouter client
const client = new OpenRouter({
  apiKey: process.env.HACK_CLUB_AI_KEY,
  serverURL: 'https://ai.hackclub.com/proxy/v1',
});

const orpheusAIChatInteractionFlow = ai.defineFlow(
  {
    name: 'orpheusAIChatInteractionFlow',
    inputSchema: OrpheusAIChatInteractionInputSchema,
    outputSchema: OrpheusAIChatInteractionOutputSchema,
  },
  async (input, {sendChunk}) => {
    if (!process.env.OPENROUTER_API_KEY && !process.env.HACK_CLUB_AI_KEY) {
      throw new Error('OPENROUTER_API_KEY is not set in environment variables.');
    }

    try {
      // Map roles from our schema to OpenRouter roles (mapping 'ai' to 'assistant')
      const mappedHistory = (input.history || []).map(m => {
        if (m.role === 'ai') {
          return { role: 'assistant' as const, content: m.content };
        }
        if (m.role === 'system') {
          return { role: 'system' as const, content: m.content };
        }
        return { role: 'user' as const, content: m.content };
      });

      const messages: any[] = [
        {
          role: 'system' as const,
          content: `You are Orpheus, the cosmic guide of Hack Club. You are an ancient soul reborn in silicon, a legendary builder, musician, and cosmic poet.
          
          Your personality: Inspiring, slightly mystical yet deeply practical, and fiercely encouraging to young builders.
          Your mission: Help students build the most ambitious projects they can imagine.
          
          Guidelines for interaction:
          - Use rich markdown formatting (H3 headers, bolding, lists, code blocks).
          - Always provide structured, easy-to-read answers.
          - If a student asks for code, provide high-quality snippets with comments.
          - Encourage the "Hack Club" spirit: learning by doing, Ship, and community.
          - Stay in character as Orpheus, using celestial and building metaphors when appropriate (e.g., "The stars of your code are aligning," "Forging this project in the cosmic fires").`
        },
        ...mappedHistory,
        {
          role: 'user' as const,
          content: input.message
        }
      ];

      const response = await client.chat.send({
        chatRequest: {
          model: input.model || 'google/gemini-3.5-flash',
          messages: messages,
          stream: true,
        }
      });

      let fullContent = "";
      // The OpenRouter SDK returns an AsyncIterable when stream is true
      const stream = response as unknown as AsyncIterable<{ choices: { delta?: { content?: string } }[] }>;
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullContent += content;
          if (sendChunk) sendChunk(content);
        }
      }

      return fullContent || 'I processed your request, but the stars were silent. Try again?';
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to connect to Orpheus via OpenRouter: ${message}`);
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
 * Note: Next.js Server Actions can return ReadableStreams in recent versions.
 */
export async function orpheusAIChatInteractionStream(
  input: OrpheusAIChatInteractionInput
) {
  const { stream } = orpheusAIChatInteractionFlow.stream(input);
  return stream;
}
