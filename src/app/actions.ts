"use server";

import { extractAndMatch, ExtractAndMatchOutput } from "@/ai/flows/extract-and-match";
import { z } from "zod";
import pdf from "pdf-parse/lib/pdf-parse";

const actionSchema = z.object({
  resumeText: z.string().min(1, "Resume text is required."),
  jobDescriptionText: z.string().min(1, "Job description text is required."),
  modificationPrompt: z.string().optional(),
});

export async function generateTailoredResumeAction(
  resumeText: string,
  jobDescriptionText: string,
  modificationPrompt?: string,
): Promise<ExtractAndMatchOutput> {
  const validation = actionSchema.safeParse({
    resumeText,
    jobDescriptionText,
    modificationPrompt,
  });

  if (!validation.success) {
    throw new Error(validation.error.errors.map((e) => e.message).join(", "));
  }

  try {
    const result = await extractAndMatch({
      resumeText,
      jobDescriptionText,
      modificationPrompt,
    });

    if (!result) {
        throw new Error("The AI failed to generate a tailored resume.");
    }

    return result;
  } catch (error) {
    console.error("Error in generateTailoredResumeAction:", error);
    if (error instanceof Error) {
        throw new Error(`An unexpected error occurred: ${error.message}`);
    }
    throw new Error("An unexpected error occurred while tailoring the resume.");
  }
}

export async function extractTextFromPdfAction(formData: FormData): Promise<string> {
    const file = formData.get('file') as File;
    if (!file) {
        throw new Error('No file uploaded.');
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const data = await pdf(buffer);
        return data.text;
    } catch (error) {
        console.error("Failed to parse PDF", error);
        throw new Error("Failed to extract text from PDF.");
    }
}
