import { WalletProvider, useWallet } from './WalletContext';
import { Header } from './Header';
import { Horoscope } from './Horoscope';
import { Predictions } from './Predictions';
import { WalletConnect } from './WalletConnect';
import './App.css';

function AppContent() {
  const { wallet } = useWallet();
  return (
    <div className="app">
      <Header />
      <main className="main">
        <Horoscope />
        {!wallet.connected ? <WalletConnect /> : <Predictions />}
      </main>
      <footer className="footer"><p>🔥 $OVEN AI Horoscope • Built on TON • Powered by Mira</p></footer>
    </div>
  );
}

function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}
export default App;
