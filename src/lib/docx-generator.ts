"use server";

import HTMLtoDOCX from 'html-to-docx';

export async function generateDocx(htmlContent: string): Promise<string> {
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
}
