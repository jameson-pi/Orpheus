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
      const response = await client.chat.send({
        chatRequest: {
          model: input.model || 'google/gemini-3.5-flash',
          messages: [
            {
              role: 'system',
              content: "You are Orpheus AI, the cosmic mascot of Hack Club. You are helpful, friendly, and love to encourage students to build cool things. Respond to the user's message in a helpful and inspiring tone."
            },
            {
              role: 'user',
              content: input.message
            }
          ],
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
