import type { ExtractAndMatchOutput } from "@/ai/flows/extract-and-match";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, TrendingUp, Lightbulb, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const AtsInsightsOutput = (props: ExtractAndMatchOutput) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };
  
  const getScoreBgColor = (score: number) => {
    if (score >= 85) return "bg-green-600";
    if (score >= 70) return "bg-yellow-600";
    return "bg-red-600";
  };

  const scoreDifference = props.tailoredAtsScore - props.initialAtsScore;

  return (
    <div className="bg-white text-gray-800 p-8 font-sans text-sm">
      <section className="mb-8">
        <h2 className="text-xl font-bold text-primary mb-3 flex items-center">
            <Lightbulb className="mr-2 h-5 w-5" />
            ATS & Improvement Insights
        </h2>
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <p className="font-semibold">Initial ATS Score</p>
                        <p className={`font-bold text-2xl ${getScoreColor(props.initialAtsScore)}`}>{props.initialAtsScore}%</p>
                    </div>
                    <Progress value={props.initialAtsScore} className="h-2" indicatorClassName={getScoreBgColor(props.initialAtsScore)} />
                </div>
                 <div>
                    <div className="flex justify-between items-center mb-1">
                        <p className="font-semibold">Tailored ATS Score</p>
                        <p className={`font-bold text-2xl ${getScoreColor(props.tailoredAtsScore)}`}>{props.tailoredAtsScore}%</p>
                    </div>
                    <Progress value={props.tailoredAtsScore} className="h-2" indicatorClassName={getScoreBgColor(props.tailoredAtsScore)} />
                </div>
            </div>
            {scoreDifference > 0 && (
                 <div className="flex items-center justify-center text-center bg-green-50 p-3 rounded-lg">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600"/>
                    <p className="text-sm font-semibold text-green-700">Your tailored resume scored {scoreDifference} points higher!</p>
                 </div>
            )}
             <p className="text-xs text-muted-foreground text-center">
                This score estimates how well your resume aligns with the job description keywords.
            </p>

            {props.matchedKeywords?.length > 0 && (
                <div>
                    <h3 className="font-semibold mb-2 mt-4 flex items-center">
                        <BadgeCheck className="mr-2 h-5 w-5 text-primary" />
                        Top Matched Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {props.matchedKeywords.map((keyword) => (
                        <Badge key={keyword} variant="secondary" className="font-normal">{keyword}</Badge>
                        ))}
                    </div>
                </div>
            )}
          
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
