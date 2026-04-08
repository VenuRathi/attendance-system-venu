import { Code2, Cpu, Linkedin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Developer {
  name: string;
  position: string;
  role: string;
  description: string;
  initials: string;
  linkedin?: string;
}

const DEVELOPERS: Developer[] = [
  {
    name: "Venu Rathi",
    position: "Project Lead",
    role: "Full Stack IoT Developer",
    description:
      "Led the overall development of the RFID-based attendance system, including hardware integration, backend API development, and real-time dashboard design.",
    initials: "VR",
    linkedin: "https://www.linkedin.com/in/venu-rathi/",
  },
  {
    name: "Prachiti Bhambure",
    position: "Team Member",
    role: "UI/UX Support",
    description:
      "Assisted in interface design and contributed to improving user experience.",
    initials: "PB",
    linkedin: "https://www.linkedin.com/in/prachiti-bhambure-513348372/",
  },
  {
    name: "Shravasti Barathe",
    position: "Team Member",
    role: "Testing & Validation",
    description:
      "Helped in testing the system and verifying real-time attendance functionality.",
    initials: "SB",
    linkedin: "https://www.linkedin.com/in/shravasti-barathe-aaa8813b8/",
  },
  {
    name: "Sameera Koshe",
    position: "Team Member",
    role: "Documentation & Presentation Lead",
    description:
      "Contributed to project documentation and assisted in presentation preparation.",
    initials: "SK",
    linkedin: "https://www.linkedin.com/in/sameera-koshe-380101387/",
  },
];

const AVATAR_COLORS = [
  "from-cyan-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-orange-500 to-rose-500",
  "from-emerald-500 to-green-600",
];

export default function AboutUs() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-mono font-bold tracking-wider text-foreground uppercase">
          About Us
        </h1>
        <p className="mt-2 text-muted-foreground">
          The team behind the RFID Attendance System
        </p>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/40 p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/20 border border-primary/40">
          <Cpu className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground font-mono">
            RFID_CTRL — Attendance Management System
          </h2>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            A real-time, RFID-powered attendance tracking platform built for
            educational institutions. Designed to handle multi-lecture sessions,
            live scan feeds, and comprehensive analytics — all in a single
            unified dashboard.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-2">
          <Code2 className="h-3.5 w-3.5" />
          Meet the Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {DEVELOPERS.map((dev, index) => (
            <Card
              key={dev.name}
              className="bg-card/50 border-border/60 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              data-testid={`card-developer-${index}`}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_COLORS[index % AVATAR_COLORS.length]} text-white font-bold font-mono text-base shadow-md`}
                  >
                    {dev.initials}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="font-semibold text-foreground text-base leading-tight">
                      {dev.name}
                    </p>
                    <Badge
                      variant="secondary"
                      className="text-xs font-mono bg-primary/10 text-primary border border-primary/30"
                    >
                      {dev.position}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    {dev.role}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {dev.description}
                  </p>
                </div>

                {dev.linkedin && (
                  <div className="pt-2 border-t border-border/40">
                    <a
                      href={dev.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors font-mono"
                      data-testid={`link-linkedin-${index}`}
                    >
                      <Linkedin className="h-3.5 w-3.5" />
                      View LinkedIn
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border/40 bg-muted/20 p-5 text-center">
        <p className="text-xs text-muted-foreground font-mono">
          RFID_CTRL &mdash; Built with React, TypeScript, Node.js &amp;
          PostgreSQL
        </p>
      </div>
    </div>
  );
}
