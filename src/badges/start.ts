import { Wallet } from 'ethers';
import { authDB, badgesDB, statsDB } from '../data';
import { keysLeft, rndKeyPair, startScript } from '../micro';
import { shuffleArray, sleep, timeout } from '../utils';
import { authProcess, processTaskWait } from './micro';
import { BADGES } from '../../deps/config';
import { BADGE_IDS } from './constants';
import { checkEligibility, initiateClaim } from './utils';
import { Badges } from './types';

export async function startClaim() {
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

      let authToken = authDB.get(address);

      if (!authToken) {
        const token = await authProcess(wallet, proxy);

        if (!token) {
          /// ???
          continue;
        }

        authToken = token;
      }

      const badgesToCheck = Object.entries(BADGES)
        .filter(([name, claiming]) => claiming === true)
        .map(([name]) => name as Badges.BadgesNames);

      const shuffledBadges = shuffleArray(badgesToCheck);

      for (const badgeName of shuffledBadges) {
        if (badgesDB.get(address, badgeName)) {
          console.log(`Badge ${badgeName} already claimed`);
          continue;
        }

        console.log(`\nChecking badge ${badgeName}`);

        const badgeId = BADGE_IDS[badgeName];
        const processIdEligibility = await checkEligibility(badgeId, authToken, proxy);

        if (!processIdEligibility) {
          continue;
        }

        const eligibility = await processTaskWait(
          processIdEligibility,
          authToken,
          proxy,
          'eligibility',
        );

        if (eligibility === null) {
          console.log('Failed to check eligibility');
          continue;
        }

        if (eligibility === false) {
          continue;
        }

        console.log(`Claiming badge ${badgeName}...`);

        const processIdClaim = await initiateClaim(badgeId, processIdEligibility, authToken, proxy);

        if (!processIdClaim) {
          continue;
        }

        const claim = await processTaskWait(processIdClaim, authToken, proxy, 'claim');

        if (claim === null) {
          console.log('Failed to check claim');
          continue;
        }

        console.log(`Badge ${badgeName} claimed successfully for wallet ${address}`);

        badgesDB.set(address, badgeName, claim);

        await sleep({ seconds: 10 }, { seconds: 20 });
      }

      keys.splice(index, 1);
      proxies.splice(index, 1);

      console.log(`\nWallet ${address} finished and removed from the list\n`);

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
  authDB.save();
  badgesDB.save();

  process.exit();
});

// catching unhandled promise rejection
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);

  statsDB.save();
  authDB.save();
  badgesDB.save();

  process.exit();
});

// catching uncaught exception
process.on('uncaughtException', (err, origin) => {
  console.log(`Caught exception: ${err}\n Exception origin: ${origin}`);

  statsDB.save();
  authDB.save();
  badgesDB.save();

  process.exit();
});

startClaim();
