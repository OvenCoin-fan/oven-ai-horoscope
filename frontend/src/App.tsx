import { useState } from 'react';
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

const RATE = 1000; // 1 TON = 1000 $OVEN

function getPrices(pool) {
  const t = pool[0] + pool[1];
  return [pool[0]/t, pool[1]/t];
}

function App() {
  const [connected, setConnected] = useState(false);
  const [ovenBal, setOvenBal] = useState(0);
  const [tonBal, setTonBal] = useState(5.0);
  const [selSign, setSelSign] = useState(null);
  const [horoText, setHoroText] = useState('');
  const [markets, setMarkets] = useState(MARKETS);
  const [positions, setPositions] = useState({});
  const [error, setError] = useState('');
  const [trade, setTrade] = useState({});
  const [hint, setHint] = useState({});
  const [mintAmt, setMintAmt] = useState(1);

  const connectWallet = () => {
    setConnected(true);
  };

  const getHoro = (s) => {
    setSelSign(s);
    setHoroText(HOROS[s] || HOROS.aries);
  };

  const doMint = () => {
    const cost = mintAmt; // TON
    if (cost > tonBal) { setError('Недостаточно TON!'); return; }
    setError('');
    setTonBal(prev => +(prev - cost).toFixed(4));
    setOvenBal(prev => prev + mintAmt * RATE);
  };

  const buyShares = (mkId, idx, shares) => {
    const mk = markets.find(m => m.id === mkId);
    if (!mk) return;
    const prices = getPrices(mk.pool);
    const cost = prices[idx] * shares * 1.02;
    if (cost > ovenBal) { setError('Недостаточно $OVEN! Купи за TON.'); return; }
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

  return (
    <div className="app">
      <header className="card" style={{textAlign:'center',marginBottom:'8px'}}>
        <h1 style={{fontSize:'32px',margin:0}}>♈ $OVEN</h1>
        <p style={{color:'#888',fontSize:'14px',marginTop:'8px'}}>AI Horoscope • TON Mini App</p>
        <p style={{color:'#d4a017',fontSize:'12px',marginTop:'4px'}}>Овны рулят рынком ♈</p>
      </header>

      <main className="main">
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
              <p style={{color:'#888',fontSize:'14px',marginBottom:'24px'}}>Ставки и минт в $OVEN. Без кошелька — не играешь.</p>
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
            <div className="card">
              <div className="balance-bar" style={{marginBottom:'0'}}>
                <div><span className="label">🔥 $OVEN</span><span className="amount" style={{marginLeft:'8px'}}>{ovenBal.toLocaleString()}</span></div>
                <div><span className="label">💎 TON</span><span className="amount" style={{marginLeft:'8px'}}>{tonBal}</span></div>
              </div>
            </div>

            <div className="card">
              <h2>♈ Купить $OVEN</h2>
              <div style={{marginBottom:'12px',padding:'12px',background:'rgba(212,160,23,0.04)',borderRadius:'12px'}}>
                <p style={{fontSize:'13px',color:'#888'}}>💱 Курс: <span style={{color:'#e8e8e8',fontWeight:600}}>1 TON = {RATE.toLocaleString()} $OVEN</span></p>
                <p style={{fontSize:'13px',color:'#888'}}>🔥 Total Supply: 1,000,000,000 $OVEN</p>
              </div>
              <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
                {[0.5, 1, 2, 5].map(n => (
                  <button key={n} onClick={() => setMintAmt(n)} style={{flex:1,padding:'8px',borderRadius:'8px',border:mintAmt===n?'2px solid #d4a017':'1px solid rgba(212,160,23,0.25)',background:mintAmt===n?'rgba(212,160,23,0.15)':'rgba(212,160,23,0.04)',color:'#e8e8e8',fontSize:'13px',cursor:'pointer'}}>{n} TON</button>
                ))}
              </div>
              <div style={{padding:'10px',background:'rgba(212,160,23,0.06)',borderRadius:'8px',marginBottom:'12px'}}>
                <p style={{fontSize:'13px',color:'#888'}}>Получишь: <span style={{color:'#d4a017',fontWeight:700,fontSize:'16px'}}>{(mintAmt * RATE).toLocaleString()} $OVEN</span></p>
              </div>
              <button className="mint-btn" onClick={doMint}>💎 Купить за {mintAmt} TON</button>
            </div>

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
