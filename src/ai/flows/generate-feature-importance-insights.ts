'use server';

/**
 * @fileOverview Generates human-readable insights from feature importance results.
 *
 * - generateFeatureImportanceInsights - A function that generates insights from feature importance.
 * - GenerateFeatureImportanceInsightsInput - The input type for the generateFeatureImportanceInsights function.
 * - GenerateFeatureImportanceInsightsOutput - The return type for the generateFeatureImportanceInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFeatureImportanceInsightsInputSchema = z.object({
  featureImportances: z
    .record(z.number())
    .describe('A map of feature names to their importance scores.'),
  targetColumn: z.string().describe('The name of the target column.'),
});
export type GenerateFeatureImportanceInsightsInput = z.infer<
  typeof GenerateFeatureImportanceInsightsInputSchema
>;

const GenerateFeatureImportanceInsightsOutputSchema = z.object({
  insights: z.string().describe('Human-readable insights about feature importance.'),
});
export type GenerateFeatureImportanceInsightsOutput = z.infer<
  typeof GenerateFeatureImportanceInsightsOutputSchema
>;

export async function generateFeatureImportanceInsights(
  input: GenerateFeatureImportanceInsightsInput
): Promise<GenerateFeatureImportanceInsightsOutput> {
  return generateFeatureImportanceInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFeatureImportanceInsightsPrompt',
  input: {schema: GenerateFeatureImportanceInsightsInputSchema},
  output: {schema: GenerateFeatureImportanceInsightsOutputSchema},
  prompt: `You are an expert data scientist. You are analyzing the feature importances from a random forest model to understand which features are most predictive of the target variable.

  The target variable is '{{targetColumn}}'.

  Here are the feature importances:
  {{#each (sortObject featureImportances) }}
  - {{@key}}: {{this}}
  {{/each}}

  Provide a concise summary of the top 3 most important features and how they relate to the target variable. Focus on providing actionable insights that a data scientist or business user could use to understand the model and the data.
  `,
  templateHelpers: {
    sortObject: (obj: Record<string, number>) => {
      const entries = Object.entries(obj);
      entries.sort(([, a], [, b]) => b - a);
      return Object.fromEntries(entries);
    },
  },
});

const generateFeatureImportanceInsightsFlow = ai.defineFlow(
  {
    name: 'generateFeatureImportanceInsightsFlow',
    inputSchema: GenerateFeatureImportanceInsightsInputSchema,
    outputSchema: GenerateFeatureImportanceInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
