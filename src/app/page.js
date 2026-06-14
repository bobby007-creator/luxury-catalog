import fs from 'fs';
import path from 'path';
import dynamic from 'next/dynamic';

const CatalogFlipbook = dynamic(() => import('@/components/CatalogFlipbook'), { ssr: false });

export default async function Home() {
  const filePath = path.join(process.cwd(), 'data', 'catalogData.json');
  const jsonData = fs.readFileSync(filePath, 'utf8');
  const catalogData = JSON.parse(jsonData);

  return (
    <main style={{ width: '100vw', height: '100vh', backgroundColor: '#fdfaf6' }}>
      <CatalogFlipbook catalogData={catalogData} />
    </main>
  );
}
