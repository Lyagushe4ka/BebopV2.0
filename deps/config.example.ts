import { Chains, Tokens } from '../src';

export const TG_CHAT_ID: number = 0; // specify your telegram chat id to receive notifications
export const TG_TOKEN: string = ''; // specify your telegram bot token to receive notifications

export const MIN_BAL_IN_USD = 0.5; // specify minimum balance in USD to swap this token
export const CHAIN = Chains.Polygon; // specify chain, options: Chains.Polygon, Chains.Arbitrum, Chains.Ethereum

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
    seconds: 0, // specify maximum timeout between swaps
    minutes: 10,
    hours: 0,
  },
  maxGasPrice: {
    [Chains.Polygon]: '400', // polygon gas price in gwei
    [Chains.Arbitrum]: '30', // ethereum gas price in gwei
    [Chains.Ethereum]: '30', // ethereum gas price in gwei
  },
};

export const FLAGS = {
  useProxy: true, // specify whether to use proxy or not
  useTxLimit: true, // specify whether to use tx limit or not
  useVolumeLimit: true, // specify whether to use volume limit or not
  useGasPriceLimit: true, // specify whether to use gas price limit or not
  finalToken: 'USDC' as Tokens, // specify final token to swap to
};
