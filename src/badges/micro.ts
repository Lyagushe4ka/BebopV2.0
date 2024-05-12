import { Wallet } from 'ethers';
import { authorize, getNonce, processCheck, signNonce } from './utils';
import { authDB } from '../data';
import { Badges } from './types';
import { sleep } from '../utils';

export async function authProcess(wallet: Wallet, proxy: string): Promise<string | null> {
  console.log(`\nWallet ${wallet.address} is not authorized, logging in...\n`);

  const nonce = await getNonce(wallet.address, proxy);

  if (!nonce) {
    // TODO: handle this case??
    return null;
  }

  const sign = await signNonce(wallet, nonce);

  const token = await authorize(wallet.address, sign, proxy);

  if (!token) {
    // TODO: handle this case??
    return null;
  }

  authDB.set(wallet.address, token);

  return token;
}

export async function processTaskWait(
  processId: string,
  authToken: string,
  proxy: string,
  type: 'eligibility' | 'claim',
) {
  let data: Badges.ProcessTaskResponse | null = null;

  let retries = 7;
  let state: Badges.State = Badges.State.INITIATED;
  while (state !== Badges.State.DONE && retries > 0) {
    await sleep({ seconds: 5 }, { seconds: 10 });

    data = await processCheck(processId, authToken, proxy, type);
    // console.log('Data:', data);

    if (!data) {
      return null;
    }

    state = data.state;
    retries--;
  }

  if (!data) {
    console.log('Failed to check process state, retries exceeded');
    return null;
  }

  if (!data.is_eligible) {
    console.log('Badge is not eligible');
    return false;
  }

  return true;
}
