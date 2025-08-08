"use client";

import * as React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import './print.css';
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  React.useEffect(() => {
    const beforePrint = () => {
      const resumeTab = document.querySelector('[data-state="active"][value="resume"]');
      const coverLetterTab = document.querySelector('[data-state="active"][value="cover-letter"]');
      
      document.body.classList.remove('print-resume', 'print-cover-letter');

      if (resumeTab) {
        document.body.classList.add('print-resume');
      } else if (coverLetterTab) {
        document.body.classList.add('print-cover-letter');
      }
    };

    window.addEventListener('beforeprint', beforePrint);

    return () => {
      window.removeEventListener('beforeprint', beforePrint);
    };
  }, []);

  return (
    <html lang="en">
      <head>
        <title>Resume Tailor</title>
        <meta name="description" content="Tailor your resume for any job with AI" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
