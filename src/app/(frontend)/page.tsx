import type { Metadata } from 'next/types'
import React from 'react'
import PageClient from '@/components/PageClient'
import { AboutHero } from '@/components/AboutHero'
import { ProjectsShowcase } from '@/blocks/ProjectsShowcase/Component'
import { getPublishedProjects } from '@/data/projects'
import { getCanonicalUrl } from '@/utilities/getURL'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Kartik Mandar - Astrophysicist & Software Developer',
    description: 'Welcome to my digital space where astrophysics meets modern software development. Discover my projects, research, and expertise.',
    alternates: { canonical: getCanonicalUrl('/') },
  }
}

const otherProjects = [
  { name: 'Colloquia', description: 'Local-first AI research assistant with Zotero integration, RAG via ChromaDB, and real-time voice/text LLM interaction.' },
  { name: 'Workflow Orchestrator', description: 'OpenEnv environment for training and evaluating LLM agent orchestration across DAG-based workflows.' },
  { name: 'NVIDIA Cosmos-Reason1-7B Fine-Tuning', description: 'QLoRA fine-tuning of a 7B vision-language model on RTX 3090 for soccer event detection with temporal localization.' },
  { name: 'LLM Financial AI System', description: 'Self-hosted open-source LLM deployment on Vast.ai for financial statement analysis with structured JSON output pipelines.' },
  { name: 'Molecular Dynamics Simulation', description: 'GROMACS/LAMMPS pipeline modeling thermal motion of DNA/RNA molecules within CAD-defined nanoscale boundaries.' },
  { name: 'HPC Cluster & Homelab', description: '5-node Slurm HPC cluster with GPU scheduling, Proxmox HA, Kubernetes, TrueNAS, and Grafana/Prometheus monitoring.' },
  { name: 'Polarized Sky Model (matvis)', description: 'Added full-Stokes (I, Q, U, V) sky model support to matvis via coherency matrix eigendecomposition, across CPU and GPU backends.' },
  { name: 'Enrolia', description: 'React Native app for AI-powered graduate admissions consulting with Expo Dev Builds, Supabase backend, and LLM integration.' },
  { name: 'AzuFlow', description: 'Privacy-first productivity app (React Native mobile + Electron desktop) with background alerts and cross-platform sync.' },
  { name: 'Sensor Data App', description: 'Cross-platform mobile app for high-frequency sensor logging (100Hz) for a mental health research study at IISER Bhopal.' },
  { name: 'Spillover', description: 'Real-time party game app (Next.js + Supabase) with anonymous hot takes, Two Truths and a Lie, and live leaderboard.' },
  { name: 'Ada-e-Haandi', description: 'Catering business website with Payload CMS, multi-step quote wizard, menu management, and inquiry tracking.' },
  { name: 'KeratiNoMore (iGEM 2023)', description: 'iGEM Gold Medal team wiki and GROMACS molecular dynamics simulations for gene insertion validation.' },
  { name: 'PromptPrep', description: 'CLI tool to prepare codebase context for LLM prompts by aggregating file contents with token counting.' },
  { name: 'Science Rendezvous & Event Websites', description: 'Websites for Science Rendezvous 2023 (UofT), AIIM 2023, Enthuzia 2023, and IISM 2022.' },
  { name: 'IISERB Mastodon Instance', description: 'Self-hosted Mastodon instance on Digital Ocean with PostgreSQL, S3 storage, SSL, and Crowdsec security.' },
]

export default function HomePage() {
  const projects = getPublishedProjects()

  return (
    <>
      <PageClient />

      {/* About Me Section */}
      <AboutHero />

      {/* Projects Showcase Component */}
      <section className="pb-16">
        <ProjectsShowcase
          blockType="projectsShowcase"
          blockName="My Projects"
          layout="grid-3"
          projects={projects}
          maxProjects={100}
          showViewAllButton={false}
        />
      </section>

      {/* All Projects List */}
      <section className="container pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/60">
              Projects
            </h2>
          </div>
          <div className="space-y-4">
            {otherProjects.map((project, index) => (
              <div key={index} className="py-3 border-b border-border last:border-b-0">
                <h3 className="text-base font-semibold text-foreground">{project.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}