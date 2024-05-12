import { Wallet } from 'ethers';
import { createAgents } from '../utils';
import { BADGE_API } from './constants';
import { Badges } from './types';

export async function getNonce(address: string, proxy: string): Promise<string | null> {
  const agents = createAgents(proxy);

  try {
    const { data } = await BADGE_API.get('/v2/auth/nonce', {
      params: {
        eoa: address,
      },
      ...agents,
    });

    if (!data.nonce) {
      console.error('Failed to get nonce');
      return null;
    }

    return data.nonce;
  } catch (error: any) {
    console.error('Failed to get nonce', error.message);
    return null;
  }
}

export async function authorize(
  address: string,
  signature: string,
  proxy: string,
): Promise<string | null> {
  const agents = createAgents(proxy);

  try {
    const { data } = await BADGE_API.get('/v2/auth/token', {
      params: {
        eoa: address,
        signature,
      },
      ...agents,
    });

    if (!data.token) {
      console.error('Failed to get token');

      return null;
    }

    return data.token;
  } catch (error: any) {
    console.error('Failed to get token', error.message);
    return null;
  }
}

export async function checkEligibility(
  questId: string,
  authToken: string,
  proxy: string,
): Promise<string | null> {
  const agents = createAgents(proxy);

  try {
    const { data } = await BADGE_API.post(
      '/v2/quest/check_eligibility',
      {
        is_lazy_mint: 0,
        quest_uuid: questId,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        ...agents,
      },
    );

    if (!data.task_processing_uuid) {
      console.log('Failed to check eligibility', data);
      return null;
    }

    return data.task_processing_uuid;
  } catch (error: any) {
    console.log('Failed to check eligibility', error.message);
    return null;
  }
}

export async function processCheck(
  processId: string,
  authToken: string,
  proxy: string,
  type: 'eligibility' | 'claim',
) {
  const agents = createAgents(proxy);

  const include =
    type === 'eligibility' ? 'task_group' : 'quest,task_group,user_tasks,user_reward_transactions';

  try {
    const { data }: { data: Badges.ProcessTaskResponse } = await BADGE_API.get(
      `/v2/task/task_processing/${processId}`,
      {
        params: {
          include,
        },
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        ...agents,
      },
    );

    return data;
  } catch (error: any) {
    console.log('Failed to process check', error.message);
    return null;
  }
}

export async function initiateClaim(
  questId: string,
  checkProcessId: string,
  authToken: string,
  proxy: string,
): Promise<string | null> {
  const agents = createAgents(proxy);

  try {
    const { data } = await BADGE_API.post(
      'https://api.drepute.xyz/v2/reward/claim',
      {
        quest_uuid: questId,
        task_processing_uuid: checkProcessId,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        ...agents,
      },
    );

    if (!data.task_processing_uuid) {
      console.log('Failed to initiate claim', data);
      return null;
    }

    return data.task_processing_uuid;
  } catch (error: any) {
    console.log('Failed to initiate claim', error.message);
    return null;
  }
}

export async function signNonce(wallet: Wallet, nonce: string): Promise<string> {
  const msg = `Signing in to rep3.gg with nonce ${nonce}`;
  const signature = await wallet.signMessage(msg);

  return signature;
}
