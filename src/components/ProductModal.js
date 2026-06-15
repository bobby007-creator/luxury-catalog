import React from 'react';
import styles from './ProductModal.module.css';

export default function ProductModal({ product, onClose }) {
  if (!product) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        
        <div className={styles.modalGrid}>
          <div className={styles.imageColumn}>
            <div className={styles.imageWrapper}>
              <img src={product.images?.isolated} alt={product.name} />
            </div>
          </div>

          <div className={styles.infoColumn}>
            <span className={styles.categoryBadge}>{product.category}</span>
            <h2 className={styles.productName}>{product.name}</h2>
            <p className={styles.tagline}>{product.tagline}</p>
            <p className={styles.price}>{product.priceRange}</p>
            
            <div className={styles.divider}></div>
            
            <p className={styles.description}>{product.description}</p>
            
            <div className={styles.specsGrid}>
              <div className={styles.specItem}>
                <h4>Dimensions</h4>
                <p>{product.dimensions}</p>
              </div>
              <div className={styles.specItem}>
                <h4>Best Room Size</h4>
                <p>{product.bestRoomSize}</p>
              </div>
              <div className={styles.specItem}>
                <h4>Available Colors</h4>
                <div className={styles.colorChips}>
                  {product.options?.colors?.map((color, i) => (
                    <span key={i} className={styles.colorChip}>{color}</span>
                  ))}
                </div>
              </div>
              <div className={styles.specItem}>
                <h4>Compatibility</h4>
                <ul className={styles.compatList}>
                  <li><span>Small:</span> {product.compatibility?.small}</li>
                  <li><span>Medium:</span> {product.compatibility?.medium}</li>
                  <li><span>Large:</span> {product.compatibility?.large}</li>
                </ul>
              </div>
            </div>
            
            <button className={styles.inquireButton} onClick={() => alert("Sales representative has been notified.")}>
              Inquire About This Piece
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
