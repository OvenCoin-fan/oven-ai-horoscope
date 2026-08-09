import "@stdlib/deploy";

message PlaceBet {
    outcome: Int as uint8;
    amount: Int as coins;
}

message ResolveWithPyth {
    pythPrice: Int as int64;
    pythPublishTime: Int as uint64;
}

message ClaimWinnings {
}

message CancelMarket {
}

contract PredictionMarket {
    title: String;
    asset: String;
    targetPrice: Int as uint128;
    deadline: Int as uint32;
    resolveAfter: Int as uint32;
    feeBps: Int as uint16;
    ovenJetton: Address;
    pythContract: Address;
    pythFeedId: Int as uint256;
    totalYes: Int as coins;
    totalNo: Int as coins;
    resolved: Bool;
    winningOutcome: Int as int8;
    finalPrice: Int as uint128;
    resolutionTime: Int as uint32;
    betsYes: map<Address, Int as coins>;
    betsNo: map<Address, Int as coins>;
    claimed: map<Address, Bool>;
    admin: Address;
    collectedFees: Int as coins;

    init(
        admin: Address,
        title: String,
        asset: String,
        targetPrice: Int as uint128,
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

    receive(msg: PlaceBet) {
        require(!self.resolved, "Market resolved");
        require(now() < self.deadline, "Betting closed");
        require(msg.outcome == 0 || msg.outcome == 1, "Invalid outcome");
        require(msg.amount > 0, "Positive amount");

        if (msg.outcome == 0) {
            let existing = self.betsYes.get(sender());
            let newVal = msg.amount;
            if (existing != null) {
                newVal = existing!! + msg.amount;
            }
            self.betsYes.set(sender(), newVal);
            self.totalYes = self.totalYes + msg.amount;
        } else {
            let existing = self.betsNo.get(sender());
            let newVal = msg.amount;
            if (existing != null) {
                newVal = existing!! + msg.amount;
            }
            self.betsNo.set(sender(), newVal);
            self.totalNo = self.totalNo + msg.amount;
        }
    }

    receive(msg: ResolveWithPyth) {
        require(!self.resolved, "Already resolved");
        require(now() >= self.resolveAfter, "Too early");
        require(sender() == self.admin, "Only admin");
        require(msg.pythPublishTime >= self.deadline - 300, "Price too old");

        self.finalPrice = msg.pythPrice;
        self.resolved = true;
        self.resolutionTime = now();

        if (msg.pythPrice >= self.targetPrice) {
            self.winningOutcome = 0;
        } else {
            self.winningOutcome = 1;
        }

        let totalPool = self.totalYes + self.totalNo;
        self.collectedFees = totalPool * self.feeBps / 10000;
    }

    receive(msg: ClaimWinnings) {
        require(self.resolved, "Not resolved");
        require(self.winningOutcome >= 0, "Market cancelled");
        let alreadyClaimed = self.claimed.get(sender());
        require(alreadyClaimed == null, "Already claimed");

        let userBet: Int = 0;
        if (self.winningOutcome == 0) {
            let bet = self.betsYes.get(sender());
            if (bet != null) {
                userBet = bet!!;
            }
        } else {
            let bet = self.betsNo.get(sender());
            if (bet != null) {
                userBet = bet!!;
            }
        }

        require(userBet > 0, "No winning bets");

        self.claimed.set(sender(), true);

        let totalPool = self.totalYes + self.totalNo;
        let netPool = totalPool - self.collectedFees;
        let totalWinning: Int = 0;
        if (self.winningOutcome == 0) {
            totalWinning = self.totalYes;
        } else {
            totalWinning = self.totalNo;
        }

        let payout = userBet * netPool / totalWinning;

        send(SendParameters{
            to: sender(),
            value: 0,
            mode: SendPayGasSeparately,
            body: beginCell().storeUint(payout, 64).endCell()
        });
    }

    receive(msg: CancelMarket) {
        require(sender() == self.admin, "Only admin");
        require(!self.resolved, "Already resolved");
        self.resolved = true;
        self.winningOutcome = -2;
    }

    receive("Refund") {
        require(self.resolved, "Not resolved");
        require(self.winningOutcome == -2, "Not cancelled");
        let alreadyClaimed = self.claimed.get(sender());
        require(alreadyClaimed == null, "Already refunded");

        let userYes = self.betsYes.get(sender());
        let userNo = self.betsNo.get(sender());
        let yesAmt: Int = 0;
        let noAmt: Int = 0;
        if (userYes != null) {
            yesAmt = userYes!!;
        }
        if (userNo != null) {
            noAmt = userNo!!;
        }
        let total = yesAmt + noAmt;

        require(total > 0, "No bets");

        self.claimed.set(sender(), true);

        send(SendParameters{
            to: sender(),
            value: 0,
            mode: SendPayGasSeparately,
            body: beginCell().storeUint(total, 64).endCell()
        });
    }

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

    get fun getTotalYes(): Int {
        return self.totalYes;
    }

    get fun getTotalNo(): Int {
        return self.totalNo;
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

    get fun getUserYesBet(user: Address): Int {
        let bet = self.betsYes.get(user);
        if (bet != null) {
            return bet!!;
        }
        return 0;
    }

    get fun getUserNoBet(user: Address): Int {
        let bet = self.betsNo.get(user);
        if (bet != null) {
            return bet!!;
        }
        return 0;
    }

    get fun hasUserClaimed(user: Address): Bool {
        let c = self.claimed.get(user);
        if (c != null) {
            return c!!;
        }
        return false;
    }
}
