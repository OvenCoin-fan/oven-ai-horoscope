import { useWallet } from './WalletContext';
import '../App.css';

export function MintOven() {
  const { wallet, connect } = useWallet();

  if (!wallet.connected) {
    return (
      <div className="card">
        <h2>♈ Минт $OVEN</h2>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '16px' }}>Подключи кошелёк, чтобы получить $OVEN.</p>
        <button className="mint-btn" onClick={connect}>
          🔗 Подключить кошелёк
        </button>
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
        <span className="label">🔥 Ваш $OVEN:</span>
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
