"use client"

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'

export function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const starsContainerRef = useRef<HTMLDivElement>(null);
  const shootingStarsRef = useRef<HTMLDivElement>(null);
  
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
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          z-index: 50;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background-color: rgba(128, 128, 128, 0.4);
          backdrop-filter: invert(1) blur(3px);
          mix-blend-mode: difference;
          color: white;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
          cursor: pointer;
          border: none;
        }
        
        .back-to-top-button:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
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

  // Navigation items
  const navItems = [
    { label: 'Home', url: '/' },
    { label: 'Posts', url: '/posts' },
    { label: 'About', url: '/about' },
    { label: 'Research', url: '/research' },
    { label: 'Contact', url: '/contact' },
  ]
  
  // Research interests
  const researchInterests = [
    'Radio Interferometry',
    'X-ray Binary Black Holes',
    'Astrophysics',
    'Astronomical Data Analysis',
    'Black Hole Physics',
    'Observational Astronomy'
  ]
  
  // Publications
  const publications = [
    {
      title: 'Radio Observations of X-ray Binary Systems',
      authors: 'Mandar, K., et al.',
      journal: 'Astronomy & Astrophysics (2024)',
      url: '#'
    },
    {
      title: 'Machine Learning Applications in Radio Astronomy',
      authors: 'Mandar, K., et al.',
      journal: 'Monthly Notices of the Royal Astronomical Society (2023)',
      url: '#'
    },
    {
      title: 'Analysis of Black Hole Binary Systems',
      authors: 'Mandar, K., et al.',
      journal: 'Astrophysical Journal (2023)',
      url: '#'
    }
  ]
  
  // Technical skills
  const technicalSkills = [
    { label: 'Python & Data Analysis', url: '#' },
    { label: 'Data Visualization', url: '#' },
    { label: 'Machine Learning', url: '#' },
    { label: 'Web & App Development', url: '#' },
    { label: 'Cloud Deployments', url: '#' }
  ]
  
  // Resources
  const resources = [
    { label: 'Research Projects', url: '#' },
    { label: 'Data Repositories', url: '#' },
    { label: 'Code Repositories', url: '#' },
    { label: 'Tutorials', url: '#' },
    { label: 'Astronomical Resources', url: '#' }
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
        <div className="border-t border-border bg-gradient-to-r from-black to-zinc-900 py-10 text-center relative">
          <div className="container max-w-4xl mx-auto px-4">
            <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-zinc-200 to-zinc-400 inline-block">
              Connect for Research Collaboration
            </h3>
            <p className="mb-6 text-gray-300 max-w-xl mx-auto">
              Interested in collaborating on radio astronomy research, discussing black hole physics, or exploring data analysis projects? Let&apos;s connect!
            </p>
            <form className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <input
                type="email"
                placeholder="Your email address"
                required
                className="flex-1 min-w-0 px-4 py-3 rounded-md bg-opacity-10 bg-white border border-gray-700 text-white"
              />
              <button 
                type="submit"
                className="px-6 py-3 bg-zinc-700 text-white font-semibold rounded-md transition-all hover:bg-zinc-600 hover:translate-y-[-2px]"
              >
                Connect
              </button>
            </form>
            <p className="text-gray-400 text-sm">I&apos;m open to collaborations, presentations, and academic discussions.</p>
          </div>
        </div>
        
        {/* Main footer content */}
        <div className="container py-12 px-4 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {/* Profile section */}
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-1">Kartik Mandar</h3>
              <p className="text-zinc-400 mb-2">BS Physics Student</p>
              <p className="text-gray-400 text-sm">Specializing in radio interferometry and X-ray binary black holes</p>
            </div>
            
            {/* Social links */}
            <div className="flex gap-3 mb-6">
              <a href="#" className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center transition-all hover:bg-zinc-600 hover:translate-y-[-2px]" aria-label="GitHub">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center transition-all hover:bg-zinc-600 hover:translate-y-[-2px]" aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center transition-all hover:bg-zinc-600 hover:translate-y-[-2px]" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center transition-all hover:bg-zinc-600 hover:translate-y-[-2px]" aria-label="ORCID">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2.033 16.01c-.564-1.789-1.632-1.023-1.632-1.023l.498 1.205c.475.422.904.447 1.134-.182zm.146-8.361l-1.201-.822c-.682-.46-1.28-.264-1.311.5l.813 1.109c.669.217 1.353-.138 1.699-.787zm3.312-1.73c-.501-.532-1.341-.11-1.341-.11l.009 1.053c.325.444.645.287 1.332-.943z"/></svg>
              </a>
            </div>
            
            {/* Academic buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              <a href="#" className="inline-flex items-center gap-2 bg-zinc-800 px-3 py-2 rounded-md text-sm transition-all hover:bg-zinc-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>CV / Resume</span>
              </a>
              <a href="#" className="inline-flex items-center gap-2 bg-zinc-800 px-3 py-2 rounded-md text-sm transition-all hover:bg-zinc-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
                <span>Google Scholar</span>
              </a>
            </div>
            
            {/* Make sure the theme selector is visible */}
            <div className="mb-4">
              <ThemeSelector />
            </div>
          </div>
          
          {/* Research Interests & Skills */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-zinc-400 pb-2 border-b border-zinc-800 inline-block">Research Interests</h4>
            <div className="flex flex-wrap gap-2 mb-6">
              {researchInterests.map((interest, index) => (
                <span 
                  key={index} 
                  className="bg-zinc-800 text-gray-300 px-3 py-1 rounded-full text-xs transition-all hover:bg-zinc-700 hover:text-white hover:translate-y-[-2px]"
                >
                  {interest}
                </span>
              ))}
            </div>
            
            <h4 className="text-lg font-semibold mb-4 text-zinc-400 pb-2 border-b border-zinc-800 inline-block">Technical Skills</h4>
            <ul className="space-y-2">
              {technicalSkills.map((skill, index) => (
                <li key={index}>
                  <a 
                    href={skill.url} 
                    className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block"
                  >
                    {skill.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Publications */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-zinc-400 pb-2 border-b border-zinc-800 inline-block">Recent Publications</h4>
            <div className="space-y-4">
              {publications.map((pub, index) => (
                <div key={index} className="border-l-2 border-zinc-700 pl-3">
                  <a href={pub.url} className="text-gray-300 hover:text-white text-sm">{pub.title}</a>
                  <div className="text-xs text-gray-500 italic">{pub.authors}</div>
                  <div className="text-xs text-zinc-500">{pub.journal}</div>
                </div>
              ))}
              <div className="border-l-2 border-zinc-700 pl-3">
                <a href="#" className="text-gray-300 hover:text-white text-sm">See All Publications</a>
              </div>
            </div>
          </div>
          
          {/* Resources & Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-zinc-400 pb-2 border-b border-zinc-800 inline-block">Resources</h4>
            <ul className="space-y-2 mb-6">
              {resources.map((resource, index) => (
                <li key={index}>
                  <a 
                    href={resource.url} 
                    className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block"
                  >
                    {resource.label}
                  </a>
                </li>
              ))}
            </ul>
            
            <h4 className="text-lg font-semibold mb-4 text-zinc-400 pb-2 border-b border-zinc-800 inline-block">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div className="text-gray-300">
                  Indian Institute of Science Education<br />
                  and Research Bhopal<br />
                  Bhopal, India
                </div>
              </div>
              <div className="flex gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div className="text-gray-300">kartik4321mandar@gmail.com</div>
              </div>
              <div className="flex gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-gray-300">Office Hours: By appointment</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer bottom */}
        <div className="bg-zinc-900 py-4 relative z-10">
          <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Kartik Mandar | Astrophysics Researcher
            </div>
            <div className="flex flex-wrap gap-4">
              <nav className="flex flex-wrap gap-4">
                {navItems.map((item, i) => (
                  <Link className="text-gray-500 text-sm hover:text-white transition-colors" key={i} href={item.url}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
