'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const AboutHero: React.FC = () => {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Subtle starfield background */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(1px 1px at 20px 30px, white, transparent),
                           radial-gradient(1px 1px at 40px 70px, white, transparent),
                           radial-gradient(1px 1px at 80px 10px, white, transparent),
                           radial-gradient(1px 1px at 130px 80px, white, transparent),
                           radial-gradient(1px 1px at 70px 50px, white, transparent)`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px'
        }}
      />
      
      <div className="relative max-w-4xl mx-auto text-center">
        {/* Profile Photo */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="relative w-40 h-40 overflow-hidden rounded-full border-4 border-white dark:border-gray-800 shadow-xl">
              <Image
                src="/kartik-mandar.jpeg"
                alt="Kartik Mandar"
                fill
                className="object-cover"
                priority
                sizes="160px"
              />
            </div>
            {/* Optional: Add a subtle glow effect */}
            <div className="absolute inset-0 rounded-full bg-blue-400 dark:bg-blue-600 blur-2xl opacity-20 -z-10 scale-110" />
          </div>
        </div>
        
        {/* Name and Introduction */}
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Hi, I'm Kartik Mandar
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            I completed my Bachelors in Physics from the Indian Institute of Science Education and Research, Bhopal, in May 2025.
          <br className="hidden md:block" />
        </p>
        
        {/* Research Interests */}
        <div className="mb-10">
        
          <p className="text-base md:text-lg text-gray-700 dark:text-gray-300">
            My research interests are in Radio Interferometry (Visibility Simulators), Radio Antenna Simulations, Time Series and Spectral Analysis (BHXBs), open source software development and ML techniques for studying Strong Gravitational Lensing and Dark Matter Substructure.
          </p><br/>
          <p className="text-base md:text-lg text-gray-700 dark:text-gray-300">
            I am on the lookout for Research Assistant positions which align to my research interests and a Master's in Astrophysics.
          </p>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          <Button 
            size="lg" 
            variant="outline"
            className="min-w-[140px] hover:scale-105 transition-transform"
            onClick={() => {
              // Find projects section by looking for heading text
              const headings = Array.from(document.querySelectorAll('h2'))
              const projectsHeading = headings.find(h => h.textContent?.includes('Projects'))
              
              if (projectsHeading) {
                projectsHeading.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                })
              } else {
                // Fallback: look for projects showcase component
                const projectsSection = document.querySelector('[class*="projects-showcase"]')
                if (projectsSection) {
                  projectsSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  })
                }
              }
            }}
          >
            View Projects
          </Button>
          <Link href="/publications">
            <Button 
              size="lg"
              variant="outline"
              className="min-w-[140px] hover:scale-105 transition-transform"
            >
              Read Papers
            </Button>
          </Link>
        </div>
        
        {/* Optional: Add a scroll indicator */}
        <div className="mt-16 animate-bounce">
          <svg 
            className="w-6 h-6 mx-auto text-gray-400 dark:text-gray-600"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 14l-7 7m0 0l-7-7m7 7V3" 
            />
          </svg>
        </div>
      </div>
    </section>
  )
}

export default AboutHero