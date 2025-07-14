'use client'

import React, { useEffect } from 'react'
import './styles.css'

export const RadioTelescopeLoader: React.FC = () => {
  useEffect(() => {
    // Generate starfield
    const starfield = document.getElementById('starfield')
    if (!starfield) return
    
    const numStars = 150
    
    for (let i = 0; i < numStars; i++) {
      const star = document.createElement('div')
      star.className = 'star'
      star.style.left = Math.random() * 100 + '%'
      star.style.top = Math.random() * 100 + '%'
      star.style.animationDelay = Math.random() * 4 + 's'
      
      // Vary star sizes and brightness
      const size = Math.random() * 2 + 1
      star.style.width = size + 'px'
      star.style.height = size + 'px'
      star.style.opacity = String(Math.random() * 0.8 + 0.2)
      
      starfield.appendChild(star)
    }
    
    // Occasionally add "detected signal" effect on dish
    const interval = setInterval(() => {
      const dishInner = document.querySelector('.dish-inner') as HTMLElement
      if (dishInner) {
        dishInner.style.boxShadow = 'inset 0 5px 15px rgba(0,0,0,0.4), inset 0 -5px 20px rgba(52, 152, 219, 0.5)'
        setTimeout(() => {
          dishInner.style.boxShadow = 'inset 0 5px 15px rgba(0,0,0,0.4), inset 0 -5px 10px rgba(52, 152, 219, 0.1)'
        }, 600)
      }
    }, 3200)
    
    return () => {
      clearInterval(interval)
      // Clean up stars
      if (starfield) {
        starfield.innerHTML = ''
      }
    }
  }, [])

  return (
    <div className="loader-wrapper">
      <div className="stars" id="starfield"></div>
      
      <div className="loader-container">
        {/* Radio telescope structure */}
        <div className="telescope-base"></div>
        
        <div className="dish-container">
          {/* Incoming radio waves */}
          <div className="incoming-wave">
            <div className="wave-sphere"></div>
            <div className="wave-sphere"></div>
            <div className="wave-sphere"></div>
            <div className="wave-sphere"></div>
          </div>
          
          <div className="telescope-dish">
            <div className="dish-inner"></div>
            <div className="dish-grid">
              {/* Horizontal grid lines */}
              <div className="grid-line grid-line-h" style={{ top: '20%' }}></div>
              <div className="grid-line grid-line-h" style={{ top: '40%' }}></div>
              <div className="grid-line grid-line-h" style={{ top: '60%' }}></div>
              <div className="grid-line grid-line-h" style={{ top: '80%' }}></div>
              {/* Vertical grid lines */}
              <div className="grid-line grid-line-v" style={{ left: '20%' }}></div>
              <div className="grid-line grid-line-v" style={{ left: '40%' }}></div>
              <div className="grid-line grid-line-v" style={{ left: '60%' }}></div>
              <div className="grid-line grid-line-v" style={{ left: '80%' }}></div>
            </div>
          </div>
        </div>
        
        <div className="loading-text">Searching for Signals</div>
      </div>
    </div>
  )
}