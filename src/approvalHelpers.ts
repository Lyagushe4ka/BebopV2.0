import {
  Contract,
  ContractTransactionResponse,
  MaxUint256,
  TransactionReceipt,
  Wallet,
} from 'ethers';
import { Chains, Permit2Data, Tokens } from './types';
import { Erc20Abi, Permit2Abi } from './abi';
import { retry } from './utils';
import {
  BEBOP_ROUTER,
  MAX_UINT160,
  PERMIT2,
  TOKENS,
  permit2Domain,
  typesPermit2,
} from './constants';

export async function allowance(
  wallet: Wallet,
  chainId: Chains,
  token: Tokens,
  spender = PERMIT2,
): Promise<bigint> {
  const tokenData = TOKENS[chainId][token];

  if (!tokenData) {
    throw new Error('Token not found');
  }

  const contract = new Contract(tokenData.address, Erc20Abi, wallet);
  return await retry(() => contract.allowance(wallet.address, spender));
}

export async function approve(
  wallet: Wallet,
  chainId: Chains,
  token: Tokens,
  spender = PERMIT2,
  amount = MaxUint256,
): Promise<TransactionReceipt | undefined> {
  const tokenData = TOKENS[chainId][token];

  if (!tokenData) {
    throw new Error('Token not found');
  }

  const contract = new Contract(tokenData.address, Erc20Abi, wallet);
  const tx: ContractTransactionResponse = await retry(() => contract.approve(spender, amount));

  const receipt = await retry(
    async () => {
      const receipt = await wallet.provider!.getTransactionReceipt(tx.hash);

      if (receipt === null) {
        throw new Error('Got null receipt');
      }

      return receipt;
    },
    5,
    10,
  );

  if (receipt.status === 0) {
    return undefined;
  }

  return receipt;
}

export async function permit2Allowance(
  wallet: Wallet,
  chainId: Chains,
  token: Tokens,
  spender = BEBOP_ROUTER,
): Promise<{ amount: bigint; expiration: bigint; nonce: bigint }> {
  const tokenData = TOKENS[chainId][token];

  if (!tokenData) {
    throw new Error('Token not found');
  }

  const permit2Instance = new Contract(PERMIT2, Permit2Abi, wallet);

  const data = await retry(() =>
    permit2Instance.allowance(wallet.address, tokenData.address, spender),
  );

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
  spender: string,
  amount = MAX_UINT160,
): Promise<Permit2Data> {
  let value = {
    details: [] as any[],
    spender,
    sigDeadline: deadline,
  };

  for (const token of tokens) {
    const { nonce } = await permit2Allowance(wallet, chainId, token, spender);

    const tokenData = TOKENS[chainId][token];

    if (!tokenData) {
      throw new Error('Token not found');
    }

    value.details.push({
      token: tokenData.address,
      amount,
      expiration: deadline,
      nonce: nonce.toString(),
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
