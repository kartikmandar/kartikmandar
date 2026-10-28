import React from 'react'
import './styles.css'

// Shown by the route-level loading.tsx while a slow page streams in. Pure CSS:
// it fades in only after 250 ms, so quick navigations never flash it.
export const RadioTelescopeLoader: React.FC = () => {
  return (
    <div className="loader-wrapper" role="status" aria-label="Loading">
      <div className="stars" aria-hidden></div>
      
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