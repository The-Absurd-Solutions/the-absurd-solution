import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlitchText } from './GlitchText';
import { Project } from '../types';
import { ExternalLink, Github, X, Code, Layers, Cpu, Fingerprint, ArrowRight } from 'lucide-react';

const projects: Project[] = [
    {
        id: 'auction-ai',
        title: "AI Auctioneer's Eye",
        shortDescription: "Turning chaotic Italian auction PDF catalogs into structured data using Gemini AI.",
        longDescription: "A sophisticated document processing system designed to handle the visual and textual chaos of art auction catalogs. From extracting lot numbers hidden in full-page oil paintings to parsing dense, unstructured Italian text, this system creates order from entropy.",
        techStack: ["Python", "PyMuPDF", "Gemini API", "AWS Fargate", "S3"],
        challenges: [
            "Extracting lot numbers from scanned full-page artwork images.",
            "Prompt engineering for handling skewed text and complex layout associations.",
            "Cost optimization for processing ~20,000 documents."
        ],
        links: {
            demo: "#"
        },
        images: []
    },
    {
        id: 'ona-tools',
        title: "Corporate Web Spinner (ONA)",
        shortDescription: "Visualizing the invisible threads of organizational hierarchy and influence.",
        longDescription: "An interactive platform for Organizational Network Analysis. It renders the hidden social graph of a company, calculating who really holds the power (centrality) and who bridges the gaps (brokerage).",
        techStack: ["React", "D3.js", "SVG", "Node.js"],
        features: [
            "Interactive network graph visualization.",
            "Calculation of Gould-Fernandez brokerage roles.",
            "Advanced metrics: Centrality, Betweenness, Eigenvector.",
            "Custom color legend components."
        ],
        links: {
            demo: "#"
        },
        images: ["/images/ona-1.png", "/images/ona-2.png"]
    },
    {
        id: 'paddle-camp',
        title: "Serverless Paddle Court",
        shortDescription: "Full-stack booking platform built on AWS complexity.",
        longDescription: "A robust booking system for paddle tennis camps that refuses to crash. Built entirely on serverless architecture to handle spikes in demand without blinking.",
        techStack: ["React 19", "Vite", "AWS Lambda", "DynamoDB", "AWS CDK", "Stripe", "Cognito"],
        features: [
            "Real-time availability & booking.",
            "Stripe payment intents integration.",
            "Isolated DEV/PROD environments via CDK.",
            "Zero-downtime deployments."
        ],
        architectureAscii: `
  ┌─────────────────────────────────────────────────────────┐                             
  │                      Frontend                           │                             
  │              React + Vite + TailwindCSS                 │                              
  │                   (AWS Amplify)                         │                             
  └─────────────────────┬───────────────────────────────────┘                             
                        │                                                                 
                        ▼                                                                 
  ┌─────────────────────────────────────────────────────────┐                             
  │                   API Gateway                           │                             
  │              REST API + Cognito Auth                    │                             
  └─────────────────────┬───────────────────────────────────┘                             
                        │                                                                 
            ┌───────────┼───────────┐                                                     
            ▼           ▼           ▼                                                     
      ┌──────────┐ ┌──────────┐ ┌──────────┐                                              
      │  Camps   │ │ Bookings │ │ Payments │                                              
      │ Lambdas  │ │ Lambdas  │ │ Lambdas  │                                              
      └────┬─────┘ └────┬─────┘ └────┬─────┘                                              
           │            │            │                                                    
           ▼            ▼            ▼                                                    
      ┌─────────────────────┐  ┌──────────┐                                               
      │     DynamoDB        │  │  Stripe  │                                               
      │  (Single Table)     │  │   API    │                                               
      └─────────────────────┘  └──────────┘  
    `,
        links: {
            demo: "https://develop.xxx.amplifyapp.com",
            repo: "https://github.com/The-Absurd-Solutions/three-state-paddel"
        },
        images: ["/images/paddle-1.png", "/images/paddel-2.png"]
    },
    {
        id: 'lex-ai',
        title: "LexExpert (AI Legal Mind)",
        shortDescription: "Grounded AI legal assistant with citation tracking and document highlighting.",
        longDescription: "A legal assistant chat platform designed to help lawyers navigate complex legal content. Users ask questions and receive AI-generated answers enriched with direct references to legal documents. The system emphasizes traceability: returned sources are visually highlighted in the original document to validate the AI's claims.",
        techStack: ["React", "AWS Serverless", "DynamoDB", "Cognito", "Vector Search"],
        features: [
            "Chat-based Q&A with grounded AI responses.",
            "Source referencing with visual highlighting.",
            "Document preview and open-from-chat workflow.",
            "Voice interaction support (Mobile)."
        ],
        challenges: [
            "Implementing RBAC (Role-Based Access Control) for admin/editor/viewer roles.",
            "Ensuring Observability with correlation IDs across Chat → Retrieval → Response.",
            "Managing strict data privacy/redaction for sensitive legal inputs."
        ],
        architectureAscii: `
  ┌─────────────┐      ┌──────────────┐
  │   User UI   │◄────►│  API Gateway │
  └──────┬──────┘      └──────┬───────┘
         │                    │
         ▼                    ▼
  ┌─────────────┐      ┌──────────────┐
  │    Auth     │      │ Orchestrator │
  │  (Cognito)  │      │   (Lambda)   │
  └─────────────┘      └──────┬───────┘
                              │
           ┌──────────────────┼──────────────────┐
           ▼                  ▼                  ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │  Vector DB  │    │  Legal LLM  │    │  Doc Store  │
    │ (Knowledge) │    │ (Inference) │    │    (S3)     │
    └─────────────┘    └─────────────┘    └─────────────┘
    `,
        links: {
            demo: "#"
        },
        images: []
    },
    {
        id: 'survey-etl',
        title: "Survey ETL & Analytics",
        shortDescription: "End-to-end survey ingestion, ETL transformation, and graph analytics via GraphQL.",
        longDescription: "A massive data ingestion platform that automates the lifecycle of survey data. It ingests raw files, runs them through a complex ETL pipeline to normalize data into PostgreSQL/Graph models, and exposes insights via a high-performance GraphQL API. It also orchestrates an AI workflow for dataset preparation and fine-tuning.",
        techStack: ["AWS Lambda", "AppSync GraphQL", "PostgreSQL (RDS)", "DynamoDB", "AWS CDK"],
        features: [
            "ETL pipeline converting JSON surveys into Relational/Graph models.",
            "GraphQL API with optimized Lambda resolvers.",
            "Analytics dashboard with narrative widgets.",
            "Automated AI training workflow (Dataset builder -> Fine-tune)."
        ],
        challenges: [
            "Multi-tenancy strategy involving tenant isolation and RLS.",
            "Data quality contracts with Dead Letter Queue strategies.",
            "Performance optimization via per-tenant caching and query budgeting."
        ],
        architectureAscii: `
  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
  │ Raw Surveys │───►│ Ingestion   │───►│     ETL     │
  │   (JSON)    │    │  (Lambda)   │    │  Pipeline   │
  └─────────────┘    └─────────────┘    └──────┬──────┘
                                               │
                                               ▼
  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
  │  Analytics  │◄───│   AppSync   │◄───│  Postgres   │
  │  Dashboard  │    │   GraphQL   │    │ (Relational)│
  └─────────────┘    └─────────────┘    └─────────────┘
                            ▲
                            │
                     ┌─────────────┐
                     │ AI Workflow │
                     │ (Fine-tune) │
                     └─────────────┘
    `,
        links: {
            demo: "#"
        },
        images: ["/images/survey-1.png"]
    }
];

export const Portfolio: React.FC = () => {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    return (
        <section id="work" className="min-h-screen py-32 px-4 bg-white relative overflow-hidden">

            {/* Background Static/Grain */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg className="w-full h-full">
                    <filter id="bw_noise">
                        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
                        <feColorMatrix type="saturate" values="0" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#bw_noise)" />
                </svg>
            </div>

            <div className="max-w-7xl mx-auto relative z-10 px-4">
                <div className="mb-32 text-center md:text-left border-b-4 border-black pb-8">
                    <h2 className="text-6xl md:text-9xl text-black tracking-tighter uppercase leading-none">
                        <GlitchText text="EVIDENCE" />
                    </h2>
                    <div className="flex justify-between items-end mt-4">
                        <p className="font-mono text-xs md:text-sm tracking-[0.3em] uppercase opacity-60 hidden md:block">
                    // DECLASSIFIED ARCHIVES // LEVEL 4 CLEARANCE
                        </p>
                        <div className="bg-black text-white px-2 py-1 font-bold font-mono text-xs uppercase">
                            Total Files: {projects.length}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-32">
                    {projects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            layoutId={`project-container-${project.id}`}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className={`flex flex-col md:flex-row gap-12 md:gap-24 items-center group cursor-pointer ${index % 2 === 1 ? 'md:flex-row-reverse' : ''
                                }`}
                            onClick={() => setSelectedProject(project)}
                        >
                            {/* Image Area - Rough Cut Style */}
                            <div className="w-full md:w-7/12 relative">
                                {/* Black Backdrop for depth */}
                                <div
                                    className="absolute inset-0 bg-black/90 transition-transform duration-500 group-hover:translate-x-3 group-hover:translate-y-3"
                                    style={{
                                        clipPath: index % 2 === 0
                                            ? "polygon(2% 2%, 98% 0, 100% 98%, 0 95%)"
                                            : "polygon(0 0, 100% 5%, 95% 100%, 5% 95%)"
                                    }}
                                ></div>

                                <motion.div
                                    layoutId={`image-${project.id}`}
                                    className="relative h-64 md:h-96 w-full overflow-hidden grayscale contrast-125 brightness-90 group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-500"
                                    style={{
                                        clipPath: index % 2 === 0
                                            ? "polygon(2% 2%, 98% 0, 100% 98%, 0 95%)"
                                            : "polygon(0 0, 100% 5%, 95% 100%, 5% 95%)"
                                    }}
                                >
                                    <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover" />
                                    {/* Noise Overlay */}
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dust.png')] opacity-40 mix-blend-overlay"></div>
                                </motion.div>

                                {/* Stamped ID */}
                                <div className="absolute -top-6 -left-6 z-20 hidden md:block">
                                    <div className="border-2 border-black bg-white px-3 py-1 font-mono text-sm font-bold shadow-[4px_4px_0px_rgba(0,0,0,1)] -rotate-3">
                                        CASE #{project.id.toUpperCase().substring(0, 4)}
                                    </div>
                                </div>
                            </div>

                            {/* Text Area */}
                            <div className="w-full md:w-5/12 relative">
                                <motion.h3
                                    layoutId={`title-${project.id}`}
                                    className="text-4xl md:text-6xl font-black font-sans uppercase leading-[0.9] mb-6 text-black group-hover:underline decoration-4 underline-offset-4"
                                >
                                    {project.title}
                                </motion.h3>

                                <motion.p className="text-xl font-serif text-gray-900 leading-relaxed mb-8 border-l-2 border-black pl-4">
                                    {project.shortDescription}
                                </motion.p>

                                <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm uppercase text-gray-500 mb-8">
                                    {project.techStack.slice(0, 4).map((tech, i) => (
                                        <span key={i} className="relative">
                                            {tech}
                                            {i < 3 && <span className="ml-6 absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-black rounded-full opacity-20"></span>}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center gap-2 font-bold text-black uppercase tracking-widest text-sm group-hover:translate-x-2 transition-transform">
                                    Open Case File <ArrowRight size={16} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Detailed Modal - Monochrome Noir Style */}
            <AnimatePresence>
                {selectedProject && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Backdrop */}
                        <motion.div
                            className="absolute inset-0 bg-white/90 backdrop-blur-sm grayscale"
                            onClick={() => setSelectedProject(null)}
                        />

                        {/* Modal Content - Styled like a Top Secret Document */}
                        <motion.div
                            layoutId={`project-container-${selectedProject.id}`}
                            className="bg-white w-full max-w-6xl h-full md:max-h-[90vh] overflow-y-auto relative shadow-2xl flex flex-col md:flex-row border-4 border-black"
                        >
                            <button
                                onClick={() => setSelectedProject(null)}
                                className="absolute top-28 md:top-6 right-4 md:right-6 z-50 p-3 bg-black text-white hover:bg-gray-800 transition-colors rounded-full"
                            >
                                <X size={28} />
                            </button>

                            {/* Left Side: Visual Evidence */}
                            <div className="w-full md:w-5/12 bg-gray-100 flex flex-col border-b-4 md:border-b-0 md:border-r-4 border-black relative">
                                <div className="absolute top-4 left-4 z-20 bg-black text-white px-2 py-1 text-xs font-mono uppercase">
                                    Exhibit A
                                </div>
                                <motion.div layoutId={`image-${selectedProject.id}`} className="relative flex-grow h-64 md:h-auto overflow-hidden">
                                    <img
                                        src={selectedProject.images[0]}
                                        alt={selectedProject.title}
                                        className="w-full h-full object-cover grayscale contrast-110"
                                    />
                                    {/* Scanlines */}
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
                                </motion.div>

                                {selectedProject.architectureAscii && (
                                    <div className="bg-black text-white p-6 font-mono text-[10px] md:text-xs overflow-x-auto border-t-4 border-black">
                                        <div className="uppercase text-gray-400 mb-2 border-b border-gray-700 pb-2">// BLUEPRINT_DUMP.TXT</div>
                                        <pre className="whitespace-pre">{selectedProject.architectureAscii}</pre>
                                    </div>
                                )}
                            </div>

                            {/* Right Side: The Dossier */}
                            <div className="w-full md:w-7/12 p-8 md:p-16 text-left relative bg-white">
                                {/* Stamp */}
                                <div className="absolute top-10 right-20 border-4 border-black text-black px-4 py-2 transform -rotate-12 opacity-20 pointer-events-none">
                                    <span className="text-4xl font-black uppercase tracking-tighter">CONFIDENTIAL</span>
                                </div>

                                <div className="mb-2 font-mono text-xs uppercase text-gray-500">
                                    CASE ID: {selectedProject.id}
                                </div>

                                <motion.h2 layoutId={`title-${selectedProject.id}`} className="text-5xl md:text-7xl font-black mb-12 uppercase tracking-tighter text-black leading-[0.85]">
                                    {selectedProject.title}
                                </motion.h2>

                                <p className="text-xl md:text-2xl leading-relaxed mb-12 font-serif text-black">
                                    {selectedProject.longDescription}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                                    {selectedProject.challenges && (
                                        <div>
                                            <h4 className="font-bold uppercase mb-4 text-sm tracking-widest border-b-2 border-black pb-2 inline-block">
                                                Problem Space
                                            </h4>
                                            <ul className="list-none space-y-3 font-mono text-sm text-black">
                                                {selectedProject.challenges.map((c, i) => (
                                                    <li key={i} className="flex gap-3 items-start">
                                                        <span className="text-black font-bold text-lg leading-none">×</span> {c}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {selectedProject.features && (
                                        <div>
                                            <h4 className="font-bold uppercase mb-4 text-sm tracking-widest border-b-2 border-black pb-2 inline-block">
                                                Solution Vector
                                            </h4>
                                            <ul className="list-none space-y-3 font-mono text-sm text-black">
                                                {selectedProject.features.map((f, i) => (
                                                    <li key={i} className="flex gap-3 items-start">
                                                        <span className="text-black font-bold text-lg leading-none">✓</span> {f}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <div className="mb-12">
                                    <h4 className="font-bold uppercase mb-4 text-sm tracking-widest">
                                        Technical Components
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProject.techStack.map(tech => (
                                            <span key={tech} className="border border-black px-3 py-1 text-sm font-bold bg-white text-black hover:bg-black hover:text-white transition-colors">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-4 pt-8 border-t border-gray-300">
                                    {selectedProject.links.demo && (
                                        <a href={selectedProject.links.demo} target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-black text-white text-center font-bold uppercase hover:bg-white hover:text-black border-2 border-black transition-colors flex items-center justify-center gap-2">
                                            <ExternalLink size={20} /> Launch System
                                        </a>
                                    )}
                                    {selectedProject.links.repo && (
                                        <a href={selectedProject.links.repo} target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white text-black border-2 border-black text-center font-bold uppercase hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2">
                                            <Github size={20} /> Source Code
                                        </a>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};