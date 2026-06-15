import React, { useState, useRef, useEffect } from 'react';
import styles from './RoomPreviewer.module.css';

export default function RoomPreviewer({ productImage, onClose }) {
  const [bgImage, setBgImage] = useState(null);
  const [mode, setMode] = useState('drag'); // 'drag', 'pick', 'paint'
  const [color, setColor] = useState('#aaaaaa');
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPainting, setIsPainting] = useState(false);
  
  const canvasRef = useRef(null);
  const imgRef = useRef(null); // original background image reference

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          setBgImage(img);
          imgRef.current = img;
          drawBackground(img);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

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
    
    // Center product overlay initially
    setPos({ x: width / 2, y: height / 2 });
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
    if (mode === 'pick') {
      // Auto-switch to paint after picking a color
      setMode('paint');
    }
  };

  const handleCanvasAction = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'pick') {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      setColor(`rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`);
    } else if (mode === 'paint') {
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
            <button 
              className={`${styles.toolBtn} ${mode === 'pick' ? styles.active : ''}`}
              onClick={() => setMode('pick')}
            >
              💧 Pick Color
            </button>
            <button 
              className={`${styles.toolBtn} ${mode === 'paint' ? styles.active : ''}`}
              onClick={() => setMode('paint')}
            >
              🖌️ Paint Eraser
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

          <div className={styles.workspace}>
            <div className={styles.canvasContainer}>
              <canvas 
                ref={canvasRef}
                className={styles.roomCanvas}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              />
              
              {mode === 'drag' && (
                <img 
                  src={productImage} 
                  className={styles.productOverlay}
                  style={{
                    left: pos.x + 'px',
                    top: pos.y + 'px',
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    pointerEvents: 'none' // Let canvas handle pointer events to avoid dragging issues
                  }}
                  alt="Product Overlay"
                />
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
