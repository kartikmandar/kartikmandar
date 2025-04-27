'use client'
import Link from 'next/link'
import React, { useState } from 'react'
import { Home, FileText, User, ChevronLeft } from 'lucide-react'

interface HeaderClientProps {
  data: { navItems: { link: { label: string; url: string } }[] }
}

const iconMap: Record<string, React.ReactNode> = {
  Home: <Home size={28} />, // Adjust size as needed
  Posts: <FileText size={28} />,
  About: <User size={28} />,
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const navItems = data?.navItems || []
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <aside
        className={`custom-header${expanded ? ' expanded' : ' minimized'}`}
        onMouseLeave={() => setExpanded(false)}
        style={{ pointerEvents: expanded ? 'auto' : 'none' }}
      >
        <div className="header-icons" style={{ width: '100%' }}>
          {navItems.map(({ link }, i) => (
            <div key={i} className="nav-item" style={{ margin: '1.5rem 0', position: 'relative' }}>
              <Link href={link.url} aria-label={link.label} className="nav-link">
                <span className="tooltip-text">{link.label}</span>
                {iconMap[link.label] || <span />}
              </Link>
            </div>
          ))}
        </div>
      </aside>
      <div
        className={`header-arrow-anim${!expanded ? ' visible' : ''}`}
        onMouseEnter={() => setExpanded(true)}
        style={{ position: 'fixed', top: '50%', right: '0px', transform: 'translateY(-50%)', cursor: 'pointer', borderRadius: '12px 0 0 12px', width: '18px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, opacity: !expanded ? 1 : 0, pointerEvents: !expanded ? 'auto' : 'none', transition: 'opacity 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.4s cubic-bezier(0.4,0,0.2,1)' }}
        tabIndex={0}
        aria-label={expanded ? 'Collapse header' : 'Expand header'}
      >
        <ChevronLeft size={16} style={{ marginLeft: '-2px' }} />
      </div>
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
      border-radius: 15px;
      z-index: 1000;
      padding: 30px 0;
      box-sizing: border-box;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      gap: 0.5rem;
      transition: width 0.4s cubic-bezier(0.4,0,0.2,1), padding 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.4s cubic-bezier(0.4,0,0.2,1);
      overflow: visible;
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
      transition: color 0.2s;
      display: flex;
      justify-content: center;
      position: relative;
      mix-blend-mode: difference;
    }
    
    .nav-link:hover {
      color: #ffd700 !important;
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
    
    /* Tooltip styles */
    .tooltip-text {
      visibility: hidden;
      position: absolute;
      top: 50%;
      right: calc(100% + 15px);
      transform: translateY(-50%);
      background-color: rgba(0, 0, 0, 0.6);
      color: white;
      text-align: center;
      padding: 6px 12px;
      border-radius: 5px;
      z-index: 1002;
      opacity: 0;
      transition: opacity 0.3s, visibility 0.3s, transform 0.3s;
      font-size: 14px;
      white-space: nowrap;
      pointer-events: none;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      mix-blend-mode: difference;
    }
    
    .tooltip-text::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 100%;
      margin-top: -5px;
      border-width: 5px;
      border-style: solid;
      border-color: transparent transparent transparent rgba(0, 0, 0, 0.6);
    }
    
    .nav-link:hover .tooltip-text {
      visibility: visible;
      opacity: 1;
      transform: translateY(-50%) scale(1);
    }
  `
  document.head.appendChild(style)
}
