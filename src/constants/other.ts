import axios from 'axios';
import { Tokens } from '../types';

const API_URL = 'https://api.bebop.xyz';

export const API = axios.create({
  baseURL: API_URL,
  headers: {
    Referer: 'https://bebop.xyz/',
  },
});

export const PERMIT2 = '0x000000000022D473030F116dDEE9F6B43aC78BA3';
export const BEBOP_ROUTER = '0xBeB09000fa59627dc02Bb55448AC1893EAa501A5';

export const MAX_UINT160 = BigInt('0xffffffffffffffffffffffffffffffffffffffff');

export const IS_STABLE: Record<Tokens, boolean> = {
  DAI: true,
  USDT: true,
  USDC: true,
  'USDC.e': true,
  USDBC: true,
  USDB: true,
  WETH: false,
};
