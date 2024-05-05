import { Chains } from '../types';
import { BEBOP_ROUTER, PERMIT2 } from './other';

export const bebopTypesPmm = {
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

export const bebopTypesJam = {
  JamOrder: [
    { name: 'taker', type: 'address' },
    { name: 'receiver', type: 'address' },
    { name: 'expiry', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'executor', type: 'address' },
    { name: 'minFillPercent', type: 'uint16' },
    { name: 'hooksHash', type: 'bytes32' },
    { name: 'sellTokens', type: 'address[]' },
    { name: 'buyTokens', type: 'address[]' },
    { name: 'sellAmounts', type: 'uint256[]' },
    { name: 'buyAmounts', type: 'uint256[]' },
    { name: 'sellNFTIds', type: 'uint256[]' },
    { name: 'buyNFTIds', type: 'uint256[]' },
    { name: 'sellTokenTransfers', type: 'bytes' },
    { name: 'buyTokenTransfers', type: 'bytes' },
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

export const permit2Domain = (chainId: Chains) => ({
  name: 'Permit2',
  chainId,
  verifyingContract: PERMIT2,
});
