import axios, { AxiosResponse } from 'axios';
import { FLAGS } from '../deps/config';
import { Stats, StatNames, RatesData } from './types';
import fs from 'fs';
import { TOKENS } from './constants';

export let data: Record<string, Stats>;
export let ratesData: RatesData;

export const statsDB = {
  load() {
    if (fs.existsSync('./deps/stats.json')) {
      data = JSON.parse(fs.readFileSync('./deps/stats.json', 'utf8'));
    } else {
      data = {};
    }
  },

  init(wallet: string) {
    data[wallet] = {
      transactionsSingle: 0,
      transactionsMulti: 0,
      volumeSingle: 0,
      volumeMulti: 0,
      fees: 0,
    };
  },

  get(wallet: string, statName: StatNames) {
    if (!data[wallet]) {
      this.set(wallet, statName, 0);
    }
    return data[wallet][statName];
  },

  set(wallet: string, statName: StatNames, value: number) {
    if (!data[wallet]) {
      this.init(wallet);
    }
    data[wallet][statName] = value;
  },

  increment(wallet: string, statName: StatNames, value: number) {
    if (!data[wallet]) {
      this.init(wallet);
    }
    data[wallet][statName] = (data[wallet][statName] || 0) + value;
  },

  save() {
    fs.writeFileSync('./deps/stats.json', JSON.stringify(data));
  },
};

export function readData(): { keys: string[]; proxies?: string[] } {
  const keys = fs.readFileSync('./deps/keys.txt', 'utf8').replaceAll('\r', '').split('\n');

  keys.every((key, index) => {
    if (!((key.startsWith('0x') && key.length === 66) || key.length === 64)) {
      throw new Error(`Invalid key length at line ${index + 1}.`);
    }
    return true;
  });

  if (FLAGS.useProxy) {
    let proxies = fs.readFileSync('./deps/proxies.txt', 'utf8').replaceAll('\r', '').split('\n');

    const proxyRegex = /^[a-zA-Z0-9]+:[a-zA-Z0-9]+@[0-9.]+:[0-9]+$/;

    proxies.every((proxy, index) => {
      if (!proxyRegex.test(proxy)) {
        throw new Error(`Invalid proxy at line ${index + 1}.`);
      }
      return true;
    });

    proxies = proxies.map((proxy) => {
      return (proxy = 'socks5://' + proxy);
    });

    if (keys.length !== proxies.length) {
      throw new Error('Number of keys and proxies must be equal.');
    }

    return { keys, proxies };
  }

  return { keys };
}

export const updateRates = async (): Promise<void> => {
  const endpoint = 'https://api.binance.com/api/v3/ticker/price';
  let response: AxiosResponse;
  try {
    response = await axios.get(endpoint);
  } catch (error) {
    return undefined;
  }
  const rawData = response.data;
  const prices: Record<string, number> = {};
  for (const { symbol, price } of rawData) {
    if (symbol.endsWith('USDT')) {
      prices[symbol.substring(0, symbol.length - 4)] = parseFloat(price);
    }
  }

  for (const token of Object.values(TOKENS[1])) {
    if (token.isStable) {
      continue;
    }

    const tokenName = token.name.startsWith('W') ? token.name.substring(1) : token.name;

    if (prices[tokenName]) {
      ratesData.rates = {
        ...ratesData.rates,
        [token.name]: prices[tokenName],
      };
    }
  }

  ratesData.timestamp = Date.now();
};
