import { useState, useEffect, useCallback } from 'react';
import { ZODIACS, STAKE_TIERS, SWAP_RATE, STONFI_URL, CONTRACTS } from './constants';
import './App.css';

const MANIFEST_URL = 'https://oven-ai-horoscope-six.vercel.app/tonconnect-manifest.json';

const FALLBACK_HORO: Record<string, string> = {
  aries: '♈ Овен: День перемен. Риски оправдаются, если действуешь решительно!',
  taurus: '♉ Телец: Стабильность — суперсила. Укрепляй то, что работает.',
  gemini: '♊ Близнецы: Информация — валюта. Новые связи принесут возможности.',
  cancer: '♋ Рак: Доверяй чувствам. Внутренний голос подскажет верное решение.',
  leo: '♌ Лев: Сцена твоя. Проявись — и мир заметит.',
  virgo: '♍ Дева: Детали решают всё. Перепроверь — и успех гарантирован.',
  libra: '♎ Весы: Баланс — ключ к гармонии. Партнёрство принесёт плоды.',
  scorpio: '♏ Скорпион: Трансформация. Отпусти старое — придёт новое.',
  sagittarius: '♐ Стрелец: Горизонт расширяется. Не бойся нового.',
  capricorn: '♑ Козерог: Дисциплина — твой козырь. Признание близко.',
  aquarius: '♒ Водолей: Инновации в воздухе. Будь первым.',
  pisces: '♓ Рыбы: Интуиция на пике. Доверься потоку.',
};

function fmtTime(ms: number) {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (d > 0) return d + 'д ' + h + 'ч';
  if (h > 0) return h + 'ч ' + m + 'м';
  return m + 'м';
}

// Lazy blockchain reader - only loads when wallet connects
let _tonClient: any = null;
async function getTonClient() {
  if (!_tonClient) {
    const { TonClient } = await import('@ton/ton');
    const { TONCENTER_API } = await import('./constants');
    _tonClient = new TonClient({ endpoint: TONCENTER_API });
  }
  return _tonClient;
}

async function fetchBalances(address: string) {
  try {
    const { Address, beginCell } = await import('@ton/core');
    const { CONTRACTS } = await import('./constants');
    const client = await getTonClient();

    // TON balance
    const addr = Address.parse(address);
    const tonBal = Number(await client.getBalance(addr)) / 1e9;

    // $OVEN jetton balance
    let ovenBal = 0;
    try {
      const minterAddr = Address.parse(CONTRACTS.ovenJettonMinter);
      const result = await client.runMethod(minterAddr, 'get_wallet_address', [
        { type: 'slice', cell: beginCell().storeAddress(addr).endCell() }
      ]);
      const jettonWalletAddr = result.stack.readAddress();
      if (jettonWalletAddr) {
        const jettonResult = await client.runMethod(jettonWalletAddr, 'get_wallet_data');
        ovenBal = Number(jettonResult.stack.readBigNumber()) / 1e9;
      }
    } catch {}

    // Supply
    let supply = '0';
    try {
      const minterAddr = Address.parse(CONTRACTS.ovenJettonMinter);
      const result = await client.runMethod(minterAddr, 'getTotalSupply');
      supply = result.stack.readBigNumber().toString();
    } catch {}

    return { tonBal: Math.round(tonBal * 1000) / 1000, ovenBal: Math.round(ovenBal * 100) / 100, supply };
  } catch {
    return { tonBal: 0, ovenBal: 0, supply: '0' };
  }
}

export default function App() {
  const [tonUI, setTonUI] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [rawAddress, setRawAddress] = useState('');
  const [friendlyAddress, setFriendlyAddress] = useState('');
  const [walletError, setWalletError] = useState('');
  const [connecting, setConnecting] = useState(false);

  const [ovenBal, setOvenBal] = useState(0);
  const [tonBal, setTonBal] = useState(0);
  const [selSign, setSelSign] = useState<string | null>(null);
  const [horoText, setHoroText] = useState('');
  const [horoLoading, setHoroLoading] = useState(false);
  const [error, setError] = useState('');
  const [swapAmt, setSwapAmt] = useState('');
  const [stakes, setStakes] = useState<any[]>([]);
  const [stakeAmt, setStakeAmt] = useState('');
  const [selTier, setSelTier] = useState('7d');
  const [tab, setTab] = useState('swap');
  const [now, setNow] = useState(Date.now());
  const [supply, setSupply] = useState('0');

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (connected && rawAddress) {
      fetchBalances(rawAddress).then(b => {
        setTonBal(b.tonBal);
        setOvenBal(b.ovenBal);
        setSupply(b.supply);
      });
    }
  }, [connected, rawAddress]);

  const connect = useCallback(async () => {
    setConnecting(true);
    setWalletError('');
    try {
      if (!tonUI) {
        const { TonConnectUI } = await import('@tonconnect/ui-react');
        const ui = new TonConnectUI({ manifestUrl: MANIFEST_URL });
        ui.onStatusChange(wallet => {
          if (wallet) {
            setConnected(true);
            setRawAddress(wallet.account.address);
            setFriendlyAddress(wallet.account.address.slice(0, 8) + '...' + wallet.account.address.slice(-6));
          } else {
            setConnected(false);
            setRawAddress('');
            setFriendlyAddress('');
          }
        });
        setTonUI(ui);
        await ui.connectWallet();
      } else {
        await tonUI.connectWallet();
      }
    } catch (e: any) {
      console.error('[TON Connect]', e);
      setWalletError(e?.message || 'Не удалось подключить кошелёк. Попробуй открыть в Tonkeeper.');
    }
    setConnecting(false);
  }, [tonUI]);

  const disconnect = useCallback(async () => {
    if (tonUI) {
      try { await tonUI.disconnect(); } catch {}
    }
    setConnected(false);
    setRawAddress('');
    setFriendlyAddress('');
    setOvenBal(0);
    setTonBal(0);
  }, [tonUI]);

  const getHoro = useCallback(async (sign: string) => {
    setSelSign(sign);
    setHoroLoading(true);
    try {
      const res = await fetch('/api/horoscope?sign=' + sign);
      if (res.ok) {
        const data = await res.json();
        setHoroText(data.text || FALLBACK_HORO[sign]);
      } else { setHoroText(FALLBACK_HORO[sign]); }
    } catch { setHoroText(FALLBACK_HORO[sign]); }
    setHoroLoading(false);
  }, []);

  const openStonFi = () => window.open(STONFI_URL, '_blank');

  const doStake = () => {
    const amt = parseFloat(stakeAmt);
    if (!amt || amt <= 0) { setError('Укажи сумму $OVEN'); return; }
    if (amt > ovenBal) { setError('Недостаточно $OVEN!'); return; }
    const tier = STAKE_TIERS.find(t => t.id === selTier);
    if (!tier) return;
    setError('');
    setOvenBal(prev => Math.round((prev - amt) * 100) / 100);
    setStakes(prev => [...prev, { id: Date.now(), amount: amt, tier: tier.id, apy: tier.apy, days: tier.days, startTime: Date.now(), unlockTime: Date.now() + tier.days * 86400000, reward: Math.floor(amt * tier.apy / 100 * tier.days / 365 * 100) / 100, claimed: false }]);
    setStakeAmt('');
  };

  const doClaim = (stakeId: number) => {
    const s = stakes.find(x => x.id === stakeId);
    if (!s || s.claimed || now < s.unlockTime) return;
    setOvenBal(prev => Math.round((prev + s.amount + s.reward) * 100) / 100);
    setStakes(prev => prev.map(x => x.id === stakeId ? { ...x, claimed: true } : x));
  };

  const totalStaked = stakes.filter(s => !s.claimed).reduce((a, s) => a + s.amount, 0);
  const totalRewards = stakes.filter(s => !s.claimed).reduce((a, s) => a + s.reward, 0);
  const swapNum = parseFloat(swapAmt) || 0;

  return (
    <div className="app">
      <header className="card" style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '32px', margin: 0 }}>♈ $OVEN</h1>
        <p style={{ color: '#888', fontSize: '14px', marginTop: '8px' }}>AI Horoscope &bull; TON Mini App</p>
        <p style={{ color: '#d4a017', fontSize: '12px', marginTop: '4px' }}>Овны рулят рынком ♈ <span className="badge badge-testnet">TESTNET</span></p>
      </header>

      <main className="main">
        <div className="card">
          <h2>🔮 AI Гороскоп</h2>
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '12px' }}>Выбери знак — Mira предскажет день</p>
          <div className="zodiac-grid">
            {ZODIACS.map(({ id, emoji, name }) => (
              <button key={id} className={'zodiac-btn' + (selSign === id ? ' active' : '')} onClick={() => getHoro(id)}>
                <span className="emoji">{emoji}</span>{name}
              </button>
            ))}
          </div>
          {horoLoading && <div className="loading">✨ Звёзды выстраиваются...</div>}
          {horoText && !horoLoading && <div className="horoscope-result">{horoText}</div>}
        </div>

        {!connected ? (
          <div className="card">
            <div style={{ textAlign: 'center', padding: '20px 16px' }}>
              <p style={{ fontSize: '48px', marginBottom: '12px' }}>👛</p>
              <h2 style={{ marginBottom: '8px' }}>Подключи кошелёк</h2>
              <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>Стейкинг и свап в $OVEN</p>
              <button className="mint-btn" onClick={connect} disabled={connecting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: connecting ? 0.6 : 1 }}>
                <span style={{ fontSize: '18px' }}>💎</span> {connecting ? 'Подключение...' : 'Подключить TON Wallet'}
              </button>
              {walletError && <p style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '12px' }}>{walletError}</p>}
            </div>
          </div>
        ) : (
          <>
            <div className="card">
              <div className="balance-bar" style={{ marginBottom: '0' }}>
                <div><span className="label">🔥 $OVEN</span><span className="amount" style={{ marginLeft: '8px' }}>{ovenBal.toLocaleString()}</span></div>
                <div><span className="label">🪙 TON</span><span className="amount" style={{ marginLeft: '8px' }}>{tonBal.toLocaleString()}</span></div>
              </div>
              <p style={{ marginTop: '4px' }}>📦 Supply: {Number(supply).toLocaleString()} $OVEN</p>
            </div>

            <div className="card">
              <div className="tabs">
                <button className={'tab' + (tab === 'swap' ? ' active' : '')} onClick={() => setTab('swap')}>🔄 Свап</button>
                <button className={'tab' + (tab === 'stake' ? ' active' : '')} onClick={() => setTab('stake')}>🥩 Стейк</button>
              </div>

              {tab === 'swap' && (
                <div className="tab-content">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                    <input type="number" placeholder="TON → $OVEN" value={swapAmt} onChange={e => setSwapAmt(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#1a1a2e', color: '#fff', fontSize: '16px' }} />
                    <span style={{ color: '#888', fontSize: '14px' }}>→ {Math.floor(swapNum * SWAP_RATE).toLocaleString()} $OVEN</span>
                  </div>
                  <button className="mint-btn" onClick={openStonFi} style={{ width: '100%' }}>Свапнуть на STON.fi 💎</button>
                </div>
              )}

              {tab === 'stake' && (
                <div className="tab-content">
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                    {STAKE_TIERS.map(t => (
                      <button key={t.id} className={'tier-btn' + (selTier === t.id ? ' active' : '')} onClick={() => setSelTier(t.id)}>
                        {t.emoji} {t.label} <span style={{ color: '#d4a017' }}>{t.apy}% APY</span>
                      </button>
                    ))}
                  </div>
                  <input type="number" placeholder="Сумма $OVEN" value={stakeAmt} onChange={e => setStakeAmt(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#1a1a2e', color: '#fff', fontSize: '16px', marginBottom: '8px' }} />
                  <button className="mint-btn" onClick={doStake} style={{ width: '100%' }}>Застейкать 🥩</button>
                  {error && <p style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '8px' }}>{error}</p>}

                  {stakes.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <p style={{ color: '#888', fontSize: '13px', marginBottom: '8px' }}>Застейкано: {totalStaked.toLocaleString()} $OVEN | Награды: {totalRewards.toLocaleString()} $OVEN</p>
                      {stakes.map(s => (
                        <div key={s.id} style={{ padding: '8px', background: '#1a1a2e', borderRadius: '8px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '14px' }}>{s.amount.toLocaleString()} $OVEN</span>
                            <span style={{ color: '#888', fontSize: '12px', marginLeft: '8px' }}>{STAKE_TIERS.find(t => t.id === s.tier)?.label}</span>
                            <span style={{ color: '#d4a017', fontSize: '12px', marginLeft: '8px' }}>+{s.reward.toLocaleString()}</span>
                          </div>
                          <div>
                            {s.claimed ? <span style={{ color: '#888', fontSize: '12px' }}>✅ Выведено</span> :
                              now >= s.unlockTime ? <button onClick={() => doClaim(s.id)} style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', background: '#d4a017', color: '#000', fontSize: '12px', cursor: 'pointer' }}>Забрать</button> :
                              <span style={{ color: '#888', fontSize: '12px' }}>⏳ {fmtTime(s.unlockTime - now)}</span>
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <button onClick={disconnect} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #333', background: 'transparent', color: '#888', cursor: 'pointer' }}>Отключить 👋</button>
              <p style={{ marginTop: '8px', fontSize: '12px', color: '#555' }}>{friendlyAddress}</p>
              <p style={{ marginTop: '4px', fontSize: '12px', color: '#555' }}>Contracts: <a href={'https://testnet.tonscan.org/address/' + CONTRACTS.ovenJettonMinter} target="_blank" rel="noreferrer" style={{ color: '#d4a017' }}>Jetton</a></p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
