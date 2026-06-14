import fs from 'fs';
import path from 'path';
import FlipbookWrapper from '@/components/FlipbookWrapper';

export default async function Home() {
  const filePath = path.join(process.cwd(), 'data', 'catalogData.json');
  const jsonData = fs.readFileSync(filePath, 'utf8');
  const catalogData = JSON.parse(jsonData);

  return (
    <main style={{ width: '100vw', height: '100vh', backgroundColor: '#fdfaf6' }}>
      <FlipbookWrapper catalogData={catalogData} />
    </main>
  );
}
