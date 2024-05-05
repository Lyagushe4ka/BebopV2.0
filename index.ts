import { Wallet, formatUnits } from 'ethers';
import {
  CHAINS,
  TOKENS,
  approveIfNeeded,
  gasPriceGuard,
  generateTokensToSwap,
  getBalances,
  getPermit2Data,
  getQuote,
  keysLeft,
  limitsReached,
  rndKeyPair,
  sendOrder,
  sendTelegramMessage,
  signOrder,
  sleep,
  startScript,
  statsDB,
  timeout,
} from './src';

async function main() {
  const { keys, proxies, chain, provider } = await startScript();

  while (true) {
    try {
      if (!(await keysLeft(keys))) {
        break;
      }

      const { key, proxy, index } = rndKeyPair(keys, proxies);

      const wallet = new Wallet(key, provider);
      const address = wallet.address;
      console.log(`\nUsing wallet ${address}\n`);

      if (await limitsReached(address)) {
        keys.splice(index, 1);
        proxies.splice(index, 1);
        continue;
      }

      const balances = await getBalances(wallet, chain);

      if (Object.keys(balances).length === 0) {
        keys.splice(index, 1);
        proxies.splice(index, 1);
        continue;
      }

      await gasPriceGuard(chain);

      const tokensData = await generateTokensToSwap(chain, address, balances);

      if (!tokensData) {
        keys.splice(index, 1);
        proxies.splice(index, 1);
        continue;
      }

      const { tokensFrom, tokensTo, ratios } = tokensData;
      const amountsIn = tokensFrom.map((token) => balances[token]!);

      const approves = await approveIfNeeded(wallet, chain, tokensFrom, balances);

      if (!approves) {
        continue;
      }

      console.log(`\nSwapping ${tokensFrom.join(', ')} to ${tokensTo.join(', ')}\n`);

      const quote = await getQuote(wallet, chain, tokensFrom, tokensTo, amountsIn, ratios, proxy);

      if (!quote) {
        console.log(`\nWallet ${address} failed to get quote.\n`);
        continue;
      }

      const liquidityType = quote.type === 'Jam' ? quote.quote.solver : 'bebop liquidity';
      console.log(`\nGot quote from: ${liquidityType}\n`);

      const deadline = Math.floor((Date.now() + 20 * 60 * 1000) / 1000);
      const permit = await getPermit2Data(
        wallet,
        chain,
        tokensFrom,
        deadline,
        quote.quote.approvalTarget,
      );

      const sig = await signOrder(
        quote.type,
        wallet,
        chain,
        quote.quote.toSign,
        quote.quote.settlementAddress,
      );

      const order = await sendOrder(quote.type, chain, permit, quote.quote.quoteId, sig, proxy);

      if (!order) {
        console.log(`\nWallet ${address} failed to send order.\n`);
        continue;
      }

      statsDB.increment(address, 'fees', +quote.quote.gasFee.usd.toFixed(2));

      const volume = amountsIn.reduce((a, b, i) => {
        const amount = Number(formatUnits(b, TOKENS[chain][tokensFrom[i]]!.decimals));
        return a + amount;
      }, 0);

      if (tokensFrom.length === 1 && tokensTo.length === 1) {
        statsDB.increment(address, 'transactionsSingle', 1);
        statsDB.increment(address, 'volumeSingle', volume);
      } else {
        statsDB.increment(address, 'transactionsMulti', 1);
        statsDB.increment(address, 'volumeMulti', volume);
      }

      let message: string = `Swapped `;
      for (const token of tokensFrom) {
        const amount = Number(
          formatUnits(amountsIn[tokensFrom.indexOf(token)], TOKENS[chain][token]!.decimals),
        );
        message += `${tokensFrom.indexOf(token) === 1 ? 'and ' : ''}${amount.toFixed(2)} ${token} `;
      }

      if (tokensTo.length === 1) {
        message += `to ${volume.toFixed(2)} ${tokensTo[0]}`;
      } else {
        message += `to ${(volume * ratios[0]).toFixed(2)} ${tokensTo[0]} and ${(
          volume * ratios[1]
        ).toFixed(2)} ${tokensTo[1]}`;
      }
      message += `, volume made: ${volume.toFixed(2)}$, tx: ${CHAINS[chain].explorer}${order}\n`;

      await sendTelegramMessage(message);
      console.log(message);

      await timeout();
    } catch (e: any) {
      console.log(`\nCaught error: ${e.message}\n`);
      await sleep({ seconds: 5 });
    }
  }
}

// catching ctrl+c event
process.on('SIGINT', function () {
  console.log('Caught interrupt signal');

  statsDB.save();

  process.exit();
});

// catching unhandled promise rejection
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);

  statsDB.save();

  process.exit();
});

// catching uncaught exception
process.on('uncaughtException', (err, origin) => {
  console.log(`Caught exception: ${err}\n Exception origin: ${origin}`);

  statsDB.save();

  process.exit();
});

main();
