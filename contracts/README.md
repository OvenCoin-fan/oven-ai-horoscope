# $OVEN AI Horoscope - Smart Contracts

Prediction Market on TON with Pyth Oracle integration.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  MarketFactory   │────>│ PredictionMarket  │<────│ Pyth Oracle │
│  (Registry)      │     │  (Per Market)     │     │  (Price)    │
└─────────────────┘     └──────────────────┘     └─────────────┘
         │                       │
         │                       │
         v                       v
┌─────────────────┐     ┌──────────────────┐
│  OvenJetton     │     │  StakingContract │
│  (TEP-74)       │     │  (3 tiers)       │
└─────────────────┘     └──────────────────┘
```

## Contracts

### 1. OvenJettonMinter (`oven_jetton.tact`)
- Standard TEP-74 jetton
- Admin-controlled minting
- Total supply: 1,000,000,000 $OVEN
- Minting disabled after initial distribution

### 2. PredictionMarket (`prediction_market.tact`)
- **Place bets** on Yes/No outcomes with $OVEN
- **Resolve** via Pyth Network oracle price feeds
- **Claim** proportional winnings after resolution
- **Cancel** with full refund if oracle fails
- 2% platform fee on winnings

### 3. MarketFactory (`market_factory.tact`)
- Creates and registers PredictionMarket contracts
- Tracks all active markets
- Admin-controlled market creation

## Pyth Oracle Integration

The prediction market resolves using [Pyth Network](https://pyth.network/) price feeds on TON.

### How it works:
1. Market is created with a price condition (e.g., BTC/USD > $65,000)
2. Users bet $OVEN on Yes or No
3. After deadline, admin submits Pyth price data to resolve
4. Contract verifies price timestamp is valid
5. Winning outcome determined by actual price vs target
6. Winners claim proportional share of pool (minus 2% fee)

### Supported Price Feeds:
- BTC/USD
- TON/USD
- ETH/USD
- Any Pyth-supported asset

### Pyth on TON:
- Testnet: `kQCKT2UbMjbi8k8W2fRt7lUBF7vYR2Y7mK7tW9dZ2dX3dY4a`
- Mainnet: Deployed via Pyth governance

## Build

```bash
cd contracts
npm install
npm run build
```

## Deploy

```bash
npm run deploy
```

## Staking (3 Tiers)

| Tier | Lock Period | APY   | Emoji |
|------|-------------|-------|-------|
| 1    | 3 days      | 3%    | 🥉    |
| 2    | 7 days      | 6%    | 🥈    |
| 3    | 30 days     | 10%   | 🥇    |

Rewards are minted only after the lock period expires.

## Tokenomics

- **Total Supply**: 1,000,000,000 $OVEN
- **Exchange**: 1 GRAM = 1,000 $OVEN via STON.fi
- **No free minting** - all tokens acquired through swap
- **Staking rewards** from reserved supply
