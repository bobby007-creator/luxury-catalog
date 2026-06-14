"use client";

import React, { useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import Image from "next/image";
import styles from "./CatalogFlipbookStyles.module.css";
import { Check, X, Star, MapPin, Phone, Globe, Smartphone } from "lucide-react";

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

export default function CatalogFlipbook({ catalogData }) {
  const flipBookRef = useRef(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { brand, spacePlanning, products, transformations, visualization, customFurniture } = catalogData;

  const handleConsultationSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  return (
    <div className={styles.container}>
      <HTMLFlipBook
        width={550}
        height={750}
        size="stretch"
        minWidth={315}
        maxWidth={1000}
        minHeight={400}
        maxHeight={1350}
        maxShadowOpacity={0.5}
        showCover={true}
        mobileScrollSupport={true}
        className={styles.flipbook}
        ref={flipBookRef}
      >
        {/* PAGE 1: Cover */}
        <Page density="hard">
          <div className={styles.coverPage}>
            <Image 
              src="/images/hero_cover.png" 
              alt="Luxury Living Room" 
              fill
              className={styles.coverBgImage}
              priority
            />
            <div className={styles.coverOverlay}></div>
            <div className={styles.coverContent}>
              <div className={styles.logoWrapper}>
                <Image src="/images/logo.png" alt="Logo" width={180} height={100} style={{ objectFit: 'contain' }} />
              </div>
              <h1 className={styles.coverTitle}>{brand.name}</h1>
              <p className={styles.coverTagline}>{brand.tagline}</p>
            </div>
          </div>
        </Page>

        {/* PAGE 2: About Us */}
        <Page density="soft">
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

        {/* PAGE 3: Space Planning Guide Intro */}
        <Page density="soft">
          <div className={styles.textPage}>
            <h2 className={styles.sectionTitle}>Space Planning Guide</h2>
            <div className={styles.divider}></div>
            <p className={styles.bodyText}>
              Choosing the right furniture is not just about aesthetics; it is about perfect proportions. 
              Use our visual guide to understand which collections are engineered for your specific room dimensions.
            </p>
          </div>
        </Page>

        {/* PAGE 4: Space Planning - Small & Medium */}
        <Page density="soft">
          <div className={styles.splitPage}>
            <div className={styles.spaceSection}>
              <h3>{spacePlanning.small.title}</h3>
              <p className={styles.sizeRange}>{spacePlanning.small.sizeRange}</p>
              <div className={styles.spaceImageWrapper}>
                <Image src={spacePlanning.small.image} alt="Small Room" fill className={styles.spaceImage} />
              </div>
              <p className={styles.recommended}><strong>Recommended:</strong> {spacePlanning.small.recommended.join(", ")}</p>
            </div>
            
            <div className={styles.spaceSection}>
              <h3>{spacePlanning.medium.title}</h3>
              <p className={styles.sizeRange}>{spacePlanning.medium.sizeRange}</p>
              <div className={styles.spaceImageWrapper}>
                <Image src={spacePlanning.medium.image} alt="Medium Room" fill className={styles.spaceImage} />
              </div>
              <p className={styles.recommended}><strong>Recommended:</strong> {spacePlanning.medium.recommended.join(", ")}</p>
            </div>
          </div>
        </Page>

        {/* PAGE 5: Space Planning - Large */}
        <Page density="soft">
          <div className={styles.fullPageImageWithText}>
             <Image src={spacePlanning.large.image} alt="Large Room" fill className={styles.bgImage} />
             <div className={styles.textOverlayBottom}>
                <h3>{spacePlanning.large.title}</h3>
                <p className={styles.sizeRange}>{spacePlanning.large.sizeRange}</p>
                <p className={styles.recommended}><strong>Recommended:</strong> {spacePlanning.large.recommended.join(", ")}</p>
             </div>
          </div>
        </Page>

        {/* PAGE 6: Collections Divider */}
        <Page density="hard">
          <div className={styles.dividerPage}>
            <h2>The Collections</h2>
            <p>Sofas & Beds</p>
          </div>
        </Page>

        {/* PRODUCT PAGES */}
        {products.map((product) => {
          return [
            <Page key={`${product.id}-visual`} density="soft">
              <div className={styles.productVisualPage}>
                <div className={styles.lifestyleImageWrapper}>
                  <Image src={product.images.lifestyle} alt={product.name} fill className={styles.productImage} />
                </div>
                <div className={styles.isolatedImageWrapper}>
                  <Image src={product.images.isolated} alt={product.name} fill className={styles.productImageContain} />
                </div>
              </div>
            </Page>,

            <Page key={`${product.id}-details`} density="soft">
              <div className={styles.productSpecPage}>
                <span className={styles.categoryBadge}>{product.category}</span>
                <h2 className={styles.productTitle}>{product.name}</h2>
                <p className={styles.productTagline}>{product.tagline}</p>
                <div className={styles.divider}></div>
                
                <p className={styles.productDesc}>{product.description}</p>
                
                <div className={styles.specGrid}>
                  <div>
                    <strong>Dimensions:</strong>
                    <p>{product.dimensions}</p>
                  </div>
                  <div>
                    <strong>Best Room Size:</strong>
                    <p>{product.bestRoomSize}</p>
                  </div>
                </div>

                <div className={styles.compatibilityBox}>
                  <h3>Will it fit your room?</h3>
                  <ul className={styles.compatibilityList}>
                    <li><X size={16} color="#d32f2f" /> <span><strong>Small:</strong> {product.compatibility.small.replace('❌ ', '')}</span></li>
                    <li><Check size={16} color="#388e3c" /> <span><strong>Medium:</strong> {product.compatibility.medium.replace('✅ ', '')}</span></li>
                    <li><Star size={16} color="#fbc02d" /> <span><strong>Large:</strong> {product.compatibility.large.replace('⭐ ', '')}</span></li>
                  </ul>
                </div>

                <div className={styles.optionsSection}>
                  <p><strong>Available Colors:</strong> {product.options.colors.join(" | ")}</p>
                  <p><strong>Fabric:</strong> {product.options.fabric}</p>
                </div>

                {/* AR View in Room Feature */}
                <div className={styles.arSection}>
                  <div className={styles.qrCode}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://pvrmanufacturing.com/ar/${product.id}&color=2c2a29`} 
                      alt="QR Code" 
                      width={60} 
                      height={60} 
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <div className={styles.arText}>
                    <h4><Smartphone size={16} /> View in Your Room</h4>
                    <p>Scan with your phone to see this piece in your actual space using AR.</p>
                  </div>
                </div>

                <div className={styles.priceSection}>
                  <p>Starting from</p>
                  <h3>{product.priceRange}</h3>
                </div>
              </div>
            </Page>
          ];
        })}

        {/* TRANSFORMATIONS (Before & After) */}
        {transformations && [
          <Page key="trans-1" density="soft">
            <div className={styles.fullPageImageWithText}>
              <Image src={transformations.beforeImage} alt="Before" fill className={styles.bgImage} />
              <div className={styles.textOverlayTop}>
                <h3>Before</h3>
                <p className={styles.taglineOverlay}>An Empty Canvas</p>
              </div>
            </div>
          </Page>,
          <Page key="trans-2" density="soft">
            <div className={styles.splitPage}>
              <div className={styles.textSectionHalf}>
                <h2 className={styles.sectionTitle}>{transformations.title}</h2>
                <div className={styles.divider}></div>
                <p className={styles.bodyText}>{transformations.description}</p>
              </div>
              <div className={styles.imageSectionHalf}>
                <Image src={transformations.afterImage} alt="After" fill className={styles.productImage} />
                <div className={styles.floatingLabel}>After: Perfectly Scaled</div>
              </div>
            </div>
          </Page>
        ]}

        {/* VISUALIZATION */}
        {visualization && [
          <Page key="viz-1" density="soft">
            <div className={styles.textPage}>
              <h2 className={styles.sectionTitle}>{visualization.title}</h2>
              <div className={styles.divider}></div>
              <p className={styles.bodyText}>{visualization.description}</p>
              
              <div className={styles.vizCard}>
                <h3>{visualization.apartment.title}</h3>
                <div className={styles.vizImageWrapper}>
                  <Image src={visualization.apartment.image} alt="Apartment" fill className={styles.productImage} />
                </div>
                <p className={styles.vizNote}>{visualization.apartment.note}</p>
              </div>
            </div>
          </Page>,
          <Page key="viz-2" density="soft">
            <div className={styles.textPage}>
              <div className={styles.vizCard} style={{ marginTop: '0', height: '100%' }}>
                <h3>{visualization.villa.title}</h3>
                <div className={styles.vizImageWrapper} style={{ height: '70%' }}>
                  <Image src={visualization.villa.image} alt="Villa" fill className={styles.productImage} />
                </div>
                <p className={styles.vizNote}>{visualization.villa.note}</p>
              </div>
            </div>
          </Page>
        ]}

        {/* CUSTOM FURNITURE */}
        {customFurniture && [
          <Page key="custom-1" density="soft">
            <div className={styles.fullPageImageWithText}>
              <Image src={customFurniture.image} alt="Workshop" fill className={styles.bgImage} />
            </div>
          </Page>,
          <Page key="custom-2" density="soft">
            <div className={styles.textPage}>
              <h2 className={styles.sectionTitle}>{customFurniture.title}</h2>
              <div className={styles.divider}></div>
              <p className={styles.bodyText}>{customFurniture.description}</p>
              
              <div className={styles.featuresList}>
                <h3>The Custom Experience</h3>
                <ul>
                  {customFurniture.features.map((feat, idx) => (
                    <li key={idx}><Check size={18} color="var(--color-accent)" /> {feat}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Page>
        ]}

        {/* BACK COVER / CONSULTATION */}
        <Page density="hard">
          <div className={styles.backCover}>
            <div className={styles.logoWrapper}>
              <Image src="/images/logo.png" alt="Logo" width={180} height={100} style={{ objectFit: 'contain' }} />
            </div>
            <h2>Let&apos;s Design Your Space</h2>
            
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
              <p><Phone size={18} /> {brand.contact.phone}</p>
              <p><Globe size={18} /> {brand.contact.website}</p>
              <p><MapPin size={18} /> {brand.contact.address}</p>
            </div>
          </div>
        </Page>

        {/* PAGE 16: Back Cover (Required to make pages even) */}
        <Page density="hard">
          <div className={`${styles.coverPage} ${styles.backCover}`}>
            <h2>{brand.name}</h2>
            <p>Thank you for exploring our collection.</p>
          </div>
        </Page>
      </HTMLFlipBook>
    </div>
  );
}