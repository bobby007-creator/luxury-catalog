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

        return (
          <div key={p.id} style={{
            height: '100vh',
            position: 'sticky',
            top: 0,
            zIndex: index,
            backgroundColor: '#050505',
            backgroundImage: `
              radial-gradient(circle at center, rgba(30, 30, 30, 0.8) 0%, rgba(5, 5, 5, 1) 100%),
              repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.02) 0px, rgba(255, 255, 255, 0.02) 1px, transparent 1px, transparent 10px)
            `,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 -20px 50px rgba(0,0,0,0.8)',
            overflow: 'hidden',
            borderTop: '2px solid rgba(204, 167, 123, 0.3)', // subtle gold top border
            boxSizing: 'border-box'
          }}>
            
            {/* Elegant Inner Frame */}
            <div style={{
              position: 'absolute',
              top: '20px', left: '20px', right: '20px', bottom: '20px',
              border: '1px solid rgba(204, 167, 123, 0.15)',
              borderRadius: '16px',
              pointerEvents: 'none',
              zIndex: 0
            }}></div>
            
            <div style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10%'
            }}>
               <img src={`${imageUrl}?v=${cacheBuster}`} alt={p.name} style={{
                 maxWidth: '90%',
                 maxHeight: '90%',
                 objectFit: 'contain',
                 filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.5))',
                 transition: 'transform 0.5s ease',
                 cursor: 'pointer'
               }} 
               onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
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
