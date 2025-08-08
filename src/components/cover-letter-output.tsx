import type { ExtractAndMatchOutput } from "@/ai/flows/extract-and-match";
import { Mail, Phone, MapPin, Linkedin } from "lucide-react";

export const CoverLetterOutput = (props: ExtractAndMatchOutput) => {
  // Simple markdown to HTML
  const formatCoverLetter = (text: string) => {
    return text
      .split('\n')
      .map((paragraph, index) => (
        <p key={index} className="mb-4 last:mb-0">
          {paragraph}
        </p>
      ));
  };

  return (
    <div className="bg-white text-gray-800 p-8 font-sans text-sm">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{props.name}</h1>
        <div className="flex flex-col space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Mail size={12} />
            <a href={`mailto:${props.email}`} className="hover:text-primary">{props.email}</a>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={12} />
            <a href={`tel:${props.phone}`} className="hover:text-primary">{props.phone}</a>
          </div>
           <div className="flex items-center gap-2">
            <MapPin size={12} />
            <span>{props.city}</span>
          </div>
          <div className="flex items-center gap-2">
            <Linkedin size={12} />
            <a href={props.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary">LinkedIn Profile</a>
          </div>
        </div>
      </header>

      <main className="prose prose-sm max-w-none">
        {formatCoverLetter(props.coverLetter)}
      </main>
    </div>
  );
};
