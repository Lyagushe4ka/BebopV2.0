export enum Chains {
  Ethereum = 1,
  Optimism = 10,
  BNB = 56,
  Polygon = 137,
  ZkSync = 324,
  Base = 8453,
  Mode = 34443,
  Arbitrum = 42161,
  Blast = 81457,
}

export enum OrderStatus {
  PENDING = 'Pending',
  SUCCESS = 'Success',
  SETTLED = 'Settled',
  CONFIRMED = 'Confirmed',
  FAILED = 'Failed',
}

export type OrderType = 'Jam' | 'PMM';

export type TimeSeparated = {
  seconds?: number;
  minutes?: number;
  hours?: number;
};

export type Permit2Data = {
  signature: string;
  token_addresses: string[];
  token_nonces: string[];
  approvals_deadline: number;
};

export type Stats = {
  transactionsSingle: number;
  transactionsMulti: number;
  volumeSingle: number;
  volumeMulti: number;
  fees: number;
};

export type StatNames = keyof Stats;

export type TokenInfo = {
  name: Tokens;
  address: string;
  decimals: number;
  isStable: boolean;
};

export type ChainInfo = {
  name: string;
  rpc: string;
  explorer: string;
};

export const TOKEN_TICKERS = ['USDT', 'USDC', 'DAI', 'USDC.e', 'WETH', 'USDBC', 'USDB'] as const;

export type Tokens = (typeof TOKEN_TICKERS)[number];

export type TokensInfo = Partial<Record<Tokens, TokenInfo>>;
export type ChainsInfo = Record<Chains, ChainInfo>;

export type RatesData = {
  timestamp: number;
  rates: Record<Tokens, number>;
};

export interface QuoteParams {
  buy_tokens: string;
  sell_tokens: string;
  taker_address: string;
  receiver_address: string;
  source: string;
  approval_type: string;
  sell_amounts: string;
  buy_tokens_ratios?: string;
}

export interface QuoteResponse {
  routes: {
    type: OrderType;
    quote: Quote;
  }[];
  errors: any;
  link: string;
}

export interface Quote {
  type: string;
  status: string;
  quoteId: string;
  chainId: number;
  approvalType: string;
  nativeToken: string;
  taker: string;
  receiver: string;
  expiry: number;
  gasFee: {
    native: string;
    usd: number;
  };
  buyTokens: { [key: string]: any };
  sellTokens: { [key: string]: any };
  settlementAddress: string;
  approvalTarget: string;
  requiredSignatures: string[];
  warnings: any[];
  toSign: ToSignJam | ToSignPMM;
  solver?: string;
}

export interface ToSignJam {
  taker: string;
  receiver: string;
  expiry: number;
  nonce: string;
  executor: string;
  minFillPercent: number;
  hooksHash: string;
  sellTokens: string[];
  buyTokens: string[];
  sellAmounts: string[];
  buyAmounts: string[];
  sellNFTIds: any[];
  buyNFTIds: any[];
  sellTokenTransfers: string;
  buyTokenTransfers: string;
}

export interface ToSignPMM {
  expiry: number;
  taker_address: string;
  maker_addresses: string[];
  maker_nonces: number[];
  taker_tokens: string[][];
  maker_tokens: string[][];
  taker_amounts: string[][];
  maker_amounts: string[][];
  receiver: string;
  commands: string;
}
