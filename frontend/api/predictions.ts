const MARKETS = [
  {
    id: 'btc-65k',
    emoji: '📈',
    title: 'BTC выше $65,000 в пятницу?',
    outcomes: ['Да', 'Нет'],
    hint: '♈ Марс в Овне — к росту. Но Сатурн тормозит.',
    pool: [130, 70],
    category: 'crypto'
  },
  {
    id: 'ton-top10',
    emoji: '💎',
    title: 'TON в топ-10 к сентябрю?',
    outcomes: ['Да', 'Нет'],
    hint: '♈ Юпитер расширяет границы. Но конкуренция жёсткая.',
    pool: [60, 140],
    category: 'crypto'
  },
  {
    id: 'elon-tweet',
    emoji: '🐦',
    title: 'Маск упомянет DOGE/TON до 15 августа?',
    outcomes: ['Да', 'Нет'],
    hint: '♈ Меркурий в ретрограде — неожиданные сообщения.',
    pool: [100, 100],
    category: 'fun'
  }
];

function getPrices(pool: number[]): number[] {
  const total = pool.reduce((a, b) => a + b, 0);
  return pool.map(p => p / total);
}

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const marketsWithPrices = MARKETS.map(m => ({
      ...m,
      prices: getPrices(m.pool)
    }));
    return res.status(200).json({ markets: marketsWithPrices, fee: 0.02 });
  }
  if (req.method === 'POST') {
    const { marketId, outcome, shares, wallet, action } = req.body;
    if (!marketId || outcome === undefined || !shares) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const mk = MARKETS.find(m => m.id === marketId);
    if (!mk) return res.status(404).json({ error: 'Market not found' });
    const prices = getPrices(mk.pool);
    const price = prices[outcome];
    const fee = 0.02;
    if (action === 'buy') {
      const cost = price * shares * (1 + fee);
      return res.status(200).json({
        success: true,
        action: 'buy',
        marketId,
        outcome,
        shares,
        pricePerShare: Math.round(price * 100) / 100,
        totalCost: Math.round(cost * 100) / 100,
        potentialWin: shares,
        fee: `${fee * 100}%`
      });
    }
    if (action === 'sell') {
      const revenue = price * shares * (1 - fee);
      return res.status(200).json({
        success: true,
        action: 'sell',
        marketId,
        outcome,
        shares,
        pricePerShare: Math.round(price * 100) / 100,
        totalRevenue: Math.round(revenue * 100) / 100,
        fee: `${fee * 100}%`
      });
    }
    return res.status(400).json({ error: 'Invalid action' });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
