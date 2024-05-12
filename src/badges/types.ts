export namespace Badges {
  export interface ProcessTaskResponse {
    action_type: 'CLAIM' | 'CHECK';
    is_eligible: boolean;
    state: State;
    process_data: any;
  }

  export enum State {
    INITIATED = 'INITIATED',
    DONE = 'DONE',
  }

  export interface Badges {
    '10_trades': boolean;
    '25_trades': boolean;
    '50_trades': boolean;
    '100_trades': boolean;
    '1k_volume': boolean;
    '5k_volume': boolean;
    '10k_volume': boolean;
    '25k_volume': boolean;
    '10_trades_multi': boolean;
    '25_trades_multi': boolean;
    '50_trades_multi': boolean;
    '100_trader_multi': boolean;
    mode: boolean;
    base: boolean;
    optimism: boolean;
    blast: boolean;
    zksync: boolean;
    arbitrum: boolean;
    bnb: boolean;
    halloween: boolean;
  }

  export type BadgesNames = keyof Badges;
}
