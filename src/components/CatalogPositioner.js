import React, { useState, useRef } from 'react';

export default function CatalogPositioner({ product, onSave, onClose }) {
  const [scale, setScale] = useState(product.placement?.scale || 1);
  const [posX, setPosX] = useState(product.placement?.x || 0);
  const [posY, setPosY] = useState(product.placement?.y || 15);
  const [rotation, setRotation] = useState(product.placement?.rotation || 0);
  const [tilt, setTilt] = useState(product.placement?.tilt || 0);

  // Touch and drag state
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0, initialPosX: 0, initialPosY: 0 });
  const startDist = useRef(0);
  const startScale = useRef(1);

  const imageUrl = product.image?.startsWith('/') ? product.image : (product.images?.isolated?.startsWith('/') ? product.images.isolated : '/images/products/' + (product.image || product.images?.isolated));

  const handleSave = () => {
    onSave({ scale, x: posX, y: posY, rotation, tilt });
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    if (e.touches && e.touches.length === 2) {
      // Pinch to zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      startDist.current = Math.sqrt(dx*dx + dy*dy);
      startScale.current = scale;
    } else {
      isDragging.current = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      startPos.current = { x: clientX, y: clientY, initialPosX: posX, initialPosY: posY };
    }
  };

  const handlePointerMove = (e) => {
    if (e.touches && e.touches.length === 2) {
      // Pinch zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const scaleChange = (dist - startDist.current) * 0.005;
      setScale(Math.max(0.1, startScale.current + scaleChange));
    } else if (isDragging.current) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      const dx = clientX - startPos.current.x;
      const dy = clientY - startPos.current.y;
      
      // Convert pixels to % and vh roughly
      setPosX(startPos.current.initialPosX + (dx * 0.15));
      setPosY(startPos.current.initialPosY + (dy * 0.15));
    }
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      touchAction: 'none' // Prevent scrolling while dragging
    }}>
      <div style={{
        padding: '10px 20px', background: '#222', color: '#fff',
        display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'center',
        borderBottom: '1px solid #444', flexWrap: 'wrap', fontSize: '14px'
      }}>
        <h4 style={{ margin: 0, width: '100%', textAlign: 'center' }}>Adjust Placement: {product.name} (Drag/Pinch Image or use Sliders)</h4>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          Scale
          <input type="range" min="0.5" max="2" step="0.05" value={scale} onChange={e => setScale(parseFloat(e.target.value))} />
        </label>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          Up/Down
          <input type="range" min="-50" max="50" step="1" value={posY} onChange={e => setPosY(parseFloat(e.target.value))} />
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          L/R
          <input type="range" min="-50" max="50" step="1" value={posX} onChange={e => setPosX(parseFloat(e.target.value))} />
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          Rot
          <input type="range" min="-180" max="180" step="1" value={rotation} onChange={e => setRotation(parseFloat(e.target.value))} />
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          Tilt (3D)
          <input type="range" min="-60" max="60" step="1" value={tilt} onChange={e => setTilt(parseFloat(e.target.value))} />
        </label>

        <button onClick={handleSave} style={{ padding: '8px 15px', background: '#cca77b', color: '#000', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
        <button onClick={onClose} style={{ padding: '8px 15px', background: '#444', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
      </div>

      <div 
        style={{
          flex: 1,
          position: 'relative',
          backgroundColor: '#0a0a0a',
          backgroundImage: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.6) 100%), url(/images/brand/room-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          overflow: 'hidden',
          perspective: '1000px' // For 3D tilt
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        <div style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: '15vh'
        }}>
           <img src={imageUrl} alt={product.name} style={{
             maxWidth: '85%',
             maxHeight: '55vh',
             objectFit: 'contain',
             filter: 'drop-shadow(0 50px 30px rgba(0,0,0,0.8)) brightness(1.05) contrast(1.1) saturate(1.1)',
             transformOrigin: 'bottom center',
             transform: 'translate(' + posX + '%, ' + (posY - 15) + 'vh) scale(' + scale + ') rotate(' + rotation + 'deg) rotateX(' + tilt + 'deg)'
           }} draggable="false" />
        </div>
      </div>
    </div>
  );
}
