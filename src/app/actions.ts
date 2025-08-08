"use server";

import { extractAndMatch } from "@/ai/flows/extract-and-match";
import { z } from "zod";

const actionSchema = z.object({
  resumeText: z.string().min(1, "Resume text is required."),
  jobDescriptionText: z.string().min(1, "Job description text is required."),
});

export async function generateTailoredResumeAction(
  resumeText: string,
  jobDescriptionText: string
): Promise<string> {
  const validation = actionSchema.safeParse({
    resumeText,
    jobDescriptionText,
  });

  if (!validation.success) {
    throw new Error(validation.error.errors.map((e) => e.message).join(", "));
  }

  try {
    const result = await extractAndMatch({
      resumeText,
      jobDescriptionText,
    });

    if (!result || !result.tailoredResumeText) {
        throw new Error("The AI failed to generate a tailored resume.");
    }

    return result.tailoredResumeText;
  } catch (error) {
    console.error("Error in generateTailoredResumeAction:", error);
    throw new Error("An unexpected error occurred while tailoring the resume.");
  }
}
