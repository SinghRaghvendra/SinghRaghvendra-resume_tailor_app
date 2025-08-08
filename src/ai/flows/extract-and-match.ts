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
    .describe('The text content of the resume, potentially merged from multiple uploaded PDF files.'),
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
  initialAtsScore: z.number().describe('An estimated ATS match score percentage for the original resume.'),
  tailoredAtsScore: z.number().describe('An estimated ATS match score percentage for the tailored resume.'),
  matchedKeywords: z.array(z.string()).describe('A list of the top keywords found in both the resume and job description.'),
  improvementSuggestions: z.array(z.string()).describe('A list of actionable suggestions to improve the resume and cover letter.'),
});
export type ExtractAndMatchOutput = z.infer<typeof ExtractAndMatchOutputSchema>;

export async function extractAndMatch(input: ExtractAndMatchInput): Promise<ExtractAndMatchOutput> {
  return extractAndMatchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractAndMatchPrompt',
  input: {schema: ExtractAndMatchInputSchema},
  output: {schema: ExtractAndMatchOutputSchema},
  prompt: `You are an expert-level resume creator and career coach, specializing in crafting resumes that not only pass through Applicant Tracking Systems (ATS) but also capture the attention of human recruiters. Your task is to meticulously analyze the provided resume (which may be a combination of multiple documents) and the job description, then generate a suite of optimized application materials.

Your primary goal is to make the candidate stand out. You must deeply analyze the job description to identify the most critical skills, qualifications, experiences, and even the underlying company culture. Then, strategically weave these elements throughout the resume and cover letter, ensuring every word serves a purpose.

Resume (merged from one or more documents):
{{{resumeText}}}

Job Description:
{{{jobDescriptionText}}}

Instructions:
1.  **Initial Analysis:** First, analyze the original resume and the job description.
    a.  Calculate an initial ATS score based on how well the original resume matches the job description.
    b.  Identify and list the top keywords that are common to both the original resume and the job description.
2.  **Parse Resume:** Accurately parse the entire input resume into its constituent parts. Treat the provided resume text as a single, consolidated document.
3.  **Deep Job Description Analysis:** Identify the most important keywords, required skills (hard and soft), key responsibilities, and qualifications from the job description. Go beyond surface-level matching.
4.  **Skill Matching & Culling:** Compare the job's required skills with the candidate's skills. Add relevant skills from the job description that the candidate likely possesses but hasn't listed. **Crucially, include only the top 10 most relevant skills for the job to ensure focus.**
5.  **Tailor Experience for Impact:** Review all work experience from the original resume. **Do not remove any work experience entries.** For each role, rephrase the bullet points to directly address the requirements of the job description. Use powerful action verbs and quantify achievements with metrics wherever possible (e.g., "Increased sales by 15%" or "Reduced processing time by 25%"). The goal is to highlight transferable skills and align the candidate's entire history with the target role, making it short, simple, informative, and compelling. Ensure each bullet point is a separate string in the 'description' array.
6.  **Create Portfolio Section:** Identify and extract any projects mentioned in the resume. Format them for a new "Portfolio" section to showcase practical experience. If no projects are mentioned, leave this section empty.
7.  **Generate a Standout Cover Letter:** Write a professional, concise, and compelling cover letter. It must be tailored to the job description and company. It should highlight the candidate's most relevant qualifications from the tailored resume and express genuine, well-researched interest in the role and company. The output should be a single string with markdown for formatting (e.g., newlines for paragraphs).
8.  **Rewrite for Excellence:** Review and rewrite the entire resume for clarity, impact, and a professional tone. The final output must be polished, free of grammatical errors, and formatted to be easily readable by both ATS and humans. The final resume should not exceed a maximum of 3 pages.
9.  **Final ATS Score & Actionable Suggestions:** Calculate a new, improved ATS match score for the tailored resume. Provide a list of specific, actionable suggestions for what the user could do to further improve their resume and cover letter to increase their chances of getting an interview.
10. **Format Output:** Return the complete, tailored resume, the cover letter, initial and tailored ATS scores, matched keywords, and suggestions as a single JSON object conforming to the specified output schema. Ensure all fields are populated correctly.

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
