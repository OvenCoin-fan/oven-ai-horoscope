const EVENTS = [
  {
    id: 'btc-65k',
    emoji: '📈',
    title: 'BTC выше $65,000 к 10 августа?',
    options: ['Да', 'Нет'],
    hint: '♈ Марс в Овне — к росту. Но Сатурн тормозит. Риск 50/50.',
    category: 'crypto'
  },
  {
    id: 'rain-moscow',
    emoji: '🌧',
    title: 'Дождь в Москве 10 августа?',
    options: ['Да', 'Нет'],
    hint: '♈ Нептун в Рыбах — вода близко. Вероятность осадков высока.',
    category: 'weather'
  },
  {
    id: 'ton-up',
    emoji: '💎',
    title: 'TON вырастет на 5% за неделю?',
    options: ['Да', 'Нет'],
    hint: '♈ Венера и Юпитер в союзе — рост вероятен.',
    category: 'crypto'
  }
];

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    return res.status(200).json({ events: EVENTS });
  }
  if (req.method === 'POST') {
    const { eventId, option, stake, wallet } = req.body;
    if (!eventId || option === undefined || !stake) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    return res.status(200).json({
      success: true,
      bet: { eventId, option, stake, wallet: wallet || 'anonymous' },
      message: `Ставка ${stake} $OVEN принята!`
    });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
