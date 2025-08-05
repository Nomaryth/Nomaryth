'use server';

import { ai } from '@/ai/genkit';
import { GenerateAvatarInputSchema, GenerateAvatarOutputSchema, type GenerateAvatarInput, type GenerateAvatarOutput } from '@/ai/schemas/avatar-schema';

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
    const seed = input.seed || Math.random().toString(36).substring(7);
    const encodedSeed = encodeURIComponent(seed);
    const avatarUrl = `https://api.dicebear.com/8.x/adventurer/svg?seed=${encodedSeed}`;
    
    return { url: avatarUrl };
  }
);
