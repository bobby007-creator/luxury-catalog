import FlipbookWrapper from '@/components/FlipbookWrapper';
import catalogData from '../../data/catalogData.json';

export default async function Home() {
  return (
    <main style={{ width: '100vw', height: '100vh', backgroundColor: '#fdfaf6' }}>
      <FlipbookWrapper catalogData={catalogData} />
    </main>
  );
}