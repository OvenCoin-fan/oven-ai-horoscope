// OVEN Jetton - $OVEN Token
import "@stdlib/deploy";

message(0x178d4519) Mint { queryId: UInt64; amount: Coins; recipient: Address; }

struct JettonData { totalSupply: Coins; mintable: Bool; ownerAddress: Address; content: Cell; walletCode: Cell; }

contract OVENJettonMaster with Deployable {
    owner: Address;
    totalSupply: Coins = 0;
    content: Cell;
    mintable: Bool = true;

    init(owner: Address, content: Cell) { self.owner = owner; self.content = content; }

    receive(msg: Mint) {
        require(sender() == self.owner, "Only owner can mint $OVEN");
        require(self.mintable, "$OVEN minting is disabled");
        self.totalSupply = self.totalSupply + msg.amount;
    }

    receive("disable_mint") {
        require(sender() == self.owner, "Only owner");
        self.mintable = false;
    }

    get fun get_jetton_data(): JettonData {
        return JettonData { totalSupply: self.totalSupply, mintable: self.mintable, ownerAddress: self.owner, content: self.content, walletCode: initOf OVENJettonWallet(myAddress(), self.owner).code };
    }

    get fun get_total_supply(): Coins { return self.totalSupply; }
}

contract OVENJettonWallet {
    balance: Coins = 0;
    owner: Address;
    master: Address;
    init(master: Address, owner: Address) { self.master = master; self.owner = owner; }
    get fun get_wallet_data(): Cell { return beginCell().storeCoins(self.balance).storeAddress(self.owner).storeAddress(self.master).endCell(); }
}
