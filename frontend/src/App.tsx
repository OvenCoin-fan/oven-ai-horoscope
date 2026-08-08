import { Header } from './components/Header';
import { Horoscope } from './components/Horoscope';
import { MintOven } from './components/MintOven';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main">
        <Horoscope />
        <MintOven />
      </main>
      <footer className="footer"><p>🔥 $OVEN AI Horoscope • Built on TON • Powered by Mira</p></footer>
    </div>
  );
}
export default App;
