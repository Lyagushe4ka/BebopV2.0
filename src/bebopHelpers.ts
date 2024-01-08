import { SocksProxyAgent } from 'socks-proxy-agent';
import { Chains, Permit2Data, Quote, Tokens } from './types';
import axios from 'axios';
import { API_URL, CHAINS, TOKENS, bebopDomain, typesBebop } from './constants';
import { retry } from './utils';
import { Wallet } from 'ethers';
import { FLAGS } from '../deps/config';

export async function getQuote(
  wallet: Wallet,
  chainId: Chains,
  tokensIn: Tokens[],
  tokensOut: Tokens[],
  amountsIn: bigint[],
  proxy: string,
): Promise<Quote | undefined> {
  const proxyAgent = FLAGS.useProxy ? new SocksProxyAgent(proxy) : undefined;

  const name = CHAINS[chainId].name;
  const tokenInAddresses = tokensIn.map((token) => TOKENS[chainId][token]);
  const tokenOutAddresses = tokensOut.map((token) => TOKENS[chainId][token]);
  const tokensInStr = tokenInAddresses.join('%2C');
  const tokensOutStr = tokenOutAddresses.join('%2C');
  const sellAmountsStr = amountsIn.map((amount) => amount.toString()).join('%2C');

  const ratios = tokenOutAddresses.length > 1 ? `&buy_tokens_ratios=0.5%2C0.5` : '';

  const url = `${API_URL}/${name}/v2/quote?sell_tokens=${tokensInStr}&buy_tokens=${tokensOutStr}&sell_amounts=${sellAmountsStr}&taker_address=${wallet.address}&source=bebop&approval_type=Permit2${ratios}`;

  const response = await retry(() =>
    axios.get(url, { httpAgent: proxyAgent, httpsAgent: proxyAgent }),
  );

  if (response.data.error) {
    return undefined;
  }

  return response.data;
}

export async function signOrder(wallet: Wallet, chainId: Chains, dataToSign: any): Promise<string> {
  const sig = await retry(() => wallet.signTypedData(bebopDomain(chainId), typesBebop, dataToSign));

  return sig;
}

export async function sendOrder(
  chainId: Chains,
  permit2: Permit2Data,
  quote_id: string,
  signature: string,
  proxy: string,
): Promise<string | undefined> {
  const proxyAgent = FLAGS.useProxy ? new SocksProxyAgent(proxy) : undefined;

  const name = CHAINS[chainId].name;

  const url = `${API_URL}/${name}/v2/order`;

  const response = await retry(() =>
    axios.post(
      url,
      { permit2, quote_id, signature },
      { httpAgent: proxyAgent, httpsAgent: proxyAgent },
    ),
  );

  if (response.status !== 200 || response.data.error || response.data.status !== 'Success') {
    return undefined;
  }

  return response.data.txHash;
}
