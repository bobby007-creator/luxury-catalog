import CinematicCatalog from '@/components/CinematicCatalog';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const catalogPath = path.join(process.cwd(), 'data', 'catalogData.json');
  const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const cacheBuster = "v2";

  return (
    <main style={{ width: '100vw', height: '100vh', backgroundColor: '#0a0a0a' }}>
      <CinematicCatalog catalogData={catalogData} cacheBuster={cacheBuster} />
    </main>
  );
}