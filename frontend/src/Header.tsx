import './App.css';
export function Header() {
  return (
    <header className="card" style={{ textAlign: 'center', marginBottom: '8px' }}>
      <h1 style={{ fontSize: '32px', margin: 0 }}>♈ $OVEN</h1>
      <p style={{ color: '#888', fontSize: '14px', marginTop: '8px' }}>AI Horoscope • TON Mini App</p>
      <p style={{ color: '#d4a017', fontSize: '12px', marginTop: '4px' }}>Овны рулят рынком ♈</p>
    </header>
  );
}
