import React, { useState, useRef, useEffect } from 'react';
import styles from './RoomPreviewer.module.css';

export default function RoomPreviewer({ productImage, onClose }) {
  const [bgImage, setBgImage] = useState(null);
  const [mode, setMode] = useState('drag'); // 'drag', 'pick', 'paint'
  const [color, setColor] = useState('#aaaaaa');
  const [texture, setTexture] = useState(null);
  const [showTextures, setShowTextures] = useState(false);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPainting, setIsPainting] = useState(false);
  
  const availableTextures = [
    { name: 'Brown Leather', src: 'textures/leather_brown.png' },
    { name: 'Tan Leather', src: 'textures/leather_tan.png' },
    { name: 'Grey Velvet', src: 'textures/velvet_grey.png' },
    { name: 'Blue Velvet', src: 'textures/velvet_blue.png' },
    { name: 'Beige Linen', src: 'textures/linen_beige.png' },
    { name: 'White Linen', src: 'textures/linen_white.png' },
  ];
  
  const canvasRef = useRef(null);
  const imgRef = useRef(null); // original background image reference

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        setBgImage(url); // This triggers a re-render
      };
      img.src = url;
    }
  };

  useEffect(() => {
    if (bgImage && imgRef.current) {
      drawBackground(imgRef.current);
    }
  }, [bgImage]);

  const drawBackground = (img) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Scale canvas to fit window
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight - 180; // account for header and toolbar
    let width = img.width;
    let height = img.height;
    
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = width * ratio;
      height = height * ratio;
    }
    
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    
    // Only set Pos if it's the first time drawing
    if (pos.x === 0 && pos.y === 0) {
      setPos({ x: width / 2, y: height / 2 });
    }
  };

  const handlePointerDown = (e) => {
    if (mode === 'drag') {
      setIsDragging(true);
      e.target.setPointerCapture(e.pointerId);
    } else if (mode === 'paint' || mode === 'pick') {
      setIsPainting(true);
      handleCanvasAction(e);
    }
  };

  const handlePointerMove = (e) => {
    if (mode === 'drag' && isDragging) {
      setPos(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    } else if (isPainting) {
      handleCanvasAction(e);
    }
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    setIsPainting(false);
  };

  const handleCanvasAction = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'paint') {
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fillStyle = color;
      
      // Soft brush effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.fill();
      
      // Reset shadow for other drawings
      ctx.shadowBlur = 0;
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.header}>
        <h3 className={styles.title}>Room Previewer</h3>
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
      </div>

      {!bgImage ? (
        <div className={styles.uploadContainer}>
          <h2>Take a Photo of the Room</h2>
          <p>We'll drop the sofa directly into the customer's space!</p>
          <label className={styles.uploadBtn}>
            Open Camera
            <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} />
          </label>
        </div>
      ) : (
        <>
          <div className={styles.toolbar}>
            <button 
              className={`${styles.toolBtn} ${mode === 'drag' ? styles.active : ''}`}
              onClick={() => setMode('drag')}
            >
              🖐️ Drag Sofa
            </button>
            <label className={styles.toolBtn} style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
              🎨 Choose Color
              <input 
                type="color" 
                value={color === '#aaaaaa' ? '#ffffff' : color} 
                onChange={(e) => {
                  setColor(e.target.value);
                  setMode('drag');
                }}
                style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', left: 0, top: 0, cursor: 'pointer' }}
              />
            </label>
            <button 
              className={`${styles.toolBtn} ${showTextures ? styles.active : ''}`}
              onClick={() => setShowTextures(!showTextures)}
            >
              🧵 Choose Fabric
            </button>
            <button 
              className={`${styles.toolBtn} ${mode === 'paint' ? styles.active : ''}`}
              onClick={() => setMode('paint')}
            >
              🧹 Paint Eraser
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ color: 'white', fontSize: '12px' }}>Size:</span>
              <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.05" 
                value={scale} 
                onChange={(e) => setScale(parseFloat(e.target.value))}
                style={{ width: '80px' }}
              />
            </div>
          </div>

            {showTextures && (
              <div className={styles.texturePanel} style={{ display: 'flex', gap: '10px', padding: '10px', background: '#333', overflowX: 'auto' }}>
                <div 
                  onClick={() => { setTexture(null); setColor('#aaaaaa'); }}
                  style={{ minWidth: '50px', height: '50px', borderRadius: '5px', cursor: 'pointer', border: !texture ? '2px solid white' : '2px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#444', color: 'white', fontSize: '10px', textAlign: 'center' }}
                >
                  Clear
                </div>
                {availableTextures.map((tex, i) => (
                  <div 
                    key={i}
                    onClick={() => { setTexture(tex.src); setMode('drag'); }}
                    style={{
                      minWidth: '50px', height: '50px', borderRadius: '5px', cursor: 'pointer',
                      backgroundImage: `url(${tex.src})`, backgroundSize: 'cover',
                      border: texture === tex.src ? '2px solid white' : '2px solid transparent'
                    }}
                    title={tex.name}
                  />
                ))}
              </div>
            )}

            <div className={styles.workspace}>
              <div className={styles.canvasContainer}>
                <canvas 
                  ref={canvasRef} 
                  className={styles.roomCanvas}
                  onClick={handleCanvasAction}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                />
                
                {mode === 'drag' && (
                  <div 
                    className={styles.productOverlay}
                    style={{
                      left: pos.x + 'px',
                      top: pos.y + 'px',
                      transform: `translate(-50%, -50%) scale(${scale})`,
                      pointerEvents: 'none' // Let canvas handle pointer events to avoid dragging issues
                    }}
                  >
                    <img 
                      src={productImage} 
                      style={{ display: 'block', width: '100%', height: 'auto' }}
                      alt="Product Overlay"
                    />
                    {texture && (
                      <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundImage: `url(${texture})`,
                        backgroundSize: '150px',
                        backgroundRepeat: 'repeat',
                        mixBlendMode: 'multiply',
                        WebkitMaskImage: `url(${productImage})`,
                        WebkitMaskSize: '100% 100%',
                        WebkitMaskRepeat: 'no-repeat',
                        opacity: 1
                      }} />
                    )}
                    {color !== '#aaaaaa' && (
                      <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: color,
                        mixBlendMode: 'multiply',
                        WebkitMaskImage: `url(${productImage})`,
                        WebkitMaskSize: '100% 100%',
                        WebkitMaskRepeat: 'no-repeat',
                        opacity: texture ? 0.6 : 0.85
                      }} />
                    )}
                  </div>
                )}
                {mode !== 'drag' && (
                   <img 
                   src={productImage} 
                   className={styles.productOverlay}
                   style={{
                     left: pos.x + 'px',
                     top: pos.y + 'px',
                     transform: `translate(-50%, -50%) scale(${scale})`,
                     opacity: 0.3, // make it ghosted while painting
                     pointerEvents: 'none'
                   }}
                   alt="Product Overlay Ghost"
                 />
                )}
              </div>
            </div>
        </>
      )}
    </div>
  );
}
