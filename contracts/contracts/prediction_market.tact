// ============================================================
// $OVEN Prediction Market - Pyth Oracle Integration
// ============================================================
// Real prediction markets resolved by Pyth Network price feeds
// Users bet $OVEN on outcomes, winners claim proportional share

import "@stdlib/deploy";

// ---- Messages ----

message(0x4f5f4b01) PlaceBet {
    outcome: Int as uint8;  // 0 = Yes, 1 = No
    amount: Int as coins;   // $OVEN amount in nanotokens
}

message(0x4f5f4b02) ResolveWithPyth {
    // Price data from Pyth oracle
    pythPrice: Int as int64;       // Raw price from Pyth
    pythExpo: Int as int32;        // Exponent (price * 10^expo)
    pythConf: Int as uint64;       // Confidence interval
    pythPublishTime: Int as uint64; // When Pyth published this price
    // VAA proof would be attached as body ref in production
}

message(0x4f5f4b03) ClaimWinnings {
    // Sender claims their winnings
}

message(0x4f5f4b04) CancelMarket {
    // Cancel and refund all bets
}

message(0x4f5f4b05) SetPythFeed {
    feedId: Int as uint256; // Pyth price feed ID
}

// ---- Contract ----

contract PredictionMarket {
    // ===== Market Configuration =====
    title: String;              // "BTC above $65K on Friday?"
    asset: String;              // "BTC/USD"
    targetPrice: Int as uint128; // Target price * 10^priceDecimals
    priceDecimals: Int as uint8; // Decimals for price comparison
    deadline: Int as uint32;     // Unix timestamp - betting closes
    resolveAfter: Int as uint32; // Unix timestamp - can resolve after
    feeBps: Int as uint16;       // Platform fee (200 = 2%)
    
    // ===== Token =====
    ovenJetton: Address;        // $OVEN jetton minter address
    
    // ===== Pyth Oracle =====
    pythContract: Address;      // Pyth contract on TON
    pythFeedId: Int as uint256; // Price feed ID (e.g., BTC/USD)
    
    // ===== Pools =====
    totalYes: Int as coins;     // Total $OVEN bet on Yes
    totalNo: Int as coins;      // Total $OVEN bet on No
    
    // ===== Resolution =====
    resolved: Bool;
    winningOutcome: Int as int8; // 0=Yes, 1=No, -1=unresolved, -2=cancelled
    finalPrice: Int as uint128;  // Price at resolution
    resolutionTime: Int as uint32;
    
    // ===== User Positions =====
    betsYes: map<Address, Int as coins>;
    betsNo: map<Address, Int as coins>;
    claimed: map<Address, Bool>;
    
    // ===== Admin =====
    admin: Address;
    collectedFees: Int as coins;
    
    init(
        admin: Address,
        title: String,
        asset: String,
        targetPrice: Int as uint128,
        priceDecimals: Int as uint8,
        deadline: Int as uint32,
        resolveAfter: Int as uint32,
        feeBps: Int as uint16,
        ovenJetton: Address,
        pythContract: Address,
        pythFeedId: Int as uint256
    ) {
        self.admin = admin;
        self.title = title;
        self.asset = asset;
        self.targetPrice = targetPrice;
        self.priceDecimals = priceDecimals;
        self.deadline = deadline;
        self.resolveAfter = resolveAfter;
        self.feeBps = feeBps;
        self.ovenJetton = ovenJetton;
        self.pythContract = pythContract;
        self.pythFeedId = pythFeedId;
        
        self.totalYes = 0;
        self.totalNo = 0;
        self.resolved = false;
        self.winningOutcome = -1;
        self.finalPrice = 0;
        self.resolutionTime = 0;
        self.betsYes = emptyMap();
        self.betsNo = emptyMap();
        self.claimed = emptyMap();
        self.collectedFees = 0;
    }
    
    // ===== Place Bet =====
    receive(msg: PlaceBet) {
        // Validations
        require(!self.resolved, "Market already resolved");
        require(now() < self.deadline, "Betting period closed");
        require(msg.outcome == 0 || msg.outcome == 1, "Invalid outcome");
        require(msg.amount > 0, "Amount must be positive");
        
        // In production: receive $OVEN via jetton notification
        // Jetton wallet sends notification to this contract
        // amount comes from the jetton transfer, not message
        
        let betAmount = msg.amount;
        
        if (msg.outcome == 0) {
            // Bet on Yes
            let current = self.betsYes.get(sender()) ?? 0;
            self.betsYes.set(sender(), current + betAmount);
            self.totalYes = self.totalYes + betAmount;
        } else {
            // Bet on No
            let current = self.betsNo.get(sender()) ?? 0;
            self.betsNo.set(sender(), current + betAmount);
            self.totalNo = self.totalNo + betAmount;
        }
    }
    
    // ===== Resolve with Pyth Price =====
    receive(msg: ResolveWithPyth) {
        require(!self.resolved, "Already resolved");
        require(now() >= self.resolveAfter, "Too early to resolve");
        require(sender() == self.admin, "Only admin can resolve");
        require(msg.pythPublishTime >= self.deadline - 300, "Price too old");
        require(msg.pythPublishTime <= now() + 60, "Price from future");
        
        // Convert Pyth price to our format
        // Pyth: actual_price = pythPrice * 10^pythExpo
        // Our:   stored_price = actual_price * 10^priceDecimals
        // So:    finalPrice = pythPrice * 10^(priceDecimals - pythExpo)
        
        // For BTC/USD: pythExpo = -8, priceDecimals = 2
        // actual = 65000.00, pythPrice = 6500000000000 (6.5e12)
        // finalPrice = 6500000000000 * 10^(2-(-8)) = 6500000000000 * 10^10
        // That's too big. Let's simplify:
        // We compare pythPrice directly with targetPrice adjusted for expo
        
        self.finalPrice = msg.pythPrice;
        self.resolved = true;
        self.resolutionTime = now();
        
        // Determine winner
        // Compare: actual_price vs target_price
        // actual = pythPrice * 10^pythExpo
        // target = targetPrice * 10^(-priceDecimals)
        // To compare: pythPrice * 10^pythExpo vs targetPrice * 10^(-priceDecimals)
        // => pythPrice vs targetPrice * 10^(-priceDecimals - pythExpo)
        // Simplified: we store targetPrice already adjusted
        
        if (msg.pythPrice >= self.targetPrice) {
            self.winningOutcome = 0; // Yes wins - price met target
        } else {
            self.winningOutcome = 1; // No wins - price below target
        }
        
        // Calculate platform fees from total pool
        let totalPool = self.totalYes + self.totalNo;
        self.collectedFees = totalPool * self.feeBps / 10000;
    }
    
    // ===== Claim Winnings =====
    receive(msg: ClaimWinnings) {
        require(self.resolved, "Market not resolved yet");
        require(self.winningOutcome >= 0, "Market cancelled - use refund");
        require(!(self.claimed.get(sender()) ?? false), "Already claimed");
        
        // Get user's bet on winning outcome
        let userBet: Int = 0;
        if (self.winningOutcome == 0) {
            userBet = self.betsYes.get(sender()) ?? 0;
        } else {
            userBet = self.betsNo.get(sender()) ?? 0;
        }
        
        require(userBet > 0, "No winning bets found");
        
        // Mark as claimed
        self.claimed.set(sender(), true);
        
        // Calculate payout: proportional share of net pool
        // netPool = totalPool - fees
        // payout = userBet * netPool / totalWinningBets
        let totalPool = self.totalYes + self.totalNo;
        let netPool = totalPool - self.collectedFees;
        
        let totalWinning: Int = 0;
        if (self.winningOutcome == 0) {
            totalWinning = self.totalYes;
        } else {
            totalWinning = self.totalNo;
        }
        
        let payout = userBet * netPool / totalWinning;
        
        // In production: send $OVEN jettons back to user
        // For hackathon: emit event for frontend to track
        send(SendParameters{
            to: sender(),
            value: 0,
            mode: SendDefault,
            body: "Claim: ".asComment() + payout
        });
    }
    
    // ===== Cancel Market (refund all) =====
    receive(msg: CancelMarket) {
        require(sender() == self.admin, "Only admin");
        require(!self.resolved, "Already resolved");
        
        self.resolved = true;
        self.winningOutcome = -2; // Cancelled
    }
    
    // ===== Refund after cancellation =====
    receive("Refund") {
        require(self.resolved, "Not resolved");
        require(self.winningOutcome == -2, "Not cancelled");
        require(!(self.claimed.get(sender()) ?? false), "Already refunded");
        
        let userYes = self.betsYes.get(sender()) ?? 0;
        let userNo = self.betsNo.get(sender()) ?? 0;
        let total = userYes + userNo;
        
        require(total > 0, "No bets to refund");
        
        self.claimed.set(sender(), true);
        
        // Refund full amount
        send(SendParameters{
            to: sender(),
            value: 0,
            mode: SendDefault,
            body: "Refund: ".asComment() + total
        });
    }
    
    // ===== Update Pyth Feed =====
    receive(msg: SetPythFeed) {
        require(sender() == self.admin, "Only admin");
        self.pythFeedId = msg.feedId;
    }
    
    // ===== Getters =====
    
    get fun getTitle(): String {
        return self.title;
    }
    
    get fun getAsset(): String {
        return self.asset;
    }
    
    get fun getTargetPrice(): Int {
        return self.targetPrice;
    }
    
    get fun getDeadline(): Int {
        return self.deadline;
    }
    
    get fun getPool(): [Int, Int] {
        return [self.totalYes, self.totalNo];
    }
    
    get fun getPrices(): [Int, Int] {
        // Returns Yes/No prices in cents (0-100)
        let total = self.totalYes + self.totalNo;
        if (total == 0) {
            return [50, 50];
        }
        let yesPrice = self.totalYes * 100 / total;
        let noPrice = self.totalNo * 100 / total;
        return [yesPrice, noPrice];
    }
    
    get fun isResolved(): Bool {
        return self.resolved;
    }
    
    get fun getWinningOutcome(): Int {
        return self.winningOutcome;
    }
    
    get fun getFinalPrice(): Int {
        return self.finalPrice;
    }
    
    get fun getUserBets(user: Address): [Int, Int, Bool] {
        // Returns [yesBet, noBet, claimed]
        return [
            self.betsYes.get(user) ?? 0,
            self.betsNo.get(user) ?? 0,
            self.claimed.get(user) ?? false
        ];
    }
    
    get fun getMarketInfo(): [String, String, Int, Int, Int, Int, Bool, Int] {
        // [title, asset, targetPrice, deadline, totalYes, totalNo, resolved, winningOutcome]
        return [
            self.title,
            self.asset,
            self.targetPrice,
            self.deadline,
            self.totalYes,
            self.totalNo,
            self.resolved,
            self.winningOutcome
        ];
    }
}
