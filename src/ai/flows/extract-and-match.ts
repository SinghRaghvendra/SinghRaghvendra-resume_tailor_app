'use server';

/**
 * @fileOverview Extracts information from a resume and job description, matches skills and experience,
 * and generates a tailored resume and cover letter.
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
  coverLetter: z.string().describe('A tailored cover letter for the job application.'),
});
export type ExtractAndMatchOutput = z.infer<typeof ExtractAndMatchOutputSchema>;

export async function extractAndMatch(input: ExtractAndMatchInput): Promise<ExtractAndMatchOutput> {
  return extractAndMatchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractAndMatchPrompt',
  input: {schema: ExtractAndMatchInputSchema},
  output: {schema: ExtractAndMatchOutputSchema},
  prompt: `You are an expert resume tailor and career coach with deep knowledge of Applicant Tracking Systems (ATS). Your task is to parse the provided resume, tailor it to a specific job description aiming for a 90% match for skills and keywords, generate a compelling cover letter, and return everything as a structured JSON object.

Your primary goal is to strategically incorporate relevant skills and keywords from the job description into the resume and cover letter. You must analyze the job description to identify the most critical skills, qualifications, and experiences.

Resume:
{{{resumeText}}}

Job Description:
{{{jobDescriptionText}}}

Instructions:
1.  **Parse Resume:** Accurately parse the entire input resume into its constituent parts.
2.  **Analyze and Extract Keywords:** Carefully read the job description and extract all relevant skills, technologies, and action verbs.
3.  **Skill Matching & Culling:** Compare extracted keywords with the skills in the resume. Add relevant skills from the job description. **Crucially, include only the top 10 most relevant skills for the job.** Remove any skills, experiences, or certifications from the original resume that do not align with the job description to ensure the final document is highly focused and relevant.
4.  **Tailor Experience:** Rephrase bullet points in the 'experience' section to reflect the language and priorities of the job description. Use strong action verbs and quantify achievements wherever possible. Ensure each bullet point is a separate string in the 'description' array.
5.  **Generate Cover Letter:** Write a professional and compelling cover letter. The cover letter should be tailored to the job description, highlight the candidate's most relevant qualifications from the tailored resume, and express genuine interest in the role and company. The tone should be professional yet personable. The output should be a single string with markdown for formatting (e.g., newlines for paragraphs).
6.  **Rewrite for Impact:** Review and rewrite the entire resume for clarity, impact, and professional tone. The final output must be polished and free of grammatical errors.
7.  **Format Output:** Return the complete, tailored resume and the cover letter as a single JSON object conforming to the specified output schema. Ensure all fields are populated correctly.
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
