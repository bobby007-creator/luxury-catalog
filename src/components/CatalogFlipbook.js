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
          src={`/images/cover_image.png`} 
          onError={(e) => { e.target.onerror = null; e.target.src = "/images/hero_cover.png"; }}
          alt="Luxury Living Room" 
          className={styles.coverBgImage}
        />
        <div className={styles.coverOverlay}></div>
        <div className={styles.coverContent}>
          <div className={styles.logoWrapper}>
            <img 
              src={`/images/logo.png`} 
              onError={(e) => { e.target.onerror = null; e.target.src = "/images/hero_cover.png"; }}
              alt="Logo" 
              style={{ objectFit: 'contain', width: '180px', height: '100px' }} 
            />
          </div>
          <div className={styles.coverTitles} style={{ color: brand.coverTextColor || '#ffffff' }}>
            <h1 className={styles.brandName}>{brand.name}</h1>
            <p className={styles.brandTagline}>{brand.tagline}</p>
          </div>
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
              {brand.qualityCommitment && brand.qualityCommitment.length > 0 
                ? brand.qualityCommitment.map((item, idx) => <li key={idx}>{item}</li>)
                : (
                  <>
                    <li>Custom-made solutions tailored to your space</li>
                    <li>Premium international materials</li>
                    <li>Professional installation included</li>
                    <li>Lifetime warranty support</li>
                  </>
                )
              }
            </ul>
        </div>
      </div>
    </Page>
  );

  // Group Products by Category
  const groupedProducts = {};
  products.forEach(p => {
    const cat = p.category || 'Other';
    if (!groupedProducts[cat]) groupedProducts[cat] = [];
    groupedProducts[cat].push(p);
  });
  const categories = Object.keys(groupedProducts);

  // Calculate Page Indexes
  // Page 0 = Cover, Page 1 = About, Page 2 = Index
  let currentPageIndex = 3;
  const categoryStartPages = {};
  
  categories.forEach(cat => {
    categoryStartPages[cat] = currentPageIndex;
    currentPageIndex += 1; // Divider Page
    const productCount = groupedProducts[cat].length;
    currentPageIndex += Math.ceil(productCount / 2); // Product Pages
  });

  // PAGE 3: Index
  pages.push(
    <Page key="index" density="soft">
      <div className={styles.indexPage}>
        <h2 className={styles.indexTitle}>Index</h2>
        <ul className={styles.indexList}>
          {categories.map((cat) => (
            <li 
              key={cat} 
              className={styles.indexItem}
              onClick={() => {
                if (flipBookRef.current) {
                  flipBookRef.current.pageFlip().turnToPage(categoryStartPages[cat]);
                }
              }}
            >
              <span className={styles.indexItemName}>{cat}</span>
              <span className={styles.indexItemPage}>Page {categoryStartPages[cat] + 1}</span>
            </li>
          ))}
        </ul>
      </div>
    </Page>
  );

  // Render Category Dividers and Products
  categories.forEach((cat) => {
    // Divider
    pages.push(
      <Page key={`divider-${cat}`} density="hard">
        <div className={styles.sectionDivider}>
          <h2 className={styles.sectionDividerTitle}>{cat}</h2>
          <div className={styles.sectionDividerLine}></div>
          <p>Premium Collection</p>
        </div>
      </Page>
    );

    // Products
    const catProducts = groupedProducts[cat];
    for (let i = 0; i < catProducts.length; i += 2) {
      const product1 = catProducts[i];
      const product2 = catProducts[i + 1];

      pages.push(
        <Page key={`products-${cat}-${i}`} density="soft">
          <div className={styles.twoProductGrid}>
            {/* Top Product */}
            <div className={styles.productCard} onClick={() => setSelectedProduct(product1)}>
              <div className={styles.imageContainer}>
                <img 
                  id={`product-img-${product1.id || product1.name.replace(/\s+/g, '')}`}
                  src={product1.image?.startsWith('/') ? product1.image : (product1.images?.isolated?.startsWith('/') ? product1.images.isolated : `/images/products/${product1.image || product1.images?.isolated}`)}
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
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
                  <button className={styles.viewSpecsBtn} onClick={(e) => { e.stopPropagation(); setSelectedProduct(product1); }}>Details</button>
                  <button className={styles.previewBtn} onClick={(e) => { e.stopPropagation(); setPreviewingProductImage(product1.image?.startsWith('/') ? product1.image : (product1.images?.isolated?.startsWith('/') ? product1.images.isolated : `/images/products/${product1.image || product1.images?.isolated}`)); }}>Preview in Room</button>
                  <button className={styles.viewSpecsBtn} onClick={(e) => { e.stopPropagation(); setZoomingProductImage(product1.image?.startsWith('/') ? product1.image : (product1.images?.isolated?.startsWith('/') ? product1.images.isolated : `/images/products/${product1.image || product1.images?.isolated}`)); }}>🔎 Zoom</button>
                </div>
              </div>
            </div>

            {/* Bottom Product (if exists) */}
            {product2 ? (
              <div className={styles.productCard} onClick={() => setSelectedProduct(product2)}>
                <div className={styles.imageContainer}>
                  <img 
                    id={`product-img-${product2.id || product2.name.replace(/\s+/g, '')}`}
                    src={product2.image?.startsWith('/') ? product2.image : (product2.images?.isolated?.startsWith('/') ? product2.images.isolated : `/images/products/${product2.image || product2.images?.isolated}`)}
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
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
                  <button className={styles.viewSpecsBtn} onClick={(e) => { e.stopPropagation(); setSelectedProduct(product2); }}>Details</button>
                  <button className={styles.previewBtn} onClick={(e) => { e.stopPropagation(); setPreviewingProductImage(product2.image?.startsWith('/') ? product2.image : (product2.images?.isolated?.startsWith('/') ? product2.images.isolated : `/images/products/${product2.image || product2.images?.isolated}`)); }}>Preview in Room</button>
                  <button className={styles.viewSpecsBtn} onClick={(e) => { e.stopPropagation(); setZoomingProductImage(product2.image?.startsWith('/') ? product2.image : (product2.images?.isolated?.startsWith('/') ? product2.images.isolated : `/images/products/${product2.image || product2.images?.isolated}`)); }}>🔎 Zoom</button>
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
  });

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
          productImage={`${previewingProductImage}`}
          onClose={() => setPreviewingProductImage(null)} 
        />
      )}

      {zoomingProductImage && (
        <ZoomGallery 
          imageSrc={`${zoomingProductImage}`}
          onClose={() => setZoomingProductImage(null)} 
        />
      )}

      {/* Render Product Modal Conditionally outside the FlipBook DOM */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onPreview={() => {
            const img = selectedProduct.image?.startsWith('/') ? selectedProduct.image : (selectedProduct.images?.isolated?.startsWith('/') ? selectedProduct.images.isolated : `/images/products/${selectedProduct.image || selectedProduct.images?.isolated}`);
            setSelectedProduct(null);
            setPreviewingProductImage(img);
          }}
        />
      )}
    </div>
  );
}