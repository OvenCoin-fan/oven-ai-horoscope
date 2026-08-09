import { useState } from 'react';
import '../App.css';

interface Event {
  id: string;
  emoji: string;
  title: string;
  options: { label: string; odds: number }[];
  hint: string;
}

const EVENTS: Event[] = [
  {
    id: 'btc-65k',
    emoji: '📈',
    title: 'BTC закроется выше $65,000 в пятницу?',
    options: [{ label: 'Да 🚀', odds: 1.7 }, { label: 'Нет 📉', odds: 2.2 }],
    hint: '♈ Марс в Овне — к росту. Но Сатурн тормозит. Рынок нервный, 50/50.'
  },
  {
    id: 'ton-top10',
    emoji: '💎',
    title: 'TON войдёт в топ-10 криптовалют к сентябрю?',
    options: [{ label: 'Да 🔥', odds: 3.5 }, { label: 'Нет 📉', odds: 1.3 }],
    hint: '♈ Юпитер расширяет границы, но конкуренция высока. Долгий шанс.'
  },
  {
    id: 'elon-tweet',
    emoji: '🐦',
    title: 'Илон Маск упомянет DOGE или TON до 15 августа?',
    options: [{ label: 'Да 🐕', odds: 2.0 }, { label: 'Нет 🤷', odds: 1.8 }],
    hint: '♈ Меркурий в ретрограде — неожиданные сообщения. Маск непредсказуем.'
  }
];

const STAKES = [10, 50, 100];
const HOUSE_EDGE = 0.10;

export function Predictions() {
  const [balance, setBalance] = useState(500);
  const [bets, setBets] = useState<Record<string, { option: number; stake: number }>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const placeBet = (eventId: string, optionIdx: number, stake: number) => {
    setBets(prev => ({ ...prev, [eventId]: { option: optionIdx, stake } }));
    setError(null);
  };

  const submitBet = (eventId: string) => {
    const bet = bets[eventId];
    if (!bet) return;
    if (bet.stake > balance) {
      setError('Недостаточно $OVEN на балансе!');
      return;
    }
    setBalance(prev => prev - bet.stake);
    setSubmitted(prev => ({ ...prev, [eventId]: true }));
    setError(null);
  };

  const netWin = (bet: { stake: number; option: number }, ev: Event) => {
    const gross = bet.stake * ev.options[bet.option].odds;
    return Math.round(gross * (1 - HOUSE_EDGE));
  };

  return (
    <div className="card">
      <h2>🎯 OVEN Predictions</h2>
      <p style={{ color: '#888', fontSize: '13px', marginBottom: '12px' }}>
        Ставь $OVEN на непредсказуемые события. Угадал — забирай.
      </p>

      <div className="balance-bar">
        <span className="label">💰 Баланс:</span>
        <span className="amount">{balance} $OVEN</span>
      </div>

      {error && (
        <div style={{ padding: '10px', background: 'rgba(255,50,50,0.1)', borderRadius: '8px', border: '1px solid rgba(255,50,50,0.3)', marginBottom: '12px' }}>
          <p style={{ fontSize: '13px', color: '#f55' }}>⚠️ {error}</p>
        </div>
      )}

      {EVENTS.map(ev => (
        <div key={ev.id} style={{ marginBottom: '20px', padding: '16px', background: 'rgba(212,160,23,0.04)', borderRadius: '12px', border: '1px solid rgba(212,160,23,0.12)' }}>
          <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '10px', color: '#e8e8e8' }}>
            {ev.emoji} {ev.title}
          </p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            {ev.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => {
                  const currentStake = bets[ev.id]?.stake || 10;
                  placeBet(ev.id, i, currentStake);
                }}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  borderRadius: '10px',
                  border: bets[ev.id]?.option === i ? '2px solid #d4a017' : '1px solid rgba(212,160,23,0.25)',
                  background: bets[ev.id]?.option === i ? 'rgba(212,160,23,0.15)' : 'rgba(212,160,23,0.04)',
                  color: '#e8e8e8',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div>{opt.label}</div>
                <div style={{ fontSize: '12px', color: '#d4a017', marginTop: '4px' }}>×{opt.odds}</div>
              </button>
            ))}
          </div>

          {bets[ev.id]?.option !== undefined && !submitted[ev.id] && (
            <div style={{ marginBottom: '10px' }}>
              <p style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>Ставка $OVEN:</p>
              <div style={{ display: 'flex', gap: '6px' }}>
                {STAKES.map(s => (
                  <button
                    key={s}
                    onClick={() => placeBet(ev.id, bets[ev.id].option, s)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: bets[ev.id]?.stake === s ? '2px solid #d4a017' : '1px solid rgba(212,160,23,0.25)',
                      background: bets[ev.id]?.stake === s ? 'rgba(212,160,23,0.15)' : 'rgba(212,160,23,0.04)',
                      color: '#e8e8e8',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {bets[ev.id] && !submitted[ev.id] && (
            <div style={{ padding: '8px 12px', background: 'rgba(212,160,23,0.08)', borderRadius: '8px', marginBottom: '10px' }}>
              <p style={{ fontSize: '13px', color: '#888' }}>
                Ставка: <span style={{ color: '#e8e8e8', fontWeight: 600 }}>{bets[ev.id].stake} $OVEN</span>
              </p>
              <p style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>
                Выигрыш: <span style={{ color: '#d4a017', fontWeight: 700 }}>{netWin(bets[ev.id], ev)} $OVEN</span>
                {' '}
                <span style={{ color: '#4f4', fontSize: '12px' }}>(+{netWin(bets[ev.id], ev) - bets[ev.id].stake})</span>
              </p>
              <p style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                Комиссия 10% от выигрыша
              </p>
            </div>
          )}

          {bets[ev.id] && !submitted[ev.id] && (
            <button
              onClick={() => submitBet(ev.id)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #d4a017, #8b6914)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                marginBottom: '8px'
              }}
            >
              Поставить {bets[ev.id].stake} $OVEN
            </button>
          )}

          {submitted[ev.id] && (
            <div style={{ padding: '10px', background: 'rgba(0,200,100,0.08)', borderRadius: '8px', border: '1px solid rgba(0,200,100,0.25)', marginBottom: '8px' }}>
              <p style={{ fontSize: '13px', color: '#4f4' }}>✅ Ставка {bets[ev.id].stake} $OVEN на «{ev.options[bets[ev.id].option].label}»</p>
              <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                Возможный выигрыш: <span style={{ color: '#d4a017' }}>{netWin(bets[ev.id], ev)} $OVEN</span> (−10% комиссия)
              </p>
            </div>
          )}

          <button
            onClick={() => setShowHint(prev => ({ ...prev, [ev.id]: !prev[ev.id] }))}
            style={{ background: 'none', border: 'none', color: '#d4a017', fontSize: '12px', cursor: 'pointer', padding: '4px 0' }}
          >
            {showHint[ev.id] ? '🔮 Скрыть подсказку' : '🔮 Подсказка гороскопа'}
          </button>
          {showHint[ev.id] && (
            <p style={{ fontSize: '13px', color: '#aaa', marginTop: '6px', fontStyle: 'italic', lineHeight: 1.5 }}>
              {ev.hint}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
