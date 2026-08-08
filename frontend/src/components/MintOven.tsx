import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { beginCell, toNano, Address } from '@ton/core';
import '../App.css';

// Replace with actual deployed $OVEN jetton master address
const OVEN_MASTER = 'EQD_________________________________________8';

export function MintOven() {
  const [ui] = useTonConnectUI();
  const addr = useTonAddress();
  const mint = async () => {
    if(!ui.connected||!addr) return;
    try {
      const body = beginCell().storeUint(0x178d4519,32).storeUint(0,64).storeCoins(toNano('100')).storeAddress(Address.parse(addr)).endCell();
      await ui.sendTransaction({validUntil:Math.floor(Date.now()/1000)+600,messages:[{address:OVEN_MASTER,amount:toNano('0.1').toString(),payload:body.toBoc().toString('base64')}]});
    }catch(e){console.error('Mint failed:',e)}
  };
  return (
    <div className="card">
      <h2>♈ Минт $OVEN</h2>
      <p style={{color:'#999',fontSize:'14px',marginBottom:'16px'}}>Получи 100 $OVEN — токен Овнов. Первый гороскоп-токен на TON.</p>
      <div style={{marginBottom:'12px',padding:'12px',background:'rgba(255,107,0,0.05)',borderRadius:'12px'}}>
        <p style={{fontSize:'13px',color:'#999'}}>🔥 Total Supply: 1,000,000,000 $OVEN</p>
        <p style={{fontSize:'13px',color:'#999'}}>♈ Держи $OVEN — получай гороскопы</p>
        <p style={{fontSize:'13px',color:'#999'}}>💎 Чем больше $OVEN — тем точнее предсказание</p>
      </div>
      <button onClick={mint} disabled={!ui.connected} className="mint-btn">
        {ui.connected ? '🔥 Минт 100 $OVEN' : 'Подключи кошелёк первым'}
      </button>
    </div>
  );
}
