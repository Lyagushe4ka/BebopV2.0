import { TOKEN_TICKERS } from './constants';

export enum Chains {
  Ethereum = 1,
  Polygon = 137,
  Arbitrum = 42161,
}

export type TimeSeparated = {
  seconds?: number;
  minutes?: number;
  hours?: number;
};

export type Quote = {
  status: string;
  quoteId: string;
  expiry: number;
  gasFee: {
    usd: number;
    native: string;
  };
  toSign: any;
};

export type Permit2Data = {
  signature: string;
  token_addresses: string[];
  token_nonces: bigint[];
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

export type Tokens = (typeof TOKEN_TICKERS)[number];

export type TokensInfo = Record<Tokens, TokenInfo>;
export type ChainsInfo = Record<Chains, ChainInfo>;

export type RatesData = {
  timestamp: number;
  rates: Partial<Record<Tokens, number>>;
};
