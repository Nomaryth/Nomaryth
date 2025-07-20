
/**
 * @fileOverview Schemas and types for the weather fetching flow.
 *
 * - GetWeatherInputSchema - The Zod schema for the weather input.
 * - GetWeatherInput - The TypeScript type for the weather input.
 * - GetWeatherOutputSchema - The Zod schema for the weather output.
 * - GetWeatherOutput - The TypeScript type for the weather output.
 */

import { z } from 'genkit';

export const GetWeatherInputSchema = z.object({
  city: z.string().describe('The name of the city.'),
});
export type GetWeatherInput = z.infer<typeof GetWeatherInputSchema>;

export const GetWeatherOutputSchema = z.object({
  temperature: z.number().describe('The current temperature in Celsius.'),
  description: z.string().describe('A brief description of the weather.'),
  locationName: z.string().describe('The name of the location.'),
});
export type GetWeatherOutput = z.infer<typeof GetWeatherOutputSchema>;
