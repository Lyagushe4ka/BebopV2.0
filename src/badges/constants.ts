import axios from 'axios';
import { Badges } from './types';

export const BADGE_IDS: Record<Badges.BadgesNames, string> = {
  '10_trades': '344b30f3-d1e7-439a-863a-a625b3d583ad',
  '25_trades': '6058c32f-6987-41cb-bd1c-5a24150e3664',
  '50_trades': 'fa14c575-5d94-4b39-8957-0f8d814cb0ec',
  '100_trades': '49706b4a-91d5-48cc-a602-7c04ad801dd0',
  '1k_volume': 'ec42b17e-1d05-48a7-904d-92c38b65b625',
  '5k_volume': '6b671ea9-beed-44e3-924d-125de4b97859',
  '10k_volume': '0872a0ca-d64a-41d8-917b-a7d5baced81f',
  '25k_volume': '393db8f2-bccd-45b1-afe7-f7b2da4ab5d1',
  '10_trades_multi': '92b66eac-f7db-4de6-91c8-32360bae16ab',
  '25_trades_multi': 'b5c8e07c-7a93-4cff-8c3d-ef9c7fd31398',
  '50_trades_multi': '2ee2867e-c3b0-4af7-bffa-86a0398213c4',
  '100_trader_multi': '22b2d60d-7a51-4359-9957-e582c0f9ea84',
  mode: '68453380-5e62-49fb-a054-9ebeccaa5d38',
  base: '2fcb4dd4-8231-47bc-8733-ee92c79e1983',
  optimism: 'ca05484b-86db-4691-b719-44db00a3e00a',
  blast: '04270cc8-0234-4db5-96c1-7e3c7647e653',
  zksync: '59d6a332-0e94-4826-b669-c853e80b3c9d',
  arbitrum: '68e112b1-28f3-464b-bd30-ed43ab20049f',
  bnb: 'f01559a8-db4a-4ae4-aab9-3692cdc00853',
  halloween: '2a79a50b-50f3-4cb6-974d-96bc1ae4bf9b',
};

export const BADGE_API = axios.create({
  baseURL: 'https://api.drepute.xyz',
  headers: {
    Referer: 'https://bebop.rep3.gg/',
    Origin: 'https://bebop.rep3.gg',
  },
});
