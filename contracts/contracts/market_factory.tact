// ============================================================
// Market Factory - Creates and tracks Prediction Markets
// ============================================================
// Deploys new PredictionMarket contracts and provides registry

import "@stdlib/deploy";

message CreateMarket {
    title: String;
    asset: String;
    targetPrice: Int as uint128;
    priceDecimals: Int as uint8;
    deadline: Int as uint32;
    resolveAfter: Int as uint32;
    feeBps: Int as uint16;
    pythFeedId: Int as uint256;
}

message SetOvenJetton {
    jetton: Address;
}

message SetPythContract {
    pyth: Address;
}

contract MarketFactory {
    admin: Address;
    ovenJetton: Address;
    pythContract: Address;
    markets: map<Int as uint256, Address>;
    marketCount: Int as uint256;
    feeBps: Int as uint16; // Default fee
    
    init(admin: Address, ovenJetton: Address, pythContract: Address) {
        self.admin = admin;
        self.ovenJetton = ovenJetton;
        self.pythContract = pythContract;
        self.markets = emptyMap();
        self.marketCount = 0;
        self.feeBps = 200; // 2% default
    }
    
    receive(msg: CreateMarket) {
        require(sender() == self.admin, "Only admin can create markets");
        require(msg.deadline > now(), "Deadline must be in future");
        require(msg.resolveAfter >= msg.deadline, "Resolve after deadline");
        require(msg.targetPrice > 0, "Invalid target price");
        
        let marketId = self.marketCount + 1;
        self.marketCount = marketId;
        
        // In production: deploy PredictionMarket contract via deploy message
        // For hackathon: store market parameters
        // The actual deployment would use contract creation primitives
        
        // Store market address after deployment
        // self.markets.set(marketId, deployedAddress);
    }
    
    receive(msg: SetOvenJetton) {
        require(sender() == self.admin, "Only admin");
        self.ovenJetton = msg.jetton;
    }
    
    receive(msg: SetPythContract) {
        require(sender() == self.admin, "Only admin");
        self.pythContract = msg.pyth;
    }
    
    get fun getMarketCount(): Int {
        return self.marketCount;
    }
    
    get fun getMarket(id: Int as uint256): Address {
        return self.markets.get(id) ?? address("0:0000000000000000000000000000000000000000000000000000000000000000");
    }
    
    get fun getOvenJetton(): Address {
        return self.ovenJetton;
    }
    
    get fun getPythContract(): Address {
        return self.pythContract;
    }
}
