
'use server';
/**
 * @fileOverview A flow to fetch weather data from wttr.in.
 *
 * - getWeather - A function that fetches weather for a given city.
 */

import { ai } from '@/ai/genkit';
import { GetWeatherInputSchema, GetWeatherOutputSchema, type GetWeatherInput, type GetWeatherOutput } from '@/ai/schemas/weather-schema';
import { z } from 'zod';

// This function is what the client-side code will call.
export async function getWeather(input: GetWeatherInput): Promise<GetWeatherOutput> {
  return getWeatherFlow(input);
}

const getWeatherFlow = ai.defineFlow(
  {
    name: 'getWeatherFlow',
    inputSchema: GetWeatherInputSchema,
    outputSchema: GetWeatherOutputSchema,
  },
  async ({ city }) => {
    // Using wttr.in, a simple weather service that returns JSON.
    // It's free and doesn't require an API key.
    const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;

    try {
      const response = await fetch(url, {
        headers: {
            // wttr.in requires a User-Agent header to prevent being blocked.
            'User-Agent': 'Nomaryth-App/0.1'
        }
      });

      if (!response.ok) {
        // wttr.in might return non-ok status for various reasons (e.g., unknown location)
        const errorText = await response.text();
        console.error(`wttr.in API error for city "${city}":`, errorText);
        throw new Error(`Failed to fetch weather data. Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const currentCondition = data.current_condition?.[0];
      if (!currentCondition) {
        throw new Error(`No current weather condition found for ${city}`);
      }

      return {
        temperature: parseInt(currentCondition.temp_C, 10),
        description: currentCondition.weatherDesc?.[0]?.value || 'N/A',
        locationName: data.nearest_area?.[0]?.areaName?.[0]?.value || city,
      };

    } catch (error) {
      console.error("Error in getWeatherFlow:", error);
      if (error instanceof Error) {
        // Re-throw specific, actionable errors
        throw new Error(`Could not retrieve weather for "${city}". Please check the location name.`);
      }
      // Throw a generic error for unexpected issues
      throw new Error("Could not retrieve weather information at this time.");
    }
  }
);
