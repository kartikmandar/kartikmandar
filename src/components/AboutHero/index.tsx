'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const AboutHero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center px-4 py-8 md:py-0 overflow-hidden">
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
      
      <div className="relative max-w-7xl mx-auto w-full mt-16 md:mt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Profile Photo */}
          <div className="order-2 lg:order-1 flex justify-center lg:justify-center">
            <div className="relative">
              <div className="relative w-80 h-80 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px] overflow-hidden rounded-2xl border-4 border-white dark:border-white shadow-2xl dark:shadow-white/20">
                <Image
                  src="/kartik-mandar.jpeg"
                  alt="Kartik Mandar"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 320px, (max-width: 1024px) 384px, 450px"
                />
              </div>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-blue-400 dark:bg-blue-600 blur-3xl opacity-20 -z-10 scale-105" />
            </div>
          </div>

          {/* Right Column - Text Content */}
          <div className="order-1 lg:order-2 text-center lg:text-left flex flex-col justify-center">
            {/* Name and Introduction */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Hi, I&apos;m Kartik Mandar
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              I completed my Bachelors in Physics from the Indian Institute of Science Education and Research, Bhopal, India in May 2025.
            </p>
            
            {/* Research Interests */}
            <div className="mb-10 space-y-4">
              <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                My research interests are in Radio Interferometry (Visibility Simulators), Radio Antenna Simulations, Time Series and Spectral Analysis (BHXBs), open source software development and ML techniques for studying Strong Gravitational Lensing and Dark Matter Substructure.
              </p>
              <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                <strong>I am on the lookout for Research Assistant positions which align to my research interests and a Master&apos;s in Astrophysics.</strong>
              </p>
              <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed"> 
                I also offer consultancy and development services for research software, web and mobile applications.
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center lg:justify-start flex-wrap mb-8">
              <Button 
                size="lg" 
                variant="outline"
                className="min-w-[140px] hover:scale-105 transition-transform border-gray-300 dark:border-white"
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
                  className="min-w-[140px] hover:scale-105 transition-transform border-gray-300 dark:border-white"
                >
                  Read Papers
                </Button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default AboutHero