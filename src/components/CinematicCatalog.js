"use client";

import React, { useState } from 'react';
import RoomPreviewer from './RoomPreviewer';

export default function CinematicCatalog({ catalogData, cacheBuster }) {
  const [activePreview, setActivePreview] = useState(null);

  const { brand, products } = catalogData;

  // Add the cover as the first "slide"
  const slides = [
    { type: 'cover', data: brand || {} },
    ...products.map(p => ({ type: 'product', data: p }))
  ];

  return (
    <div style={{ backgroundColor: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      
      {slides.map((slide, index) => {
        if (slide.type === 'cover') {
          return (
            <div key="cover" style={{
              height: '100vh',
              position: 'sticky',
              top: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.8)), url(/images/brand/cover.jpg?v=${cacheBuster})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: index,
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
              {!slide.data.hideLogo && (
                <img src={`/images/brand/logo.png?v=${cacheBuster}`} alt="Logo" style={{ width: '150px', marginBottom: '30px' }} onError={(e) => e.target.style.display = 'none'} />
              )}
              <h1 style={{ fontSize: '5rem', fontWeight: 300, letterSpacing: '8px', textAlign: 'center', textTransform: 'uppercase', margin: 0, padding: '0 20px' }}>{slide.data.name || 'Luxury Catalog'}</h1>
              <p style={{ fontSize: '1.2rem', fontWeight: 300, letterSpacing: '4px', opacity: 0.7, marginTop: '20px' }}>{slide.data.tagline}</p>
              
              <div style={{ position: 'absolute', bottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.5, animation: 'bounce 2s infinite' }}>
                <span style={{ fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Scroll to Explore</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
              </div>
            </div>
          );
        }

        const p = slide.data;
        const imageUrl = p.image?.startsWith('/') ? p.image : (p.images?.isolated?.startsWith('/') ? p.images.isolated : `/images/products/${p.image || p.images?.isolated}`);
        
        // Dynamic placement
        const pScale = p.placement?.scale || 1;
        const pX = p.placement?.x || 0;
        const pY = p.placement?.y !== undefined ? p.placement.y : 15;
        const pRot = p.placement?.rotation || 0;
        const pTilt = p.placement?.tilt || 0;

        return (
          <div key={p.id} style={{
            height: '100vh',
            position: 'sticky',
            top: 0,
            zIndex: index,
            backgroundColor: '#0a0a0a',
            backgroundImage: `
              radial-gradient(circle at center, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.6) 100%),
              url('/images/brand/room-bg.png?v=${cacheBuster}')
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 -20px 50px rgba(0,0,0,0.8)',
            overflow: 'hidden',
            borderTop: '4px solid rgba(204, 167, 123, 0.8)', // very prominent gold top border
            boxSizing: 'border-box',
            perspective: '1000px' // For 3D tilt
          }}>
            
            {/* Elegant Inner Frame */}
            <div style={{
              position: 'absolute',
              top: '30px', left: '30px', right: '30px', bottom: '30px',
              border: '2px solid rgba(204, 167, 123, 0.6)', // much brighter and thicker gold border
              boxShadow: 'inset 0 0 20px rgba(204, 167, 123, 0.1)',
              borderRadius: '20px',
              pointerEvents: 'none',
              zIndex: 0
            }}>
              {/* Corner Accents */}
              <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '20px', height: '20px', borderTop: '4px solid #cca77b', borderLeft: '4px solid #cca77b', borderRadius: '20px 0 0 0' }}></div>
              <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '20px', height: '20px', borderTop: '4px solid #cca77b', borderRight: '4px solid #cca77b', borderRadius: '0 20px 0 0' }}></div>
              <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #cca77b', borderLeft: '4px solid #cca77b', borderRadius: '0 0 0 20px' }}></div>
              <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #cca77b', borderRight: '4px solid #cca77b', borderRadius: '0 0 20px 0' }}></div>
            </div>
            
            <div style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              display: 'flex',
              alignItems: 'flex-end', // Anchor to the bottom (floor)
              justifyContent: 'center',
              paddingBottom: '15vh' // Perfect distance from bottom to look like it's on the floor
            }}>
               <img src={`${imageUrl}?v=${cacheBuster}`} alt={p.name} style={{
                 maxWidth: '85%',
                 maxHeight: '55vh', // Keep it proportionally sized to the room
                 objectFit: 'contain',
                 filter: 'drop-shadow(0 50px 30px rgba(0,0,0,0.8)) brightness(1.05) contrast(1.1) saturate(1.1)',
                 transformOrigin: 'bottom center', // Scale from the floor
                 transform: `translate(${pX}%, ${pY - 15}vh) scale(${pScale}) rotate(${pRot}deg) rotateX(${pTilt}deg)`,
                 transition: 'transform 0.5s ease, filter 0.5s ease',
                 cursor: 'pointer'
               }} 
               onMouseOver={(e) => {
                 e.currentTarget.style.transform = `translate(${pX}%, ${pY - 15}vh) scale(${pScale * 1.05}) rotate(${pRot}deg) rotateX(${pTilt}deg)`;
                 e.currentTarget.style.filter = 'drop-shadow(0 70px 40px rgba(0,0,0,0.6)) brightness(1.1) contrast(1.15) saturate(1.1)';
               }}
               onMouseOut={(e) => {
                 e.currentTarget.style.transform = `translate(${pX}%, ${pY - 15}vh) scale(${pScale}) rotate(${pRot}deg) rotateX(${pTilt}deg)`;
                 e.currentTarget.style.filter = 'drop-shadow(0 50px 30px rgba(0,0,0,0.8)) brightness(1.05) contrast(1.1) saturate(1.1)';
               }}
               onClick={() => setActivePreview(imageUrl)}
               />
            </div>

            <div style={{
              position: 'absolute',
              bottom: '40px',
              left: '40px',
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '40px',
              maxWidth: '450px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}>
              <p style={{ margin: 0, color: '#cca77b', fontSize: '0.9rem', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600 }}>{p.category}</p>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 300, margin: '10px 0', letterSpacing: '1px' }}>{p.name}</h2>
              <p style={{ fontSize: '1rem', color: '#999', lineHeight: 1.6 }}>{p.description}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Dimensions</span>
                  <span style={{ fontSize: '0.9rem' }}>{p.dimensions}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Starting At</span>
                  <span style={{ fontSize: '0.9rem' }}>{p.priceRange}</span>
                </div>
              </div>

              <button 
                onClick={() => setActivePreview(imageUrl)}
                style={{
                  width: '100%',
                  marginTop: '30px',
                  padding: '15px 0',
                  background: '#fff',
                  color: '#000',
                  border: 'none',
                  borderRadius: '30px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'background 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#e0e0e0'}
                onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                View in Room AR
              </button>
            </div>
          </div>
        );
      })}

      <style jsx global>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        body { margin: 0; background: #0a0a0a; }
        ::-webkit-scrollbar { width: 0px; background: transparent; }
      `}</style>

      {/* Room Previewer Modal */}
      {activePreview && (
        <RoomPreviewer 
          productImage={activePreview}
          onClose={() => setActivePreview(null)}
        />
      )}
    </div>
  );
}
