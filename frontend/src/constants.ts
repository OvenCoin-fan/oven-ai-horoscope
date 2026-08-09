export const CONTRACTS = {
  ovenJettonMinter: 'UQBiKpoXqUP6H304AXpUgkwca-ZjnQjTJCVwu17qEymt1L3f',
  marketFactory: 'UQAYeu2BTMwqI5y83qgj-HGu1I2WdPnNaQfeoLRbO7p5h1Dz',
  pythOracle: 'EQB4ZnrI5qsP_IUJgVJNwEGKLzZWsQOFhiaqDbD7pTt_f9oU',
  adminWallet: 'UQBZK61wriCZgHljAXodzp_hPX8OUSmQVJVnEQXGlTF598dJ',
} as const;

export const NETWORK = 'testnet';
export const TONCENTER_API = 'https://testnet.toncenter.com/api/v2/jsonRPC';
export const STONFI_URL = 'https://app.ston.fi/swap';
export const SWAP_RATE = 1000;

export const ZODIACS = [
  { id: 'aries', emoji: '♈', name: 'Овен' },
  { id: 'taurus', emoji: '♉', name: 'Телец' },
  { id: 'gemini', emoji: '♊', name: 'Близнецы' },
  { id: 'cancer', emoji: '♋', name: 'Рак' },
  { id: 'leo', emoji: '♌', name: 'Лев' },
  { id: 'virgo', emoji: '♍', name: 'Дева' },
  { id: 'libra', emoji: '♎', name: 'Весы' },
  { id: 'scorpio', emoji: '♏', name: 'Скорпион' },
  { id: 'sagittarius', emoji: '♐', name: 'Стрелец' },
  { id: 'capricorn', emoji: '♑', name: 'Козерог' },
  { id: 'aquarius', emoji: '♒', name: 'Водолей' },
  { id: 'pisces', emoji: '♓', name: 'Рыбы' },
] as const;

export const STAKE_TIERS = [
  { id: '3d', label: '3 дня', days: 3, apy: 3, emoji: '🥉' },
  { id: '7d', label: '7 дней', days: 7, apy: 6, emoji: '🥈' },
  { id: '30d', label: '30 дней', days: 30, apy: 10, emoji: '🥇' },
] as const;
