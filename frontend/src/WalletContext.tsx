import { useState, createContext, useContext } from 'react';
import './App.css';

interface WalletState {
  connected: boolean;
  address: string | null;
  ovenBalance: number;
  tonBalance: number;
}

const defaultWallet: WalletState = { connected: false, address: null, ovenBalance: 0, tonBalance: 0 };

export const WalletContext = createContext<{ wallet: WalletState; connect: (type: string) => void; disconnect: () => void }>({
  wallet: defaultWallet,
  connect: () => {},
  disconnect: () => {}
});

export const useWallet = () => useContext(WalletContext);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>(defaultWallet);

  const connect = (type: string) => {
    setWallet({
      connected: true,
      address: 'UQBCF...W9aR',
      ovenBalance: 0,
      tonBalance: 2.5
    });
  };

  const disconnect = () => setWallet(defaultWallet);

  return (
    <WalletContext.Provider value={{ wallet, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}
