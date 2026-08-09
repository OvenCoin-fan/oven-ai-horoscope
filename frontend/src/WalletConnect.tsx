import { useWallet } from './WalletContext';
import './App.css';

export function WalletConnect() {
  const { connect } = useWallet();
  return (
    <div className="card">
      <div style={{ textAlign: 'center', padding: '20px 16px' }}>
        <p style={{ fontSize: '48px', marginBottom: '12px' }}>👛</p>
        <h2 style={{ marginBottom: '8px' }}>Подключи кошелёк</h2>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>Ставки и минт в $OVEN. Без кошелька — не играешь.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={() => connect('tonkeeper')} style={{
            padding: '14px 24px', borderRadius: '12px', border: '1px solid rgba(212,160,23,0.3)',
            background: 'rgba(212,160,23,0.08)', color: '#e8e8e8', fontSize: '15px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
          }}><span style={{ fontSize: '20px' }}>💎</span> Tonkeeper</button>
          <button onClick={() => connect('tonwallet')} style={{
            padding: '14px 24px', borderRadius: '12px', border: '1px solid rgba(212,160,23,0.3)',
            background: 'rgba(212,160,23,0.08)', color: '#e8e8e8', fontSize: '15px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
          }}><span style={{ fontSize: '20px' }}>🔵</span> TON Wallet</button>
          <button onClick={() => connect('mytonwallet')} style={{
            padding: '14px 24px', borderRadius: '12px', border: '1px solid rgba(212,160,23,0.3)',
            background: 'rgba(212,160,23,0.08)', color: '#e8e8e8', fontSize: '15px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
          }}><span style={{ fontSize: '20px' }}>🟣</span> MyTonWallet</button>
        </div>
      </div>
    </div>
  );
}
