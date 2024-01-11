import { Contract, JsonRpcProvider, Wallet, formatUnits, parseUnits } from 'ethers';
import { CHAINS, TOKENS } from './constants';
import { Chains, TimeSeparated, Tokens } from './types';
import { TG_CHAT_ID, TG_TOKEN, MIN_BAL_IN_USD } from '../deps/config';
import axios from 'axios';
import { Erc20Abi } from './abi';
import { updateRates, ratesData } from './data';

export const gasPriceGuard = async (chainId: Chains, maxGasPrice: string) => {
  console.log(`\n[GAS PRICE GUARD] Started for ${CHAINS[chainId].name} chain\n`);
  const rpc = chainId === Chains.Polygon ? CHAINS[chainId].rpc : CHAINS[Chains.Ethereum].rpc;
  const provider = new JsonRpcProvider(rpc);
  const maxGasPriceInWei = parseUnits(maxGasPrice, 'gwei');
  let startingWaitTime = 1;
  let sumWaitTime = 0;

  while (true) {
    sumWaitTime += startingWaitTime;

    const { gasPrice } = await retry(() => provider.getFeeData());

    if (gasPrice! < maxGasPriceInWei) {
      console.log('\n[GAS PRICE GUARD] Gas price is ok, continuing...\n');
      return;
    }
    console.log(
      `[GAS PRICE GUARD] Gas price is too high, waiting for ${startingWaitTime} minute(s), current gas price: ${formatUnits(
        gasPrice!,
        'gwei',
      )} gwei, summary wait time: ${sumWaitTime} minute(s)`,
    );

    startingWaitTime += 1;
    await sleep({ minutes: startingWaitTime });
  }
};

export const getBalances = async (wallet: Wallet, chainId: Chains) => {
  let balances: Partial<Record<Tokens, bigint>> = {};
  for (const token of Object.values(TOKENS[chainId])) {
    const tokenInstance = new Contract(token.address, Erc20Abi, wallet);

    if (!ratesData || ratesData.timestamp + 60 * 60 * 1000 < Date.now()) {
      await updateRates();
    }
    const tokenRate = token.isStable ? 1 : ratesData.rates[token.name];

    const minbalInEther = token.isStable
      ? MIN_BAL_IN_USD.toString()
      : (MIN_BAL_IN_USD * tokenRate!).toFixed(6);
    const minBalInWei = parseUnits(minbalInEther, token.decimals);

    const balance = await retry(() => tokenInstance.balanceOf(wallet.address));

    if (balance < minBalInWei) {
      continue;
    }

    balances[token.name] = balance;
  }
  return balances;
};

export const createProvider = (chainId: Chains) => {
  return new JsonRpcProvider(CHAINS[chainId].rpc);
};

export const shuffleArray = <T>(array: T[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const rndArrElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const convertTimeToSeconds = (time: TimeSeparated): number => {
  const seconds = time.seconds || 0;
  const minutes = time.minutes || 0;
  const hours = time.hours || 0;
  return seconds + minutes * 60 + hours * 60 * 60;
};

export const sleep = async (from: TimeSeparated, to?: TimeSeparated): Promise<void> => {
  const seconds = from.seconds || 0;
  const minutes = from.minutes || 0;
  const hours = from.hours || 0;
  const msFrom = seconds * 1000 + minutes * 60 * 1000 + hours * 60 * 60 * 1000;
  if (to) {
    const seconds = to.seconds || 0;
    const minutes = to.minutes || 0;
    const hours = to.hours || 0;
    const msTo = seconds * 1000 + minutes * 60 * 1000 + hours * 60 * 60 * 1000;
    const ms = Math.floor(Math.random() * (msTo - msFrom + 1) + msFrom);
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  return new Promise((resolve) => setTimeout(resolve, msFrom));
};

export const randomBetween = (min: number, max: number, roundTo?: number): number => {
  const random = Math.random() * (max - min) + min;
  return roundTo !== undefined ? Math.round(random * 10 ** roundTo) / 10 ** roundTo : random;
};

export async function retry<T>(
  fn: () => Promise<T>,
  attempts = 5,
  timeoutInSec = 6,
  logger?: (text: string, isError: boolean) => Promise<any>,
): Promise<T> {
  let response: T;
  while (attempts--) {
    if (attempts === Number.MAX_SAFE_INTEGER - 1) {
      attempts = Number.MAX_SAFE_INTEGER;
    }
    try {
      response = await fn();
      break;
    } catch (e: unknown) {
      if (e instanceof Error) {
        const text = `[RETRY] Error while executing function. Message: ${
          e.message
        }. Attempts left: ${attempts === Number.MAX_SAFE_INTEGER ? 'infinity' : attempts}`;
        console.log(text);
        if (logger) {
          await logger(text, true);
        }
      } else {
        const text = `[RETRY] An unexpected error occurred. Attempts left: ${
          attempts === Number.MAX_SAFE_INTEGER ? 'infinity' : attempts
        }`;
        console.log(text);
        if (logger) {
          await logger(text, true);
        }
      }
      if (attempts === 0) {
        return Promise.reject(e);
      }
      await sleep({ seconds: timeoutInSec });
    }
  }
  return response!;
}

export async function sendTelegramMessage(message: string) {
  if (TG_CHAT_ID === 0 || TG_TOKEN === '') {
    return;
  }

  // Escape markdown special characters
  const escapedMessage = message.replace(/([*_[\]()~`>#+\-={}.!])/g, '\\$1');

  // Truncate the message if it's too long
  const maxLength = 4096;
  const truncatedMessage = escapedMessage.slice(0, maxLength);

  try {
    await axios.post(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      chat_id: TG_CHAT_ID,
      text: truncatedMessage,
      parse_mode: 'MarkdownV2', // Or 'HTML' if you're using HTML tags
      disable_web_page_preview: true,
    });
  } catch (error: any) {
    console.log(error.message);
  }
}
