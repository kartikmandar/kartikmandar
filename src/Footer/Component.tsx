import React from 'react'
import Link from 'next/link'
import { CookieConsentSettings } from '@/components/CookieConsent'
import { CONTACT_EMAIL, NAVIGATION_ITEMS } from '@/constants/navigation'
import { BackToTop } from './BackToTop'
import { FooterSky } from './FooterSky'
import './footer.css'

export function Footer() {
  // Navigation items from shared constants
  const navItems = NAVIGATION_ITEMS
  
  // Research interests
  const researchInterests = [
    '21-cm Cosmology',
    'Radio Interferometry',
    'Black Hole X-ray Binaries',
    'Strong Lensing',
    'Astronomical Data Analysis',
  ]
  
  // Publications
  const publications = [
    {
      title: 'A NuSTAR Reflection-Spectroscopy Survey of Cygnus X-1',
      authors: 'Duraphe, Mandar, et. al',
      journal: 'Under review at ApJ',
      url: 'https://arxiv.org/abs/2608.15902'
    },
    {
      title: 'State-dependent X-Ray Variability in Cygnus X-1: A 12 yr NuSTAR Timing Study of Accretion Flow Geometry',
      authors: 'Duraphe, Mandar, et. al',
      journal: 'ApJ 1003, 13 (2026)',
      url: 'https://doi.org/10.3847/1538-4357/ae5632'
    },
    {
      title: 'fftvis: A Non-Uniform Fast Fourier Transform Based Interferometric Visibility Simulator',
      authors: 'Cox et. al',
      journal: 'RASTI 4, rzaf056 (2025)',
      url: 'https://doi.org/10.1093/rasti/rzaf056'
    },
    {
      title: 'A New Master Supernovae Ia sample and the investigation of the H0 tension',
      authors: 'Acknowledgment (Not Author)',
      journal: 'arXiv preprint',
      url: 'https://arxiv.org/abs/2501.11772v3'
    }
    
  ]
  
  // Technical skills
  const technicalSkills = [
    'Python & Data Analysis',
    'Machine Learning',
    'Web & App Development',
    'Database & DevOps',
    'Mobile Development',
  ]

  // Blog posts
  const blogPosts = [
    { label: 'GSoC 2024 Journey', url: 'https://gsoc2024.blogspot.com/' },
    { label: 'GSoC 2025 Adventure', url: 'https://gsoc2025.blogspot.com/' },
    { label: 'Posts', url: '/posts' },
    { label: 'Open Source Contributions', url: '/open-source' }
  ]
  
  // Resources
  const resources = [
    { label: 'Projects', url: '/open-source' },
    { label: 'Talks', url: '/talks' },
    { label: 'Posters', url: '/posters' },
    { label: 'Courses/Labs', url: '/about#courses' },
    { label: 'Journal Club', url: '/about#journal-club' },
  ]

  return (
    <>
      <BackToTop />

      <footer className="mt-auto relative bg-background-deep text-white overflow-hidden">
        <FooterSky />

        {/* The end moment on every page */}
        <div className="container relative z-10 mx-auto border-b border-zinc-800 px-4 pb-16 pt-20 sm:px-6 lg:pt-28">
          <h2 className="font-display text-display-xl text-white">Let&apos;s talk.</h2>
          <p className="mt-4 max-w-xl text-lg text-zinc-400">
            A research collaboration, an open-source question or an AI system to build. Write to me.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="break-all font-display text-2xl text-white underline decoration-ember underline-offset-8 transition-colors hover:text-ember sm:text-4xl"
            >
              {CONTACT_EMAIL}
            </a>
            <Link href="/contact" className="mono-label text-zinc-400 transition-colors hover:text-white">
              Other ways to reach me
            </Link>
          </div>
        </div>

        {/* Main footer content */}
        <div className="container py-8 sm:py-10 lg:py-12 px-4 sm:px-6 mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative z-10">
          {/* Profile section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold mb-1">Kartik Mandar</h3>
              <p className="text-zinc-400 mb-2 text-sm sm:text-base">MSc Astrophysics</p>
            </div>
            
            {/* Social links */}
            <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap">
              <a href="https://github.com/kartikmandar" className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center transition-all hover:bg-zinc-600 hover:translate-y-[-2px]" aria-label="GitHub">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="https://www.linkedin.com/in/kartikmandar/" className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center transition-all hover:bg-zinc-600 hover:translate-y-[-2px]" aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>
              </a>
              <a href="https://www.reddit.com/user/kartikmandar/" className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center transition-all hover:bg-zinc-600 hover:translate-y-[-2px]" aria-label="Reddit">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14.238 15.348c.085.084.085.221 0 .306-.465.462-1.194.687-2.231.687l-.008-.002-.008.002c-1.036 0-1.766-.225-2.231-.688-.085-.084-.085-.221 0-.305.084-.084.222-.084.307 0 .379.377 1.008.561 1.924.561l.008.002.008-.002c.915 0 1.544-.184 1.924-.561.085-.084.223-.084.307 0zm-3.44-2.418c0-.507-.414-.919-.922-.919-.509 0-.923.412-.923.919 0 .506.414.918.923.918.508.001.922-.411.922-.918zm13.202-.93c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12zm-5-.129c0-.851-.695-1.543-1.55-1.543-.417 0-.795.167-1.074.435-1.056-.695-2.485-1.137-4.066-1.194l.865-2.724 2.343.549-.003.034c0 .696.569 1.262 1.268 1.262.699 0 1.267-.566 1.267-1.262s-.568-1.262-1.267-1.262c-.537 0-.994.335-1.179.804l-2.525-.592c-.11-.027-.223.037-.257.145l-.965 3.038c-1.656.02-3.155.466-4.258 1.181-.277-.255-.644-.415-1.05-.415-.854.001-1.549.693-1.549 1.544 0 .566.311 1.056.768 1.325-.03.164-.05.331-.05.5 0 2.281 2.805 4.137 6.253 4.137s6.253-1.856 6.253-4.137c0-.16-.017-.317-.044-.472.486-.261.82-.766.82-1.353zm-4.872.141c-.509 0-.922.412-.922.919 0 .506.414.918.922.918s.922-.412.922-.918c0-.507-.413-.919-.922-.919z"/></svg>
              </a>
              <a href="https://x.com/kartik_mandar" className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center transition-all hover:bg-zinc-600 hover:translate-y-[-2px]" aria-label="Twitter/X">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
            
            {/* Academic buttons */}
            <div className="flex flex-col items-start gap-2 sm:gap-3 mb-4 sm:mb-6">
              <a href="https://drive.google.com/file/d/1Mt1mdXwKkwagocNu4DYbXNjDmA006zvA/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 sm:gap-2 bg-zinc-800 px-3 py-2 rounded-md text-xs sm:text-sm transition-all hover:bg-zinc-600 touch-target min-h-[44px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Academic CV</span>
              </a>
              <a href="https://drive.google.com/file/d/15PZLNWHPzwWEzjf4GhA3WJhXWlJXqkXg/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 sm:gap-2 bg-zinc-800 px-3 py-2 rounded-md text-xs sm:text-sm transition-all hover:bg-zinc-600 touch-target min-h-[44px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Professional CV</span>
              </a>
              <a href="https://scholar.google.com/citations?hl=en&user=8vhqrogAAAAJ" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 sm:gap-2 bg-zinc-800 px-3 py-2 rounded-md text-xs sm:text-sm transition-all hover:bg-zinc-600 touch-target min-h-[44px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
                <span>Google Scholar</span>
              </a>
              <a href="https://orcid.org/0009-0002-6037-4613" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 sm:gap-2 bg-zinc-800 px-3 py-2 rounded-md text-xs sm:text-sm transition-all hover:bg-zinc-600 touch-target min-h-[44px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.025-5.325 5.025h-3.919V7.416zm1.444 1.303v7.444h2.297c3.272 0 4.022-2.484 4.022-3.722 0-2.016-1.284-3.722-4.097-3.722h-2.222z"/>
                </svg>
                <span>ORCID</span>
              </a>
            </div>
            
          </div>
          
          {/* Blogs & Technical Skills */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-zinc-400 pb-2 border-b border-zinc-800 inline-block">Blogs</h4>
            <ul className="space-y-2 mb-4 sm:mb-6">
              {blogPosts.map((post, index) => (
                <li key={index}>
                  {post.url.startsWith('http') ? (
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block text-sm sm:text-base py-1 touch-target"
                    >
                      {post.label}
                    </a>
                  ) : (
                    <Link
                      href={post.url}
                      className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block text-sm sm:text-base py-1 touch-target"
                    >
                      {post.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-zinc-400 pb-2 border-b border-zinc-800 inline-block">Technical Skills</h4>
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
              {technicalSkills.map((skill) => (
                <span key={skill} className="bg-zinc-800 text-gray-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Publications */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-zinc-400 pb-2 border-b border-zinc-800 inline-block">Recent Publications</h4>
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              {publications.map((pub, index) => (
                <div key={index} className="border-l-2 border-zinc-700 pl-3">
                  <a href={pub.url} className="text-gray-300 hover:text-white text-sm leading-snug block mb-1 touch-target" target="_blank" rel="noopener noreferrer">{pub.title}</a>
                  <div className="text-xs text-gray-500 italic">{pub.authors}</div>
                  <div className="text-xs text-zinc-500">{pub.journal}</div>
                </div>
              ))}
              <div className="border-l-2 border-zinc-700 pl-3">
                <Link href="/publications" className="text-gray-300 hover:text-white text-sm touch-target py-1 inline-block">See All Publications</Link>
              </div>
            </div>
            
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-zinc-400 pb-2 border-b border-zinc-800 inline-block">Research Interests</h4>
            <div className="flex flex-wrap gap-2">
              {researchInterests.map((interest, index) => (
                <span 
                  key={index} 
                  className="bg-zinc-800 text-gray-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs transition-all hover:bg-zinc-700 hover:text-white hover:translate-y-[-2px] touch-target"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
          
          {/* Resources & Contact */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-zinc-400 pb-2 border-b border-zinc-800 inline-block">Resources</h4>
            <ul className="space-y-2 mb-4 sm:mb-6">
              {resources.map((resource, index) => (
                <li key={index}>
                  <Link 
                    href={resource.url} 
                    className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block text-sm sm:text-base py-1 touch-target"
                  >
                    {resource.label}
                  </Link>
                </li>
              ))}
            </ul>
            
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-zinc-400 pb-2 border-b border-zinc-800 inline-block">
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            </h4>
            <div className="space-y-3 text-sm">
              <a href="https://www.unict.it/" target="_blank" rel="noopener noreferrer" className="flex gap-3 items-start hover:text-white transition-colors group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-500 flex-shrink-0 mt-0.5 group-hover:text-zinc-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div className="text-gray-300 text-sm leading-relaxed group-hover:text-white">
                  University of Catania<br />
                  Catania, Italy
                </div>
              </a>
              <a href={`mailto:${CONTACT_EMAIL}`} className="flex gap-3 items-start hover:text-white transition-colors group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-500 flex-shrink-0 mt-0.5 group-hover:text-zinc-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div className="text-gray-300 text-sm leading-relaxed break-all group-hover:text-white">{CONTACT_EMAIL}</div>
              </a>
            </div>
          </div>
        </div>
        
        {/* Footer bottom */}
        <div className="bg-zinc-900 py-4 sm:py-6 relative z-10">
          <div className="container mx-auto px-4">
            {/* Centered navigation menu */}
            <nav className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 gap-y-2 mb-3 sm:mb-4">
              {navItems.map((item, i) => (
                <Link className="text-gray-400 text-xs sm:text-sm hover:text-white transition-colors py-1 touch-target" key={i} href={item.url}>
                  {item.label}
                </Link>
              ))}
            </nav>
            {/* Copyright */}
            <div className="text-center text-gray-500 text-xs sm:text-sm space-y-1">
              <div>
                &copy; {new Date().getFullYear()} Kartik Mandar | MSc Astrophysics
              </div>
              <CookieConsentSettings className="text-center" />
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
