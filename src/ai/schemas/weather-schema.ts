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