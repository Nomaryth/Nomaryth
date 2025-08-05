import { z } from 'genkit';

export const GenerateAvatarInputSchema = z.object({
  seed: z.string().optional().describe('An optional seed to generate a specific avatar.'),
});
export type GenerateAvatarInput = z.infer<typeof GenerateAvatarInputSchema>;

export const GenerateAvatarOutputSchema = z.object({
  url: z.string().url().describe('The URL of the generated avatar image.'),
});
export type GenerateAvatarOutput = z.infer<typeof GenerateAvatarOutputSchema>;