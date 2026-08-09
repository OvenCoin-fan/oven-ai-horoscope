import { useWallet } from './WalletContext';
import '../App.css';

export function MintOven() {
  const { wallet, connect } = useWallet();

  if (!wallet.connected) {
    return (
      <div className="card">
        <h2>♈ Минт $OVEN</h2>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '16px' }}>Подключи кошелёк, чтобы получить $OVEN.</p>
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
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>♈ Минт $OVEN</h2>
      <div style={{ marginBottom: '12px', padding: '12px', background: 'rgba(212,160,23,0.04)', borderRadius: '12px' }}>
        <p style={{ fontSize: '13px', color: '#888' }}>🔥 Total Supply: 1,000,000,000 $OVEN</p>
        <p style={{ fontSize: '13px', color: '#888' }}>♈ Держи $OVEN — получай гороскопы</p>
        <p style={{ fontSize: '13px', color: '#888' }}>💎 Ставь $OVEN на предсказания</p>
      </div>
      <div className="balance-bar" style={{ marginBottom: '12px' }}>
        <span className="label">🔥 $OVEN:</span>
        <span className="amount">{wallet.ovenBalance}</span>
      </div>
      <div className="balance-bar">
        <span className="label">💎 TON:</span>
        <span className="amount">{wallet.tonBalance}</span>
      </div>
      <button className="mint-btn" style={{ marginTop: '12px' }} onClick={() => alert('В продакшене: jetton transfer через TonConnect')}>
        🔥 Минт 100 $OVEN
      </button>
    </div>
  );
}
