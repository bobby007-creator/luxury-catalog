"use client";

import React, { useState, useEffect } from "react";
import styles from "./Admin.module.css";

import PDFExportButton from "./PDFExportButton";

export default function AdminPage() {
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState("");
  
  // Product Upload State
  const [file, setFile] = useState(null);
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("L Corner Sofas");
  const [dimensions, setDimensions] = useState("");
  const [bestRoomSize, setBestRoomSize] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [description, setDescription] = useState("");
  const [tagline, setTagline] = useState("");
  const [colors, setColors] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [products, setProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);

  // Brand Settings State
  const [brandName, setBrandName] = useState("");
  const [brandTagline, setBrandTagline] = useState("");
  const [brandAbout, setBrandAbout] = useState("");
  const [brandQualityCommitment, setBrandQualityCommitment] = useState("");
  const [coverTextColor, setCoverTextColor] = useState("#ffffff");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [logoImage, setLogoImage] = useState(null);
  const [isSavingBrand, setIsSavingBrand] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [logoPosition, setLogoPosition] = useState({ top: 10, left: 10 });
  const [textPosition, setTextPosition] = useState({ top: 50, left: 50 });
  const [previewCoverUrl, setPreviewCoverUrl] = useState("/images/brand/cover.jpg");
  const [previewLogoUrl, setPreviewLogoUrl] = useState("/images/brand/logo.png");
  const [removeLogo, setRemoveLogo] = useState(false);

  useEffect(() => {
    // Load config on mount
    fetch("/api/config")
      .then(res => res.json())
      .then(data => {
        if (data.removeBgApiKey) setApiKey(data.removeBgApiKey);
      })
      .catch(err => console.error("Could not load config", err));

    // Load existing brand data and products
    fetch("/api/catalog")
      .then(res => res.json())
      .then(data => {
        if (data.products) setProducts(data.products);
        
        if (data.brand) {
          setBrandName(data.brand.name || "");
          setBrandTagline(data.brand.tagline || "");
          setBrandAbout(data.brand.about || "");
          setBrandQualityCommitment(data.brand.qualityCommitment ? data.brand.qualityCommitment.join("\n") : "");
          setCoverTextColor(data.brand.coverTextColor || "#ffffff");
          if (data.brand.contact) {
            setPhone(data.brand.contact.phone || "");
            setWebsite(data.brand.contact.website || "");
            setAddress(data.brand.contact.address || "");
          }
          if (data.brand.layout) {
            if (data.brand.layout.logoPosition) setLogoPosition(data.brand.layout.logoPosition);
            if (data.brand.layout.textPosition) setTextPosition(data.brand.layout.textPosition);
          }
          if (data.brand.hideLogo) {
            setRemoveLogo(true);
            setPreviewLogoUrl("");
          }
        }
      })
      .catch(err => console.error("Could not load catalog data", err));
  }, []);

  const saveConfig = async () => {
    setStatus("Saving...");
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ removeBgApiKey: apiKey })
      });
      if (res.ok) {
        setStatus("API Key Saved Successfully!");
        setTimeout(() => setStatus(""), 3000);
      }
    } catch (e) {
      setStatus("Error saving config.");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!productName) return;

    if (editingProductId) {
      setIsUploading(true);
      setStatus("Updating product...");
      try {
        const res = await fetch("/api/catalog", {
          method: "PUT",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingProductId,
            name: productName,
            category: category,
            tagline: tagline,
            description: description,
            priceRange: priceRange,
            dimensions: dimensions,
            colors: colors.split(',').map(c => c.trim()).filter(Boolean)
          })
        });
        const data = await res.json();
        if (res.ok) {
          setStatus(`Success! Updated ${data.product.name}.`);
          setEditingProductId(null);
          setProductName("");
          setDescription("");
          setTagline("");
          setColors("");
          setPriceRange("");
          setDimensions("");
          
          setProducts(prev => prev.map(p => p.id === data.product.id ? data.product : p));
        } else {
          setStatus(`Error: ${data.error}`);
        }
      } catch (err) {
        setStatus("Failed to update product.");
      }
      setIsUploading(false);
      return;
    }

    if (!file) return alert("Please select a file!");
    if (!apiKey) return alert("Please save your Remove.bg API key first!");

    setIsUploading(true);
    setStatus("Uploading and removing background... This may take a few seconds.");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("name", productName);
    formData.append("category", category);
    formData.append("dimensions", dimensions);
    formData.append("bestRoomSize", bestRoomSize);
    formData.append("priceRange", priceRange);
    formData.append("description", description);
    formData.append("tagline", tagline);
    formData.append("colors", colors);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      
      if (res.ok) {
        setStatus(`Success! Added ${data.product.name} to the catalog.`);
        setFile(null);
        setProductName("");
        setDimensions("");
        setBestRoomSize("");
        setPriceRange("");
        setDescription("");
        setTagline("");
        setColors("");
        
        // Refresh product list
        setProducts(prev => [...prev, data.product]);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setStatus("Failed to upload product.");
    }
    
    setIsUploading(false);
  };

  const handleBrandUpload = async (e) => {
    e.preventDefault();
    setIsSavingBrand(true);
    setStatus("Saving brand settings...");

    const formData = new FormData();
    formData.append("name", brandName);
    formData.append("tagline", brandTagline);
    formData.append("about", brandAbout);
    formData.append("qualityCommitment", JSON.stringify(brandQualityCommitment.split("\n").map(s => s.trim()).filter(Boolean)));
    formData.append("coverTextColor", coverTextColor);
    formData.append("phone", phone);
    formData.append("website", website);
    formData.append("address", address);
    formData.append("logoPosition", JSON.stringify(logoPosition));
    formData.append("textPosition", JSON.stringify(textPosition));
    if (removeLogo) formData.append("hideLogo", "true");
    if (coverImage) formData.append("coverImage", coverImage);
    if (logoImage) formData.append("logoImage", logoImage);

    try {
      const res = await fetch("/api/branding", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        setStatus("Success! Brand settings updated.");
        setCoverImage(null);
        setLogoImage(null);
      } else {
        setStatus("Error updating brand settings.");
      }
    } catch (err) {
      setStatus("Failed to save brand settings.");
    }
    
    setIsSavingBrand(false);
  };

  const handleCloudSync = async () => {
    setIsSyncing(true);
    setStatus("Syncing to cloud tablets... This may take a minute.");
    
    try {
      const res = await fetch("/api/sync", {
        method: "POST"
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatus("Success! Tablets will update automatically on Wi-Fi.");
      } else {
        setStatus("Cloud sync error: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      setStatus("Failed to trigger cloud sync. Ensure you are on the host PC.");
    }
    
    setIsSyncing(false);
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    setStatus("Deleting product...");
    try {
      const res = await fetch(`/api/catalog?id=${id}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        setStatus("Product deleted successfully!");
        setProducts(prev => prev.filter(p => p.id !== id));
      } else {
        setStatus("Error deleting product.");
      }
    } catch (err) {
      setStatus("Failed to delete product.");
    }
  };

  const handleEditProduct = (p) => {
    setEditingProductId(p.id);
    setProductName(p.name);
    setCategory(p.category);
    setDescription(p.description || "");
    setTagline(p.tagline || "");
    setPriceRange(p.priceRange || "");
    setDimensions(p.dimensions || "");
    setColors(p.options?.colors ? p.options.colors.join(", ") : "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setProductName("");
    setDescription("");
    setTagline("");
    setColors("");
    setPriceRange("");
    setDimensions("");
    setFile(null);
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.sidebar}>
        <h2>PVR Admin</h2>
        <ul className={styles.navLinks}>
          <li className={styles.active}>Product Upload</li>
          <li>Settings</li>
        </ul>
      </div>

      <div className={styles.mainContent}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Catalog Management</h1>
          <PDFExportButton />
        </div>
        
        {status && <div className={styles.statusBox}>{status}</div>}

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
          <button 
            onClick={handleCloudSync}
            disabled={isSyncing}
            style={{ 
                padding: '15px 30px', 
                fontSize: '18px', 
                backgroundColor: isSyncing ? '#aaa' : '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px', 
                cursor: isSyncing ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}
          >
            {isSyncing ? "Syncing to Cloud..." : "📱 Sync to Cloud Tablets"}
          </button>
        </div>

        <div className={styles.card}>
          <h3>1. API Configuration</h3>
          <p className={styles.helpText}>
            To use the automatic AI background removal, you must enter a valid API key from <a href="https://www.remove.bg/api" target="_blank" rel="noreferrer">Remove.bg</a>.
          </p>
          <div className={styles.formGroup}>
            <label>Remove.bg API Key</label>
            <input 
              type="password" 
              value={apiKey} 
              onChange={e => setApiKey(e.target.value)}
              placeholder="e.g. kH9xJ..."
            />
            <button onClick={saveConfig} className="btn-outline" style={{marginTop: '1rem'}}>Save API Key</button>
          </div>
        </div>

        <div className={styles.card}>
            <h3>{editingProductId ? `Editing: ${productName}` : "2. Add New Furniture"}</h3>
            <p className={styles.helpText}>
              {editingProductId ? "Update details for this product." : "Upload a raw photo of your furniture. Our AI will automatically remove the background and generate a transparent PNG."}
            </p>
            <form className={styles.uploadForm} onSubmit={handleUpload}>
              
              {!editingProductId && (
                <div className={styles.formGroup}>
                  <label htmlFor="rawPhoto">Raw Photo</label>
                  <input 
                    id="rawPhoto"
                    type="file" 
                    accept="image/*" 
                    onChange={e => setFile(e.target.files[0])} 
                  />
                </div>
              )}

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Product Name</label>
                <input 
                  type="text" 
                  value={productName} 
                  onChange={e => setProductName(e.target.value)} 
                  placeholder="e.g. Milan Velvet Sofa"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="L Corner Sofas">L Corner Sofas</option>
                    <option value="Lounger Model Sofas">Lounger Model Sofas</option>
                    <option value="3+1+1 Sofa Sets">3+1+1 Sofa Sets</option>
                    <option value="Beds">Beds</option>
                    <option value="Dining">Dining</option>
                    <option value="Wardrobes">Wardrobes</option>
                  </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Exact Dimensions</label>
                <input 
                  type="text" 
                  value={dimensions} 
                  onChange={e => setDimensions(e.target.value)} 
                  placeholder="e.g. 9ft Ã— 7ft"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Best Room Size</label>
                <input 
                  type="text" 
                  value={bestRoomSize} 
                  onChange={e => setBestRoomSize(e.target.value)} 
                  placeholder="e.g. 12ft Ã— 15ft+"
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Price Range</label>
                <input 
                  type="text" 
                  value={priceRange} 
                  onChange={e => setPriceRange(e.target.value)} 
                  placeholder="e.g. $4,000 - $6,500"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Tagline</label>
                <input 
                  type="text" 
                  value={tagline} 
                  onChange={e => setTagline(e.target.value)} 
                  placeholder="e.g. Modern Luxury"
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Available Colors (comma separated)</label>
              <input 
                type="text" 
                value={colors} 
                onChange={e => setColors(e.target.value)} 
                placeholder="e.g. Emerald Green, Navy Blue, Ivory"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Enter a detailed description of the product..."
                rows={4}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary" disabled={isUploading}>
                  {isUploading 
                    ? (editingProductId ? "Updating..." : "Processing Image with AI...") 
                    : (editingProductId ? "Update Product" : "Upload & Process Image")}
                </button>
                {editingProductId && (
                  <button type="button" onClick={cancelEdit} className="btn-secondary">
                    Cancel Edit
                  </button>
                )}
            </div>
          </form>
          </div>

          <div className={styles.card} style={{ marginTop: '20px' }}>
            <h3>Manage Products</h3>
            <p className={styles.helpText}>View and remove existing products from your catalog.</p>
            {products.length === 0 ? (
              <p>No products in catalog.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {products.map(p => (
                  <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #ddd', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '50px', height: '50px', background: '#f5f5f5', borderRadius: '5px', overflow: 'hidden' }}>
                        {(p.image || (p.images && p.images.isolated)) && (
                          <img 
                            src={p.image?.startsWith('/') ? p.image : (p.images?.isolated?.startsWith('/') ? p.images.isolated : `/images/products/${p.image || p.images?.isolated}`)} 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                            alt={p.name}
                          />
                        )}
                      </div>
                      <div>
                        <strong>{p.name}</strong> <span style={{ color: '#888', fontSize: '0.9em' }}>({p.category})</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => handleEditProduct(p)}
                        style={{ background: '#f0f0f0', color: '#333', border: '1px solid #ccc', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(p.id)}
                        style={{ background: '#ff4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

        <div className={styles.card} style={{ marginTop: '20px' }}>
          <h3>3. Brand Settings & Cover Page</h3>
          <p className={styles.helpText}>
            Update your catalog&apos;s cover page background, logo, and brand text.
          </p>
          <form className={styles.uploadForm} onSubmit={(e) => e.preventDefault()} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Brand Name</label>
                <input type="text" value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="e.g. PVR Manufacturing" />
              </div>
              <div className={styles.formGroup}>
                <label>Tagline</label>
                <input type="text" value={brandTagline} onChange={e => setBrandTagline(e.target.value)} placeholder="e.g. Designed for Your Space" />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>About Content (Back Cover)</label>
              <textarea value={brandAbout} onChange={e => setBrandAbout(e.target.value)} rows={3} placeholder="We believe that premium furniture..." />
            </div>

            <div className={styles.formGroup}>
              <label>Quality Commitment (About Page) - One per line</label>
              <textarea value={brandQualityCommitment} onChange={e => setBrandQualityCommitment(e.target.value)} rows={4} placeholder="Custom-made solutions...&#10;Premium materials...&#10;Professional installation..." />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Contact Phone</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +1 (555) 123-4567" />
              </div>
              <div className={styles.formGroup}>
                <label>Cover Text Color</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input type="color" value={coverTextColor} onChange={e => setCoverTextColor(e.target.value)} style={{ width: '50px', height: '40px', padding: '0', cursor: 'pointer' }} />
                  <span style={{ fontFamily: 'monospace' }}>{coverTextColor}</span>
                </div>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Website</label>
                <input type="text" value={website} onChange={e => setWebsite(e.target.value)} placeholder="e.g. www.gravityapp.com" />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Address</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. 123 Luxury Ave, Design District" />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="coverImage">Cover Page Background Image</label>
                <input id="coverImage" type="file" accept="image/*" onChange={e => {
                  setCoverImage(e.target.files[0]);
                  if (e.target.files[0]) setPreviewCoverUrl(URL.createObjectURL(e.target.files[0]));
                }} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="logoImage">Company Logo</label>
                <input id="logoImage" type="file" accept="image/*" onChange={e => {
                  setLogoImage(e.target.files[0]);
                  setRemoveLogo(false);
                  if (e.target.files[0]) setPreviewLogoUrl(URL.createObjectURL(e.target.files[0]));
                }} />
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input type="checkbox" id="removeLogo" checked={removeLogo} onChange={e => {
                    setRemoveLogo(e.target.checked);
                    if (e.target.checked) setPreviewLogoUrl("");
                    else setPreviewLogoUrl("/images/logo.png?v=" + new Date().getTime());
                  }} />
                  <label htmlFor="removeLogo" style={{ margin: 0, fontWeight: 'normal' }}>Hide logo on cover</label>
                </div>
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <h4>Cover Page Layout Editor</h4>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                
                {/* The Preview Window */}
                <div style={{
                  width: '300px', 
                  height: '420px', 
                  position: 'relative', 
                  backgroundColor: '#333',
                  backgroundImage: `url(${previewCoverUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '2px solid #ccc',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  {/* Logo Preview */}
                  {!removeLogo && (
                    <div style={{
                      position: 'absolute',
                      top: `${logoPosition.top}%`,
                      left: `${logoPosition.left}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '60px',
                      height: 'auto'
                    }}>
                      <img src={previewLogoUrl} alt="Logo" style={{ width: '100%', height: 'auto' }} onError={(e) => e.target.style.display='none'} />
                    </div>
                  )}

                  {/* Text Preview */}
                  <div style={{
                    position: 'absolute',
                    top: `${textPosition.top}%`,
                    left: `${textPosition.left}%`,
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    color: coverTextColor,
                    width: '100%'
                  }}>
                    <h1 style={{ fontSize: '24px', margin: '0', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{brandName || "Brand Name"}</h1>
                    <p style={{ fontSize: '12px', margin: '5px 0 0 0', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{brandTagline || "Brand Tagline"}</p>
                  </div>
                </div>

                {/* The Sliders */}
                <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                    <strong>Logo Position</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                      <span style={{ width: '20px' }}>Y:</span>
                      <input type="range" min="0" max="100" value={logoPosition.top} onChange={e => setLogoPosition({...logoPosition, top: parseInt(e.target.value)})} style={{ flex: 1 }} />
                      <span>{logoPosition.top}%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                      <span style={{ width: '20px' }}>X:</span>
                      <input type="range" min="0" max="100" value={logoPosition.left} onChange={e => setLogoPosition({...logoPosition, left: parseInt(e.target.value)})} style={{ flex: 1 }} />
                      <span>{logoPosition.left}%</span>
                    </div>
                  </div>

                  <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                    <strong>Text Position</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                      <span style={{ width: '20px' }}>Y:</span>
                      <input type="range" min="0" max="100" value={textPosition.top} onChange={e => setTextPosition({...textPosition, top: parseInt(e.target.value)})} style={{ flex: 1 }} />
                      <span>{textPosition.top}%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                      <span style={{ width: '20px' }}>X:</span>
                      <input type="range" min="0" max="100" value={textPosition.left} onChange={e => setTextPosition({...textPosition, left: parseInt(e.target.value)})} style={{ flex: 1 }} />
                      <span>{textPosition.left}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="button" 
              onClick={(e) => {
                console.log("Save Brand Settings clicked!");
                handleBrandUpload(e);
              }} 
              className="btn-primary" 
              disabled={isSavingBrand}
            >
              {isSavingBrand ? "Saving Brand Settings..." : "Save Brand Settings"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}