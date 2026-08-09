import { useState } from 'react';
import { useWallet } from './WalletContext';
import '../App.css';

interface Market {
  id: string;
  emoji: string;
  title: string;
  outcomes: string[];
  hint: string;
  pool: number[];
}

const FEE = 0.02;

const MARKETS: Market[] = [
  {
    id: 'btc-65k',
    emoji: '📈',
    title: 'BTC выше $65,000 в пятницу?',
    outcomes: ['Да', 'Нет'],
    hint: '♈ Марс в Овне — к росту. Но Сатурн тормозит. Рынок нервный.',
    pool: [130, 70]
  },
  {
    id: 'ton-top10',
    emoji: '💎',
    title: 'TON в топ-10 к сентябрю?',
    outcomes: ['Да', 'Нет'],
    hint: '♈ Юпитер расширяет границы. Но конкуренция жёсткая.',
    pool: [60, 140]
  },
  {
    id: 'elon-tweet',
    emoji: '🐦',
    title: 'Маск упомянет DOGE/TON до 15 августа?',
    outcomes: ['Да', 'Нет'],
    hint: '♈ Меркурий в ретрограде — неожиданные сообщения.',
    pool: [100, 100]
  }
];

function getPrices(pool: number[]): number[] {
  const total = pool.reduce((a, b) => a + b, 0);
  return pool.map(p => p / total);
}

function getCost(pool: number[], idx: number, shares: number): number {
  const prices = getPrices(pool);
  return prices[idx] * shares * (1 + FEE);
}

export function Predictions() {
  const { wallet, connect } = useWallet();
  const [markets, setMarkets] = useState<Market[]>(MARKETS);
  const [positions, setPositions] = useState<Record<string, Record<number, number>>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [tradeMode, setTradeMode] = useState<Record<string, { outcome: number; amount: number }>>({});

  const buyShares = (marketId: string, outcomeIdx: number, shares: number) => {
    const mk = markets.find(m => m.id === marketId);
    if (!mk) return;
    const cost = getCost(mk.pool, outcomeIdx, shares);
    if (cost > wallet.ovenBalance) {
      setError('Недостаточно $OVEN! Купи или заминти токены.');
      return;
    }
    setError(null);
    const newPool = [...mk.pool];
    newPool[outcomeIdx] += shares;
    setMarkets(prev => prev.map(m => m.id === marketId ? { ...m, pool: newPool } : m));
    setPositions(p => ({
      ...p,
      [marketId]: { ...p[marketId], [outcomeIdx]: (p[marketId]?.[outcomeIdx] || 0) + shares }
    }));
  };

  const sellShares = (marketId: string, outcomeIdx: number, shares: number) => {
    const held = positions[marketId]?.[outcomeIdx] || 0;
    if (shares > held) { setError('Недостаточно акций!'); return; }
    setError(null);
    const mk = markets.find(m => m.id === marketId);
    if (!mk) return;
    const prices = getPrices(mk.pool);
    const newPool = [...mk.pool];
    newPool[outcomeIdx] = Math.max(1, newPool[outcomeIdx] - shares);
    setMarkets(prev => prev.map(m => m.id === marketId ? { ...m, pool: newPool } : m));
    setPositions(p => ({
      ...p,
      [marketId]: { ...p[marketId], [outcomeIdx]: held - shares }
    }));
  };

  // NO WALLET
  if (!wallet.connected) {
    return (
      <div className="card">
        <h2>🎯 OVEN Predictions</h2>
        <div style={{ textAlign: 'center', padding: '30px 16px' }}>
          <p style={{ fontSize: '40px', marginBottom: '12px' }}>👛</p>
          <p style={{ color: '#e8e8e8', fontSize: '15px', marginBottom: '8px' }}>Подключи кошелёк</p>
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '20px' }}>Ставки в $OVEN. Без кошелька — не играешь.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => connect('tonkeeper')}
              style={{
                padding: '14px 24px',
                borderRadius: '12px',
                border: '1px solid rgba(212,160,23,0.3)',
                background: 'rgba(212,160,23,0.08)',
                color: '#e8e8e8',
                fontSize: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              <span style={{ fontSize: '20px' }}>💎</span> Tonkeeper
            </button>
            <button
              onClick={() => connect('tonwallet')}
              style={{
                padding: '14px 24px',
                borderRadius: '12px',
                border: '1px solid rgba(212,160,23,0.3)',
                background: 'rgba(212,160,23,0.08)',
                color: '#e8e8e8',
                fontSize: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              <span style={{ fontSize: '20px' }}>🔵</span> TON Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  // WALLET CONNECTED
  return (
    <div className="card">
      <h2>🎯 OVEN Predictions</h2>
      <p style={{ color: '#888', fontSize: '13px', marginBottom: '12px' }}>
        Покупай акции исхода за $OVEN. Угадал — каждая акция = 1 $OVEN.
      </p>

      <div className="balance-bar">
        <span className="label">🔥 $OVEN:</span>
        <span className="amount">{wallet.ovenBalance}</span>
      </div>

      {error && (
        <div style={{ padding: '10px', background: 'rgba(255,50,50,0.1)', borderRadius: '8px', border: '1px solid rgba(255,50,50,0.3)', marginBottom: '12px' }}>
          <p style={{ fontSize: '13px', color: '#f55' }}>⚠️ {error}</p>
        </div>
      )}

      {markets.map(mk => {
        const prices = getPrices(mk.pool);
        const myPos = positions[mk.id] || {};
        const trade = tradeMode[mk.id];

        return (
          <div key={mk.id} style={{ marginBottom: '20px', padding: '16px', background: 'rgba(212,160,23,0.04)', borderRadius: '12px', border: '1px solid rgba(212,160,23,0.12)' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: '#e8e8e8' }}>{mk.emoji} {mk.title}</p>

            <div style={{ marginBottom: '12px' }}>
              {mk.outcomes.map((name, i) => {
                const pct = Math.round(prices[i] * 100);
                const held = myPos[i] || 0;
                return (
                  <div key={i} style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', color: '#e8e8e8' }}>{name}</span>
                      <span style={{ fontSize: '13px', color: '#d4a017', fontWeight: 600 }}>{pct}¢</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(212,160,23,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #d4a017, #8b6914)', borderRadius: '4px', transition: 'width 0.3s' }} />
                    </div>
                    {held > 0 && <p style={{ fontSize: '11px', color: '#4f4', marginTop: '2px' }}>У вас: {held} акций</p>}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              {mk.outcomes.map((name, i) => (
                <button key={i} onClick={() => setTradeMode(prev => ({ ...prev, [mk.id]: { outcome: i, amount: prev[mk.id]?.amount || 10 } }))} style={{
                  flex: 1, padding: '8px', borderRadius: '8px',
                  border: trade?.outcome === i ? '2px solid #d4a017' : '1px solid rgba(212,160,23,0.25)',
                  background: trade?.outcome === i ? 'rgba(212,160,23,0.15)' : 'rgba(212,160,23,0.04)',
                  color: '#e8e8e8', fontSize: '13px', cursor: 'pointer'
                }}>Купить «{name}»</button>
              ))}
            </div>

            {trade !== undefined && trade.outcome !== undefined && (
              <div style={{ padding: '10px', background: 'rgba(212,160,23,0.06)', borderRadius: '8px' }}>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>Кол-во акций «{mk.outcomes[trade.outcome]}»:</p>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  {[5, 10, 25, 50].map(n => (
                    <button key={n} onClick={() => setTradeMode(prev => ({ ...prev, [mk.id]: { ...prev[mk.id], amount: n } }))} style={{
                      padding: '5px 12px', borderRadius: '6px',
                      border: trade.amount === n ? '2px solid #d4a017' : '1px solid rgba(212,160,23,0.25)',
                      background: trade.amount === n ? 'rgba(212,160,23,0.15)' : 'rgba(212,160,23,0.04)',
                      color: '#e8e8e8', fontSize: '12px', cursor: 'pointer'
                    }}>{n}</button>
                  ))}
                </div>

                <div style={{ marginBottom: '8px', padding: '8px', background: 'rgba(212,160,23,0.08)', borderRadius: '6px' }}>
                  <p style={{ fontSize: '12px', color: '#888' }}>Стоимость: <span style={{ color: '#e8e8e8' }}>{getCost(mk.pool, trade.outcome, trade.amount).toFixed(2)} $OVEN</span> (по {Math.round(prices[trade.outcome] * 100)}¢ + 2%)</p>
                  <p style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>Выигрыш: <span style={{ color: '#d4a017', fontWeight: 700 }}>{trade.amount} $OVEN</span> <span style={{ color: '#4f4', fontSize: '11px' }}>(+{Math.round(trade.amount - getCost(mk.pool, trade.outcome, trade.amount))})</span></p>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => buyShares(mk.id, trade.outcome, trade.amount)} style={{
                    flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
                    background: 'linear-gradient(135deg, #d4a017, #8b6914)', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer'
                  }}>Купить за {getCost(mk.pool, trade.outcome, trade.amount).toFixed(1)} $OVEN</button>
                  {(myPos[trade.outcome] || 0) > 0 && (
                    <button onClick={() => sellShares(mk.id, trade.outcome, Math.min(trade.amount, myPos[trade.outcome] || 0))} style={{
                      flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,50,50,0.4)',
                      background: 'rgba(255,50,50,0.1)', color: '#f88', fontSize: '13px', cursor: 'pointer'
                    }}>Продать {Math.min(trade.amount, myPos[trade.outcome] || 0)}</button>
                  )}
                </div>
              </div>
            )}

            <button onClick={() => setShowHint(prev => ({ ...prev, [mk.id]: !prev[mk.id] }))} style={{ background: 'none', border: 'none', color: '#d4a017', fontSize: '12px', cursor: 'pointer', padding: '4px 0', marginTop: '8px' }}>
              {showHint[mk.id] ? '🔮 Скрыть подсказку' : '🔮 Подсказка гороскопа'}
            </button>
            {showHint[mk.id] && <p style={{ fontSize: '13px', color: '#aaa', marginTop: '6px', fontStyle: 'italic', lineHeight: 1.5 }}>{mk.hint}</p>}
          </div>
        );
      })}
    </div>
  );
}
