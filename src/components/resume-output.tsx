import type { ExtractAndMatchOutput } from "@/ai/flows/extract-and-match";
import { Mail, Phone, MapPin, Linkedin, Link } from "lucide-react";

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-4 break-inside-avoid">
    <h2 className="text-sm font-bold text-primary tracking-widest uppercase bg-primary/10 p-2 rounded-sm mb-3">{title}</h2>
    <div className="text-sm">{children}</div>
  </section>
);

export const ResumeOutput = (props: ExtractAndMatchOutput) => {
  return (
    <div className="bg-white text-gray-800 p-8 font-sans text-sm">
       <header className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">{props.name}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <a href={`tel:${props.phone}`} className="flex items-center gap-1.5 hover:text-primary"><Phone size={12} />{props.phone}</a>
          <a href={`mailto:${props.email}`} className="flex items-center gap-1.5 hover:text-primary"><Mail size={12} />{props.email}</a>
          <span className="flex items-center gap-1.5"><MapPin size={12} />{props.city}</span>
          <a href={props.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary"><Linkedin size={12} />LinkedIn</a>
        </div>
      </header>

      <main className="space-y-4">
        {props.objective && (
            <Section title="Objective">
              <p className="text-gray-700">{props.objective}</p>
            </Section>
        )}

        {props.skills?.length > 0 && (
            <Section title="Skills">
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-6 gap-y-2">
                {props.skills.map((skill) => (
                <li key={skill} className="flex items-center text-gray-700">
                    <span className="text-primary mr-2">&#9679;</span>
                    {skill}
                </li>
                ))}
            </ul>
            </Section>
        )}

        {props.experience?.length > 0 && (
            <Section title="Experience">
            {props.experience.map((exp, index) => (
                <div key={index} className="mb-4 last:mb-0 break-inside-avoid">
                <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-base text-gray-800">{exp.role}</h3>
                    <span className="text-xs font-medium text-muted-foreground">{exp.period}</span>
                </div>
                <h4 className="font-semibold text-primary mb-1.5">{exp.company}</h4>
                <ul className="list-disc list-outside pl-5 space-y-1 text-gray-700">
                    {exp.description.map((desc, i) => (
                    <li key={i}>{desc}</li>
                    ))}
                </ul>
                </div>
            ))}
            </Section>
        )}

        {props.portfolio?.length > 0 && (
          <Section title="Portfolio">
            {props.portfolio.map((project, index) => (
              <div key={index} className="mb-4 last:mb-0 break-inside-avoid">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-gray-800">{project.projectName}</h3>
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                      <Link size={12} />
                      View Project
                    </a>
                  )}
                </div>
                <p className="text-gray-700">{project.description}</p>
              </div>
            ))}
          </Section>
        )}

        {props.education?.length > 0 && (
            <Section title="Education">
            {props.education.map((edu, index) => (
                <div key={index} className="mb-3 last:mb-0 break-inside-avoid">
                <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-base text-gray-800">{edu.degree}</h3>
                    <span className="text-xs font-medium text-muted-foreground">{edu.year}</span>
                </div>
                <p className="font-semibold">{edu.institution}</p>
                {edu.details && <p className="text-muted-foreground text-xs">{edu.details}</p>}
                </div>
            ))}
            </Section>
        )}

        {props.certifications?.length > 0 && (
            <Section title="Certifications">
            <ul className="list-disc list-outside pl-5 space-y-1 text-gray-700">
                {props.certifications.map((cert) => (
                <li key={cert}>{cert}</li>
                ))}
            </ul>
            </Section>
        )}
        
        {props.hobbies?.length > 0 && (
            <Section title="Hobbies & Key Interests">
            <p className="text-gray-700">
                {props.hobbies.join(' · ')}
            </p>
            </Section>
        )}
      </main>
    </div>
  );
};
