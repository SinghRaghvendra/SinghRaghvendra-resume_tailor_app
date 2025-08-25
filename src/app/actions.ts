"use server";

import { extractAndMatch, ExtractAndMatchOutput } from "@/ai/flows/extract-and-match";
import { z } from "zod";
import pdf from "pdf-parse/lib/pdf-parse";
import HTMLtoDOCX from 'html-to-docx';

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
    const files = formData.getAll('file') as File[];
    if (!files || files.length === 0) {
        throw new Error('No files uploaded.');
    }

    try {
        let combinedText = '';
        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const data = await pdf(buffer);
            combinedText += data.text + '\n\n';
        }
        return combinedText.trim();
    } catch (error) {
        console.error("Failed to parse PDF", error);
        throw new Error("Failed to extract text from one or more PDFs.");
    }
}


export async function generateDocxAction(htmlContent: string): Promise<string> {
  if (!htmlContent) {
    throw new Error("HTML content is required.");
  }
  
  try {
    const styledHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <style>
              body {
                  font-family: Arial, sans-serif;
                  font-size: 10pt;
                  line-height: 1.15;
                  color: #000;
              }
              h1, h2, h3, h4 {
                  color: #000;
              }
              a {
                color: #0000EE;
                text-decoration: underline;
              }
              .page-break {
                  page-break-before: always;
              }
          </style>
      </head>
      <body>
          ${htmlContent}
      </body>
      </html>
    `;

    const fileBuffer = await HTMLtoDOCX(styledHtml, undefined, {
        table: { row: { cantSplit: true } },
        footer: true,
        pageNumber: true,
    });

    return (fileBuffer as Buffer).toString('base64');
  } catch (error) {
    console.error("Error generating DOCX file:", error);
    throw new Error("Failed to generate Word document.");
  }
}
