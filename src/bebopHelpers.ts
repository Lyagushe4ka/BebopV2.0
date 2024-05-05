import {
  Chains,
  OrderStatus,
  OrderType,
  Permit2Data,
  Quote,
  QuoteParams,
  QuoteResponse,
  ToSignJam,
  ToSignPMM,
  Tokens,
} from './types';
import { createAgents, retry, sleep } from './utils';
import { Wallet } from 'ethers';
import { FLAGS } from '../deps/config';
import { API, CHAINS, TOKENS, bebopTypesJam, bebopTypesPmm } from './constants';

export async function getQuote(
  wallet: Wallet,
  chainId: Chains,
  tokensIn: Tokens[],
  tokensOut: Tokens[],
  amountsIn: bigint[],
  ratios: number[],
  proxy: string,
): Promise<
  | {
      type: OrderType;
      quote: Quote;
    }
  | undefined
> {
  const agents = FLAGS.useProxy ? createAgents(proxy) : {};

  const name = CHAINS[chainId].name;
  const tokenInAddresses = tokensIn.map((token) => TOKENS[chainId][token]!.address); // TODO: check if token exists
  const tokenOutAddresses = tokensOut.map((token) => TOKENS[chainId][token]!.address); // TODO: check if token exists
  const tokensInStr = tokenInAddresses.join(',');
  const tokensOutStr = tokenOutAddresses.join(',');
  const sellAmountsStr = amountsIn.join(',');
  const ratiosStr = ratios.join(',');

  const params: QuoteParams = {
    buy_tokens: tokensOutStr,
    sell_tokens: tokensInStr,
    taker_address: wallet.address,
    receiver_address: wallet.address,
    source: 'bebop',
    approval_type: 'Permit2',
    sell_amounts: sellAmountsStr,
  };

  if (tokenOutAddresses.length > 1) {
    params.buy_tokens_ratios = ratiosStr;
  }

  const response = await retry(() =>
    API.get(`/router/${name}/v1/quote`, {
      params,
      ...agents,
    }),
  );

  if (response.data.error) {
    console.log(response.data.error);
    return undefined;
  }

  if (response.data.routes.length === 0) {
    console.log('No routes found.');
    return undefined;
  }

  return (response.data as QuoteResponse).routes[0];
}

export async function signOrder(
  orderType: OrderType,
  wallet: Wallet,
  chainId: Chains,
  dataToSign: ToSignJam | ToSignPMM,
  verifyingContract: string,
): Promise<string> {
  const types = orderType === 'Jam' ? bebopTypesJam : bebopTypesPmm;

  const domain = {
    name: orderType === 'Jam' ? 'JamSettlement' : 'BebopSettlement',
    version: '1',
    chainId,
    verifyingContract,
  };

  const sig = await retry(() => wallet.signTypedData(domain, types, dataToSign));

  return sig;
}

export async function sendOrder(
  orderType: OrderType,
  chainId: Chains,
  permit2: Permit2Data,
  quote_id: string,
  signature: string,
  proxy: string,
): Promise<string | undefined> {
  const agents = FLAGS.useProxy ? createAgents(proxy) : {};

  const name = CHAINS[chainId].name;

  const endpoint = orderType === 'Jam' ? `/jam/${name}/v1/order` : `/${name}/v2/order`;

  const response = await API.post(
    endpoint,
    { permit2, quote_id, signature, sign_scheme: 'EIP712' },
    { ...agents },
  );

  const data = response.data;

  if (response.status !== 200 || data.error) {
    console.log(data.error);
    return undefined;
  }
  //  { error: { errorCode: number; message: string } };

  if ((data as { txHash: string; status: OrderStatus }).status === OrderStatus.FAILED) {
    console.log('Order failed.');
    return undefined;
  }

  let tx: string = data.txHash;
  let status: OrderStatus = data.status;
  while (status !== OrderStatus.SUCCESS && status !== OrderStatus.SETTLED) {
    await sleep({ seconds: 5 }, { seconds: 15 });

    const statusData = await getStatus(orderType, chainId, quote_id, proxy);
    status = statusData.status;
    tx = statusData.txHash;
  }

  return tx;
}

export async function getStatus(
  orderType: OrderType,
  chainId: Chains,
  quote_id: string,
  proxy: string,
) {
  const agents = FLAGS.useProxy ? createAgents(proxy) : {};

  const name = CHAINS[chainId].name;
  const endpoint =
    orderType === 'Jam' ? `/jam/${name}/v1/order-status` : `/${name}/v2/order-status`;

  const response = await API.get(endpoint, {
    params: { quote_id },
    ...agents,
  });

  const data = response.data as { status: OrderStatus; txHash: string };

  return data;
}
