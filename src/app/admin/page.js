"use client";

import React, { useState, useEffect } from "react";
import styles from "./Admin.module.css";

export default function AdminPage() {
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState("");
  
  // Product Upload State
  const [file, setFile] = useState(null);
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("Sofas");
  const [dimensions, setDimensions] = useState("");
  const [bestRoomSize, setBestRoomSize] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Load config on mount
    fetch("/api/config")
      .then(res => res.json())
      .then(data => {
        if (data.removeBgApiKey) setApiKey(data.removeBgApiKey);
      })
      .catch(err => console.error("Could not load config", err));
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
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setStatus("Failed to upload product.");
    }
    
    setIsUploading(false);
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
        <h1>Catalog Management</h1>
        
        {status && <div className={styles.statusBox}>{status}</div>}

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
          <h3>2. Upload New Product</h3>
          <p className={styles.helpText}>
            Upload a raw photo of your furniture. Our AI will automatically strip the background, auto-crop it, enhance the lighting, and scale it perfectly to 1000x1000 pixels for the catalog.
          </p>
          
          <form onSubmit={handleUpload} className={styles.uploadForm}>
            <div className={styles.formGroup}>
              <label>Raw Photo</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={e => setFile(e.target.files[0])} 
                required
              />
            </div>

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
                  <option value="Sofas">Sofas</option>
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

            <button type="submit" className="btn-primary" disabled={isUploading}>
              {isUploading ? "Processing Image with AI..." : "Upload & Process Image"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}