"use client";
import dynamic from "next/dynamic";
import React from "react";

const CatalogFlipbook = dynamic(() => import("./CatalogFlipbook"), { ssr: false });

export default function FlipbookWrapper({ catalogData, cacheBuster }) {
  return <CatalogFlipbook catalogData={catalogData} cacheBuster={cacheBuster} />;
}