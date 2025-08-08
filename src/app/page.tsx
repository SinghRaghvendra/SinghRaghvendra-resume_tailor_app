"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Download, Loader2, Sparkles, Wand2, Upload, Lightbulb } from "lucide-react";

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
import { Logo } from "@/components/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import type { ExtractAndMatchOutput } from "@/ai/flows/extract-and-match";
import { ResumeOutput } from "@/components/resume-output";
import { CoverLetterOutput } from "@/components/cover-letter-output";
import { AtsInsightsOutput } from "@/components/ats-insights-output";
import { Separator } from "@/components/ui/separator";


const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ACCEPTED_FILE_TYPES = ["application/pdf"];

const formSchema = z.object({
  resume: z.string().optional(),
  jobDescription: z
    .string()
    .min(50, "Please provide a more detailed job description.")
    .max(10000, "Job description is too long."),
  modificationPrompt: z.string().optional(),
  resumeFile: z
    .any()
    .optional(),
}).refine(data => {
    if (form?.getValues('activeTab') === 'text') {
        return !!data.resume && data.resume.length > 0;
    }
    if (form?.getValues('activeTab') === 'file') {
        return !!data.resumeFile && data.resumeFile.length > 0;
    }
    return false;
}, {
    message: "Please upload a resume or paste it as text.",
    path: ["resume"],
}).refine(data => {
    if (form?.getValues('activeTab') === 'file' && data.resumeFile) {
        for (let i = 0; i < data.resumeFile.length; i++) {
            if (data.resumeFile[i].size > MAX_FILE_SIZE) {
                return false;
            }
        }
    }
    return true;
}, {
    message: `Max file size is 4MB per file.`,
    path: ["resumeFile"],
}).refine(data => {
    if (form?.getValues('activeTab') === 'file' && data.resumeFile) {
         for (let i = 0; i < data.resumeFile.length; i++) {
            if (!ACCEPTED_FILE_TYPES.includes(data.resumeFile[i].type)) {
                return false;
            }
        }
    }
    return true;
}, {
    message: "Only .pdf files are accepted.",
    path: ["resumeFile"],
});

type FormValues = z.infer<typeof formSchema>;
let form: any;

export default function Home() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [generationResult, setGenerationResult] = React.useState<ExtractAndMatchOutput | null>(null);
  const [activeInputTab, setActiveInputTab] = React.useState("file");
  const { toast } = useToast();

  form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resume: "",
      jobDescription: "",
      modificationPrompt: "",
      resumeFile: undefined,
    },
    mode: 'onChange',
  });
  
  React.useEffect(() => {
    form.setValue('activeTab', activeInputTab, { shouldValidate: true });
  }, [activeInputTab]);


  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setGenerationResult(null);
    let resumeText = values.resume;

    try {
      if (activeInputTab === 'file' && values.resumeFile?.[0]) {
        try {
            const formData = new FormData();
            for (let i = 0; i < values.resumeFile.length; i++) {
              formData.append('file', values.resumeFile[i]);
            }
            resumeText = await extractTextFromPdfAction(formData);
        } catch (error) {
          toast({
            variant: "destructive",
            title: "PDF Processing Error",
            description: String(error),
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
      console.error(error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description:
          error instanceof Error ? error.message : "Failed to tailor resume. Please check your inputs and try again.",
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
    return '';
  }

  return (
    <main className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
        <Logo className="h-14 w-14 text-primary" />
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
          Resume Tailor
        </h1>
        <p className="max-w-[800px] text-muted-foreground md:text-xl">
          Instantly tailor your resume and generate a cover letter for any job. Our AI analyzes the job
          description and your experience to highlight your most relevant
          skills.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12">
        <Card className="w-full no-print">
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
                <Tabs value={activeInputTab} onValueChange={setActiveInputTab} className="w-full">
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
                                            {form.watch('resumeFile')?.[0]?.name ? (
                                                <p className="font-semibold text-primary px-2 text-center">{renderFileNames()}</p>
                                            ) : (
                                                <>
                                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                    <p className="text-xs text-muted-foreground">PDFs (MAX. 4MB each)</p>
                                                </>
                                            )}
                                        </div>
                                        <Input id="dropzone-file" type="file" className="hidden" accept="application/pdf" multiple
                                            onChange={(e) => field.onChange(e.target.files)}
                                            ref={field.ref}
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
                           {form.formState.errors.resume && activeInputTab === 'file' && <FormMessage>{form.formState.errors.resume.message}</FormMessage>}
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
            <CardHeader className="flex flex-row items-center justify-between no-print">
              <div className="space-y-1">
                <CardTitle>Your Tailored Documents</CardTitle>
                <CardDescription>
                  Your AI-optimized resume and cover letter.
                </CardDescription>
              </div>
               <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  disabled={!generationResult}
                  >
                  <Download className="h-4 w-4 mr-2" />
                  Download
              </Button>
            </CardHeader>
            <CardContent className="min-h-[500px]">
              {isLoading ? (
                <div className="space-y-4">
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
                <>
                  <div id="printable-area">
                    <ResumeOutput {...generationResult} />
                    <div className="p-8"><Separator /></div>
                    <CoverLetterOutput {...generationResult} />
                  </div>
                  <div className="no-print mt-8">
                    <Separator className="my-6" />
                     <AtsInsightsOutput {...generationResult} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-center p-8 border-2 border-dashed border-border rounded-lg no-print">
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
    </main>
  );
}
