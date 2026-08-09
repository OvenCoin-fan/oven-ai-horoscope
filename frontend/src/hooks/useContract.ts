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

  const getMarketCount = useCallback(async () => {
    try {
      const addr = Address.parse(CONTRACTS.marketFactory);
      const result = await client.runMethod(addr, 'getMarketCount');
      return result.stack.readBigNumber();
    } catch { return BigInt(0); }
  }, []);

  const buildMintBody = useCallback((to: Address, amount: number) => {
    const mintOp = crc32b('Mint') & 0x7FFFFFFF;
    return beginCell().storeUint(mintOp, 32).storeAddress(to).storeCoins(amount).endCell();
  }, []);

  const buildCreateMarketBody = useCallback((params: {
    title: string; asset: string; targetPrice: number;
    deadline: number; resolveAfter: number; pythFeedId: bigint;
  }) => {
    const op = crc32b('CreateMarket') & 0x7FFFFFFF;
    const titleCell = beginCell()
      .storeUint(Buffer.byteLength(params.title), 8)
      .storeBuffer(Buffer.from(params.title)).endCell();
    const assetCell = beginCell()
      .storeUint(Buffer.byteLength(params.asset), 8)
      .storeBuffer(Buffer.from(params.asset)).endCell();
    return beginCell()
      .storeUint(op, 32)
      .storeRef(titleCell).storeRef(assetCell)
      .storeUint(params.targetPrice, 128)
      .storeUint(params.deadline, 32)
      .storeUint(params.resolveAfter, 32)
      .storeUint(params.pythFeedId, 256).endCell();
  }, []);

  return { loading, setLoading, client, getOvenSupply, getMarketCount, buildMintBody, buildCreateMarketBody, CONTRACTS };
}
