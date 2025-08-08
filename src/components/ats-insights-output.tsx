import type { ExtractAndMatchOutput } from "@/ai/flows/extract-and-match";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

export const AtsInsightsOutput = (props: ExtractAndMatchOutput) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white text-gray-800 p-8 font-sans text-sm">
      <section className="mb-8">
        <h2 className="text-xl font-bold text-primary mb-3 flex items-center">
            <Lightbulb className="mr-2 h-5 w-5" />
            ATS & Improvement Insights
        </h2>
        <div className="space-y-4">
            <div>
                <div className="flex justify-between items-center mb-1">
                    <p className="font-semibold">ATS Match Score</p>
                    <p className={`font-bold text-2xl ${getScoreColor(props.atsScore)}`}>{props.atsScore}%</p>
                </div>
                <Progress value={props.atsScore} className="h-2" />
                 <p className="text-xs text-muted-foreground mt-1">
                    This score estimates how well your resume aligns with the job description keywords.
                </p>
            </div>
          
            <div>
                 <h3 className="font-semibold mb-2 mt-4">Improvement Suggestions:</h3>
                 <ul className="space-y-2">
                    {props.improvementSuggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start">
                            <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                            <span>{suggestion}</span>
                        </li>
                    ))}
                 </ul>
            </div>
        </div>
      </section>
    </div>
  );
};
