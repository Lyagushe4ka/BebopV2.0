import { Chains, TokensInfo } from './types';

export const PERMIT2 = '0x000000000022D473030F116dDEE9F6B43aC78BA3';
export const BEBOP_ROUTER = '0xBeB09000fa59627dc02Bb55448AC1893EAa501A5';
export const API_URL = 'https://api.bebop.xyz';

export const MAX_UINT160 = BigInt('0xffffffffffffffffffffffffffffffffffffffff');

export const TOKEN_TICKERS = ['USDT', 'USDC', 'DAI'] as const;

export const CHAINS = {
  [Chains.Ethereum]: {
    name: 'ethereum',
    rpc: 'https://eth.meowrpc.com',
    explorer: 'https://etherscan.io/tx/',
    chainId: 1,
  },
  [Chains.Polygon]: {
    name: 'polygon',
    rpc: 'https://polygon.drpc.org', //'https://polygon.meowrpc.com',
    explorer: 'https://polygonscan.com/tx/',
    chainId: 137,
  },
  [Chains.Arbitrum]: {
    name: 'arbitrum',
    rpc: 'https://arbitrum.llamarpc.com',
    explorer: 'https://arbiscan.io/tx/',
    chainId: 42161,
  },
};

export const TOKENS: Record<Chains, TokensInfo> = {
  [Chains.Ethereum]: {
    USDT: {
      name: 'USDT',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
      isStable: true,
    },
    USDC: {
      name: 'USDC',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
      isStable: true,
    },
    DAI: {
      name: 'DAI',
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      decimals: 18,
      isStable: true,
    },
    // WETH: {
    //   name: 'WETH',
    //   address: '',
    //   decimals: 18,
    //   isStable: false,
    // },
    // WBTC: {
    //   name: 'WBTC',
    //   address: '',
    //   decimals: 8,
    //   isStable: false,
    // },
  },
  [Chains.Polygon]: {
    USDT: {
      name: 'USDT',
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      decimals: 6,
      isStable: true,
    },
    USDC: {
      name: 'USDC',
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      decimals: 6,
      isStable: true,
    },
    DAI: {
      name: 'DAI',
      address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      decimals: 18,
      isStable: true,
    },
    // WETH: {
    //   name: 'WETH',
    //   address: '',
    //   decimals: 18,
    //   isStable: false,
    // },
    // WBTC: {
    //   name: 'WBTC',
    //   address: '',
    //   decimals: 8,
    //   isStable: false,
    // },
  },
  [Chains.Arbitrum]: {
    USDT: {
      name: 'USDT',
      address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      decimals: 6,
      isStable: true,
    },
    USDC: {
      name: 'USDC',
      address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      decimals: 6,
      isStable: true,
    },
    DAI: {
      name: 'DAI',
      address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      decimals: 18,
      isStable: true,
    },
    // WETH: {
    //   name: 'WETH',
    //   address: '',
    //   decimals: 18,
    //   isStable: false,
    // },
    // WBTC: {
    //   name: 'WBTC',
    //   address: '',
    //   decimals: 8,
    //   isStable: false,
    // },
  },
};

export const permit2Domain = (chainId: Chains) => ({
  name: 'Permit2',
  chainId,
  verifyingContract: PERMIT2,
});

export const bebopDomain = (chainId: Chains) => ({
  name: 'BebopSettlement',
  version: '1',
  chainId,
  verifyingContract: BEBOP_ROUTER,
});

export const typesBebop = {
  Aggregate: [
    { name: 'expiry', type: 'uint256' },
    { name: 'taker_address', type: 'address' },
    { name: 'maker_addresses', type: 'address[]' },
    { name: 'maker_nonces', type: 'uint256[]' },
    { name: 'taker_tokens', type: 'address[][]' },
    { name: 'maker_tokens', type: 'address[][]' },
    { name: 'taker_amounts', type: 'uint256[][]' },
    { name: 'maker_amounts', type: 'uint256[][]' },
    { name: 'receiver', type: 'address' },
    { name: 'commands', type: 'bytes' },
  ],
};

export const typesPermit2 = {
  // EIP712Domain: [
  //   {
  //     name: 'name',
  //     type: 'string',
  //   },
  //   {
  //     name: 'chainId',
  //     type: 'uint256',
  //   },
  //   {
  //     name: 'verifyingContract',
  //     type: 'address',
  //   },
  // ],
  PermitBatch: [
    {
      name: 'details',
      type: 'PermitDetails[]',
    },
    {
      name: 'spender',
      type: 'address',
    },
    {
      name: 'sigDeadline',
      type: 'uint256',
    },
  ],
  PermitDetails: [
    {
      name: 'token',
      type: 'address',
    },
    {
      name: 'amount',
      type: 'uint160',
    },
    {
      name: 'expiration',
      type: 'uint48',
    },
    {
      name: 'nonce',
      type: 'uint48',
    },
  ],
};
