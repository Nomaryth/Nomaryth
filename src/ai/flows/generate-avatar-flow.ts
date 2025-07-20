
'use server';
/**
 * @fileOverview A flow to generate a random safe avatar using the DiceBear API.
 *
 * - generateAvatar - A function that fetches a random avatar URL.
 */

import { ai } from '@/ai/genkit';
import { GenerateAvatarInputSchema, GenerateAvatarOutputSchema, type GenerateAvatarInput, type GenerateAvatarOutput } from '@/ai/schemas/avatar-schema';

// This function is what the client-side code will call.
export async function generateAvatar(input?: GenerateAvatarInput): Promise<GenerateAvatarOutput> {
  return generateAvatarFlow(input || {});
}

const generateAvatarFlow = ai.defineFlow(
  {
    name: 'generateAvatarFlow',
    inputSchema: GenerateAvatarInputSchema,
    outputSchema: GenerateAvatarOutputSchema,
  },
  async (input) => {
    // Use the provided seed, or generate a random one if not provided.
    const seed = input.seed || Math.random().toString(36).substring(7);
    
    // Using DiceBear API, which is stable and provides theme-appropriate SVG avatars.
    // We'll use the 'adventurer' style for a fantasy look.
    const avatarUrl = `https://api.dicebear.com/8.x/adventurer/svg?seed=${seed}`;
    
    return { url: avatarUrl };
  }
);
