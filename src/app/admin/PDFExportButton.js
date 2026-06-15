'use client';
import React, { useState } from 'react';
import { jsPDF } from "jspdf";

export default function PDFExportButton() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      // Fetch data
      const res = await fetch('/api/catalog');
      const catalogData = await res.json();
      
      if (!catalogData || !catalogData.products) {
        throw new Error("No catalog data");
      }

      // Create landscape PDF (A4)
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Title Page (Background)
      doc.setFillColor(30, 30, 30);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      try {
        const coverData = await getBase64ImageFromUrl('/images/cover_image.png');
        if (coverData) {
          doc.addImage(coverData, 'PNG', 0, 0, pageWidth, pageHeight, '', 'FAST');
        }
      } catch(e) {}

      // Dark Overlay
      doc.setFillColor(0, 0, 0, 0.5); // wait, jsPDF might not support RGBA transparency easily without GState, we will just draw text with shadow or rely on dark background
      
      try {
        const logoData = await getBase64ImageFromUrl('/images/logo.png');
        if (logoData) {
          doc.addImage(logoData, 'PNG', pageWidth / 2 - 40, pageHeight / 2 - 60, 80, 40, '', 'FAST');
        }
      } catch(e) {}

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(40);
      doc.text(catalogData.brand?.name || "Luxury Catalog", pageWidth / 2, pageHeight / 2 + 10, { align: "center" });
      
      doc.setFontSize(16);
      doc.setTextColor(200, 200, 200);
      doc.text(catalogData.brand?.tagline || "Premium Collection", pageWidth / 2, pageHeight / 2 + 25, { align: "center" });

      // Products Pages
      for (const product of catalogData.products) {
        doc.addPage();
        
        // Reset colors
        doc.setFillColor(253, 250, 246); // Light cream background
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        doc.setTextColor(30, 30, 30);

        // Try to load and add image
        if (product.image) {
          try {
            const imgUrl = `/images/products/${product.image}`;
            // Use an invisible canvas to get base64
            const imgData = await getBase64ImageFromUrl(imgUrl);
            if (imgData) {
              // Add image to the left side
              doc.addImage(imgData, 'PNG', 20, 40, 120, 120, '', 'FAST');
            }
          } catch (e) {
            console.error("Could not load image for PDF:", product.image);
          }
        }

        // Product Info on the right side
        doc.setFontSize(24);
        doc.text(product.name, 150, 60);
        
        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.text(product.category, 150, 75);

        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text(product.priceRange, 150, 95);

        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        
        // Split description to fit width
        const splitDesc = doc.splitTextToSize(product.description || "", 120);
        doc.text(splitDesc, 150, 115);

        if (product.colors && product.colors.length > 0) {
          doc.setFontSize(10);
          doc.text(`Available in: ${product.colors.join(', ')}`, 150, 180);
        }
      }

      // Back Cover
      doc.addPage();
      doc.setFillColor(30, 30, 30);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text("Contact Us", pageWidth / 2, 60, { align: "center" });

      if (catalogData.brand?.contact) {
        doc.setFontSize(14);
        let yPos = 100;
        if (catalogData.brand.contact.phone) {
          doc.text(`Phone: ${catalogData.brand.contact.phone}`, pageWidth / 2, yPos, { align: "center" });
          yPos += 15;
        }
        if (catalogData.brand.contact.website) {
          doc.text(`Website: ${catalogData.brand.contact.website}`, pageWidth / 2, yPos, { align: "center" });
          yPos += 15;
        }
        if (catalogData.brand.contact.address) {
          doc.text(`Address: ${catalogData.brand.contact.address}`, pageWidth / 2, yPos, { align: "center" });
        }
      }

      doc.save("Luxury_Catalog.pdf");

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. See console for details.");
    }

    setIsGenerating(false);
  };

  const getBase64ImageFromUrl = async (imageUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      // Remove crossOrigin for same-origin requests to prevent CORS block on localhost
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        // Force output as PNG data url
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = () => {
        console.error("Failed to load image for PDF:", imageUrl);
        resolve(null);
      };
      img.src = imageUrl;
    });
  };

  return (
    <button 
      className="btn-secondary" 
      onClick={generatePDF} 
      disabled={isGenerating}
      style={{ marginLeft: '10px' }}
    >
      {isGenerating ? "Generating PDF..." : "📥 Export PDF"}
    </button>
  );
}
