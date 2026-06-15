import React, { useState } from 'react';

// Maps common color names to CSS filter strings that can tint an image
const getFilterForColor = (colorName) => {
  const c = colorName.toLowerCase().trim();
  
  // Basic hue rotations from a default beige/grey base
  if (c.includes('green') || c.includes('emerald')) return 'sepia(1) hue-rotate(80deg) saturate(3) brightness(0.8)';
  if (c.includes('blue') || c.includes('navy')) return 'sepia(1) hue-rotate(180deg) saturate(3) brightness(0.8)';
  if (c.includes('red') || c.includes('crimson')) return 'sepia(1) hue-rotate(330deg) saturate(4) brightness(0.9)';
  if (c.includes('purple')) return 'sepia(1) hue-rotate(240deg) saturate(3)';
  if (c.includes('yellow') || c.includes('gold')) return 'sepia(1) hue-rotate(20deg) saturate(4) brightness(1.1)';
  if (c.includes('black') || c.includes('charcoal')) return 'brightness(0.3) contrast(1.5)';
  if (c.includes('white') || c.includes('ivory')) return 'brightness(1.5) saturate(0)';
  if (c.includes('brown') || c.includes('leather')) return 'sepia(1) hue-rotate(0deg) saturate(2) brightness(0.7)';
  
  // Default no filter
  return 'none';
};

// Map color names to Hex values for the swatches
const getHexForColor = (colorName) => {
  const c = colorName.toLowerCase().trim();
  if (c.includes('green')) return '#2ecc71';
  if (c.includes('emerald')) return '#27ae60';
  if (c.includes('blue')) return '#3498db';
  if (c.includes('navy')) return '#2c3e50';
  if (c.includes('red')) return '#e74c3c';
  if (c.includes('purple')) return '#9b59b6';
  if (c.includes('yellow') || c.includes('gold')) return '#f1c40f';
  if (c.includes('black') || c.includes('charcoal')) return '#333333';
  if (c.includes('white') || c.includes('ivory')) return '#fdfdfd';
  if (c.includes('brown') || c.includes('leather')) return '#8e44ad'; // fallback
  return '#ccc'; // default
};

export default function ProductColors({ colors, imageId }) {
  const [selectedColor, setSelectedColor] = useState(null);

  if (!colors || colors.length === 0 || colors[0] === 'Custom Order') {
    return null; // Don't show swatches if no specific colors
  }

  const handleColorClick = (color) => {
    setSelectedColor(color);
    
    // Apply CSS filter to the target image
    const imgElement = document.getElementById(imageId);
    if (imgElement) {
      if (color) {
        imgElement.style.filter = getFilterForColor(color);
        imgElement.style.transition = 'filter 0.5s ease';
      } else {
        imgElement.style.filter = 'none';
      }
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '15px', justifyContent: 'center' }}>
      {/* Default/Original Swatch */}
      <div 
        onClick={() => handleColorClick(null)}
        title="Original"
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: 'transparent',
          border: selectedColor === null ? '2px solid #000' : '1px solid #ccc',
          cursor: 'pointer',
          backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
          backgroundSize: '8px 8px',
          backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
        }}
      />
      
      {/* Color Swatches */}
      {colors.map((color, idx) => {
        const cName = color.trim();
        return (
          <div 
            key={idx}
            onClick={() => handleColorClick(cName)}
            title={cName}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: getHexForColor(cName),
              border: selectedColor === cName ? '2px solid #000' : '1px solid #ccc',
              cursor: 'pointer',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
            }}
          />
        );
      })}
    </div>
  );
}
