export interface ISettings {
  sysFund: number; // Initial system fund

  deposit: {
    min: number; // Min deposit
    feePct: number; // Fee percentage
    sysPct: number; // System share %
    agentPct: number; // Agent share %
  };

  withdraw: {
    min: number; // Min withdraw
    feePct: number; // Fee percentage
    sysPct: number; // System share %
    agentPct: number; // Agent share %
  };

  sendMoney: {
    perThousandFee: number; // Fee per 1000
    min: number; // Minimum P2P transfer
  };

  user: {
    welcomeBonus: number; // Signup bonus
    dailyLimit: number; // Daily cashOut limit
    monthlyLimit: number; // Monthly cashOut limit
  };

  agent: {
    initBal: number; // Initial balance
    dailyLimit: number; // Daily cashOut limit
    monthlyLimit: number; // Monthly cashOut limit
  };
}

export interface ISettingsDoc extends ISettings, Document {}
