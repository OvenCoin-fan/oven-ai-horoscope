import type { VercelRequest, VercelResponse } from '@vercel/node';

const ZODIAC: Record<string,string> = {
  aries:'Овен', taurus:'Телец', gemini:'Близнецы', cancer:'Рак',
  leo:'Лев', virgo:'Дева', libra:'Весы', scorpio:'Скорпион',
  sagittarius:'Стрелец', capricorn:'Козерог', aquarius:'Водолей', pisces:'Рыбы',
};

const FB: Record<string,string> = {
  aries:'♈ Овен: Звёзды на твоей стороне. Риски оправдаются. Доверяй интуиции!',
  taurus:'♉ Телец: Стабильность — суперсила. Укрепляй то, что работает.',
  gemini:'♊ Близнецы: Информация — валюта. Новые связи принесут возможности.',
  cancer:'♋ Рак: Доверяй чувствам. Внутренний голос подскажет верное решение.',
  leo:'♌ Лев: Сцена твоя. Проявись — и мир заметит.',
  virgo:'♍ Дева: Детали решают всё. Перепроверь — и успех гарантирован.',
  libra:'♎ Весы: Баланс — ключ к гармонии. Партнёрство принесёт плоды.',
  scorpio:'♏ Скорпион: Трансформация. Отпусти старое — придёт новое.',
  sagittarius:'♐ Стрелец: Горизонт расширяется. Не бойся нового.',
  capricorn:'♑ Козерог: Дисциплина — твой козырь. Признание близко.',
  aquarius:'♒ Водолей: Инновации в воздухе. Необычная идея — золотая.',
  pisces:'♓ Рыбы: Интуиция на пике. Творчество — твой путь.',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { sign } = req.body;
  const name = ZODIAC[sign];
  if (!name) return res.status(400).json({ error: 'Invalid sign' });

  const KEY = process.env.MIRA_API_KEY;
  if (KEY) {
    try {
      const r = await fetch('https://api.mira.tg/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEY}` },
        body: JSON.stringify({ message: `Напиши короткий гороскоп на сегодня для ${name}. Мистический стиль, 2-3 предложения.`, user_id: 'oven-app' }),
      });
      if (r.ok) { const d = await r.json(); return res.status(200).json({ horoscope: d.response || d.message || FB[sign] }); }
    } catch (e) { console.error('Mira error:', e); }
  }
  return res.status(200).json({ horoscope: FB[sign] });
}
