'use server';

/**
 * @fileOverview Extracts information from a resume and job description, matches skills and experience,
 * and generates a tailored resume.
 *
 * - extractAndMatch - A function that orchestrates the resume tailoring process.
 * - ExtractAndMatchInput - The input type for the extractAndMatch function.
 * - ExtractAndMatchOutput - The return type for the extractAndMatch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractAndMatchInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The text content of the resume.'),
  jobDescriptionText: z
    .string()
    .describe('The text content of the job description.'),
});
export type ExtractAndMatchInput = z.infer<typeof ExtractAndMatchInputSchema>;

const ExtractAndMatchOutputSchema = z.object({
  tailoredResumeText: z.string().describe('The tailored resume content with highlighted strengths.'),
});
export type ExtractAndMatchOutput = z.infer<typeof ExtractAndMatchOutputSchema>;

export async function extractAndMatch(input: ExtractAndMatchInput): Promise<ExtractAndMatchOutput> {
  return extractAndMatchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractAndMatchPrompt',
  input: {schema: ExtractAndMatchInputSchema},
  output: {schema: ExtractAndMatchOutputSchema},
  prompt: `You are an expert resume tailor. You will be given a resume and a job description. Your task is to tailor the resume to match the job description, highlighting the candidate's core strengths and relevant experience.

Resume:
{{{resumeText}}}

Job Description:
{{{jobDescriptionText}}}

Focus on mirroring the structure of the provided resume, while emphasizing skills and experiences that align with the job description.  Make sure it is ATS friendly, and ensure to write it in a professional tone.
`,
});

const extractAndMatchFlow = ai.defineFlow(
  {
    name: 'extractAndMatchFlow',
    inputSchema: ExtractAndMatchInputSchema,
    outputSchema: ExtractAndMatchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
