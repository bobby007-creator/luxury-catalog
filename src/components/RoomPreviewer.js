import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './RoomPreviewer.module.css';

export default function RoomPreviewer({ productImage, initialColor, initialTexture, onClose }) {
  const [bgImage, setBgImage] = useState(null);
  const [mode, setMode] = useState('drag'); // 'drag', 'pick', 'paint'
  const [color, setColor] = useState(initialColor || '#aaaaaa');
  const [texture, setTexture] = useState(initialTexture || null);
  const [showTextures, setShowTextures] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [processedProductImage, setProcessedProductImage] = useState(productImage);
  const [isProcessingImg, setIsProcessingImg] = useState(true);
  
  // Measurement state
  const [measurements, setMeasurements] = useState([]);
  const [currentMeasurement, setCurrentMeasurement] = useState(null);

  // Controls
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPainting, setIsPainting] = useState(false);
  
  // Touch & Pointer state
  const [lastPointerPos, setLastPointerPos] = useState(null);
  const [initialPinchDist, setInitialPinchDist] = useState(null);
  const [initialPinchScale, setInitialPinchScale] = useState(null);
  const [initialPinchAngle, setInitialPinchAngle] = useState(null);
  const [initialRotation, setInitialRotation] = useState(null);

  useEffect(() => {
    if (initialColor) setColor(initialColor);
    if (initialTexture) setTexture(initialTexture);
  }, [initialColor, initialTexture]);

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

  const handleCustomFabricUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTexture(url);
      setMode('drag'); // Switch to drag so they can position the sofa
    }
  };

  const drawBackground = useCallback((img) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Scale canvas to fit window
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight - 180; // account for header and toolbar
    
    // Unconditionally scale to fit maximum available window space
    const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
    const width = img.width * ratio;
    const height = img.height * ratio;
    
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    
    // Only set Pos if it's the first time drawing
    if (pos.x === 0 && pos.y === 0) {
      setPos({ x: width / 2, y: height / 2 });
    }
  }, [pos.x, pos.y]);

  useEffect(() => {
    if (bgImage && imgRef.current) {
      drawBackground(imgRef.current);
    }
  }, [bgImage, drawBackground]);

  // Magic White Background Remover & Smart Fill for Line Drawings
  useEffect(() => {
    setIsProcessingImg(true);
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Check if image already has transparency
        let hasTransparency = false;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 250) {
            hasTransparency = true;
            break;
          }
        }
        
        // 1. If it's a solid square (no transparency), remove the white background!
        if (!hasTransparency) {
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // If pixel is very close to white
            if (r > 240 && g > 240 && b > 240) {
              const brightness = (r + g + b) / 3;
              if (brightness > 252) {
                data[i + 3] = 0; // Fully transparent
              } else {
                // Soft edge blending
                data[i + 3] = Math.max(0, 255 - ((brightness - 240) * 17));
              }
            }
          }
        }

        // 2. SMART FILL: Fill internal transparent pixels with white!
        // This fixes line drawings where the body of the sofa was accidentally made transparent
        const w = canvas.width;
        const h = canvas.height;
        const outside = new Uint8Array(w * h);
        const stack = [];
        
        // Add all edge pixels to stack if they are transparent
        for (let x = 0; x < w; x++) {
          if (data[(x) * 4 + 3] < 50) { stack.push(x); outside[x] = 1; }
          if (data[((h-1)*w + x) * 4 + 3] < 50) { stack.push((h-1)*w + x); outside[(h-1)*w + x] = 1; }
        }
        for (let y = 0; y < h; y++) {
          if (data[(y*w) * 4 + 3] < 50) { stack.push(y*w); outside[y*w] = 1; }
          if (data[(y*w + w - 1) * 4 + 3] < 50) { stack.push(y*w + w - 1); outside[y*w + w - 1] = 1; }
        }
        
        // Flood fill to find all OUTSIDE transparent pixels
        const dirs = [-1, 1, -w, w];
        while (stack.length > 0) {
          const idx = stack.pop();
          for (let i = 0; i < dirs.length; i++) {
            const nIdx = idx + dirs[i];
            if (nIdx >= 0 && nIdx < w * h) {
               // Prevent wrapping horizontally
               if (dirs[i] === 1 && nIdx % w === 0) continue;
               if (dirs[i] === -1 && (idx % w === 0)) continue;
               
               if (outside[nIdx] === 0 && data[nIdx * 4 + 3] < 50) {
                 outside[nIdx] = 1;
                 stack.push(nIdx);
               }
            }
          }
        }
        
        // Now, any pixel that is transparent (alpha < 50) AND is NOT outside, must be INSIDE!
        // Fill it with pure white so it becomes part of the product mask
        for (let i = 0; i < w * h; i++) {
          if (data[i * 4 + 3] < 50 && outside[i] === 0) {
             data[i * 4] = 255;
             data[i * 4 + 1] = 255;
             data[i * 4 + 2] = 255;
             data[i * 4 + 3] = 255;
          }
        }

        ctx.putImageData(imageData, 0, 0);
        setProcessedProductImage(canvas.toDataURL('image/png'));
      } catch (e) {
        // Fallback if crossOrigin taints canvas
        setProcessedProductImage(productImage);
      }
      setIsProcessingImg(false);
    };
    img.onerror = () => {
      setProcessedProductImage(productImage);
      setIsProcessingImg(false);
    };
    img.src = productImage;
  }, [productImage]);

  const handlePointerDown = (e) => {
    if (mode === 'drag') {
      setIsDragging(true);
      setLastPointerPos({ x: e.clientX, y: e.clientY });
      if (e.target.setPointerCapture) {
        e.target.setPointerCapture(e.pointerId);
      }
    } else if (mode === 'paint' || mode === 'pick') {
      setIsPainting(true);
      handleCanvasAction(e);
    } else if (mode === 'measure') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCurrentMeasurement({ startX: x, startY: y, endX: x, endY: y });
      if (e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (mode === 'measure' && currentMeasurement) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCurrentMeasurement(prev => ({ ...prev, endX: x, endY: y }));
    } else if (mode === 'drag' && isDragging && lastPointerPos) {
      // If we're tracking a touch pinch, don't drag with pointer
      if (initialPinchDist !== null) return;
      
      const dx = e.clientX - lastPointerPos.x;
      const dy = e.clientY - lastPointerPos.y;
      setPos(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      setLastPointerPos({ x: e.clientX, y: e.clientY });
    } else if (isPainting) {
      handleCanvasAction(e);
    }
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    setIsPainting(false);
    setLastPointerPos(null);
    if (mode === 'measure' && currentMeasurement) {
      // Complete measurement
      const label = window.prompt("Enter measurement (e.g. '120 inches', 'Wall'):", "");
      if (label && label.trim() !== "") {
        setMeasurements([...measurements, { ...currentMeasurement, label }]);
      }
      setCurrentMeasurement(null);
    }
    if (e.target.releasePointerCapture) {
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  const handleTouchStart = (e) => {
    if (mode === 'drag' && e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setInitialPinchDist(dist);
      setInitialPinchScale(scale);
      
      const angle = Math.atan2(
        e.touches[1].clientY - e.touches[0].clientY,
        e.touches[1].clientX - e.touches[0].clientX
      ) * (180 / Math.PI);
      setInitialPinchAngle(angle);
      setInitialRotation(rotation);
    }
  };

  const handleTouchMove = (e) => {
    if (mode === 'drag' && e.touches.length === 2 && initialPinchDist) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const newScale = initialPinchScale * (dist / initialPinchDist);
      setScale(Math.max(0.1, Math.min(newScale, 5))); // clamp between 0.1 and 5
      
      if (initialPinchAngle !== null && initialRotation !== null) {
        const angle = Math.atan2(
          e.touches[1].clientY - e.touches[0].clientY,
          e.touches[1].clientX - e.touches[0].clientX
        ) * (180 / Math.PI);
        
        let angleDiff = angle - initialPinchAngle;
        if (angleDiff > 180) angleDiff -= 360;
        if (angleDiff < -180) angleDiff += 360;
        
        setRotation(initialRotation + angleDiff);
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      setInitialPinchDist(null);
      setInitialPinchScale(null);
      setInitialPinchAngle(null);
      setInitialRotation(null);
    }
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
          <p>We&apos;ll drop the sofa directly into the customer&apos;s space!</p>
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
              🖐 Drag
            </button>
            <button 
              className={`${styles.toolBtn} ${showColors ? styles.active : ''}`}
              onClick={() => {
                setShowColors(!showColors);
                if (!showColors) setShowTextures(false);
              }}
            >
              🎨 Colors
            </button>
            <button 
              className={`${styles.toolBtn} ${showTextures ? styles.active : ''}`}
              onClick={() => {
                setShowTextures(!showTextures);
                if (!showTextures) setShowColors(false);
              }}
            >
              🧵 Fabrics
            </button>
            <button 
              className={`${styles.toolBtn} ${mode === 'paint' ? styles.active : ''}`}
              onClick={() => setMode('paint')}
            >
              🖌 Paint Eraser
            </button>
            <button 
              className={`${styles.toolBtn} ${mode === 'measure' ? styles.active : ''}`}
              onClick={() => setMode('measure')}
              style={{ background: mode === 'measure' ? '#f9d423' : '#444', color: mode === 'measure' ? '#000' : '#fff' }}
            >
              📏 Measure
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
                style={{ width: '60px' }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ color: 'white', fontSize: '12px' }}>Tilt:</span>
              <input 
                type="range" 
                min="-180" 
                max="180" 
                step="1" 
                value={rotation} 
                onChange={(e) => setRotation(parseFloat(e.target.value))}
                style={{ width: '60px' }}
              />
            </div>
          </div>

            {showColors && (
              <div className={styles.texturePanel} style={{ display: 'flex', gap: '15px', padding: '15px', background: '#222', overflowX: 'auto', alignItems: 'center' }}>
                <div 
                  onClick={() => { setColor('#aaaaaa'); setTexture(null); }}
                  style={{ minWidth: '40px', height: '40px', borderRadius: '20px', cursor: 'pointer', border: color === '#aaaaaa' ? '2px solid white' : '2px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#444', color: 'white', fontSize: '10px' }}
                >
                  Reset
                </div>
                {presetColors.map(c => (
                  <div 
                    key={c.name}
                    onClick={() => { setColor(c.hex); setTexture(null); }}
                    title={c.name}
                    style={{
                      minWidth: '40px', height: '40px', borderRadius: '20px',
                      backgroundColor: c.hex,
                      cursor: 'pointer',
                      border: color === c.hex ? '3px solid white' : '1px solid rgba(255,255,255,0.2)',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                ))}
                
                {/* Custom Color Picker */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '10px', borderLeft: '1px solid #444', paddingLeft: '15px' }}>
                  <label style={{ fontSize: '10px', color: '#ccc', marginBottom: '5px' }}>Custom</label>
                  <input 
                    type="color" 
                    value={color === '#aaaaaa' ? '#ffffff' : color} 
                    onChange={(e) => {
                      setColor(e.target.value);
                      setTexture(null);
                    }}
                    style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '20px', cursor: 'pointer', background: 'transparent' }}
                  />
                </div>
              </div>
            )}

            {showTextures && (
              <div className={styles.texturePanel} style={{ display: 'flex', gap: '10px', padding: '10px', background: '#333', overflowX: 'auto' }}>
                <div 
                  onClick={() => { setTexture(null); setColor('#aaaaaa'); }}
                  style={{ minWidth: '50px', height: '50px', borderRadius: '5px', cursor: 'pointer', border: !texture ? '2px solid white' : '2px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#444', color: 'white', fontSize: '10px', textAlign: 'center' }}
                >
                  Clear
                </div>

                {/* Custom Fabric Capture */}
                <label style={{ 
                  minWidth: '50px', height: '50px', borderRadius: '5px', cursor: 'pointer', 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                  background: '#f9d423', color: '#000', fontSize: '24px' 
                }} title="Capture Fabric">
                  📷
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    onChange={handleCustomFabricUpload}
                    style={{ display: 'none' }} 
                  />
                </label>
                
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
              <div 
                className={styles.canvasContainer}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                style={{ touchAction: mode === 'drag' ? 'none' : 'auto' }} // Prevent scrolling when dragging/pinching
              >
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
                      transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
                      pointerEvents: 'none', // Let canvas handle pointer events to avoid dragging issues
                      opacity: isProcessingImg ? 0.5 : 1
                    }}
                  >
                    <img 
                      src={processedProductImage} 
                      style={{ display: 'block', width: '100%', height: 'auto' }}
                      alt="Product Overlay"
                    />
                    {texture && (
                      <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundImage: `url("${texture}")`,
                        backgroundSize: '150px',
                        backgroundRepeat: 'repeat',
                        mixBlendMode: 'multiply',
                        WebkitMaskImage: `url("${processedProductImage}")`,
                        WebkitMaskSize: '100% 100%',
                        WebkitMaskRepeat: 'no-repeat',
                        maskImage: `url("${processedProductImage}")`,
                        maskSize: '100% 100%',
                        maskRepeat: 'no-repeat',
                        opacity: 1
                      }} />
                    )}
                    {color !== '#aaaaaa' && (
                      <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: color,
                        mixBlendMode: 'multiply',
                        WebkitMaskImage: `url("${processedProductImage}")`,
                        WebkitMaskSize: '100% 100%',
                        WebkitMaskRepeat: 'no-repeat',
                        maskImage: `url("${processedProductImage}")`,
                        maskSize: '100% 100%',
                        maskRepeat: 'no-repeat',
                        opacity: texture ? 0.6 : 0.9
                      }} />
                    )}
                  </div>
                )}
                {mode !== 'drag' && (
                   <img 
                   src={processedProductImage} 
                   className={styles.productOverlay}
                   style={{
                     left: pos.x + 'px',
                     top: pos.y + 'px',
                     transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
                     opacity: 0.3, // make it ghosted while painting or measuring
                     pointerEvents: 'none'
                   }}
                   alt="Product Overlay Ghost"
                 />
                )}

                {/* SVG Overlay for Measurements */}
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 100 }}>
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#f9d423" />
                    </marker>
                    <marker id="arrowhead-start" markerWidth="10" markerHeight="7" refX="1" refY="3.5" orient="auto">
                      <polygon points="10 0, 0 3.5, 10 7" fill="#f9d423" />
                    </marker>
                  </defs>
                  
                  {measurements.map((m, i) => {
                    const midX = (m.startX + m.endX) / 2;
                    const midY = (m.startY + m.endY) / 2;
                    return (
                      <g key={i}>
                        <line x1={m.startX} y1={m.startY} x2={m.endX} y2={m.endY} stroke="#f9d423" strokeWidth="3" markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
                        <rect x={midX - (m.label.length * 4.5)} y={midY - 12} width={m.label.length * 9} height="24" fill="rgba(0,0,0,0.8)" rx="4" />
                        <text x={midX} y={midY + 4} fill="#fff" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">{m.label}</text>
                      </g>
                    );
                  })}

                  {currentMeasurement && (
                    <line x1={currentMeasurement.startX} y1={currentMeasurement.startY} x2={currentMeasurement.endX} y2={currentMeasurement.endY} stroke="#f9d423" strokeWidth="3" strokeDasharray="5,5" />
                  )}
                </svg>

              </div>
            </div>
        </>
      )}
    </div>
  );
}
