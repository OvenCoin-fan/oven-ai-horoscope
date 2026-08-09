import "@stdlib/deploy";

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
    mintable: Bool;

    init(admin: Address) {
        self.totalSupply = 0;
        self.admin = admin;
        self.mintable = true;
    }

    receive(msg: Mint) {
        require(sender() == self.admin, "Only admin");
        require(self.mintable, "Minting disabled");
        require(msg.amount > 0, "Positive amount");
        self.totalSupply = self.totalSupply + msg.amount;
    }

    receive("DisableMinting") {
        require(sender() == self.admin, "Only admin");
        self.mintable = false;
    }

    receive(msg: Burn) {
        require(sender() == self.admin, "Only admin");
        require(msg.amount <= self.totalSupply, "Exceeds supply");
        self.totalSupply = self.totalSupply - msg.amount;
    }

    get fun getTotalSupply(): Int {
        return self.totalSupply;
    }

    get fun getAdmin(): Address {
        return self.admin;
    }

    get fun isMintable(): Bool {
        return self.mintable;
    }
}
