import { WalletProvider } from './WalletContext';
import { Header } from './Header';
import { Horoscope } from './Horoscope';
import { Predictions } from './Predictions';
import { MintOven } from './MintOven';
import '../App.css';

function App() {
  return (
    <WalletProvider>
      <div className="app">
        <Header />
        <main className="main">
          <Horoscope />
          <Predictions />
          <MintOven />
        </main>
        <footer className="footer"><p>🔥 $OVEN AI Horoscope • Built on TON • Powered by Mira</p></footer>
      </div>
    </WalletProvider>
  );
}
export default App;
