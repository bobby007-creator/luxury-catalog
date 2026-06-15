import React from 'react';
import styles from './ZoomGallery.module.css';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function ZoomGallery({ imageSrc, onClose }) {
  if (!imageSrc) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.header}>
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
      </div>

      <div className={styles.workspace}>
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={5}
          centerOnInit={true}
          wheel={{ step: 0.1 }}
          doubleClick={{ step: 0.5 }}
          pinch={{ step: 5 }}
        >
          {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
            <React.Fragment>
              <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                <img src={imageSrc} alt="Zoomed Product" className={styles.image} />
              </TransformComponent>
            </React.Fragment>
          )}
        </TransformWrapper>
      </div>
      
      <p className={styles.helpText}>Pinch or Double-Tap to Zoom</p>
    </div>
  );
}
