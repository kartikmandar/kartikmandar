'use client'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Home, ChevronLeft, Menu, X, User, FolderOpen, Code2, Mic, BookOpen, Heart, Award, Users, GraduationCap, Edit3 } from 'lucide-react'

interface HeaderClientProps {
  data: { navItems: { link: { label: string; url: string } }[] }
}

const iconMap: Record<string, React.ReactNode> = {
  Home: <Home size={28} />,
  CV: <User size={28} />,
  Projects: <FolderOpen size={28} />,
  'GSoC 2024': <Code2 size={28} />,
  'GSoC 2025': <Code2 size={28} />,
  Talks: <Mic size={28} />,
  Publications: <BookOpen size={28} />,
  Hobbies: <Heart size={28} />,
  Certificates: <Award size={28} />,
  'Journal Club': <Users size={28} />,
  Courses: <GraduationCap size={28} />,
  Posts: <Edit3 size={28} />,
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const navItems = data?.navItems || []
  const [expanded, setExpanded] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
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
                <span className="mobile-nav-icon">{iconMap[link.label] || <span />}</span>
                <span className="mobile-nav-label">{link.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="current-page-url">
          <span>{pathname}</span>
        </div>
      </div>

      {/* Desktop Floating Sidebar */}
      <aside
        className={`custom-header desktop-only${expanded ? ' expanded' : ' minimized'}`}
        onMouseLeave={() => setExpanded(false)}
        style={{ pointerEvents: expanded ? 'auto' : 'none' }}
      >
        <div className="header-icons" style={{ width: '100%', overflow: 'visible' }}>
          {navItems.map(({ link }, i) => {
            const isActive = pathname === link.url || 
              (link.url !== '/' && pathname.startsWith(link.url))
            
            return (
              <div 
                key={i} 
                className="nav-item" 
                style={{ margin: '1rem 0' }}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  setTooltipPosition({
                    top: rect.top + rect.height / 2,
                    left: rect.left - 15
                  })
                  setHoveredIndex(i)
                }}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Link 
                  href={link.url} 
                  aria-label={link.label} 
                  className={`nav-link${isActive ? ' active' : ''}`}
                >
                  {iconMap[link.label] || <span />}
                </Link>
              </div>
            )
          })}
        </div>
      </aside>
      <div
        className={`header-arrow-anim desktop-only${!expanded ? ' visible' : ''}`}
        onMouseEnter={() => setExpanded(true)}
        style={{ position: 'fixed', top: '50%', right: '0px', transform: 'translateY(-50%)', cursor: 'pointer', borderRadius: '12px 0 0 12px', width: '18px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, opacity: !expanded ? 1 : 0, pointerEvents: !expanded ? 'auto' : 'none', transition: 'opacity 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.4s cubic-bezier(0.4,0,0.2,1)' }}
        tabIndex={0}
        aria-label={expanded ? 'Collapse header' : 'Expand header'}
      >
        <ChevronLeft size={16} style={{ marginLeft: '-2px' }} />
      </div>
      
      {/* Tooltip Portal */}
      {hoveredIndex !== null && navItems[hoveredIndex] && (
        <div 
          className="tooltip-portal"
          style={{
            position: 'fixed',
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: 'translate(-100%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            zIndex: 10000,
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          }}
        >
          {navItems[hoveredIndex].link.label}
          <span
            style={{
              position: 'absolute',
              top: '50%',
              left: '100%',
              marginTop: '-5px',
              borderWidth: '5px',
              borderStyle: 'solid',
              borderColor: 'transparent transparent transparent rgba(0, 0, 0, 0.9)',
            }}
          />
        </div>
      )}
    </>
  )
}

if (typeof window !== 'undefined') {
  const style = document.createElement('style')
  style.innerHTML = `
    .custom-header {
      position: fixed;
      right: 20px;
      top: 50%;
      left: auto;
      transform: translateY(-50%);
      width: 80px;
      max-height: 90vh;
      border-radius: 15px;
      z-index: 1000;
      padding: 20px 0;
      box-sizing: border-box;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      gap: 0.5rem;
      transition: width 0.4s cubic-bezier(0.4,0,0.2,1), padding 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.4s cubic-bezier(0.4,0,0.2,1);
      overflow-y: auto;
      overflow-x: visible;
      pointer-events: auto;
      opacity: 1;
      background-color: rgba(128, 128, 128, 0.4);
      backdrop-filter: invert(1) blur(3px);
      mix-blend-mode: difference;
      color: white;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
    }
    
    
    .custom-header.minimized {
      width: 0;
      padding: 0;
      background: transparent !important;
      pointer-events: none;
      opacity: 0;
      box-shadow: none;
      transform: translateY(-50%) scale(0.95);
    }
    
    .custom-header.expanded {
      opacity: 1;
      transform: translateY(-50%) scale(1);
    }
    
    .custom-header .header-icons {
      opacity: 1;
      transition: opacity 0.3s cubic-bezier(0.4,0,0.2,1);
    }
    
    .custom-header.minimized .header-icons {
      opacity: 0;
      pointer-events: none;
    }
    
    .nav-link {
      color: white;
      text-decoration: none;
      transition: color 0.2s, transform 0.2s;
      display: flex;
      justify-content: center;
      position: relative;
      mix-blend-mode: difference;
    }
    
    .nav-link:hover {
      color: #ffd700 !important;
    }
    
    .nav-link.active {
      color: #ffd700 !important;
      transform: scale(1.1);
    }
    
    .nav-link.active svg {
      filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
    }
    
    .header-arrow-anim {
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.4s cubic-bezier(0.4,0,0.2,1);
      transform: translateY(-50%) scale(0.95);
      background-color: rgba(128, 128, 128, 0.3);
      backdrop-filter: invert(1) blur(3px);
      mix-blend-mode: difference;
      color: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    
    .header-arrow-anim.visible {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(-50%) scale(1);
    }
    
    /* Nav item styles */
    .nav-item {
      position: relative;
    }

    /* Mobile Styles */
    .mobile-header {
      display: none;
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1100;
    }

    .hamburger-button {
      background-color: rgba(128, 128, 128, 0.4);
      backdrop-filter: invert(1) blur(3px);
      mix-blend-mode: difference;
      color: white;
      border: none;
      border-radius: 10px;
      padding: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
    }

    .hamburger-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.5);
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
      background-color: rgba(0, 0, 0, 0.95);
      backdrop-filter: blur(10px);
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
      gap: 1rem;
      color: white;
      text-decoration: none;
      font-size: 1.25rem;
      transition: color 0.2s, transform 0.2s;
      padding: 0.5rem 1rem;
      width: 100%;
    }

    .mobile-nav-link:hover {
      color: #ffd700;
      transform: scale(1.05);
    }

    .mobile-nav-link.active {
      color: #ffd700;
    }

    .mobile-nav-link.active .mobile-nav-icon svg {
      filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
    }

    .mobile-nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
    }

    .mobile-nav-icon svg {
      width: 28px;
      height: 28px;
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
      color: rgba(255, 255, 255, 0.7);
      font-family: monospace;
      padding: 0.5rem 1rem;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      word-break: break-all;
      max-width: 90vw;
      text-align: center;
      z-index: 1051;
      backdrop-filter: blur(5px);
      border: 1px solid rgba(255, 255, 255, 0.1);
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
      
      .mobile-nav-icon svg {
        width: 24px;
        height: 24px;
      }
    }
  `
  document.head.appendChild(style)
}
