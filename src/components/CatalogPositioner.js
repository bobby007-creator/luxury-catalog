import React, { useState } from 'react';

export default function CatalogPositioner({ product, onSave, onClose }) {
  const [scale, setScale] = useState(product.placement?.scale || 1);
  const [posX, setPosX] = useState(product.placement?.x || 0);
  const [posY, setPosY] = useState(product.placement?.y || 15);

  const imageUrl = product.image?.startsWith('/') ? product.image : (product.images?.isolated?.startsWith('/') ? product.images.isolated : '/images/products/' + (product.image || product.images?.isolated));

  const handleSave = () => {
    onSave({ scale, x: posX, y: posY });
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999,
      display: 'flex', flexDirection: 'column'
    }}>
      <div style={{
        padding: '20px', background: '#222', color: '#fff',
        display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center',
        borderBottom: '1px solid #444', flexWrap: 'wrap'
      }}>
        <h3 style={{ margin: 0 }}>Adjust Placement: {product.name}</h3>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          Scale: {scale.toFixed(2)}
          <input type="range" min="0.5" max="2" step="0.05" value={scale} onChange={e => setScale(parseFloat(e.target.value))} />
        </label>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          Up/Down: {posY}vh
          <input type="range" min="-50" max="50" step="1" value={posY} onChange={e => setPosY(parseFloat(e.target.value))} />
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          Left/Right: {posX}%
          <input type="range" min="-50" max="50" step="1" value={posX} onChange={e => setPosX(parseFloat(e.target.value))} />
        </label>

        <button onClick={handleSave} style={{ padding: '10px 20px', background: '#cca77b', color: '#000', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Save Position</button>
        <button onClick={onClose} style={{ padding: '10px 20px', background: '#444', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
      </div>

      <div style={{
        flex: 1,
        position: 'relative',
        backgroundColor: '#0a0a0a',
        backgroundImage: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.6) 100%), url(/images/brand/room-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        overflow: 'hidden'
      }}>
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
             transform: 'translate(' + posX + '%, ' + (posY - 15) + 'vh) scale(' + scale + ')'
           }} />
        </div>
      </div>
    </div>
  );
}
