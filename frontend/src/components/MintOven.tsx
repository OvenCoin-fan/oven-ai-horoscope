import '../App.css';

export function MintOven() {
  return (
    <div className="card">
      <h2>♈ Минт $OVEN</h2>
      <p style={{color:'#888',fontSize:'14px',marginBottom:'16px'}}>Получи $OVEN — токен Овнов. Первый гороскоп-токен на TON.</p>
      <div style={{marginBottom:'12px',padding:'12px',background:'rgba(212,160,23,0.04)',borderRadius:'12px'}}>
        <p style={{fontSize:'13px',color:'#888'}}>🔥 Total Supply: 1,000,000,000 $OVEN</p>
        <p style={{fontSize:'13px',color:'#888'}}>♈ Держи $OVEN — получай гороскопы</p>
        <p style={{fontSize:'13px',color:'#888'}}>💎 Чем больше $OVEN — тем точнее предсказание</p>
      </div>
      <button className="mint-btn" onClick={()=>alert('Подключи TON кошелёк через Telegram!')}>
        🔥 Минт 100 $OVEN
      </button>
    </div>
  );
}
