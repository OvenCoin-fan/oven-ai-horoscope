import { useState, useEffect } from 'react';
import './App.css';

const ZODIACS = [
  {s:'aries',e:'♈',n:'Овен'},{s:'taurus',e:'♉',n:'Телец'},
  {s:'gemini',e:'♊',n:'Близнецы'},{s:'cancer',e:'♋',n:'Рак'},
  {s:'leo',e:'♌',n:'Лев'},{s:'virgo',e:'♍',n:'Дева'},
  {s:'libra',e:'♎',n:'Весы'},{s:'scorpio',e:'♏',n:'Скорпион'},
  {s:'sagittarius',e:'♐',n:'Стрелец'},{s:'capricorn',e:'♑',n:'Козерог'},
  {s:'aquarius',e:'♒',n:'Водолей'},{s:'pisces',e:'♓',n:'Рыбы'},
];

const HOROS = {
  aries:'♈ Овен: Звёзды на твоей стороне. Риски оправдаются!',
  taurus:'♉ Телец: Стабильность — суперсила.',
  gemini:'♊ Близнецы: Информация — валюта.',
  cancer:'♋ Рак: Доверяй чувствам.',
  leo:'♌ Лев: Сцена твоя.',
  virgo:'♍ Дева: Детали решают всё.',
  libra:'♎ Весы: Баланс — ключ к гармонии.',
  scorpio:'♏ Скорпион: Трансформация.',
  sagittarius:'♐ Стрелец: Горизонт расширяется.',
  capricorn:'♑ Козерог: Дисциплина — твой козырь.',
  aquarius:'♒ Водолей: Инновации в воздухе.',
  pisces:'♓ Рыбы: Интуиция на пике.',
};

const MARKETS = [
  {id:'btc-65k',emoji:'📈',title:'BTC выше $65,000 в пятницу?',outcomes:['Да','Нет'],hint:'♈ Марс в Овне — к росту. Но Сатурн тормозит.',pool:[130,70]},
  {id:'ton-top10',emoji:'💎',title:'TON в топ-10 к сентябрю?',outcomes:['Да','Нет'],hint:'♈ Юпитер расширяет границы.',pool:[60,140]},
  {id:'elon-tweet',emoji:'🐦',title:'Маск упомянет DOGE/TON до 15 августа?',outcomes:['Да','Нет'],hint:'♈ Меркурий в ретрограде.',pool:[100,100]},
];

const STAKE_TIERS = [
  {id:'3d',label:'3 дня',days:3,apy:3,emoji:'🥉'},
  {id:'7d',label:'7 дней',days:7,apy:6,emoji:'🥈'},
  {id:'30d',label:'30 дней',days:30,apy:10,emoji:'🥇'},
];

const SWAP_RATE = 1000; // 1 GRAM = 1000 $OVEN

function getPrices(pool) {
  const t = pool[0] + pool[1];
  return [pool[0]/t, pool[1]/t];
}

function App() {
  const [connected, setConnected] = useState(false);
  const [ovenBal, setOvenBal] = useState(0);
  const [gramBal, setGramBal] = useState(0);
  const [selSign, setSelSign] = useState(null);
  const [horoText, setHoroText] = useState('');
  const [markets, setMarkets] = useState(MARKETS);
  const [positions, setPositions] = useState({});
  const [error, setError] = useState('');
  const [trade, setTrade] = useState({});
  const [hint, setHint] = useState({});
  const [swapAmt, setSwapAmt] = useState(1);
  const [stakes, setStakes] = useState([]);
  const [stakeAmt, setStakeAmt] = useState('');
  const [selTier, setSelTier] = useState('7d');
  const [tab, setTab] = useState('swap');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(iv);
  }, []);

  const connectWallet = () => setConnected(true);

  const getHoro = (s) => {
    setSelSign(s);
    setHoroText(HOROS[s] || HOROS.aries);
  };

  // STON.fi swap: GRAM → $OVEN
  const doSwap = () => {
    if (swapAmt <= 0) { setError('Укажи сумму'); return; }
    if (swapAmt > gramBal) { setError('Недостаточно GRAM!'); return; }
    setError('');
    setGramBal(prev => +(prev - swapAmt).toFixed(4));
    setOvenBal(prev => prev + swapAmt * SWAP_RATE);
  };

  // Stake $OVEN
  const doStake = () => {
    const amt = parseInt(stakeAmt);
    if (!amt || amt <= 0) { setError('Укажи сумму $OVEN'); return; }
    if (amt > ovenBal) { setError('Недостаточно $OVEN!'); return; }
    const tier = STAKE_TIERS.find(t => t.id === selTier);
    if (!tier) return;
    setError('');
    setOvenBal(prev => prev - amt);
    setStakes(prev => [...prev, {
      id: Date.now(),
      amount: amt,
      tier: tier.id,
      apy: tier.apy,
      days: tier.days,
      startTime: Date.now(),
      unlockTime: Date.now() + tier.days * 86400000,
      reward: Math.floor(amt * tier.apy / 100 * tier.days / 365),
      claimed: false
    }]);
    setStakeAmt('');
  };

  // Claim unlocked stake
  const doClaim = (stakeId) => {
    const s = stakes.find(x => x.id === stakeId);
    if (!s || s.claimed || now < s.unlockTime) return;
    setOvenBal(prev => prev + s.amount + s.reward);
    setStakes(prev => prev.map(x => x.id === stakeId ? {...x, claimed: true} : x));
  };

  const buyShares = (mkId, idx, shares) => {
    const mk = markets.find(m => m.id === mkId);
    if (!mk) return;
    const prices = getPrices(mk.pool);
    const cost = prices[idx] * shares * 1.02;
    if (cost > ovenBal) { setError('Недостаточно $OVEN! Купи через STON.fi.'); return; }
    setError('');
    const np = [...mk.pool]; np[idx] += shares;
    setMarkets(prev => prev.map(m => m.id === mkId ? {...m, pool: np} : m));
    setPositions(p => ({...p, [mkId]: {...p[mkId], [idx]: (p[mkId]?.[idx]||0) + shares}}));
  };

  const sellShares = (mkId, idx, shares) => {
    const held = positions[mkId]?.[idx] || 0;
    if (shares > held) return;
    const mk = markets.find(m => m.id === mkId);
    if (!mk) return;
    const np = [...mk.pool]; np[idx] = Math.max(1, np[idx] - shares);
    setMarkets(prev => prev.map(m => m.id === mkId ? {...m, pool: np} : m));
    setPositions(p => ({...p, [mkId]: {...p[mkId], [idx]: held - shares}}));
  };

  const totalStaked = stakes.filter(s => !s.claimed).reduce((a, s) => a + s.amount, 0);
  const totalRewards = stakes.filter(s => !s.claimed).reduce((a, s) => a + s.reward, 0);

  const fmtTime = (ms) => {
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    if (d > 0) return `${d}д ${h}ч`;
    if (h > 0) return `${h}ч ${m}м`;
    return `${m}м`;
  };

  return (
    <div className="app">
      <header className="card" style={{textAlign:'center',marginBottom:'8px'}}>
        <h1 style={{fontSize:'32px',margin:0}}>♈ $OVEN</h1>
        <p style={{color:'#888',fontSize:'14px',marginTop:'8px'}}>AI Horoscope • TON Mini App</p>
        <p style={{color:'#d4a017',fontSize:'12px',marginTop:'4px'}}>Овны рулят рынком ♈</p>
      </header>

      <main className="main">
        {/* Гороскоп */}
        <div className="card">
          <h2>🔮 AI Гороскоп</h2>
          <p style={{color:'#888',fontSize:'13px',marginBottom:'12px'}}>Выбери знак — Mira предскажет день</p>
          <div className="zodiac-grid">
            {ZODIACS.map(({s,e,n}) => (
              <button key={s} className={`zodiac-btn ${selSign===s?'active':''}`} onClick={() => getHoro(s)}>
                <span className="emoji">{e}</span>{n}
              </button>
            ))}
          </div>
          {horoText && <div className="horoscope-result">{horoText}</div>}
        </div>

        {!connected ? (
          <div className="card">
            <div style={{textAlign:'center',padding:'20px 16px'}}>
              <p style={{fontSize:'48px',marginBottom:'12px'}}>👛</p>
              <h2 style={{marginBottom:'8px'}}>Подключи кошелёк</h2>
              <p style={{color:'#888',fontSize:'14px',marginBottom:'24px'}}>Ставки и стейкинг в $OVEN. Без кошелька — не играешь.</p>
              <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                <button onClick={connectWallet} style={{padding:'14px 24px',borderRadius:'12px',border:'1px solid rgba(212,160,23,0.3)',background:'rgba(212,160,23,0.08)',color:'#e8e8e8',fontSize:'15px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
                  <span style={{fontSize:'20px'}}>💎</span> Tonkeeper
                </button>
                <button onClick={connectWallet} style={{padding:'14px 24px',borderRadius:'12px',border:'1px solid rgba(212,160,23,0.3)',background:'rgba(212,160,23,0.08)',color:'#e8e8e8',fontSize:'15px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
                  <span style={{fontSize:'20px'}}>🔵</span> TON Wallet
                </button>
                <button onClick={connectWallet} style={{padding:'14px 24px',borderRadius:'12px',border:'1px solid rgba(212,160,23,0.3)',background:'rgba(212,160,23,0.08)',color:'#e8e8e8',fontSize:'15px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
                  <span style={{fontSize:'20px'}}>🟣</span> MyTonWallet
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Баланс */}
            <div className="card">
              <div className="balance-bar" style={{marginBottom:'0'}}>
                <div><span className="label">🔥 $OVEN</span><span className="amount" style={{marginLeft:'8px'}}>{ovenBal.toLocaleString()}</span></div>
                <div><span className="label">🪙 GRAM</span><span className="amount" style={{marginLeft:'8px'}}>{gramBal}</span></div>
              </div>
              {totalStaked > 0 && (
                <div style={{marginTop:'8px',padding:'8px 16px',background:'rgba(76,175,80,0.08)',borderRadius:'8px',border:'1px solid rgba(76,175,80,0.2)'}}>
                  <span style={{fontSize:'12px',color:'#888'}}>🔒 В стейке: </span>
                  <span style={{fontSize:'12px',color:'#4f4',fontWeight:600}}>{totalStaked.toLocaleString()} $OVEN</span>
                  <span style={{fontSize:'12px',color:'#888',marginLeft:'12px'}}>💰 Награда: </span>
                  <span style={{fontSize:'12px',color:'#d4a017',fontWeight:600}}>{totalRewards.toLocaleString()} $OVEN</span>
                </div>
              )}
            </div>

            {/* Табы: Свап / Стейкинг */}
            <div className="card">
              <div style={{display:'flex',gap:'6px',marginBottom:'16px'}}>
                <button onClick={() => setTab('swap')} style={{flex:1,padding:'10px',borderRadius:'10px',border:tab==='swap'?'2px solid #d4a017':'1px solid rgba(212,160,23,0.25)',background:tab==='swap'?'rgba(212,160,23,0.15)':'rgba(212,160,23,0.04)',color:'#e8e8e8',fontSize:'14px',fontWeight:tab==='swap'?700:400,cursor:'pointer'}}>💱 Купить $OVEN</button>
                <button onClick={() => setTab('stake')} style={{flex:1,padding:'10px',borderRadius:'10px',border:tab==='stake'?'2px solid #d4a017':'1px solid rgba(212,160,23,0.25)',background:tab==='stake'?'rgba(212,160,23,0.15)':'rgba(212,160,23,0.04)',color:'#e8e8e8',fontSize:'14px',fontWeight:tab==='stake'?700:400,cursor:'pointer'}}>🔒 Стейкинг</button>
              </div>

              {tab === 'swap' && (
                <>
                  <div style={{marginBottom:'12px',padding:'12px',background:'rgba(212,160,23,0.04)',borderRadius:'12px'}}>
                    <p style={{fontSize:'13px',color:'#888'}}>💱 STON.fi: <span style={{color:'#e8e8e8',fontWeight:600}}>1 GRAM = {SWAP_RATE.toLocaleString()} $OVEN</span></p>
                    <p style={{fontSize:'11px',color:'#666',marginTop:'4px'}}>Обмен через STON.fi DEX. В продакшене — реальный swap.</p>
                  </div>
                  <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
                    {[0.5, 1, 2, 5].map(n => (
                      <button key={n} onClick={() => setSwapAmt(n)} style={{flex:1,padding:'8px',borderRadius:'8px',border:swapAmt===n?'2px solid #d4a017':'1px solid rgba(212,160,23,0.25)',background:swapAmt===n?'rgba(212,160,23,0.15)':'rgba(212,160,23,0.04)',color:'#e8e8e8',fontSize:'13px',cursor:'pointer'}}>{n}</button>
                    ))}
                  </div>
                  <div style={{padding:'10px',background:'rgba(212,160,23,0.06)',borderRadius:'8px',marginBottom:'12px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontSize:'14px',color:'#888'}}>Отдаёшь:</span>
                      <span style={{fontSize:'14px',color:'#e8e8e8',fontWeight:600}}>{swapAmt} GRAM</span>
                    </div>
                    <p style={{textAlign:'center',fontSize:'18px',margin:'6px 0'}}>⬇️</p>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontSize:'14px',color:'#888'}}>Получаешь:</span>
                      <span style={{fontSize:'16px',color:'#d4a017',fontWeight:700}}>{(swapAmt * SWAP_RATE).toLocaleString()} $OVEN</span>
                    </div>
                  </div>
                  <button className="mint-btn" onClick={doSwap}>💱 Обменять через STON.fi</button>
                </>
              )}

              {tab === 'stake' && (
                <>
                  <div style={{marginBottom:'12px',padding:'12px',background:'rgba(212,160,23,0.04)',borderRadius:'12px'}}>
                    <p style={{fontSize:'13px',color:'#888'}}>🔒 Заблокируй $OVEN и получай процент</p>
                    <p style={{fontSize:'11px',color:'#666',marginTop:'4px'}}>Награды выплачиваются после разблокировки</p>
                  </div>

                  {/* Выбор тарифа */}
                  <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
                    {STAKE_TIERS.map(tier => (
                      <button key={tier.id} onClick={() => setSelTier(tier.id)} style={{flex:1,padding:'10px 6px',borderRadius:'10px',border:selTier===tier.id?'2px solid #d4a017':'1px solid rgba(212,160,23,0.25)',background:selTier===tier.id?'rgba(212,160,23,0.15)':'rgba(212,160,23,0.04)',color:'#e8e8e8',fontSize:'12px',cursor:'pointer',textAlign:'center'}}>
                        <span style={{fontSize:'20px',display:'block',marginBottom:'4px'}}>{tier.emoji}</span>
                        <span style={{fontWeight:700}}>{tier.label}</span>
                        <span style={{display:'block',color:'#d4a017',fontWeight:700,marginTop:'2px'}}>{tier.apy}% годовых</span>
                      </button>
                    ))}
                  </div>

                  {/* Сумма */}
                  <input type="number" placeholder="Сумма $OVEN" value={stakeAmt} onChange={e => setStakeAmt(e.target.value)} style={{width:'100%',padding:'12px',borderRadius:'10px',border:'1px solid rgba(212,160,23,0.25)',background:'rgba(212,160,23,0.04)',color:'#e8e8e8',fontSize:'15px',marginBottom:'12px',boxSizing:'border-box',outline:'none'}} />

                  {/* Предпросмотр */}
                  {stakeAmt && parseInt(stakeAmt) > 0 && (() => {
                    const tier = STAKE_TIERS.find(t => t.id === selTier);
                    const amt = parseInt(stakeAmt);
                    const reward = Math.floor(amt * tier.apy / 100 * tier.days / 365);
                    return (
                      <div style={{padding:'10px',background:'rgba(212,160,23,0.06)',borderRadius:'8px',marginBottom:'12px'}}>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                          <span style={{fontSize:'13px',color:'#888'}}>Блокировка:</span>
                          <span style={{fontSize:'13px',color:'#e8e8e8'}}>{tier.emoji} {tier.label}</span>
                        </div>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                          <span style={{fontSize:'13px',color:'#888'}}>Стейкаешь:</span>
                          <span style={{fontSize:'13px',color:'#e8e8e8'}}>{amt.toLocaleString()} $OVEN</span>
                        </div>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                          <span style={{fontSize:'13px',color:'#888'}}>Награда:</span>
                          <span style={{fontSize:'14px',color:'#d4a017',fontWeight:700}}>+{reward.toLocaleString()} $OVEN</span>
                        </div>
                        <div style={{display:'flex',justifyContent:'space-between'}}>
                          <span style={{fontSize:'13px',color:'#888'}}>Итого после разблокировки:</span>
                          <span style={{fontSize:'14px',color:'#4f4',fontWeight:700}}>{(amt + reward).toLocaleString()} $OVEN</span>
                        </div>
                      </div>
                    );
                  })()}

                  <button className="mint-btn" onClick={doStake}>🔒 Заблокировать $OVEN</button>

                  {/* Активные стейки */}
                  {stakes.filter(s => !s.claimed).length > 0 && (
                    <div style={{marginTop:'16px'}}>
                      <h3 style={{fontSize:'15px',color:'#e8e8e8',marginBottom:'10px'}}>📋 Активные стейки</h3>
                      {stakes.filter(s => !s.claimed).map(s => {
                        const tier = STAKE_TIERS.find(t => t.id === s.tier);
                        const left = s.unlockTime - now;
                        const unlocked = left <= 0;
                        return (
                          <div key={s.id} style={{padding:'12px',background:'rgba(212,160,23,0.04)',borderRadius:'10px',border:'1px solid rgba(212,160,23,0.12)',marginBottom:'8px'}}>
                            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                              <span style={{fontSize:'13px',color:'#e8e8e8'}}>{tier.emoji} {tier.label} • {s.apy}% APY</span>
                              <span style={{fontSize:'13px',color:'#d4a017',fontWeight:600}}>{s.amount.toLocaleString()} $OVEN</span>
                            </div>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                              <span style={{fontSize:'12px',color:unlocked?'#4f4':'#888'}}>
                                {unlocked ? '✅ Разблокировано' : `⏳ Осталось: ${fmtTime(left)}`}
                              </span>
                              <span style={{fontSize:'12px',color:'#d4a017'}}>+{s.reward.toLocaleString()} $OVEN</span>
                            </div>
                            {unlocked && (
                              <button onClick={() => doClaim(s.id)} style={{width:'100%',marginTop:'8px',padding:'8px',borderRadius:'8px',border:'none',background:'linear-gradient(135deg,#4CAF50,#2E7D32)',color:'#fff',fontSize:'13px',fontWeight:700,cursor:'pointer'}}>💰 Забрать {s.amount + s.reward} $OVEN</button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Predictions */}
            <div className="card">
              <h2>🎯 OVEN Predictions</h2>
              <p style={{color:'#888',fontSize:'13px',marginBottom:'12px'}}>Покупай акции исхода за $OVEN. Угадал — каждая акция = 1 $OVEN.</p>
              {error && <div style={{padding:'10px',background:'rgba(255,50,50,0.1)',borderRadius:'8px',border:'1px solid rgba(255,50,50,0.3)',marginBottom:'12px'}}><p style={{fontSize:'13px',color:'#f55'}}>⚠️ {error}</p></div>}
              {markets.map(mk => {
                const prices = getPrices(mk.pool);
                const myPos = positions[mk.id] || {};
                const t = trade[mk.id];
                return (
                  <div key={mk.id} style={{marginBottom:'20px',padding:'16px',background:'rgba(212,160,23,0.04)',borderRadius:'12px',border:'1px solid rgba(212,160,23,0.12)'}}>
                    <p style={{fontSize:'15px',fontWeight:600,marginBottom:'12px',color:'#e8e8e8'}}>{mk.emoji} {mk.title}</p>
                    <div style={{marginBottom:'12px'}}>
                      {mk.outcomes.map((name, i) => {
                        const pct = Math.round(prices[i]*100);
                        const held = myPos[i] || 0;
                        return (
                          <div key={i} style={{marginBottom:'8px'}}>
                            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                              <span style={{fontSize:'13px',color:'#e8e8e8'}}>{name}</span>
                              <span style={{fontSize:'13px',color:'#d4a017',fontWeight:600}}>{pct}¢</span>
                            </div>
                            <div style={{height:'8px',background:'rgba(212,160,23,0.1)',borderRadius:'4px',overflow:'hidden'}}>
                              <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#d4a017,#8b6914)',borderRadius:'4px',transition:'width 0.3s'}} />
                            </div>
                            {held > 0 && <p style={{fontSize:'11px',color:'#4f4',marginTop:'2px'}}>У вас: {held} акций</p>}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{display:'flex',gap:'6px',marginBottom:'8px'}}>
                      {mk.outcomes.map((name, i) => (
                        <button key={i} onClick={() => setTrade(p => ({...p,[mk.id]:{outcome:i,amount:p[mk.id]?.amount||10}}))} style={{flex:1,padding:'8px',borderRadius:'8px',border:t?.outcome===i?'2px solid #d4a017':'1px solid rgba(212,160,23,0.25)',background:t?.outcome===i?'rgba(212,160,23,0.15)':'rgba(212,160,23,0.04)',color:'#e8e8e8',fontSize:'13px',cursor:'pointer'}}>Купить «{name}»</button>
                      ))}
                    </div>
                    {t && t.outcome !== undefined && (
                      <div style={{padding:'10px',background:'rgba(212,160,23,0.06)',borderRadius:'8px'}}>
                        <p style={{fontSize:'12px',color:'#888',marginBottom:'6px'}}>Кол-во акций «{mk.outcomes[t.outcome]}»:</p>
                        <div style={{display:'flex',gap:'6px',marginBottom:'8px'}}>
                          {[5,10,25,50].map(n => (
                            <button key={n} onClick={() => setTrade(p => ({...p,[mk.id]:{...p[mk.id],amount:n}}))} style={{padding:'5px 12px',borderRadius:'6px',border:t.amount===n?'2px solid #d4a017':'1px solid rgba(212,160,23,0.25)',background:t.amount===n?'rgba(212,160,23,0.15)':'rgba(212,160,23,0.04)',color:'#e8e8e8',fontSize:'12px',cursor:'pointer'}}>{n}</button>
                          ))}
                        </div>
                        <div style={{marginBottom:'8px',padding:'8px',background:'rgba(212,160,23,0.08)',borderRadius:'6px'}}>
                          <p style={{fontSize:'12px',color:'#888'}}>Стоимость: <span style={{color:'#e8e8e8'}}>{(prices[t.outcome]*t.amount*1.02).toFixed(2)} $OVEN</span></p>
                          <p style={{fontSize:'12px',color:'#888',marginTop:'2px'}}>Выигрыш: <span style={{color:'#d4a017',fontWeight:700}}>{t.amount} $OVEN</span></p>
                        </div>
                        <div style={{display:'flex',gap:'6px'}}>
                          <button onClick={() => buyShares(mk.id,t.outcome,t.amount)} style={{flex:1,padding:'8px',borderRadius:'8px',border:'none',background:'linear-gradient(135deg,#d4a017,#8b6914)',color:'#fff',fontSize:'13px',fontWeight:700,cursor:'pointer'}}>Купить за {(prices[t.outcome]*t.amount*1.02).toFixed(1)} $OVEN</button>
                          {(myPos[t.outcome]||0) > 0 && (
                            <button onClick={() => sellShares(mk.id,t.outcome,Math.min(t.amount,myPos[t.outcome]||0))} style={{flex:1,padding:'8px',borderRadius:'8px',border:'1px solid rgba(255,50,50,0.4)',background:'rgba(255,50,50,0.1)',color:'#f88',fontSize:'13px',cursor:'pointer'}}>Продать {Math.min(t.amount,myPos[t.outcome]||0)}</button>
                          )}
                        </div>
                      </div>
                    )}
                    <button onClick={() => setHint(p => ({...p,[mk.id]:!p[mk.id]}))} style={{background:'none',border:'none',color:'#d4a017',fontSize:'12px',cursor:'pointer',padding:'4px 0',marginTop:'8px'}}>
                      {hint[mk.id] ? '🔮 Скрыть подсказку' : '🔮 Подсказка гороскопа'}
                    </button>
                    {hint[mk.id] && <p style={{fontSize:'13px',color:'#aaa',marginTop:'6px',fontStyle:'italic',lineHeight:1.5}}>{mk.hint}</p>}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      <footer className="footer"><p>🔥 $OVEN AI Horoscope • Built on TON • Powered by Mira</p></footer>
    </div>
  );
}

export default App;
