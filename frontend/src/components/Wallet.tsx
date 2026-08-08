import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import '../App.css';
export function Wallet() {
  const [ui] = useTonConnectUI();
  return (
    <div className="card">
      <h2>💰 Кошелёк TON</h2>
      <div className="wallet-status">
        <div className={`wallet-dot ${ui.connected?'connected':'disconnected'}`}/>
        <span style={{color:'#999',fontSize:'14px'}}>{ui.connected?'Подключён':'Не подключён'}</span>
      </div>
      <TonConnectButton/>
    </div>
  );
}
