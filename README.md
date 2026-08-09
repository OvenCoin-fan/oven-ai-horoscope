# 🔥 $OVEN AI Horoscope — TON Mini App

AI-powered horoscope & prediction market on TON blockchain. Built for [STON.fi Hackathon](https://ston.fi/hackathon).

## ✨ Features

- 🔮 **AI Гороскоп** — 12 знаков зодиака, предсказания от Mira AI
- 👛 **TON Connect** — подключение кошелька через @tonconnect/ui-react
- 💱 **Swap** — обмен TON → $OVEN через STON.fi DEX
- 🔒 **Стейкинг** — 3/7/30 дней, 3-10% APY
- 🎯 **Prediction Markets** — BTC $150K, TON top-10, ETH $5K
- 📊 **On-chain data** — supply и marketCount с контрактов

## 🏗 Architecture

```
frontend/
├── src/
│   ├── App.tsx              # Main app with TON Connect
│   ├── App.css              # Dark gold theme
│   ├── constants.ts         # Contract addresses (testnet)
│   ├── main.tsx             # Entry point
│   └── hooks/
│       ├── useTonConnect.ts # TON Connect UI hook
│       └── useContract.ts   # Blockchain read (runMethod)
├── api/
│   └── horoscope.ts        # Vercel serverless API
├── public/
│   └── tonconnect-manifest.json
└── contracts/               # Tact smart contracts
    ├── oven-jetton.tact     # $OVEN jetton minter
    ├── market-factory.tact  # Prediction market factory
    └── prediction-market.tact # Individual market
```

## 📜 Smart Contracts (TON Testnet)

| Contract | Address |
|----------|--------|
| $OVEN Jetton Minter | `UQBiKpoXqUP6H304AXpUgkwca-ZjnQjTJCVwu17qEymt1L3f` |
| Market Factory | `UQAYeu2BTMwqI5y83qgj-HGu1I2WdPnNaQfeoLRbO7p5h1Dz` |
| Pyth Oracle | `EQB4ZnrI5qsP_IUJgVJNwEGKLzZWsQOFhiaqDbD7pTt_f9oU` |

## 🚀 Quick Start

```bash
cd frontend
npm install
npm run dev
```

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Wallet**: @tonconnect/ui-react
- **Blockchain**: @ton/ton + @ton/core
- **Contracts**: Tact language
- **Oracle**: Pyth Network
- **DEX**: STON.fi
- **AI**: Mira API
- **Deploy**: Vercel

## 🎮 Hackathon

Built for **STON.fi Hackathon** — combining DeFi, AI horoscopes, and prediction markets on TON.

## 📄 License

MIT
