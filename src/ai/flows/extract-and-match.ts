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

const ResumeSectionSchema = z.object({
  title: z.string(),
  content: z.string(),
});

const ExperienceItemSchema = z.object({
  role: z.string(),
  company: z.string(),
  period: z.string(),
  description: z.array(z.string()),
});

const EducationItemSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  year: z.string(),
  details: z.string().optional(),
});

const ExtractAndMatchOutputSchema = z.object({
  name: z.string(),
  phone: z.string(),
  email: z.string(),
  city: z.string(),
  linkedin: z.string(),
  objective: z.string(),
  skills: z.array(z.string()),
  experience: z.array(ExperienceItemSchema),
  education: z.array(EducationItemSchema),
  certifications: z.array(z.string()),
  hobbies: z.array(z.string()),
});
export type ExtractAndMatchOutput = z.infer<typeof ExtractAndMatchOutputSchema>;

export async function extractAndMatch(input: ExtractAndMatchInput): Promise<ExtractAndMatchOutput> {
  return extractAndMatchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractAndMatchPrompt',
  input: {schema: ExtractAndMatchInputSchema},
  output: {schema: ExtractAndMatchOutputSchema},
  prompt: `You are an expert resume tailor with deep knowledge of Applicant Tracking Systems (ATS). Your task is to parse the provided resume, tailor it to a specific job description aiming for a 90% match for skills and keywords, and return it as a structured JSON object.

Your primary goal is to strategically incorporate relevant skills and keywords from the job description into the resume. You must analyze the job description to identify the most critical skills, qualifications, and experiences the employer is looking for. Then, you will seamlessly integrate these into the resume, particularly in the 'skills' and 'experience' sections.

Resume:
{{{resumeText}}}

Job Description:
{{{jobDescriptionText}}}

Instructions:
1.  **Parse Resume:** Accurately parse the entire input resume into its constituent parts: name, contact info, objective, skills, experience, education, certifications, and hobbies.
2.  **Analyze and Extract Keywords:** Carefully read the job description and extract all relevant skills, technologies, and action verbs.
3.  **Skill Matching:** Compare the extracted keywords with the skills already present in the resume. Add skills from the job description that are relevant to the candidate's experience but are missing from their resume. Populate the 'skills' array in the output.
4.  **Tailor Experience:** Rephrase bullet points in the 'experience' section to reflect the language and priorities of the job description. Use action verbs and keywords from the job description where appropriate. Each bullet point should be a separate string in the 'description' array for each experience item.
5.  **Maintain Structure and Tone:** Do not invent new experiences. Creatively rephrase existing ones to align with the target role. The final output must be professional and compelling.
6.  **Format Output:** Return the complete, tailored resume as a single JSON object conforming to the specified output schema. Ensure all fields are populated correctly.
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
