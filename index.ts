import { Wallet, formatUnits, parseUnits } from 'ethers';
import { CHAIN, FLAGS, LIMITS, MIN_BAL_IN_USD } from './deps/config';
import {
  CHAINS,
  TOKENS,
  TOKEN_TICKERS,
  Tokens,
  allowance,
  approve,
  convertTimeToSeconds,
  createProvider,
  gasPriceGuard,
  getBalances,
  getPermit2Data,
  getQuote,
  randomBetween,
  readData,
  sendOrder,
  sendTelegramMessage,
  shuffleArray,
  signOrder,
  sleep,
  statsDB,
  updateRates,
} from './src';

async function main() {
  let { keys, proxies = [] } = readData();

  statsDB.load();
  await updateRates();

  const provider = createProvider(CHAIN);

  while (true) {
    if (keys.length === 0) {
      console.log('No wallets left.');
      await sendTelegramMessage('\n🏁No wallets left, exiting...\n');
      statsDB.save();
      break;
    }

    await gasPriceGuard(CHAIN, LIMITS.maxGasPrice[CHAIN]);

    let lastSwap = false;
    const rnd = Math.floor(Math.random() * keys.length);

    const key = keys[rnd];
    const proxy = proxies[rnd];

    const wallet = new Wallet(key, provider);
    const address = wallet.address;
    console.log(`\nUsing wallet ${address}\n`);

    if (FLAGS.useTxLimit) {
      const txCountSingle = statsDB.get(address, 'transactionsSingle');
      const txCountMulti = statsDB.get(address, 'transactionsMulti');

      if (txCountSingle >= LIMITS.maxTxSingle && txCountMulti >= LIMITS.maxTxMulti) {
        keys.splice(rnd, 1);
        proxies.splice(rnd, 1);
        console.log(`\nWallet ${address} reached tx limit, removing from the list...\n`);
        await sendTelegramMessage(
          `\nWallet ${address} reached tx limit, removing from the list...\n`,
        );

        lastSwap = true;
      }
    } else if (FLAGS.useVolumeLimit) {
      const volumeSingle = statsDB.get(address, 'volumeSingle');
      const volumeMulti = statsDB.get(address, 'volumeMulti');

      if (volumeSingle >= LIMITS.maxVolumeSingle && volumeMulti >= LIMITS.maxVolumeMulti) {
        keys.splice(rnd, 1);
        proxies.splice(rnd, 1);
        console.log(`\nWallet ${address} reached volume limit, removing from the list...\n`);
        await sendTelegramMessage(
          `\nWallet ${address} reached volume limit, removing from the list...\n`,
        );

        lastSwap = true;
      }
    }

    const balances = await getBalances(wallet, CHAIN);

    if (Object.keys(balances).length === 0) {
      if (lastSwap) {
        continue;
      }

      keys.splice(rnd, 1);
      proxies.splice(rnd, 1);
      console.log(`\nWallet ${address} is empty, removing from the list...\n`);
      await sendTelegramMessage(`\nWallet ${address} is empty, removing from the list...\n`);
      continue;
    }

    let tokensFrom = [...TOKEN_TICKERS.filter((token) => balances[token])];
    let amountsIn = tokensFrom.map((token) => {
      const minAmount = MIN_BAL_IN_USD;
      const maxAmount = formatUnits(balances[token]!, TOKENS[CHAIN][token].decimals);
      const rndAmount = randomBetween(minAmount, +maxAmount, 2);
      return parseUnits(rndAmount.toString(), TOKENS[CHAIN][token].decimals);
    });
    let tokensTo = [...shuffleArray(TOKEN_TICKERS.filter((token) => !tokensFrom.includes(token)))];

    if (tokensTo.length > 1) {
      let numTokens = Math.floor(Math.random() * 2) + 1; // Randomly choose either 1 or 2

      const txCountSingle = statsDB.get(address, 'transactionsSingle');
      const txCountMulti = statsDB.get(address, 'transactionsMulti');
      if (LIMITS.maxTxMulti <= txCountMulti) {
        numTokens = 1;
      } else if (LIMITS.maxTxSingle <= txCountSingle) {
        numTokens = 2;
      }

      tokensTo = tokensTo.slice(0, numTokens); // Get the first 1 or 2 tokens
    }

    if (lastSwap) {
      tokensFrom = Object.keys(balances).filter((token) => token !== FLAGS.finalToken) as Tokens[];

      if (tokensFrom.length === 0) {
        console.log(`\nNothing to swap to final token on wallet: ${address}\n`);
        await sendTelegramMessage(`\nNothing to swap to final token on wallet: ${address}\n`);
        continue;
      }

      amountsIn = tokensFrom.map((token) => balances[token]!);
      tokensTo = [FLAGS.finalToken];
    }

    console.log(`\nSwapping ${tokensFrom.join(', ')} to ${tokensTo.join(', ')}\n`);

    for (const token of tokensFrom) {
      const allow = await allowance(wallet, CHAIN, token);

      if (allow < balances[token]!) {
        const tx = await approve(wallet, CHAIN, token);

        if (!tx) {
          console.log(`\nWallet ${address} failed to approve ${token}.\n`);
          continue;
        } else {
          console.log(
            `\nWallet ${address} approved ${token} for Permit2 contract, tx: ${CHAINS[CHAIN].explorer}/${tx.hash}\n`,
          );
          await sendTelegramMessage(
            `\nWallet ${address} approved ${token} for Permit2 contract, tx: ${CHAINS[CHAIN].explorer}/${tx.hash}\n`,
          );
        }

        await sleep({ seconds: 5 });
      }
    }

    const quote = await getQuote(wallet, CHAIN, tokensFrom, tokensTo, amountsIn, proxy);

    if (!quote) {
      console.log(`\nWallet ${address} failed to get quote.\n`);
      continue;
    }

    const permit = await getPermit2Data(wallet, CHAIN, tokensFrom, quote.expiry);

    const sig = await signOrder(wallet, CHAIN, quote.toSign);

    const order = await sendOrder(CHAIN, permit, quote.quoteId, sig, proxy);

    if (!order) {
      console.log(`\nWallet ${address} failed to send order.\n`);
      continue;
    }

    statsDB.increment(address, 'fees', quote.gasFee.usd);

    const volume = amountsIn.reduce((a, b, i) => {
      const amount = Number(formatUnits(b, TOKENS[CHAIN][tokensFrom[i]].decimals));
      return a + amount;
    }, 0);

    if (tokensFrom.length === 1 && tokensTo.length === 1) {
      statsDB.increment(address, 'transactionsSingle', 1);
      statsDB.increment(address, 'volumeSingle', volume);
    } else {
      statsDB.increment(address, 'transactionsMulti', 1);
      statsDB.increment(address, 'volumeMulti', volume);
    }

    await sendTelegramMessage(
      `\nSwapped ${tokensFrom.join(', ')} to ${tokensTo.join(', ')}, volume made: ${volume.toFixed(
        2,
      )}$, tx: ${CHAINS[CHAIN].explorer}${order}\n`,
    );
    console.log(
      `\nSwapped ${tokensFrom.join(', ')} to ${tokensTo.join(', ')}, volume made: ${volume.toFixed(
        2,
      )}$, tx: ${CHAINS[CHAIN].explorer}${order}\n`,
    );

    const timeoutMin = convertTimeToSeconds(LIMITS.timeoutMin);
    const timeoutMax = convertTimeToSeconds(LIMITS.timeoutMax);
    const rndTimeout = randomBetween(timeoutMin, timeoutMax, 0);

    console.log(`\nSleeping for ${rndTimeout} seconds / ${(rndTimeout / 60).toFixed(1)} minutes\n`);
    await sendTelegramMessage(
      `\nSleeping for ${rndTimeout} seconds / ${(rndTimeout / 60).toFixed(1)} minutes\n`,
    );
    await sleep({ seconds: rndTimeout });
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
