import { Chains } from '../src';

export const TG_CHAT_ID = 0; // specify your telegram chat id to receive notifications
export const TG_TOKEN = ''; // specify your telegram bot token to receive notifications

export const MIN_BAL_IN_USD = 0.5; // specify minimum balance in USD to swap this token
export const CHAIN = Chains.Polygon; // specify chain

export const LIMITS = {
  maxTxSingle: 5, // specify maximum tx count on 1 to 1 token swaps
  maxTxMulti: 5, // specify maximum tx count on one to many or many to one token swaps
  maxVolumeSingle: 50, // specify maximum volume in USD on 1 to 1 token swaps
  maxVolumeMulti: 50, // specify maximum volume in USD on one to many or many to one token swaps
};

export const FLAGS = {
  useProxy: true, // specify whether to use proxy or not
  useTxLimit: true, // specify whether to use tx limit or not
  useVolumeLimit: true, // specify whether to use volume limit or not
  finalToken: 'USDC', // specify final token to swap to
};
