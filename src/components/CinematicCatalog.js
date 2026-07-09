"use client";

import React, { useState } from 'react';
import RoomPreviewer from './RoomPreviewer';

export default function CinematicCatalog({ catalogData, cacheBuster }) {
  const [activePreview, setActivePreview] = useState(null);
  const [isProcessingCustom, setIsProcessingCustom] = useState(false);
  const [productStyles, setProductStyles] = useState({});

  const availableTextures = [
    { name: 'Brown Leather', src: 'textures/leather_brown.png' },
    { name: 'Tan Leather', src: 'textures/leather_tan.png' },
    { name: 'Grey Velvet', src: 'textures/velvet_grey.png' },
    { name: 'Blue Velvet', src: 'textures/velvet_blue.png' },
    { name: 'Beige Linen', src: 'textures/linen_beige.png' },
    { name: 'White Linen', src: 'textures/linen_white.png' },
  ];

  const presetColors = [
    { name: 'White', hex: '#ffffff' },
    { name: 'Ivory', hex: '#fffff0' },
    { name: 'Cream', hex: '#fffdd0' },
    { name: 'Beige', hex: '#f5f5dc' },
    { name: 'Tan', hex: '#d2b48c' },
    { name: 'Light Grey', hex: '#d3d3d3' },
    { name: 'Charcoal', hex: '#36454f' },
    { name: 'Black', hex: '#111111' },
    { name: 'Navy Blue', hex: '#000080' },
    { name: 'Emerald', hex: '#046307' },
    { name: 'Burgundy', hex: '#800020' },
    { name: 'Gold', hex: '#d4af37' },
    { name: 'Blush Pink', hex: '#de5d83' },
  ];

  const { brand, products } = catalogData;

  // Add the cover as the first "slide"
  const slides = [
    { type: 'cover', data: brand || {} },
    ...products.map(p => ({ type: 'product', data: p }))
  ];

  const handleCustomTryOn = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessingCustom(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/remove-bg', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        // Automatically open room previewer with the newly processed transparent image!
        setActivePreview({ url: data.imageUrl, color: null, texture: null });
      } else {
        alert('Error processing image: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to process custom image.');
    } finally {
      setIsProcessingCustom(false);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#0a0a0a', 
      color: '#fff', 
      fontFamily: 'system-ui, sans-serif',
      height: '100vh',
      width: '100vw',
      overflowY: 'scroll',
      scrollSnapType: 'y mandatory',
      scrollBehavior: 'smooth'
    }}>
      
      {slides.map((slide, index) => {
        if (slide.type === 'cover') {
          return (
            <div key="cover" style={{
              height: '100vh',
              position: 'sticky',
              top: 0,
              scrollSnapAlign: 'start',
              scrollSnapStop: 'always',
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
        const customBg = p.placement?.bgUrl || '/images/brand/room-bg.png';
        const pStyle = productStyles[p.id] || { color: null, texture: null };

        const setPStyle = (updates) => {
          setProductStyles(prev => ({ ...prev, [p.id]: { ...prev[p.id], ...updates } }));
        };

        return (
          <div key={p.id} style={{
            height: '100vh',
            position: 'sticky',
            top: 0,
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always',
            zIndex: index,
            backgroundColor: '#0a0a0a',
            backgroundImage: `
              radial-gradient(circle at center, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.6) 100%),
              url('${customBg}?v=${cacheBuster}')
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
               <div style={{
                 position: 'relative',
                 maxWidth: '85%',
                 height: '55vh', // Keep it proportionally sized to the room
                 transformOrigin: 'bottom center', // Scale from the floor
                 transform: `translate(${pX}%, ${pY - 15}vh) scale(${pScale}) rotate(${pRot}deg) rotateX(${pTilt}deg)`,
                 transition: 'transform 0.5s ease, filter 0.5s ease',
                 cursor: 'pointer',
                 filter: 'drop-shadow(0 50px 30px rgba(0,0,0,0.8)) brightness(1.05) contrast(1.1) saturate(1.1)',
               }}
               onMouseOver={(e) => {
                 e.currentTarget.style.transform = `translate(${pX}%, ${pY - 15}vh) scale(${pScale * 1.05}) rotate(${pRot}deg) rotateX(${pTilt}deg)`;
                 e.currentTarget.style.filter = 'drop-shadow(0 70px 40px rgba(0,0,0,0.6)) brightness(1.1) contrast(1.15) saturate(1.1)';
               }}
               onMouseOut={(e) => {
                 e.currentTarget.style.transform = `translate(${pX}%, ${pY - 15}vh) scale(${pScale}) rotate(${pRot}deg) rotateX(${pTilt}deg)`;
                 e.currentTarget.style.filter = 'drop-shadow(0 50px 30px rgba(0,0,0,0.8)) brightness(1.05) contrast(1.1) saturate(1.1)';
               }}
               onClick={() => setActivePreview({ url: imageUrl, color: pStyle.color, texture: pStyle.texture })}
               >
                 <img src={`${imageUrl}?v=${cacheBuster}`} alt={p.name} style={{ display: 'block', height: '100%', width: 'auto', objectFit: 'contain' }} />
                 
                 {pStyle.texture && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      backgroundImage: `url("${pStyle.texture}")`,
                      backgroundSize: '150px',
                      backgroundRepeat: 'repeat',
                      mixBlendMode: 'multiply',
                      WebkitMaskImage: `url("${imageUrl}?v=${cacheBuster}")`,
                      WebkitMaskSize: 'contain',
                      WebkitMaskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskImage: `url("${imageUrl}?v=${cacheBuster}")`,
                      maskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                      opacity: 1
                    }} />
                 )}
                 {pStyle.color && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: pStyle.color,
                      mixBlendMode: 'multiply',
                      WebkitMaskImage: `url("${imageUrl}?v=${cacheBuster}")`,
                      WebkitMaskSize: 'contain',
                      WebkitMaskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskImage: `url("${imageUrl}?v=${cacheBuster}")`,
                      maskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                      opacity: pStyle.texture ? 0.6 : 0.9
                    }} />
                 )}
               </div>
            </div>

            <div style={{
              position: 'absolute',
              bottom: '50px',
              left: '50px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderTop: '1px solid rgba(255, 255, 255, 0.5)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '30px',
              padding: '45px',
              maxWidth: '480px',
              boxShadow: '0 30px 60px rgba(0,0,0,0.4), inset 0 0 20px rgba(255,255,255,0.1)',
              transition: 'transform 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <p style={{ margin: 0, color: '#f9d423', fontSize: '0.9rem', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 700, textShadow: '0 2px 10px rgba(249, 212, 35, 0.5)' }}>{p.category}</p>
              <h2 style={{ 
                fontSize: '2.8rem', 
                fontWeight: 600, 
                margin: '15px 0', 
                letterSpacing: '1px',
                background: 'linear-gradient(to right, #ffffff, #f0e6d2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 5px 15px rgba(0,0,0,0.2)'
              }}>{p.name}</h2>
              <p style={{ fontSize: '1.05rem', color: '#f0f0f0', lineHeight: 1.7, fontWeight: 300 }}>{p.description}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginTop: '35px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '25px' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#b0b0b0', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>Dimensions</span>
                  <span style={{ fontSize: '1rem', fontWeight: 500, color: '#fff' }}>{p.dimensions}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#b0b0b0', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>Starting At</span>
                  <span style={{ fontSize: '1rem', fontWeight: 500, color: '#fff' }}>{p.priceRange}</span>
                </div>
              </div>

              {/* LIVE CUSTOMIZER SWATCHES */}
              <div style={{ marginTop: '25px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#b0b0b0', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>Customize: {pStyle.color ? presetColors.find(c => c.hex === pStyle.color)?.name : 'Original'} {pStyle.texture ? '+ Fabric' : ''}</span>
                
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', WebkitOverflowScrolling: 'touch' }}>
                  {/* Reset Button */}
                  <div 
                    onClick={() => setPStyle({ color: null, texture: null })}
                    style={{ minWidth: '35px', height: '35px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: (!pStyle.color && !pStyle.texture) ? '2px solid white' : '1px solid #555' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  </div>
                  
                  {/* Colors */}
                  {presetColors.map(c => (
                    <div 
                      key={c.name}
                      onClick={() => setPStyle({ color: c.hex })}
                      title={c.name}
                      style={{
                        minWidth: '35px', height: '35px', borderRadius: '50%',
                        backgroundColor: c.hex,
                        cursor: 'pointer',
                        border: pStyle.color === c.hex ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                        transition: 'transform 0.2s',
                        transform: pStyle.color === c.hex ? 'scale(1.1)' : 'scale(1)'
                      }}
                    />
                  ))}
                  
                  <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', margin: '0 5px' }} />

                  {/* Custom Fabric Capture */}
                  <label style={{ 
                    minWidth: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer', 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                    background: '#f9d423', color: '#000', fontSize: '16px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                  }} title="Capture Fabric">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '2px' }}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) setPStyle({ texture: URL.createObjectURL(file) });
                      }}
                      style={{ display: 'none' }} 
                    />
                  </label>

                  {/* Textures */}
                  {availableTextures.map(tex => (
                    <div 
                      key={tex.name}
                      onClick={() => setPStyle({ texture: tex.src })}
                      title={tex.name}
                      style={{
                        minWidth: '35px', height: '35px', borderRadius: '50%',
                        backgroundImage: `url(${tex.src})`, backgroundSize: 'cover',
                        cursor: 'pointer',
                        border: pStyle.texture === tex.src ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                        transition: 'transform 0.2s',
                        transform: pStyle.texture === tex.src ? 'scale(1.1)' : 'scale(1)'
                      }}
                    />
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setActivePreview({ url: imageUrl, color: pStyle.color, texture: pStyle.texture })}
                style={{
                  width: '100%',
                  marginTop: '40px',
                  padding: '16px 0',
                  background: 'linear-gradient(135deg, #f9d423 0%, #ff4e50 100%)', // Cool bright gradient
                  color: '#fff',
                  border: 'none',
                  borderRadius: '30px',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  boxShadow: '0 10px 30px rgba(255, 78, 80, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 78, 80, 0.6)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 78, 80, 0.4)';
                }}
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
          productImage={activePreview.url}
          initialColor={activePreview.color}
          initialTexture={activePreview.texture}
          onClose={() => setActivePreview(null)}
        />
      )}

      {/* Floating Action Button for Custom Try-On */}
      <label style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        backgroundColor: '#f9d423',
        color: '#000',
        padding: '15px 25px',
        borderRadius: '30px',
        fontWeight: 'bold',
        fontSize: '1rem',
        cursor: 'pointer',
        boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: 1000,
        transition: 'transform 0.2s ease',
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
        Try Custom Sofa
        <input 
          type="file" 
          accept="image/*" 
          capture="environment"
          onChange={handleCustomTryOn}
          style={{ display: 'none' }} 
        />
      </label>

      {/* Processing Overlay */}
      {isProcessingCustom && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          color: 'white',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{ 
            width: '50px', height: '50px', 
            border: '5px solid rgba(255,255,255,0.2)', 
            borderTop: '5px solid #f9d423', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite' 
          }} />
          <h2 style={{ marginTop: '20px', letterSpacing: '2px' }}>AI Removing Background...</h2>
          <p style={{ color: '#ccc' }}>This usually takes about 2-3 seconds.</p>
          <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
        </div>
      )}
    </div>
  );
}
