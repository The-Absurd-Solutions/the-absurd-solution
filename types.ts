import { LucideIcon } from "lucide-react";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
  quirk: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface Project {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  techStack: string[];
  features?: string[];
  challenges?: string[];
  architectureAscii?: string; // For the paddle app
  links: {
    demo?: string;
    repo?: string;
  };
  images: string[]; // URLs
}