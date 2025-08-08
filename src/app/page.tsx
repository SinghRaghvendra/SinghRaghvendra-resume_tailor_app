"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Download, Loader2, Sparkles, Wand2 } from "lucide-react";

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
import { generateTailoredResumeAction } from "@/app/actions";
import { SAMPLE_RESUME } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/icons";

const formSchema = z.object({
  resume: z
    .string()
    .min(100, "Please provide a more detailed resume.")
    .max(15000, "Resume is too long."),
  jobDescription: z
    .string()
    .min(50, "Please provide a more detailed job description.")
    .max(10000, "Job description is too long."),
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [tailoredResume, setTailoredResume] = React.useState("");
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resume: "",
      jobDescription: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setTailoredResume("");
    try {
      const result = await generateTailoredResumeAction(
        values.resume,
        values.jobDescription
      );
      setTailoredResume(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description:
          "Failed to tailor resume. Please check your inputs and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };
  
  const handleUseSample = () => {
    form.setValue('resume', SAMPLE_RESUME);
    toast({
        title: "Sample resume loaded",
        description: "A sample resume has been added to the form.",
    });
  }

  return (
    <main className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
        <Logo className="h-14 w-14 text-primary" />
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
          Resume Tailor
        </h1>
        <p className="max-w-[800px] text-muted-foreground md:text-xl">
          Instantly tailor your resume for any job. Our AI analyzes the job description and your experience to highlight your most relevant skills.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Your Details</CardTitle>
            <CardDescription>
              Paste your resume and the job description below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="resume"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel>Your Resume</FormLabel>
                        <Button type="button" variant="link" size="sm" className="p-0 h-auto" onClick={handleUseSample}>Try with an example</Button>
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Paste your resume here..."
                          className="min-h-[250px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Tailor Resume
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-8 lg:mt-0">
          <Card className="sticky top-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Tailored Resume</CardTitle>
                <CardDescription>
                  Your AI-optimized resume will appear here.
                </CardDescription>
              </div>
              {tailoredResume && !isLoading && (
                <Button variant="outline" size="icon" onClick={handlePrint} className="no-print">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download PDF</span>
                </Button>
              )}
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
              ) : tailoredResume ? (
                <div id="resume-output" className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-sans text-sm">
                  {tailoredResume}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-center p-8 border-2 border-dashed border-border rounded-lg">
                  <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground">Ready to stand out?</h3>
                  <p className="text-muted-foreground">
                    Fill in the form to get your professionally tailored resume.
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