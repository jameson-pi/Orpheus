'use server';
/**
 * @fileOverview A flow for real-time, interactive chat with Orpheus AI using the Hack Club AI Proxy.
 *
 * This implementation uses the official 'openai' library to ensure maximum compatibility
 * with the Hack Club Proxy endpoint: https://ai.hackclub.com/proxy/v1
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import OpenAI from 'openai';

const OrpheusAIChatInteractionInputSchema = z.object({
  message: z.string().describe("The user's chat message to Orpheus AI."),
});
export type OrpheusAIChatInteractionInput = z.infer<typeof OrpheusAIChatInteractionInputSchema>;

const OrpheusAIChatInteractionOutputSchema = z
  .string()
  .describe("The AI's full response to the user message.");
export type OrpheusAIChatInteractionOutput = z.infer<
  typeof OrpheusAIChatInteractionOutputSchema
>;

// Initialize OpenAI client for Hack Club Proxy using env variables
const openai = new OpenAI({
  apiKey: process.env.HACK_CLUB_AI_KEY,
  baseURL: 'https://ai.hackclub.com/proxy/v1',
});

export async function orpheusAIChatInteraction(
  input: OrpheusAIChatInteractionInput
): Promise<OrpheusAIChatInteractionOutput> {
  return orpheusAIChatInteractionFlow(input);
}

const orpheusAIChatInteractionFlow = ai.defineFlow(
  {
    name: 'orpheusAIChatInteractionFlow',
    inputSchema: OrpheusAIChatInteractionInputSchema,
    outputSchema: OrpheusAIChatInteractionOutputSchema,
  },
  async input => {
    if (!process.env.HACK_CLUB_AI_KEY) {
      throw new Error('HACK_CLUB_AI_KEY is not set in environment variables.');
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'google/gemini-3.5-flash',
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
      });

      return response.choices[0]?.message?.content || 'I processed your request, but the stars were silent. Try again?';
    } catch (error: any) {
      console.error('Hack Club Proxy Error:', error);
      throw new Error(`Failed to connect to Orpheus via Hack Club AI Proxy: ${error.message}`);
    }
  }
);
