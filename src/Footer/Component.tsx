"use client"

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { NAVIGATION_ITEMS } from '@/constants/navigation'
import { useForm, ValidationError } from '@formspree/react'

export function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const starsContainerRef = useRef<HTMLDivElement>(null);
  const shootingStarsRef = useRef<HTMLDivElement>(null);
  const [state, handleSubmit] = useForm("xyzjpnrj");
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Create stars animation
  useEffect(() => {
    if (starsContainerRef.current) {
      const container = starsContainerRef.current;
      const starCount = 150; // Increased from 100 to 150
      
      // Clear any existing stars
      container.innerHTML = '';
      
      for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random size between 1px and 3px
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Random position
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        star.style.left = `${posX}%`;
        star.style.top = `${posY}%`;
        
        // Random animation duration
        const duration = Math.random() * 3 + 2;
        star.style.setProperty('--duration', `${duration}s`);
        
        // Random delay
        const delay = Math.random() * 5;
        star.style.animationDelay = `${delay}s`;
        
        container.appendChild(star);
      }
    }
  }, []);
  
  // Create shooting stars animation
  useEffect(() => {
    if (shootingStarsRef.current) {
      const container = shootingStarsRef.current;
      
      // Function to create a single shooting star
      function createShootingStar() {
        const shootingStar = document.createElement('div');
        shootingStar.className = 'shooting-star';
        
        // Random position (mostly from top part of the container)
        const startPosX = Math.random() * 100 + 50; // Start from right side or beyond
        const startPosY = Math.random() * 50;  // Start from top half
        
        shootingStar.style.left = `${startPosX}%`;
        shootingStar.style.top = `${startPosY}%`;
        
        // Random size
        const length = Math.random() * 80 + 80;
        shootingStar.style.width = `${length}px`;
        
        // Random duration between 0.8 and 1.5 seconds
        const duration = Math.random() * 0.7 + 0.8;
        shootingStar.style.animationDuration = `${duration}s`;
        
        container.appendChild(shootingStar);
        
        // Remove the shooting star after animation completes
        setTimeout(() => {
          if (shootingStar.parentNode === container) {
            container.removeChild(shootingStar);
          }
        }, duration * 1000);
      }
      
      // Create shooting stars at random intervals
      function shootingStarLoop() {
        // Create one to three shooting stars
        const count = Math.floor(Math.random() * 3) + 2;
        
        for (let i = 0; i < count; i++) {
          setTimeout(createShootingStar, i * 300);
        }
        
        // Schedule next batch of shooting stars (more frequent)
        const nextBatch = Math.random() * 2000 + 800; // Between 0.8 and 2.8 seconds
        setTimeout(shootingStarLoop, nextBatch);
      }
      
      // Start the shooting star loop
      shootingStarLoop();
      
      // Clean up function
      return () => {
        // This will run when the component unmounts
        // No need for explicit cleanup as the timeouts will be cleared when component unmounts
      };
    }
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Add the custom style for the back-to-top button and stars
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const style = document.createElement('style');
      style.innerHTML = `
        .back-to-top-button {
          position: fixed;
          bottom: 2rem;
          left: 2rem;
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 20px;
          z-index: 50;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(0, 0, 0, 0.20);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          cursor: pointer;
        }
        
        .back-to-top-button:hover {
          transform: translateY(-4px) scale(1.02);
          background: rgba(0, 0, 0, 0.30);
          color: rgba(255, 255, 255, 1);
          border-color: rgba(255, 255, 255, 0.2);
        }
        
        .back-to-top-button.hidden {
          opacity: 0;
          transform: translateY(10px);
          pointer-events: none;
        }
        
        /* Stars styling */
        .stars-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }
        
        .star {
          position: absolute;
          background-color: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          animation: twinkle var(--duration) infinite ease-in-out;
          opacity: 0;
        }
        
        @keyframes twinkle {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        
        /* Shooting stars styling */
        .shooting-stars-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          pointer-events: none;
          overflow: hidden;
        }
        
        .shooting-star {
          position: absolute;
          height: 2px;
          background: linear-gradient(90deg, rgba(255,255,255,0), #fff);
          transform: rotate(-45deg);
          border-radius: 999px;
          filter: drop-shadow(0 0 6px rgba(105, 155, 255, 1));
          animation: shooting-star-animation linear;
          opacity: 0;
          z-index: 1;
        }
        
        @keyframes shooting-star-animation {
          0% {
            opacity: 0;
            transform: translateX(0) translateY(0) rotate(-45deg);
          }
          10% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(-200px) translateY(200px) rotate(-45deg);
          }
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  // Navigation items from shared constants
  const navItems = NAVIGATION_ITEMS
  
  // Research interests
  const researchInterests = [
    'Radio Interferometry',
    'BHXBs',
    'Astronomical Data Analysis',
    "DeepLense"
  ]
  
  // Publications
  const publications = [
    {
      title: 'fftvis: A Non-Uniform Fast Fourier Transform Based Interferometric Visibility Simulator',
      authors: 'Cox et. al',
      journal: 'arXiv preprint',
      url: 'https://arxiv.org/abs/2506.02130'
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
    { label: 'Python & Data Analysis', url: '/certificates#Programming' },
    { label: 'Machine Learning', url: '/certificates#Machine-Learning' },
    { label: 'Web & App Development', url: '/certificates#Web-Development' },
    { label: 'Database & DevOps', url: '/certificates#DevOps' },
    { label: 'Mobile Development', url: '/certificates#Mobile-Development' }
  ]
  
  // Blog posts
  const blogPosts = [
    { label: 'GSoC 2024 Journey', url: 'https://gsoc2024.blogspot.com/' },
    { label: 'GSoC 2025 Adventure', url: 'https://gsoc2025.blogspot.com/' },
    { label: 'Life of an Academia Student', url: '/life-of-an-academia-student' },
    { label: 'Open Source Contributions', url: '/open-source' }
  ]
  
  // Soft skills
  const _softSkills = [
    { label: 'Public Speaking', url: '#' },
    { label: 'Writing', url: '#' },
    { label: 'Leadership', url: '#' },
  ]
  
  // Resources
  const resources = [
    { label: 'Projects', url: '/#my-projects' },
    { label: 'Talks', url: '#' },
    { label: 'Posters', url: '#' },
    { label: 'Courses/Labs', url: '/courses' },
    { label: 'Clubs', url: '#' },
    { label: 'Common Resources', url: '/common-resources' }
  ]

  return (
    <>
      {/* Back to Top Button */}
      <button 
        onClick={scrollToTop}
        className={`back-to-top-button ${!showBackToTop ? 'hidden' : ''}`}
        aria-label="Back to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      <footer className="mt-auto relative bg-black dark:bg-card text-white overflow-hidden">
        {/* Stars background */}
        <div className="stars-container" ref={starsContainerRef}></div>
        
        {/* Shooting stars */}
        <div className="shooting-stars-container" ref={shootingStarsRef}></div>
        
        {/* Connect section */}
        <div className="border-t border-border bg-gradient-to-r from-black to-zinc-900 py-8 sm:py-10 text-center relative">
          <div className="container max-w-4xl mx-auto px-4 sm:px-6">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-zinc-200 to-zinc-400 inline-block">
              Connect for Research Collaboration
            </h3>
            <p className="mb-4 sm:mb-6 text-gray-300 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Interested in collaborating on radio interferometry projects, spectral timing analysis of BHXBs, ML applications in gravitation lensing, or exploring data analysis projects? Let&apos;s connect!
            </p>
            {state.succeeded ? (
              <div className="text-center mb-4 sm:mb-6">
                <div className="inline-block px-6 py-4 bg-card border border-border rounded-lg shadow-lg">
                  <p className="text-foreground font-semibold">Thanks for reaching out!</p>
                  <p className="text-muted-foreground text-sm mt-1">I&apos;ll get back to you soon.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 justify-center mb-3 sm:mb-4 max-w-2xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your name"
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md bg-opacity-10 bg-white border border-gray-700 text-white text-sm sm:text-base placeholder-gray-400"
                    />
                    <ValidationError 
                      prefix="Name" 
                      field="name"
                      errors={state.errors}
                      className="text-destructive text-xs mt-1"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="designation"
                      placeholder="Your designation (e.g., PhD Student)"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md bg-opacity-10 bg-white border border-gray-700 text-white text-sm sm:text-base placeholder-gray-400"
                    />
                    <ValidationError 
                      prefix="Designation" 
                      field="designation"
                      errors={state.errors}
                      className="text-destructive text-xs mt-1"
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Your email address"
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md bg-opacity-10 bg-white border border-gray-700 text-white text-sm sm:text-base placeholder-gray-400"
                  />
                  <ValidationError 
                    prefix="Email" 
                    field="email"
                    errors={state.errors}
                    className="text-destructive text-xs mt-1"
                  />
                </div>
                <div>
                  <textarea
                    name="message"
                    placeholder="Why do you want to connect? (e.g., research collaboration, academic discussion, project inquiry)"
                    required
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md bg-opacity-10 bg-white border border-gray-700 text-white text-sm sm:text-base placeholder-gray-400 resize-none"
                  />
                  <ValidationError 
                    prefix="Message" 
                    field="message"
                    errors={state.errors}
                    className="text-destructive text-xs mt-1"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={state.submitting}
                  className={`px-4 sm:px-6 py-3 sm:py-4 bg-zinc-700 text-white font-semibold rounded-md transition-all text-sm sm:text-base ${
                    state.submitting 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-zinc-600 hover:translate-y-[-2px]'
                  }`}
                >
                  {state.submitting ? 'Connecting...' : 'Connect'}
                </button>
              </form>
            )}
            <p className="text-gray-400 text-xs sm:text-sm">I&apos;m open to collaborations, presentations, and academic discussions.</p>
          </div>
        </div>
        
        {/* Main footer content */}
        <div className="container py-8 sm:py-10 lg:py-12 px-4 sm:px-6 mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative z-10">
          {/* Profile section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold mb-1">Kartik Mandar</h3>
              <p className="text-zinc-400 mb-2 text-sm sm:text-base">BS Physics | Looking for Astrophysics Masters</p>
              <p className="text-gray-400 text-xs sm:text-sm">Specializing in radio interferometry and spectral analysis</p>
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
              <a href="https://bsky.app/profile/kartikmandar.bsky.social" className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center transition-all hover:bg-zinc-600 hover:translate-y-[-2px]" aria-label="Bluesky">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"/></svg>
              </a>
            </div>
            
            {/* Academic buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
              <a href="https://drive.google.com/file/d/1Mt1mdXwKkwagocNu4DYbXNjDmA006zvA/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1 sm:gap-2 bg-zinc-800 px-3 py-2 rounded-md text-xs sm:text-sm transition-all hover:bg-zinc-600 touch-target min-h-[44px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>CV / Resume</span>
              </a>
              <a href="https://scholar.google.com/citations?hl=en&user=8vhqrogAAAAJ" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1 sm:gap-2 bg-zinc-800 px-3 py-2 rounded-md text-xs sm:text-sm transition-all hover:bg-zinc-600 touch-target min-h-[44px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
                <span>Google Scholar</span>
              </a>
              <a href="https://orcid.org/0009-0002-6037-4613" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1 sm:gap-2 bg-zinc-800 px-3 py-2 rounded-md text-xs sm:text-sm transition-all hover:bg-zinc-600 touch-target min-h-[44px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.025-5.325 5.025h-3.919V7.416zm1.444 1.303v7.444h2.297c3.272 0 4.022-2.484 4.022-3.722 0-2.016-1.284-3.722-4.097-3.722h-2.222z"/>
                </svg>
                <span>ORCID</span>
              </a>
            </div>
            
            {/* Make sure the theme selector is visible */}
            <div className="mb-4">
              <ThemeSelector />
            </div>
          </div>
          
          {/* Blogs & Technical Skills */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-zinc-400 pb-2 border-b border-zinc-800 inline-block">Blogs</h4>
            <ul className="space-y-2 mb-4 sm:mb-6">
              {blogPosts.map((post, index) => (
                <li key={index}>
                  <Link 
                    href={post.url} 
                    className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block text-sm sm:text-base py-1 touch-target"
                  >
                    {post.label}
                  </Link>
                </li>
              ))}
            </ul>
            
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-zinc-400 pb-2 border-b border-zinc-800 inline-block">Technical Skills</h4>
            <ul className="space-y-2 mb-4 sm:mb-6">
              {technicalSkills.map((skill, index) => (
                <li key={index}>
                  <Link 
                    href={skill.url} 
                    className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block text-sm sm:text-base py-1 touch-target"
                  >
                    {skill.label}
                  </Link>
                </li>
              ))}
            </ul>
            
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
            
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-zinc-400 pb-2 border-b border-zinc-800 inline-block">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3 items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div className="text-gray-300 text-sm leading-relaxed">
                  Raman Research Institute<br />
                  Bangalore, Karnataka
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div className="text-gray-300 text-sm leading-relaxed break-all">contact@kartikmandar.com</div>
              </div>
              <div className="flex gap-3 items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-gray-300 text-sm leading-relaxed">Meeting Hours: By appointment</div>
              </div>
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
            <div className="text-center text-gray-500 text-xs sm:text-sm">
              &copy; {new Date().getFullYear()} Kartik Mandar | Astrophysics Student
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
