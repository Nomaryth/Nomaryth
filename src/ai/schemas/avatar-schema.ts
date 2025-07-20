
/**
 * @fileOverview Schemas and types for the avatar generation flow.
 *
 * - GenerateAvatarInputSchema - The Zod schema for the avatar generation input.
 * - GenerateAvatarInput - The TypeScript type for the avatar generation input.
 * - GenerateAvatarOutputSchema - The Zod schema for the avatar generation output.
 * - GenerateAvatarOutput - The TypeScript type for the avatar generation output.
 */

import { z } from 'genkit';

export const GenerateAvatarInputSchema = z.object({
  seed: z.string().optional().describe('An optional seed to generate a specific avatar.'),
});
export type GenerateAvatarInput = z.infer<typeof GenerateAvatarInputSchema>;

export const GenerateAvatarOutputSchema = z.object({
  url: z.string().url().describe('The URL of the generated avatar image.'),
});
export type GenerateAvatarOutput = z.infer<typeof GenerateAvatarOutputSchema>;
