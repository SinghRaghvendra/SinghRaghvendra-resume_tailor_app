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
  modificationPrompt: z.string().optional().describe('Additional instructions from the user to modify the output.'),
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

const PortfolioItemSchema = z.object({
    projectName: z.string().describe("The name or title of the project."),
    description: z.string().describe("A brief description of the project, ideally a single sentence."),
    url: z.string().optional().describe("A URL to the project if available."),
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
  portfolio: z.array(PortfolioItemSchema).describe("A list of up to 3-4 key projects for a portfolio section."),
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
  prompt: `You are an expert resume tailor and career coach with deep knowledge of Applicant Tracking Systems (ATS). Your task is to parse the provided resume, tailor it to a specific job description aiming for a 90% match for skills and keywords, generate a compelling cover letter, and return everything as a structured JSON object. The final resume should be a maximum of 3 pages.

Your primary goal is to strategically incorporate relevant skills and keywords from the job description into the resume and cover letter. You must analyze the job description to identify the most critical skills, qualifications, and experiences.

Resume:
{{{resumeText}}}

Job Description:
{{{jobDescriptionText}}}

Instructions:
1.  **Parse Resume:** Accurately parse the entire input resume into its constituent parts.
2.  **Analyze and Extract Keywords:** Carefully read the job description and extract all relevant skills, technologies, and action verbs.
3.  **Skill Matching & Culling:** Compare extracted keywords with the skills in the resume. Add relevant skills from the job description. **Crucially, include only the top 10 most relevant skills for the job.**
4.  **Tailor Experience:** Review all work experience from the original resume. Rephrase the bullet points for each role to emphasize the aspects most relevant to the job description. Use strong action verbs and quantify achievements wherever possible. The goal is to highlight transferable skills and align the candidate's entire history with the target role, making it short, simple, and informative. Ensure each bullet point is a separate string in the 'description' array. Do not remove any work experience entries.
5.  **Create Portfolio Section:** Identify and extract any projects mentioned in the resume. Format them for a new "Portfolio" section. If no projects are mentioned, you can leave this section empty.
6.  **Generate Cover Letter:** Write a professional and compelling cover letter. The cover letter should be tailored to the job description, highlight the candidate's most relevant qualifications from the tailored resume, and express genuine interest in the role and company. The tone should be professional yet personable. The output should be a single string with markdown for formatting (e.g., newlines for paragraphs).
7.  **Rewrite for Impact:** Review and rewrite the entire resume for clarity, impact, and professional tone. The final output must be polished and free of grammatical errors, making it stand out.
8.  **Format Output:** Return the complete, tailored resume and the cover letter as a single JSON object conforming to the specified output schema. Ensure all fields are populated correctly.

{{#if modificationPrompt}}
**User Modifications:**
In addition to the above, please apply the following modifications based on the user's request:
{{{modificationPrompt}}}
{{/if}}
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
