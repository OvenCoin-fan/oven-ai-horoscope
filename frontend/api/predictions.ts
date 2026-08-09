const EVENTS = [
  {
    id: 'btc-65k',
    emoji: '📈',
    title: 'BTC закроется выше $65,000 в пятницу?',
    options: [{ label: 'Да', odds: 1.7 }, { label: 'Нет', odds: 2.2 }],
    hint: '♈ Марс в Овне — к росту. Но Сатурн тормозит.',
    category: 'crypto'
  },
  {
    id: 'ton-top10',
    emoji: '💎',
    title: 'TON войдёт в топ-10 криптовалют к сентябрю?',
    options: [{ label: 'Да', odds: 3.5 }, { label: 'Нет', odds: 1.3 }],
    hint: '♈ Юпитер расширяет границы, но конкуренция высока.',
    category: 'crypto'
  },
  {
    id: 'elon-tweet',
    emoji: '🐦',
    title: 'Илон Маск упомянет DOGE или TON до 15 августа?',
    options: [{ label: 'Да', odds: 2.0 }, { label: 'Нет', odds: 1.8 }],
    hint: '♈ Меркурий в ретрограде — неожиданные сообщения.',
    category: 'fun'
  }
];

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    return res.status(200).json({ events: EVENTS, houseEdge: 0.10 });
  }
  if (req.method === 'POST') {
    const { eventId, option, stake, wallet } = req.body;
    if (!eventId || option === undefined || !stake) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const ev = EVENTS.find(e => e.id === eventId);
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    const grossWin = stake * ev.options[option].odds;
    const netWin = Math.round(grossWin * 0.9);
    return res.status(200).json({
      success: true,
      bet: { eventId, option, stake, wallet: wallet || 'anonymous' },
      potentialWin: netWin,
      houseEdge: '10%',
      message: `Ставка ${stake} $OVEN принята! Возможный выигрыш: ${netWin} $OVEN`
    });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
