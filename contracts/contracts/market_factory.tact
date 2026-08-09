import "@stdlib/deploy";

message CreateMarket {
    title: String;
    asset: String;
    targetPrice: Int as uint128;
    deadline: Int as uint32;
    resolveAfter: Int as uint32;
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
    marketCount: Int as uint256;
    feeBps: Int as uint16;

    init(admin: Address, ovenJetton: Address, pythContract: Address) {
        self.admin = admin;
        self.ovenJetton = ovenJetton;
        self.pythContract = pythContract;
        self.marketCount = 0;
        self.feeBps = 200;
    }

    receive(msg: CreateMarket) {
        require(sender() == self.admin, "Only admin");
        require(msg.deadline > now(), "Deadline in future");
        require(msg.resolveAfter >= msg.deadline, "Resolve after deadline");
        require(msg.targetPrice > 0, "Invalid price");
        self.marketCount = self.marketCount + 1;
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

    get fun getOvenJetton(): Address {
        return self.ovenJetton;
    }

    get fun getPythContract(): Address {
        return self.pythContract;
    }

    get fun getFeeBps(): Int {
        return self.feeBps;
    }
}
