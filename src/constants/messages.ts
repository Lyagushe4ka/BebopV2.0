export const MESSAGES = {
  noWallets: '\n🏁No wallets left, exiting...\n',
  txLimit(address: string) {
    return `\nWallet ${address} reached tx limit, removing from the list...\n`;
  },
  volumeLimit(address: string) {
    return `\nWallet ${address} reached volume limit, removing from the list...\n`;
  },
  noBalances(address: string) {
    return `\nWallet ${address} has no balances, removing from the list...\n`;
  },
};
