import { useState, useCallback } from 'react';
import { TonClient } from '@ton/ton';
import { Address, beginCell } from '@ton/core';
import { CONTRACTS, TONCENTER_API } from '../constants';

const client = new TonClient({ endpoint: TONCENTER_API });

function crc32b(str: string): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i);
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

export function useContract() {
  const [loading, setLoading] = useState(false);

  const getOvenSupply = useCallback(async () => {
    try {
      const addr = Address.parse(CONTRACTS.ovenJettonMinter);
      const result = await client.runMethod(addr, 'getTotalSupply');
      return result.stack.readBigNumber();
    } catch { return BigInt(0); }
  }, []);

  const getTonBalance = useCallback(async (address: string) => {
    try {
      const addr = Address.parse(address);
      const balance = await client.getBalance(addr);
      return Number(balance) / 1e9;
    } catch { return 0; }
  }, []);

  const getOvenBalance = useCallback(async (ownerAddress: string) => {
    try {
      const minterAddr = Address.parse(CONTRACTS.ovenJettonMinter);
      const ownerAddr = Address.parse(ownerAddress);
      const result = await client.runMethod(minterAddr, 'get_wallet_address', [
        { type: 'slice', cell: beginCell().storeAddress(ownerAddr).endCell() }
      ]);
      const jettonWalletAddr = result.stack.readAddress();
      if (!jettonWalletAddr) return 0;
      const jettonResult = await client.runMethod(jettonWalletAddr, 'get_wallet_data');
      const balance = jettonResult.stack.readBigNumber();
      return Number(balance) / 1e9;
    } catch { return 0; }
  }, []);

  const buildMintBody = useCallback((to: Address, amount: number) => {
    const mintOp = crc32b('Mint') & 0x7FFFFFFF;
    return beginCell().storeUint(mintOp, 32).storeAddress(to).storeCoins(amount).endCell();
  }, []);

  return { loading, setLoading, client, getOvenSupply, getTonBalance, getOvenBalance, buildMintBody, CONTRACTS };
}
