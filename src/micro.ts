import { Wallet } from 'ethers';
import { CHAIN, FLAGS, LIMITS } from '../deps/config';
import { authDB, badgesDB, readData, statsDB, updateRates } from './data';
import { Chains, Tokens } from './types';
import { createProvider, randomBetween, sendTelegramMessage, shuffleArray, sleep } from './utils';
import { allowance, approve } from './approvalHelpers';
import { CHAINS } from './constants';

export async function startScript() {
  const chainId = CHAIN;

  if (!(chainId in Chains)) {
    throw new Error('Invalid chain id');
  }

  const chain = chainId as Chains;
  let { keys, proxies = [] } = readData();

  statsDB.load();
  authDB.load();
  badgesDB.load();
  await updateRates();

  const provider = createProvider(chain);

  return { keys, proxies, chain, provider };
}

export async function limitsReached(address: string): Promise<boolean> {
  if (FLAGS.useTxLimit) {
    const txCountSingle = statsDB.get(address, 'transactionsSingle');
    const txCountMulti = statsDB.get(address, 'transactionsMulti');

    if (txCountSingle >= LIMITS.maxTxSingle && txCountMulti >= LIMITS.maxTxMulti) {
      console.log(`\nWallet ${address} reached tx limit, removing from the list...\n`);
      await sendTelegramMessage(
        `\nWallet ${address} reached tx limit, removing from the list...\n`,
      );

      return true;
    }
  } else if (FLAGS.useVolumeLimit) {
    const volumeSingle = statsDB.get(address, 'volumeSingle');
    const volumeMulti = statsDB.get(address, 'volumeMulti');

    if (volumeSingle >= LIMITS.maxVolumeSingle && volumeMulti >= LIMITS.maxVolumeMulti) {
      console.log(`\nWallet ${address} reached volume limit, removing from the list...\n`);
      await sendTelegramMessage(
        `\nWallet ${address} reached volume limit, removing from the list...\n`,
      );

      return true;
    }
  }

  return false;
}

export async function generateTokensToSwap(
  chain: Chains,
  address: string,
  balances: Partial<Record<Tokens, bigint>>,
): Promise<{ tokensFrom: Tokens[]; tokensTo: Tokens[]; ratios: number[] } | null> {
  const possibleTokensFrom = shuffleArray(Object.keys(balances) as Tokens[]);
  const possibleTokensTo = shuffleArray(Object.entries(LIMITS.tokens[chain]))
    .filter(([token, enabled]) => {
      if (enabled) {
        return token;
      }
    })
    .map(([token]) => token as Tokens);

  const txCountSingle = statsDB.get(address, 'transactionsSingle');
  const txCountMulti = statsDB.get(address, 'transactionsMulti');
  const volumeSingle = statsDB.get(address, 'volumeSingle');
  const volumeMulti = statsDB.get(address, 'volumeMulti');

  const txSingleReached = FLAGS.useTxLimit ? LIMITS.maxTxSingle <= txCountSingle : true;
  const txMultiReached = FLAGS.useTxLimit ? LIMITS.maxTxMulti <= txCountMulti : true;
  const volumeSingleReached = FLAGS.useVolumeLimit ? LIMITS.maxVolumeSingle <= volumeSingle : true;
  const volumeMultiReached = FLAGS.useVolumeLimit ? LIMITS.maxVolumeMulti <= volumeMulti : true;

  if (possibleTokensFrom.length === 0) {
    console.log(`\nWallet ${address} is empty, removing from the list...\n`);
    await sendTelegramMessage(`\nWallet ${address} is empty, removing from the list...\n`);

    return null;
  } else if (possibleTokensTo.length === 0) {
    console.log(`\nNo tokens to swap on wallet: ${address}\n`);
    await sendTelegramMessage(`\nNo tokens to swap on wallet: ${address}\n`);

    return null;
  }

  const ratio = randomBetween(0.4, 0.6, 1);
  const ratios = [ratio, 1 - ratio];

  let tokensFrom: Tokens[] = [];
  let tokensTo: Tokens[] = [];

  if (possibleTokensFrom.length === 1) {
    tokensFrom.push(possibleTokensFrom[0]);

    const possibleTokensToHere = possibleTokensTo.filter(
      (token) => token !== possibleTokensFrom[0],
    );

    if (possibleTokensToHere.length === 1) {
      tokensTo.push(possibleTokensToHere[0]);
    } else if (txSingleReached && volumeSingleReached) {
      tokensTo.push(possibleTokensToHere[0], possibleTokensToHere[1]);
    } else if (txMultiReached && volumeMultiReached) {
      tokensTo.push(possibleTokensToHere[0]);
    } else {
      const rnd = Math.random();
      if (rnd < 0.5) {
        tokensTo.push(possibleTokensToHere[0]);
      } else {
        tokensTo.push(possibleTokensToHere[0], possibleTokensToHere[1]);
      }
    }
  } else {
    const possibleTokens1 = possibleTokensTo.filter((token) => token !== possibleTokensFrom[0]);
    const possibleTokens2 = possibleTokensTo.filter(
      (token) => token !== possibleTokensFrom[0] && token !== possibleTokensFrom[1],
    );

    if (txSingleReached && volumeSingleReached && possibleTokens2.length > 0) {
      tokensFrom.push(possibleTokensFrom[0], possibleTokensFrom[1]);

      tokensTo.push(possibleTokens2[0]);
    } else if (txMultiReached && volumeMultiReached) {
      tokensFrom.push(possibleTokensFrom[0]);

      tokensTo.push(possibleTokens1[0]);
    } else {
      const rnd = Math.random() > 0.5;
      const is2Tokens = possibleTokensTo.length > 1;
      if (is2Tokens && rnd && possibleTokens1.length > 1) {
        tokensFrom.push(possibleTokensFrom[0]);
        tokensTo.push(possibleTokens1[0], possibleTokens1[1]);
      } else if (is2Tokens && !rnd && possibleTokens2.length > 0) {
        tokensFrom.push(possibleTokensFrom[0], possibleTokensFrom[1]);
        tokensTo.push(possibleTokens2[0]);
      } else {
        tokensFrom.push(possibleTokensFrom[0]);
        tokensTo.push(possibleTokens1[0]);
      }
    }
  }

  return { tokensFrom, tokensTo, ratios };
}

export async function approveIfNeeded(
  wallet: Wallet,
  chain: Chains,
  tokens: Tokens[],
  balances: Partial<Record<Tokens, bigint>>,
) {
  console.log(`\nChecking approvals for wallet ${wallet.address}\n`);

  for (const token of tokens) {
    const allow = await allowance(wallet, chain, token);

    if (allow < balances[token]!) {
      console.log(`\nApproving ${token} to permit2 contract...\n`);
      const tx = await approve(wallet, chain, token);

      if (!tx) {
        console.log(`\nWallet ${wallet.address} failed to approve ${token}.\n`);
        return false;
      } else {
        console.log(
          `\nWallet ${wallet.address} approved ${token} for Permit2 contract, tx: ${CHAINS[chain].explorer}${tx.hash}\n`,
        );
        await sendTelegramMessage(
          `\nWallet ${wallet.address} approved ${token} for Permit2 contract, tx: ${CHAINS[chain].explorer}${tx.hash}\n`,
        );
      }

      await sleep({ seconds: 5 }, { seconds: 30 });
    }
  }
  return true;
}

export const rndKeyPair = (
  keys: string[],
  proxies: string[],
): { key: string; proxy: string; index: number } => {
  const rnd = Math.floor(Math.random() * keys.length);
  return { key: keys[rnd], proxy: proxies[rnd], index: rnd };
};

export const keysLeft = async (keys: string[]): Promise<boolean> => {
  if (keys.length === 0) {
    console.log('No wallets left.');
    await sendTelegramMessage('\n🏁No wallets left, exiting...\n');
    statsDB.save();
    authDB.save();
    badgesDB.save();
    return false;
  }

  return true;
};
