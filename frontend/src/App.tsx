import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { Header } from './components/Header';
import { Horoscope } from './components/Horoscope';
import { Wallet } from './components/Wallet';
import { MintOven } from './components/MintOven';
import './App.css';

function App() {
  return (
    <TonConnectUIProvider manifestUrl="https://oven-horoscope.vercel.app/tonconnect-manifest.json">
      <div className="app">
        <Header />
        <main className="main">
          <Horoscope />
          <Wallet />
          <MintOven />
        </main>
        <footer className="footer"><p>🔥 $OVEN AI Horoscope • Built on TON • Powered by Mira</p></footer>
      </div>
    </TonConnectUIProvider>
  );
}
export default App;
