import { Chains, Tokens } from '../src';

export const TG_CHAT_ID: number = 0; // specify your telegram chat id to receive notifications
export const TG_TOKEN: string = ''; // specify your telegram bot token to receive notifications

export const MIN_BAL_IN_USD_FOR_TOKEN = 25; // specify minimum balance in USD to swap this token

export const LIMITS = {
  maxTxSingle: 5, // specify maximum tx count on 1 to 1 token swaps
  maxTxMulti: 5, // specify maximum tx count on one to many or many to one token swaps
  maxVolumeSingle: 500, // specify maximum volume in USD on 1 to 1 token swaps
  maxVolumeMulti: 500, // specify maximum volume in USD on one to many or many to one token swaps
  timeoutMin: {
    seconds: 10, // specify minimum timeout between swaps
    minutes: 0,
    hours: 0,
  },
  timeoutMax: {
    seconds: 20, // specify maximum timeout between swaps
    minutes: 0,
    hours: 0,
  },
  maxGasPrice: {
    L2: '20', // specify maximum gas price in gwei for L2 chains
    Polygon: '400', // specify maximum gas price in gwei for Polygon
  },
  tokens: {
    [Chains.Polygon]: {
      USDT: true,
      USDC: true,
      DAI: true,
      'USDC.e': true,
    },
    [Chains.Arbitrum]: {
      USDT: true,
      USDC: true,
      DAI: true,
      WETH: true,
      'USDC.e': true,
    },
    [Chains.Ethereum]: {
      USDT: true,
      USDC: true,
      DAI: true,
      WETH: true,
    },
    [Chains.BNB]: {
      USDT: true,
      USDC: true,
      WETH: true,
    },
    [Chains.Optimism]: {
      USDT: true,
      USDC: true,
      WETH: true,
      'USDC.e': true,
    },
    [Chains.ZkSync]: {
      USDT: true,
      USDC: true,
      WETH: true,
      DAI: true,
      'USDC.e': true,
    },
    [Chains.Mode]: {
      USDT: true,
      USDC: true,
      WETH: true,
    },
    [Chains.Base]: {
      USDC: true,
      DAI: true,
      WETH: true,
      USDBC: true,
    },
    [Chains.Blast]: {
      USDB: true,
      WETH: true,
    },
  } satisfies Record<Chains, Partial<Record<Tokens, boolean>>>,
};

export const FLAGS = {
  useProxy: true, // specify whether to use proxy or not
  useTxLimit: true, // specify whether to use tx limit or not
  useVolumeLimit: true, // specify whether to use volume limit or not
  useGasPriceLimit: true, // specify whether to use gas price limit or not
};
