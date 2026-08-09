import { useState } from 'react';
import '../App.css';

interface Event {
  id: string;
  emoji: string;
  title: string;
  options: string[];
  hint: string;
}

const EVENTS: Event[] = [
  {
    id: 'btc-65k',
    emoji: '📈',
    title: 'BTC выше $65,000 к 10 августа?',
    options: ['Да 🔥', 'Нет 📉'],
    hint: '♈ Звёзды говорят: Марс в Овне — к росту. Но Сатурн тормозит. Риск 50/50.'
  },
  {
    id: 'rain-moscow',
    emoji: '🌧',
    title: 'Дождь в Москве 10 августа?',
    options: ['Да 🌧', 'Нет ☀️'],
    hint: '♈ Нептун в Рыбах — вода близко. Вероятность осадков высока.'
  },
  {
    id: 'ton-up',
    emoji: '💎',
    title: 'TON вырастет на 5% за неделю?',
    options: ['Да 🚀', 'Нет 📉'],
    hint: '♈ Венера и Юпитер в союзе — рост вероятен. Но не гарантирован.'
  }
];

const STAKES = [10, 50, 100];

export function Predictions() {
  const [bets, setBets] = useState<Record<string, { option: number; stake: number }>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  const placeBet = (eventId: string, optionIdx: number, stake: number) => {
    setBets(prev => ({ ...prev, [eventId]: { option: optionIdx, stake } }));
  };

  const submitBet = (eventId: string) => {
    if (!bets[eventId]) return;
    setSubmitted(prev => ({ ...prev, [eventId]: true }));
  };

  return (
    <div className="card">
      <h2>🎯 OVEN Predictions</h2>
      <p style={{ color: '#999', fontSize: '13px', marginBottom: '16px' }}>
        Ставь $OVEN на мировые события. Гороскоп подскажет.
      </p>

      {EVENTS.map(ev => (
        <div key={ev.id} style={{ marginBottom: '20px', padding: '16px', background: 'rgba(255,107,0,0.05)', borderRadius: '12px', border: '1px solid rgba(255,107,0,0.15)' }}>
          <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>
            {ev.emoji} {ev.title}
          </p>

          {/* Options */}
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
                  border: bets[ev.id]?.option === i ? '2px solid #ff6b00' : '1px solid rgba(255,107,0,0.3)',
                  background: bets[ev.id]?.option === i ? 'rgba(255,107,0,0.2)' : 'rgba(255,107,0,0.05)',
                  color: '#fff',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Stake selector */}
          {bets[ev.id]?.option !== undefined && !submitted[ev.id] && (
            <div style={{ marginBottom: '10px' }}>
              <p style={{ fontSize: '12px', color: '#999', marginBottom: '6px' }}>Ставка $OVEN:</p>
              <div style={{ display: 'flex', gap: '6px' }}>
                {STAKES.map(s => (
                  <button
                    key={s}
                    onClick={() => placeBet(ev.id, bets[ev.id].option, s)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: bets[ev.id]?.stake === s ? '2px solid #ff6b00' : '1px solid rgba(255,107,0,0.3)',
                      background: bets[ev.id]?.stake === s ? 'rgba(255,107,0,0.2)' : 'rgba(255,107,0,0.05)',
                      color: '#fff',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    {s} 🔥
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          {bets[ev.id] && !submitted[ev.id] && (
            <button
              onClick={() => submitBet(ev.id)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #ff6b00, #ff2200)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                marginBottom: '8px'
              }}
            >
              Поставить {bets[ev.id].stake} $OVEN на «{ev.options[bets[ev.id].option]}»
            </button>
          )}

          {/* Submitted */}
          {submitted[ev.id] && (
            <div style={{ padding: '10px', background: 'rgba(0,255,100,0.1)', borderRadius: '8px', border: '1px solid rgba(0,255,100,0.3)', marginBottom: '8px' }}>
              <p style={{ fontSize: '13px', color: '#4f4' }}>✅ Ставка принята: {bets[ev.id].stake} $OVEN на «{ev.options[bets[ev.id].option]}»</p>
            </div>
          )}

          {/* Horoscope hint */}
          <button
            onClick={() => setShowHint(prev => ({ ...prev, [ev.id]: !prev[ev.id] }))}
            style={{
              background: 'none',
              border: 'none',
              color: '#ff6b00',
              fontSize: '12px',
              cursor: 'pointer',
              padding: '4px 0'
            }}
          >
            {showHint[ev.id] ? '🔮 Скрыть подсказку' : '🔮 Подсказка гороскопа'}
          </button>
          {showHint[ev.id] && (
            <p style={{ fontSize: '13px', color: '#ccc', marginTop: '6px', fontStyle: 'italic', lineHeight: 1.5 }}>
              {ev.hint}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
