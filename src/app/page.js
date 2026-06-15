import FlipbookWrapper from '@/components/FlipbookWrapper';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const catalogPath = path.join(process.cwd(), 'data', 'catalogData.json');
  const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const cacheBuster = "v2";

  return (
    <main style={{ width: '100vw', height: '100vh', backgroundColor: '#fdfaf6' }}>
      <FlipbookWrapper catalogData={catalogData} cacheBuster={cacheBuster} />
    </main>
  );
}