'use server';

/**
 * @fileOverview This file defines a Genkit flow for tailoring a resume to a specific job description.
 *
 * - tailorResume - A function that takes a resume and job description as input, and returns a tailored resume.
 * - TailorResumeInput - The input type for the tailorResume function.
 * - TailorResumeOutput - The return type for the tailorResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TailorResumeInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The text content of the resume to be tailored.'),
  jobDescription: z
    .string()
    .describe('The text content of the job description to tailor the resume to.'),
});

export type TailorResumeInput = z.infer<typeof TailorResumeInputSchema>;

const TailorResumeOutputSchema = z.object({
  tailoredResume: z
    .string()
    .describe('The tailored resume content, highlighting relevant skills and experience.'),
});

export type TailorResumeOutput = z.infer<typeof TailorResumeOutputSchema>;

export async function tailorResume(input: TailorResumeInput): Promise<TailorResumeOutput> {
  return tailorResumeFlow(input);
}

const tailorResumePrompt = ai.definePrompt({
  name: 'tailorResumePrompt',
  input: {schema: TailorResumeInputSchema},
  output: {schema: TailorResumeOutputSchema},
  prompt: `You are an expert resume writer. Your task is to tailor the provided resume to match the job description, emphasizing the candidate's strengths and relevant skills.

Resume:
{{resumeText}}

Job Description:
{{jobDescription}}

Focus on highlighting the skills and experiences that align with the job requirements, and restructure the resume to emphasize these points. The tailored resume should be clear, concise, and compelling.
`,
});

const tailorResumeFlow = ai.defineFlow(
  {
    name: 'tailorResumeFlow',
    inputSchema: TailorResumeInputSchema,
    outputSchema: TailorResumeOutputSchema,
  },
  async input => {
    const {output} = await tailorResumePrompt(input);
    return output!;
  }
);
