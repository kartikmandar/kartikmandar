'use client'

import React, { useState } from 'react'
import { ProjectCard, ProjectModal, type Project } from './index'

// Example usage component demonstrating the ProjectCard
export const ProjectCardExample: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // Sample project data - this would typically come from your CMS or API
  const sampleProjects: Project[] = [
    {
      id: 1,
      title: "Next.js E-Commerce Platform",
      shortDescription: "Modern e-commerce solution with advanced features",
      description: "A comprehensive e-commerce platform built with Next.js 15, featuring dynamic product catalogs, advanced search capabilities, user authentication, and payment processing. The platform includes admin dashboard, inventory management, and real-time analytics.",
      category: "Web Development",
      status: "active",
      techStack: [
        "Next.js",
        "TypeScript", 
        "Tailwind CSS",
        "Prisma",
        "PostgreSQL",
        "Stripe",
        "Redis",
        "Docker"
      ],
      github: {
        url: "https://github.com/example/nextjs-ecommerce",
        stars: 2340,
        forks: 456
      },
      linesOfCode: 45680,
      demoUrl: "https://demo-ecommerce.example.com",
      architecture: "The application follows a microservices architecture with Next.js handling the frontend and API routes, PostgreSQL for data persistence, Redis for caching, and Docker for containerization. The system is designed for horizontal scaling and includes comprehensive monitoring.",
      usageGuide: `# Installation
npm install

# Environment Setup
cp .env.example .env.local
# Configure your database and API keys

# Development
npm run dev

# Production Build
npm run build
npm start`,
      futureWork: "• Implement AI-powered product recommendations\n• Add mobile app with React Native\n• Integrate with headless CMS\n• Add multi-vendor marketplace features\n• Implement advanced analytics dashboard",
      problemSolving: "Traditional e-commerce platforms often suffer from slow loading times, poor mobile experience, and limited customization. Our solution addresses these issues with modern web technologies, providing a fast, responsive, and highly customizable platform."
    },
    {
      id: 2,
      title: "AI-Powered Content Generator",
      shortDescription: "Generate high-quality content using advanced AI models",
      description: "An intelligent content generation platform that leverages cutting-edge AI models to create various types of content including blog posts, social media content, marketing copy, and technical documentation. Features include content optimization, plagiarism detection, and multi-language support.",
      category: "Artificial Intelligence",
      status: "completed",
      techStack: [
        "Python",
        "FastAPI",
        "OpenAI GPT",
        "React",
        "PostgreSQL",
        "Docker",
        "AWS",
        "TensorFlow"
      ],
      github: {
        url: "https://github.com/example/ai-content-gen",
        stars: 1820,
        forks: 234
      },
      linesOfCode: 28750,
      publication: {
        title: "Advanced AI Content Generation: A Comprehensive Approach",
        authors: "Smith, J., Johnson, A., Davis, M.",
        venue: "AI Research Journal",
        year: 2024,
        url: "https://example.com/publication"
      },
      architecture: "The system uses a modular architecture with FastAPI handling the backend services, React for the frontend interface, and various AI models integrated through a unified API. Content processing is handled asynchronously using Celery workers.",
      problemSolving: "Content creation is time-consuming and expensive for businesses. Our AI-powered solution reduces content creation time by 80% while maintaining quality and consistency across different content types and languages.",
      plots: [
        {
          url: "/api/placeholder/400/300",
          caption: "Content generation accuracy over different model types",
          alt: "Bar chart showing accuracy metrics"
        },
        {
          url: "/api/placeholder/400/300", 
          caption: "Performance comparison with traditional methods",
          alt: "Line graph showing performance improvements"
        }
      ],
      futureWork: "• Implement real-time collaborative editing\n• Add voice-to-content generation\n• Integrate with popular CMS platforms\n• Develop specialized models for technical writing"
    },
    {
      id: 3,
      title: "Quantum Computing Simulator",
      shortDescription: "High-performance quantum circuit simulation platform",
      description: "A sophisticated quantum computing simulator that enables researchers and developers to design, test, and optimize quantum algorithms. Features include visual circuit designer, performance analysis, and educational resources for quantum computing concepts.",
      category: "Scientific Computing",
      status: "active",
      techStack: [
        "C++",
        "Python",
        "CUDA",
        "Qt",
        "NumPy",
        "OpenMP",
        "CMake"
      ],
      github: {
        url: "https://github.com/example/quantum-sim",
        stars: 956,
        forks: 187
      },
      linesOfCode: 67420,
      architecture: "Built with C++ for high-performance computing, the simulator uses CUDA for GPU acceleration and OpenMP for multi-threading. The Python interface provides ease of use while maintaining performance for complex simulations.",
      problemSolving: "Quantum computing hardware is expensive and limited. Our simulator provides an accessible platform for quantum algorithm development and education, enabling wider adoption of quantum computing concepts.",
      posters: [
        {
          title: "High-Performance Quantum Circuit Simulation",
          conference: "International Conference on Quantum Computing",
          year: 2024,
          url: "/posters/quantum-poster.pdf"
        }
      ],
      images: [
        {
          url: "/api/placeholder/500/300",
          caption: "Quantum circuit visualization interface",
          alt: "Screenshot of circuit designer"
        }
      ],
      futureWork: "• Add quantum error correction simulation\n• Implement distributed computing support\n• Create educational game modes\n• Integrate with real quantum hardware APIs"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Project Showcase</h1>
          <p className="text-xl text-muted-foreground">Explore our latest projects and innovations</p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sampleProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onExpand={setSelectedProject}
            />
          ))}
        </div>

        {/* Example of different variants */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-foreground mb-8">Different Card Variants</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Featured Card - takes more space */}
            <div className="lg:col-span-8">
              <ProjectCard
                project={sampleProjects[0]!}
                onExpand={setSelectedProject}
                variant="featured"
              />
            </div>
            
            {/* Compact Cards */}
            <div className="lg:col-span-4 space-y-4">
              {sampleProjects.slice(1).map((project) => (
                <ProjectCard
                  key={`compact-${project.id}`}
                  project={project}
                  onExpand={setSelectedProject}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  )
}

export default ProjectCardExample