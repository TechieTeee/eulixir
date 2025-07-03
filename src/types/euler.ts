export interface PoolData {
  timestamp: string;
  apy: number;
}

export interface PortfolioAsset {
  token: string;
  amount: number;
  valueUSD: number;
}

export interface PoolResponse {
  apyData: PoolData[];
  portfolio: PortfolioAsset[];
  ilRisk: number;
}
