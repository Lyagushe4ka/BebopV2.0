import {
  Contract,
  ContractTransactionResponse,
  MaxUint256,
  TransactionReceipt,
  Wallet,
} from 'ethers';
import { Chains, Permit2Data, Tokens } from './types';
import { BEBOP_ROUTER, PERMIT2, TOKENS, permit2Domain, typesPermit2 } from './constants';
import { Erc20Abi, Permit2Abi } from './abi';
import { retry } from './utils';

export async function allowance(
  wallet: Wallet,
  chainId: Chains,
  token: Tokens,
  spender = PERMIT2,
): Promise<bigint> {
  const tokenAddress = TOKENS[chainId][token].address;

  const contract = new Contract(tokenAddress, Erc20Abi, wallet);
  return await retry(() => contract.allowance(wallet.address, spender));
}

export async function approve(
  wallet: Wallet,
  chainId: Chains,
  token: Tokens,
  spender = PERMIT2,
  amount = MaxUint256,
): Promise<TransactionReceipt | undefined> {
  const tokenAddress = TOKENS[chainId][token].address;

  const contract = new Contract(tokenAddress, Erc20Abi, wallet);
  const tx: ContractTransactionResponse = await retry(() => contract.approve(spender, amount));

  const receipt = await retry(() => tx.wait());

  if (!receipt || receipt.status === 0) {
    return undefined;
  }

  return receipt;
}

export async function permit2Allowance(
  wallet: Wallet,
  chainId: Chains,
  token: Tokens,
  spender: string,
): Promise<{ amount: bigint; expiration: bigint; nonce: bigint }> {
  const tokenAddress = TOKENS[chainId][token].address;

  const permit2Instance = new Contract(PERMIT2, Permit2Abi, wallet);

  const data = await retry(() => permit2Instance.allowance(wallet.address, tokenAddress, spender));

  const [amount, expiration, nonce] = data;

  return {
    amount,
    expiration,
    nonce,
  };
}

export async function getPermit2Data(
  wallet: Wallet,
  chainId: Chains,
  tokens: Array<Tokens>,
  deadline: number,
  amount = MaxUint256,
): Promise<Permit2Data> {
  let value = {
    details: [] as any[],
    spender: BEBOP_ROUTER,
    sigDeadline: deadline,
  };

  for (const token of tokens) {
    const { nonce } = await permit2Allowance(wallet, chainId, token, BEBOP_ROUTER);

    value.details.push({
      token: TOKENS[chainId][token].address,
      amount,
      expiration: deadline,
      nonce,
    });
  }

  const signature = await retry(() =>
    wallet.signTypedData(permit2Domain(chainId), typesPermit2, value),
  );

  const token_addresses = value.details.map((detail) => detail.token);
  const token_nonces = value.details.map((detail) => detail.nonce);
  const approvals_deadline = deadline;

  return { signature, token_addresses, token_nonces, approvals_deadline };
}
