
"use client";

import * as React from "react";
import * as ReactDOMServer from 'react-dom/server';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Sparkles, Wand2, Upload, FileDown, Mail, CheckCircle, Lightbulb, ArrowLeft, Bell, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateTailoredResumeAction, extractTextFromPdfAction } from "@/app/actions";
import { SAMPLE_RESUME } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import type { ExtractAndMatchOutput } from "@/ai/flows/extract-and-match";
import { ResumeOutput } from "@/components/resume-output";
import { CoverLetterOutput } from "@/components/cover-letter-output";
import { AtsInsightsOutput } from "@/components/ats-insights-output";


const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ACCEPTED_FILE_TYPES = ["application/pdf"];

const formSchema = z.object({
  resume: z.string().optional(),
  resumeFile: z
    .custom<FileList>()
    .optional(),
  jobDescription: z
    .string()
    .min(50, "Please provide a more detailed job description.")
    .max(10000, "Job description is too long."),
  modificationPrompt: z.string().optional(),
}).refine(data => {
    return (data.resume && data.resume.length > 0) || (!!data.resumeFile && data.resumeFile.length > 0);
}, {
    message: "Please upload a resume or paste it as text.",
    path: ["resumeFile"], // Point error to file input for better UX
}).refine(data => {
    if (data.resumeFile && data.resumeFile.length > 0) {
      const file = data.resumeFile[0];
      return file.size <= MAX_FILE_SIZE;
    }
    return true;
}, {
    message: `Max file size is 4MB.`,
    path: ["resumeFile"],
}).refine(data => {
    if (data.resumeFile && data.resumeFile.length > 0) {
      const file = data.resumeFile[0];
      return ACCEPTED_FILE_TYPES.includes(file.type);
    }
    return true;
}, {
    message: "Only .pdf files are accepted.",
    path: ["resumeFile"],
});

type FormValues = z.infer<typeof formSchema>;
type ActiveDocument = 'resume' | 'cover-letter' | 'insights';

export default function Home() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [generationResult, setGenerationResult] = React.useState<ExtractAndMatchOutput | null>(null);
  const [activeInputTab, setActiveInputTab] = React.useState("file");
  const [activeDocument, setActiveDocument] = React.useState<ActiveDocument>('resume');
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resume: "",
      jobDescription: "",
      modificationPrompt: "",
      resumeFile: undefined,
    },
    mode: 'onChange',
  });
  
  const resumeFileRef = form.register("resumeFile");

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setGenerationResult(null);
    let resumeText = values.resume;

    try {
      if (values.resumeFile?.length) {
        try {
            const formData = new FormData();
            Array.from(values.resumeFile).forEach(file => {
              formData.append('file', file);
            });
            resumeText = await extractTextFromPdfAction(formData);
        } catch (error) {
          toast({
            variant: "destructive",
            title: "PDF Processing Error",
            description: error instanceof Error ? error.message : String(error),
          });
          setIsLoading(false);
          return;
        }
      }

      if (!resumeText) {
          toast({
            variant: "destructive",
            title: "Missing Resume",
            description: "Please provide your resume as text or a PDF file.",
          });
          setIsLoading(false);
          return;
      }

      const result = await generateTailoredResumeAction(
        resumeText,
        values.jobDescription,
        values.modificationPrompt
      );
      setGenerationResult(result);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description:
          error instanceof Error ? `An unexpected error occurred: ${error.message}` : "Failed to tailor resume. Please check your inputs and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleUseSample = () => {
    setActiveInputTab("text");
    form.setValue("resume", SAMPLE_RESUME, { shouldValidate: true });
    form.setValue("resumeFile", undefined, { shouldValidate: true });
    toast({
      title: "Sample resume loaded",
      description: "A sample resume has been added to the form.",
    });
  };

  const renderFileNames = () => {
    const files = form.watch('resumeFile');
    if (files && files.length > 0) {
      return Array.from(files).map((file: File) => file.name).join(', ');
    }
    return 'No file selected';
  }

  const topFeatures = [
    "AI-Powered Resume Tailoring",
    "AI Cover Letter Generation",
    "ATS Score Analysis & Matching",
    "Top Keyword Identification",
    "Actionable Improvement Suggestions",
    "Multi-PDF Resume Merging",
    "PDF Document Export",
    "Accepts both PDF and Text",
    "Modern, Responsive Interface",
  ];

  const keyFeaturesMarketing = [
    { text: "Tailored Resume in Seconds – Upload a job description and instantly get a high-scoring, ATS-optimized version of your resume." },
    { text: "Smart Cover Letter Generator – Generate a professional, personalized cover letter that complements your resume." },
    { text: "Prompt Optimization – Fine-tune your resume with AI-guided prompts for better impact." },
    { text: "Feedback & Improvement – Get instant feedback on weak points and actionable tips to improve." },
    { text: "Top Matching Skills & Keywords – Highlight strengths recruiters care about most." },
    { text: "Boost Your Interview Chances – Increase your chances of getting shortlisted with every application." },
  ];

  return (
    <>
    <div className={`no-print print-container--${activeDocument}`}>
        <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
          <Button variant="outline" size="sm" asChild>
            <a href="https://aicouncel.com/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Home
            </a>
          </Button>
          <p className="text-sm font-semibold text-muted-foreground">Powered by <a href="mailto:support@aicouncel.com" className="text-primary hover:underline">AI Councel</a></p>
        </header>
        
        <main className="container mx-auto px-4 pt-24 pb-12 md:px-6 lg:pt-28 lg:pb-16">

         <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md mb-12 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex-1">
                <h2 className="font-bold flex items-center justify-center md:justify-start">
                    <Bell className="h-5 w-5 mr-2" />
                    Now Live: Margdarshak AI by AI Councel Lab
                </h2>
                <p className="text-sm mt-1">Discover your strengths, unlock a 10-year career roadmap, or instantly tailor your resume for any job application.</p>
            </div>
             <Button asChild size="sm" className="mt-2 md:mt-0 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 shrink-0">
                <a href="https://aicouncel.com/signup" target="_blank" rel="noopener noreferrer">
                    Take Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </a>
            </Button>
        </div>
        
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
            Resume Tailor
            </h1>
            <p className="max-w-[800px] text-muted-foreground md:text-xl">
            Instantly tailor your resume and generate a cover letter for any job. Our AI analyzes the job
            description and your experience to highlight your most relevant
            skills.
            </p>
        </div>

         <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-6">Top Features</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-sm">
              {topFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12">
            <Card className="w-full">
            <CardHeader>
                <CardTitle>Your Details</CardTitle>
                <CardDescription>
                Provide your resume and the job description below.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                >
                    <Tabs value={activeInputTab} onValueChange={(tab) => {
                      setActiveInputTab(tab)
                      if (tab === 'text') {
                        form.setValue('resumeFile', undefined, { shouldValidate: true });
                      } else {
                        form.setValue('resume', '', { shouldValidate: true });
                      }
                    }} className="w-full">
                    <div className="flex justify-between items-center mb-2">
                        <FormLabel>Your Resume</FormLabel>
                        <TabsList className="grid w-full max-w-[220px] grid-cols-2 h-9">
                        <TabsTrigger value="file">PDF</TabsTrigger>
                        <TabsTrigger value="text">Text</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="file">
                        <FormField
                            control={form.control}
                            name="resumeFile"
                            render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                <div className="flex items-center justify-center w-full">
                                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-border border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                                <p className="font-semibold text-primary px-2 text-center">{renderFileNames()}</p>
                                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                <p className="text-xs text-muted-foreground">PDF (MAX. 4MB)</p>
                                            </div>
                                            <Input id="dropzone-file" type="file" className="hidden" accept="application/pdf"
                                                {...resumeFileRef}
                                                onChange={(e) => {
                                                    field.onChange(e.target.files)
                                                }}
                                            />
                                        </label>
                                </div> 
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </TabsContent>
                    <TabsContent value="text">
                        <FormField
                        control={form.control}
                        name="resume"
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <Textarea
                                placeholder="Paste your resume here..."
                                className="min-h-[250px] resize-y"
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                             {form.formState.errors.resume && <FormMessage>{form.formState.errors.resume.message}</FormMessage>}
                            </FormItem>
                        )}
                        />
                        <Button type="button" variant="link" size="sm" className="p-0 h-auto mt-2" onClick={handleUseSample}>Try with an example</Button>
                    </TabsContent>
                    </Tabs>

                    <FormField
                    control={form.control}
                    name="jobDescription"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Paste the job description here..."
                            className="min-h-[200px] resize-y"
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="modificationPrompt"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Additional Instructions (Optional)</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="e.g., 'Make my resume more formal', 'Emphasize my leadership skills'"
                            className="min-h-[100px] resize-y"
                            {...field}
                            />
                        </FormControl>
                        <FormDescription>
                            Provide any specific instructions to customize your documents.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Tailor Documents
                    </Button>
                </form>
                </Form>
            </CardContent>
            </Card>

            <div className="mt-8 lg:mt-0">
            <Card className="sticky top-8">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1">
                    <CardTitle>Your Tailored Documents</CardTitle>
                    <CardDescription>
                        Your AI-optimized resume and cover letter.
                    </CardDescription>
                    </div>
                     <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrint}
                            disabled={!generationResult || isLoading}
                            >
                            <FileDown className="h-4 w-4 mr-2" />
                            PDF
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="min-h-[500px]">
                {isLoading ? (
                    <div className="space-y-4 pt-6">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="space-y-2 pt-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                    <div className="space-y-2 pt-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/6" />
                    </div>
                    <div className="space-y-2 pt-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/6" />
                    </div>
                    </div>
                ) : generationResult ? (
                     <Tabs defaultValue="resume" onValueChange={(value) => setActiveDocument(value as ActiveDocument)} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="resume">Resume</TabsTrigger>
                            <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
                            <TabsTrigger value="insights">ATS Insights</TabsTrigger>
                        </TabsList>
                        <TabsContent value="resume" className="pt-6">
                            <ResumeOutput {...generationResult} />
                        </TabsContent>
                         <TabsContent value="cover-letter" className="pt-6">
                            <CoverLetterOutput {...generationResult} />
                        </TabsContent>
                        <TabsContent value="insights">
                            <AtsInsightsOutput {...generationResult} />
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center p-8 border-2 border-dashed border-border rounded-lg mt-6">
                    <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground">
                        Ready to stand out?
                    </h3>
                    <p className="text-muted-foreground">
                        Fill in the form to get your professionally tailored
                        documents.
                    </p>
                    </div>
                )}
                </CardContent>
            </Card>
            </div>
        </div>

        <section className="mt-24 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Why Resume Tailor?</h2>
          <p className="mt-4 max-w-3xl mx-auto text-muted-foreground">
            In today’s world of endless job listings and complex job descriptions, sending the same generic resume is a shortcut to rejection. Applicant Tracking Systems (ATS) demand precision. That’s where we come in.
          </p>

          <div className="mt-12 max-w-4xl mx-auto text-left space-y-12">
            <div className="bg-muted/30 p-8 rounded-lg">
                <h3 className="text-xl font-semibold flex items-center"><Sparkles className="h-6 w-6 mr-3 text-primary" />Our Unique Value Proposition</h3>
                <p className="mt-3 text-muted-foreground">
                    Instantly transform your resume into a job-winning application. Our AI doesn’t just format—it understands the job description, matches it with your experience, and crafts a tailored resume + cover letter designed to beat ATS filters and impress recruiters.
                </p>
            </div>
             <div className="bg-muted/30 p-8 rounded-lg">
                 <h3 className="text-xl font-semibold flex items-center"><Wand2 className="h-6 w-6 mr-3 text-primary" />Key Features</h3>
                 <ul className="mt-4 space-y-3">
                    {keyFeaturesMarketing.map((feature, index) => (
                         <li key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 mr-3 mt-1 text-green-500 flex-shrink-0" />
                            <span className="text-muted-foreground">{feature.text}</span>
                        </li>
                    ))}
                 </ul>
            </div>
          </div>
        </section>

        </main>
        <footer className="bg-muted/50 mt-16 py-8">
          <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">About Us</h3>
              <p className="text-sm text-muted-foreground mb-4">
                AI Councel Lab is an innovation-driven AI company that builds next-generation artificial intelligence solutions for individuals and businesses. We specialize in practical and impactful tools powered by advanced AI research and design to deliver measurable value.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4" />
                <a href="mailto:support@aicouncel.com" className="text-primary hover:underline">Contact us: support@aicouncel.com</a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Our Vision</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our vision is to help people discover their true potential and secure the best opportunities to grow and succeed with confidence. We create AI products that make careers smarter and opportunities more accessible. Margdarshak AI serves as an intelligent career and learning guide, while the Resume Tailor App builds personalized job-ready resumes. At AI Councel Lab we focus on usability scalability and real impact, shaping the future of work and life with powerful AI solutions.
              </p>
            </div>
          </div>
          <div className="text-center text-xs text-muted-foreground mt-8">
            &copy; {new Date().getFullYear()} AI Councel Lab. All Rights Reserved.
          </div>
        </footer>
    </div>
    {generationResult && (
      <div id="printable-area">
        <div className="only-print only-print--resume">
            <ResumeOutput {...generationResult} />
        </div>
        <div className="only-print only-print--cover-letter page-break">
            <CoverLetterOutput {...generationResult} />
        </div>
      </div>
    )}
    </>
  );
}
