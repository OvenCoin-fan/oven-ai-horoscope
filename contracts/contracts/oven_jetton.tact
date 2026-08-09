// ============================================================
// $OVEN Jetton (TEP-74) - Prediction Market Token
// ============================================================
// Standard jetton with mint control for STON.fi swap integration

import "@stdlib/deploy";

message(0x178d4519) MinterTransfer {
    queryId: Int as uint64;
    amount: Int as coins;
    destination: Address;
    responseDestination: Address;
    customPayload: Cell?;
    forwardTonAmount: Int as coins;
    forwardPayload: Cell?;
}

message(0x7bdd97de) MinterNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    sender: Address;
    forwardPayload: Cell?;
}

message Mint {
    to: Address;
    amount: Int as coins;
}

message Burn {
    amount: Int as coins;
}

contract OvenJettonMinter {
    totalSupply: Int as coins;
    admin: Address;
    content: Cell;
    walletCode: Cell;
    mintable: Bool;
    
    // Staking tracking
    stakingContract: Address;
    
    init(admin: Address, content: Cell, walletCode: Cell) {
        self.totalSupply = 0;
        self.admin = admin;
        self.content = content;
        self.walletCode = walletCode;
        self.mintable = true;
        self.stakingContract = sender(); // will be set later
    }
    
    receive(msg: Mint) {
        require(sender() == self.admin, "Only admin can mint");
        require(self.mintable, "Minting disabled");
        require(msg.amount > 0, "Amount must be positive");
        
        self.totalSupply = self.totalSupply + msg.amount;
        
        // In production: deploy jetton wallet for msg.to and send notification
        // For hackathon: simplified mint tracking
    }
    
    receive("DisableMinting") {
        require(sender() == self.admin, "Only admin");
        self.mintable = false;
    }
    
    receive(msg: Burn) {
        require(sender() == self.admin, "Only admin can burn");
        require(msg.amount <= self.totalSupply, "Exceeds supply");
        self.totalSupply = self.totalSupply - msg.amount;
    }
    
    receive("SetStakingContract") {
        require(sender() == self.admin, "Only admin");
        // Set staking contract address for reward minting
    }
    
    get fun getJettonData(): [Int, Bool, Address, Cell, Cell] {
        return [self.totalSupply, self.mintable, self.admin, self.content, self.walletCode];
    }
    
    get fun getTotalSupply(): Int {
        return self.totalSupply;
    }
}
