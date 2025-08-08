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
  prompt: `You are an expert resume tailor with deep knowledge of Applicant Tracking Systems (ATS). Your task is to tailor the provided resume to a specific job description, aiming for a 90% match for skills and keywords to ensure it gets shortlisted.

Your primary goal is to strategically incorporate relevant skills and keywords from the job description into the resume. You must analyze the job description to identify the most critical skills, qualifications, and experiences the employer is looking for. Then, you will seamlessly integrate these into the resume, particularly in the 'SKILLS' and 'EXPERIENCE' sections.

Resume:
{{{resumeText}}}

Job Description:
{{{jobDescriptionText}}}

Instructions:
1.  **Analyze and Extract Keywords:** Carefully read the job description and extract all relevant skills, technologies, and action verbs.
2.  **Skill Matching:** Compare the extracted keywords with the skills already present in the resume. Add skills from the job description that are relevant to the candidate's experience but are missing from their resume.
3.  **Tailor Experience:** Rephrase bullet points in the 'EXPERIENCE' section to reflect the language and priorities of the job description. Use action verbs and keywords from the job description where appropriate.
4.  **Maintain Structure and Tone:** Mirror the structure of the provided resume. The final output should be professional, compelling, and ATS-friendly. Do not invent new experiences, but creatively rephrase existing ones to align with the target role.
5.  **Achieve 90% Match:** The final tailored resume should have a high degree of keyword and skill alignment with the job description.
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
