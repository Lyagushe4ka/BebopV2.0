import { Chains, TokensInfo } from '../types';

export const CHAINS = {
  [Chains.Ethereum]: {
    name: 'ethereum',
    rpc: 'https://eth.llamarpc.com',
    explorer: 'https://etherscan.io/tx/',
    chainId: 1,
  },
  [Chains.Polygon]: {
    name: 'polygon',
    rpc: 'https://1rpc.io/matic', //'https://polygon.meowrpc.com',
    explorer: 'https://polygonscan.com/tx/',
    chainId: 137,
  },
  [Chains.Arbitrum]: {
    name: 'arbitrum',
    rpc: 'https://arbitrum.llamarpc.com',
    explorer: 'https://arbiscan.io/tx/',
    chainId: 42161,
  },
  [Chains.Blast]: {
    name: 'blast',
    rpc: 'https://rpc.blastblockchain.com',
    explorer: 'https://blastscan.io/tx/',
    chainId: 81457,
  },
  [Chains.Optimism]: {
    name: 'optimism',
    rpc: 'https://optimism.meowrpc.com',
    explorer: 'https://optimistic.etherscan.io/tx/',
    chainId: 10,
  },
  [Chains.ZkSync]: {
    name: 'zksync',
    rpc: 'https://1rpc.io/zksync2-era',
    explorer: 'https://era.zksync.network/tx/',
    chainId: 324,
  },
  [Chains.Mode]: {
    name: 'mode',
    rpc: 'https://mainnet.mode.network',
    explorer: 'https://explorer.mode.network/tx/',
    chainId: 34443,
  },
  [Chains.Base]: {
    name: 'base',
    rpc: 'https://base.llamarpc.com',
    explorer: 'https://basescan.com/tx/',
    chainId: 8453,
  },
  [Chains.BNB]: {
    name: 'bsc',
    rpc: 'https://bsc.drpc.org',
    explorer: 'https://bscscan.com/tx/',
    chainId: 56,
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
    WETH: {
      name: 'WETH',
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      decimals: 18,
      isStable: false,
    },
  },
  [Chains.Polygon]: {
    USDT: {
      name: 'USDT',
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      decimals: 6,
      isStable: true,
    },
    'USDC.e': {
      name: 'USDC.e',
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
    USDC: {
      name: 'USDC',
      address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      decimals: 6,
      isStable: true,
    },
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
    'USDC.e': {
      name: 'USDC.e',
      address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      decimals: 6,
      isStable: true,
    },
    DAI: {
      name: 'DAI',
      address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      decimals: 18,
      isStable: true,
    },
    WETH: {
      name: 'WETH',
      address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
      decimals: 18,
      isStable: false,
    },
  },
  [Chains.Blast]: {
    WETH: {
      name: 'WETH',
      address: '0x4300000000000000000000000000000000000004',
      decimals: 18,
      isStable: false,
    },
    USDB: {
      name: 'USDB',
      address: '0x4300000000000000000000000000000000000003',
      decimals: 18,
      isStable: true,
    },
  },
  [Chains.Optimism]: {
    WETH: {
      name: 'WETH',
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      isStable: false,
    },
    USDC: {
      name: 'USDC',
      address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      decimals: 6,
      isStable: true,
    },
    USDT: {
      name: 'USDT',
      address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      decimals: 6,
      isStable: true,
    },
    'USDC.e': {
      name: 'USDC.e',
      address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      decimals: 6,
      isStable: true,
    },
  },
  [Chains.ZkSync]: {
    WETH: {
      name: 'WETH',
      address: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
      decimals: 18,
      isStable: false,
    },
    USDC: {
      name: 'USDC',
      address: '0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4',
      decimals: 6,
      isStable: true,
    },
    USDT: {
      name: 'USDT',
      address: '0x493257fD37EDB34451f62EDf8D2a0C418852bA4C',
      decimals: 6,
      isStable: true,
    },
    'USDC.e': {
      name: 'USDC.e',
      address: '0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4',
      decimals: 6,
      isStable: true,
    },
    DAI: {
      name: 'DAI',
      address: '0x4B9eb6c0b6ea15176BBF62841C6B2A8a398cb656',
      decimals: 18,
      isStable: true,
    },
  },
  [Chains.Mode]: {
    WETH: {
      name: 'WETH',
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      isStable: false,
    },
    USDC: {
      name: 'USDC',
      address: '0xd988097fb8612cc24eeC14542bC03424c656005f',
      decimals: 6,
      isStable: true,
    },
    USDT: {
      name: 'USDT',
      address: '0xf0F161fDA2712DB8b566946122a5af183995e2eD',
      decimals: 6,
      isStable: true,
    },
  },
  [Chains.Base]: {
    WETH: {
      name: 'WETH',
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      isStable: false,
    },
    USDC: {
      name: 'USDC',
      address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      decimals: 6,
      isStable: true,
    },
    DAI: {
      name: 'DAI',
      address: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb',
      decimals: 18,
      isStable: true,
    },
    USDBC: {
      name: 'USDBC',
      address: '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca',
      decimals: 6,
      isStable: true,
    },
  },
  [Chains.BNB]: {
    WETH: {
      name: 'WETH',
      address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
      decimals: 18,
      isStable: false,
    },
    USDC: {
      name: 'USDC',
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      decimals: 18,
      isStable: true,
    },
    USDT: {
      name: 'USDT',
      address: '0x55d398326f99059fF775485246999027B3197955',
      decimals: 18,
      isStable: true,
    },
  },
};
