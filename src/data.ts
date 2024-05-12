import axios, { AxiosResponse } from 'axios';
import { FLAGS } from '../deps/config';
import { Stats, StatNames, RatesData } from './types';
import fs from 'fs';
import { IS_STABLE } from './constants';
import { Badges } from './badges';

export let authTokens: Record<string, string>;
export let claimedBadgesData: Record<string, Badges.Badges>;
export let data: Record<string, Stats>;
export let ratesData: RatesData = {
  rates: {} as any,
  timestamp: 0,
};

export const badgesDB = {
  load() {
    if (fs.existsSync('./deps/badges.json')) {
      const fileData = fs.readFileSync('./deps/badges.json', 'utf8');

      if (fileData === '') {
        claimedBadgesData = {};
        return;
      }

      claimedBadgesData = JSON.parse(fileData);
    } else {
      claimedBadgesData = {};
    }
  },

  init(wallet: string) {
    claimedBadgesData[wallet] = {
      '10_trades': false,
      '25_trades': false,
      '50_trades': false,
      '100_trades': false,
      '1k_volume': false,
      '5k_volume': false,
      '10k_volume': false,
      '25k_volume': false,
      '10_trades_multi': false,
      '25_trades_multi': false,
      '50_trades_multi': false,
      '100_trader_multi': false,
      mode: false,
      base: false,
      optimism: false,
      blast: false,
      zksync: false,
      arbitrum: false,
      bnb: false,
      halloween: false,
    };
  },

  set(wallet: string, badge: Badges.BadgesNames, value: boolean) {
    if (!claimedBadgesData[wallet]) {
      this.init(wallet);
    }
    claimedBadgesData[wallet][badge] = value;
  },

  get(wallet: string, statName: Badges.BadgesNames) {
    if (!claimedBadgesData[wallet]) {
      this.init(wallet);
    }
    return claimedBadgesData[wallet][statName];
  },

  save() {
    fs.writeFileSync(
      './deps/badges.json',
      claimedBadgesData ? JSON.stringify(claimedBadgesData, null, 2) : '',
    );
  },
};

export const authDB = {
  load() {
    if (fs.existsSync('./deps/auth.json')) {
      const fileData = fs.readFileSync('./deps/auth.json', 'utf8');

      if (fileData === '') {
        authTokens = {};
        return;
      }

      authTokens = JSON.parse(fileData);
    } else {
      authTokens = {};
    }
  },

  set(wallet: string, token: string) {
    authTokens[wallet] = token;
  },

  get(wallet: string) {
    const token = authTokens[wallet];

    if (!token || token === '') {
      return null;
    }

    return token;
  },

  save() {
    fs.writeFileSync('./deps/auth.json', authTokens ? JSON.stringify(authTokens, null, 2) : '');
  },
};

export const statsDB = {
  load() {
    if (fs.existsSync('./deps/stats.json')) {
      const fileData = fs.readFileSync('./deps/stats.json', 'utf8');

      if (fileData === '') {
        data = {};
        return;
      }

      data = JSON.parse(fileData);
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

    const valueRounded = Number(value.toFixed(2));

    data[wallet][statName] = (data[wallet][statName] || 0) + valueRounded;
  },

  save() {
    fs.writeFileSync('./deps/stats.json', data ? JSON.stringify(data, null, 2) : '');
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
      return (proxy = 'socks://' + proxy);
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

  for (const [token, isStable] of Object.entries(IS_STABLE)) {
    let rate: number;
    if (isStable) {
      rate = 1;
    } else {
      const tokenName = token.startsWith('W') ? token.substring(1) : token;
      rate = prices[tokenName] || 0;
    }

    ratesData.rates = {
      ...ratesData.rates,
      [token]: rate,
    };
  }

  ratesData = {
    ...ratesData,
    timestamp: Date.now(),
  };
};
