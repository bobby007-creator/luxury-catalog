import React, { useRef, useState, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import styles from "./CatalogFlipbookStyles.module.css";
import RoomPreviewer from "./RoomPreviewer";
import ZoomGallery from "./ZoomGallery";
import ProductColors from "./ProductColors";
import ProductModal from "./ProductModal";
import { Check, Phone, Globe, MapPin } from "lucide-react";

const Page = React.forwardRef((props, ref) => {
  return (
    <div className={styles.page} ref={ref} data-density={props.density || "hard"}>
      <div className={styles.pageContent}>
        {props.children}
      </div>
    </div>
  );
});

Page.displayName = 'Page';

export default function CatalogFlipbook({ catalogData, cacheBuster }) {
  const flipBookRef = useRef(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [previewingProductImage, setPreviewingProductImage] = useState(null);
  const [zoomingProductImage, setZoomingProductImage] = useState(null);

  const formatPrice = (priceStr) => {
    if (!priceStr) return "";
    if (/[a-zA-Z]/.test(priceStr) || priceStr.includes('₹')) return priceStr;
    return `₹ ${priceStr}`;
  };

  const { brand, products } = catalogData;

  const handleConsultationSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  const pages = [];

  // PAGE 1: Cover
  pages.push(
    <Page key="cover" density="hard">
      <div className={styles.coverPage}>
        <img 
          src={`/images/cover_image.png?v=${cacheBuster}`} 
          onError={(e) => { e.target.onerror = null; e.target.src = "/images/hero_cover.png"; }}
          alt="Luxury Living Room" 
          className={styles.coverBgImage}
        />
        <div className={styles.coverOverlay}></div>
        <div className={styles.coverContent}>
          <div className={styles.logoWrapper}>
            <img 
              src={`/images/logo.png?v=${cacheBuster}`} 
              onError={(e) => { e.target.onerror = null; e.target.src = "/images/hero_cover.png"; }}
              alt="Logo" 
              style={{ objectFit: 'contain', width: '180px', height: '100px' }} 
            />
          </div>
          <h1 className={styles.coverTitle}>{brand.name}</h1>
          <p className={styles.coverTagline}>{brand.tagline}</p>
        </div>
      </div>
    </Page>
  );

  // PAGE 2: About Us
  pages.push(
    <Page key="about" density="soft">
      <div className={styles.textPage}>
        <h2 className={styles.sectionTitle}>About Us</h2>
        <div className={styles.divider}></div>
        <p className={styles.bodyText}>{brand.about}</p>
        <div className={styles.qualityCommitment}>
          <h3>Our Quality Commitment</h3>
          <ul>
            <li>Custom-made solutions tailored to your space</li>
            <li>Premium international materials</li>
            <li>Professional installation included</li>
            <li>Lifetime warranty support</li>
          </ul>
        </div>
      </div>
    </Page>
  );

  // PRODUCT PAGES (2 products per page)
  for (let i = 0; i < products.length; i += 2) {
    const product1 = products[i];
    const product2 = products[i + 1]; // might be undefined

    pages.push(
      <Page key={`products-${i}`} density="soft">
        <div className={styles.twoProductGrid}>
          {/* Top Product */}
          <div className={styles.productCard} onClick={() => setSelectedProduct(product1)}>
            <div className={styles.imageContainer}>
              <img 
                id={`product-img-${product1.id || product1.name.replace(/\s+/g, '')}`}
                src={`/images/products/${product1.image}`} 
                alt={product1.name} 
                className={styles.cardImage} 
              />
            </div>
            <div className={styles.cardDetails}>
              <span className={styles.cardCategory}>{product1.category}</span>
              <h3 className={styles.cardTitle}>{product1.name}</h3>
              <p className={styles.cardPrice}>{formatPrice(product1.priceRange)}</p>
              <ProductColors 
                colors={product1.colors} 
                imageId={`product-img-${product1.id || product1.name.replace(/\s+/g, '')}`} 
              />
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '15px' }}>
                <button className={styles.viewSpecsBtn} onClick={() => setSelectedProduct(product1)}>View Details</button>
                <button className={styles.viewSpecsBtn} onClick={() => setPreviewingProductImage(`/images/products/${product1.image}`)}>Preview in Room</button>
                <button className={styles.viewSpecsBtn} onClick={() => setZoomingProductImage(`/images/products/${product1.image}`)}>🔍 Zoom</button>
              </div>
            </div>
          </div>

          {/* Bottom Product (if exists) */}
          {product2 ? (
            <div className={styles.productCard} onClick={() => setSelectedProduct(product2)}>
              <div className={styles.imageContainer}>
                <img 
                  id={`product-img-${product2.id || product2.name.replace(/\s+/g, '')}`}
                  src={`/images/products/${product2.image}`} 
                  alt={product2.name} 
                  className={styles.cardImage} 
                />
              </div>
              <div className={styles.cardDetails}>
                <span className={styles.cardCategory}>{product2.category}</span>
                <h3 className={styles.cardTitle}>{product2.name}</h3>
                <p className={styles.cardPrice}>{formatPrice(product2.priceRange)}</p>
                <ProductColors 
                  colors={product2.colors} 
                  imageId={`product-img-${product2.id || product2.name.replace(/\s+/g, '')}`} 
                />
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '15px' }}>
                  <button className={styles.viewSpecsBtn} onClick={() => setSelectedProduct(product2)}>View Details</button>
                  <button className={styles.viewSpecsBtn} onClick={() => setPreviewingProductImage(`/images/products/${product2.image}`)}>Preview in Room</button>
                  <button className={styles.viewSpecsBtn} onClick={() => setZoomingProductImage(`/images/products/${product2.image}`)}>🔍 Zoom</button>
                </div>
              </div>
            </div>
          ) : (
             <div className={styles.emptyCard}></div>
          )}
        </div>
      </Page>
    );
  }

  // Ensure pages count is even (Flipbook requires even number of pages to avoid crash)
  if (pages.length % 2 !== 0) {
     pages.push(
      <Page key="padding-page" density="soft">
        <div className={styles.textPage}>
          <div className={styles.logoWrapper} style={{opacity: 0.3, marginTop: 'auto', marginBottom: 'auto'}}>
            <img 
              src={`/images/logo.png?v=${cacheBuster}`} 
              onError={(e) => { e.target.onerror = null; e.target.src = "/images/hero_cover.png"; }}
              alt="Logo" 
              style={{ objectFit: 'contain', width: '150px' }} 
            />
          </div>
        </div>
      </Page>
    );
  }

  // BACK COVER / CONSULTATION
  pages.push(
    <Page key="back-cover-front" density="hard">
      <div className={styles.backCover}>
        <div className={styles.logoWrapper}>
          <img 
              src={`/images/logo.png?v=${cacheBuster}`} 
              onError={(e) => { e.target.onerror = null; e.target.src = "/images/hero_cover.png"; }}
              alt="Logo" 
              style={{ objectFit: 'contain', width: '180px', height: '100px' }} 
          />
        </div>
        <h2>Let's Design Your Space</h2>
        
        {!formSubmitted ? (
          <form className={styles.consultationForm} onSubmit={handleConsultationSubmit}>
            <p>Request a free measurement & layout consultation</p>
            <input type="text" placeholder="Your Name" required />
            <input type="tel" placeholder="Phone Number" required />
            <input type="text" placeholder="Approx. Room Dimensions (e.g. 12x14 ft)" required />
            <button type="submit" className={styles.submitBtn}>Book Consultation</button>
          </form>
        ) : (
          <div className={styles.successMessage}>
            <Check size={40} color="var(--color-accent-light)" />
            <h3>Request Received!</h3>
            <p>Our master designer will call you shortly.</p>
          </div>
        )}

        <div className={styles.contactInfo}>
          <p><Phone size={18} /> {brand.contact?.phone}</p>
          <p><Globe size={18} /> {brand.contact?.website}</p>
          <p><MapPin size={18} /> {brand.contact?.address}</p>
        </div>
      </div>
    </Page>
  );

  // PAGE: Back Cover Outside
  pages.push(
    <Page key="back-cover-back" density="hard">
      <div className={`${styles.coverPage} ${styles.backCover}`}>
        <h2>{brand.name}</h2>
        <p>{brand.about}</p>
      </div>
    </Page>
  );

  return (
    <div className={styles.container}>
      <HTMLFlipBook
        width={550}
        height={750}
        size="stretch"
        minWidth={200}
        maxWidth={1000}
        minHeight={200}
        maxHeight={1533}
        maxShadowOpacity={0.5}
        showCover={true}
        mobileScrollSupport={true}
        className={styles.flipbook}
        ref={flipBookRef}
      >
        {pages}
      </HTMLFlipBook>

      {previewingProductImage && (
        <RoomPreviewer 
          productImage={`${previewingProductImage}?v=${cacheBuster}`}
          onClose={() => setPreviewingProductImage(null)} 
        />
      )}

      {zoomingProductImage && (
        <ZoomGallery 
          imageSrc={`${zoomingProductImage}?v=${cacheBuster}`}
          onClose={() => setZoomingProductImage(null)} 
        />
      )}

      {/* Render Product Modal Conditionally outside the FlipBook DOM */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}