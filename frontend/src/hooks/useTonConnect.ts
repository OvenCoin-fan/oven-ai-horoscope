import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';

export function useTonConnect() {
  const [tonConnectUI] = useTonConnectUI();
  const rawAddress = useTonAddress(false);
  const friendlyAddress = useTonAddress();
  const connected = !!rawAddress;
  return {
    tonConnectUI,
    rawAddress,
    friendlyAddress,
    connected,
    connect: () => tonConnectUI.openModal(),
    disconnect: () => tonConnectUI.disconnect(),
  };
}
