'use client'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Home, Menu, X, User, FolderOpen, Code2, Mic, BookOpen, Heart, Award, Users, GraduationCap, Library, Phone, Briefcase } from 'lucide-react'

interface HeaderClientProps {
  data: { navItems: { link: { label: string; url: string } }[] }
}

const _iconMap: Record<string, React.ReactNode> = {
  Home: <Home size={28} />,
  CV: <User size={28} />,
  Projects: <FolderOpen size={28} />,
  Consultancy: <Briefcase size={28} />,
  Developer: <Code2 size={28} />,
  'GSoC 2024': <Code2 size={28} />,
  'GSoC 2025': <Code2 size={28} />,
  Talks: <Mic size={28} />,
  Publications: <BookOpen size={28} />,
  Hobbies: <Heart size={28} />,
  Certificates: <Award size={28} />,
  'Journal Club': <Users size={28} />,
  Courses: <GraduationCap size={28} />,
  'Common Resources': <Library size={28} />,
  'Academic Life': <User size={28} />,
  Contact: <Phone size={28} />,
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const navItems = data?.navItems || []
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])


  return (
    <>
      {/* Mobile Hamburger Menu */}
      <div className="mobile-header">
        <button
          className="hamburger-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay${mobileMenuOpen ? ' open' : ''}`}>
        <nav className="mobile-nav">
          {navItems.map(({ link }, i) => {
            const isActive = pathname === link.url || 
              (link.url !== '/' && pathname.startsWith(link.url))
            
            return (
              <Link 
                key={i}
                href={link.url} 
                className={`mobile-nav-link${isActive ? ' active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mobile-nav-label">{link.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="current-page-url">
          <span>{pathname}</span>
        </div>
      </div>

    </>
  )
}

if (typeof window !== 'undefined') {
  const style = document.createElement('style')
  style.innerHTML = `

    /* Mobile Styles */
    .mobile-header {
      display: none;
      position: fixed;
      top: 16px;
      right: 20px;
      z-index: 1100;
    }

    .hamburger-button {
      background: rgba(0, 0, 0, 0.20);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.9);
      border-radius: 12px;
      padding: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      width: 48px;
      height: 48px;
      min-width: 48px;
      min-height: 48px;
    }

    .hamburger-button:hover {
      transform: scale(1.02);
      background: rgba(0, 0, 0, 0.30);
      color: rgba(255, 255, 255, 1);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .hamburger-button:active {
      transform: scale(0.95);
    }

    .mobile-menu-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(20px) saturate(180%);
      z-index: 1050;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s cubic-bezier(0.4,0,0.2,1), visibility 0.3s;
    }

    .mobile-menu-overlay.open {
      opacity: 1;
      visibility: visible;
    }

    .mobile-nav {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      align-items: center;
      justify-content: flex-start;
      text-align: center;
      max-height: 80vh;
      overflow-y: auto;
      overflow-x: hidden;
      width: 90%;
      padding: 2rem 1rem;
    }
    

    .mobile-nav-link {
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      text-decoration: none;
      font-size: 1.25rem;
      transition: color 0.2s, transform 0.2s;
      padding: 0.75rem 1rem;
      width: 100%;
      text-align: center;
    }

    .mobile-nav-link:hover {
      color: #ffd700;
      transform: scale(1.05);
    }

    .mobile-nav-link.active {
      color: #ffd700;
    }


    .mobile-nav-label {
      font-weight: 500;
    }

    .current-page-url {
      position: fixed;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.8);
      font-family: monospace;
      padding: 0.75rem 1.25rem;
      background: rgba(0, 0, 0, 0.20);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      word-break: break-all;
      max-width: 90vw;
      text-align: center;
      z-index: 1051;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .desktop-only {
        display: none !important;
      }

      .mobile-header {
        display: block;
      }
    }

    @media (min-width: 769px) {
      .mobile-header {
        display: none;
      }

      .mobile-menu-overlay {
        display: none;
      }
    }
    
    /* iPad specific adjustments */
    @media only screen and (min-device-width: 768px) and (max-device-width: 1024px) {
      .mobile-nav {
        gap: 1.2rem;
        padding: 1.5rem 1rem;
        max-height: 75vh;
      }
      
      .mobile-nav-link {
        font-size: 1.1rem;
        padding: 0.4rem 1rem;
      }
      
    }
    
    /* Hide scrollbar completely */
    .custom-header::-webkit-scrollbar {
      display: none;
    }
  `
  document.head.appendChild(style)
}
