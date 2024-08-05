import { Storage } from "@acala-network/sdk/utils/storage";
import { AnyApi, FixedPointNumber as FN } from "@acala-network/sdk-core";
import { combineLatest, map, Observable } from "rxjs";

import { SubmittableExtrinsic } from "@polkadot/api/types";
import { DeriveBalancesAll } from "@polkadot/api-derive/balances/types";
import { ISubmittableResult } from "@polkadot/types/types";

import { BalanceAdapter, BalanceAdapterConfigs } from "../balance-adapter";
import { BaseCrossChainAdapter } from "../base-chain-adapter";
import { ChainId, chains } from "../configs";
import { BalanceData, ExtendedToken, TransferParams } from "../types";
import { ApiNotFound, TokenNotFound } from "../errors";
import { isChainEqual } from "../utils/is-chain-equal";
import {
  createXTokensAssetsParam,
  createXTokensDestParam,
  createRouteConfigs,
} from "../utils";

import { statemineTokensConfig, statemintTokensConfig } from "./statemint";

export const basiliskRouteConfigs = createRouteConfigs("basilisk", [
  {
    to: "kusama",
    token: "KSM",
    xcm: {
      fee: { token: "KSM", amount: "81779545" },
    },
  },
  {
    to: "karura",
    token: "BSX",
    xcm: {
      fee: { token: "BSX", amount: "93240000000" }, 
    },
  },
  {
    to: "karura",
    token: "aUSD",
    xcm: {
      fee: { token: "aUSD", amount: "5060238106" },
    },
  },
  {
    to: "karura",
    token: "KSM",
    xcm: {
      fee: { token: "KSM", amount: "90741527" },
    },
  },
  {
    to: "karura",
    token: "DAI",
    xcm: {
      fee: { token: "DAI", amount: "808240000000000" },
    },
  },
  {
    to: "karura",
    token: "USDCet",
    xcm: {
      fee: { token: "USDCet", amount: "808" },
    },
  },
  {
    to: "karura",
    token: "WETH",
    xcm: {
      fee: { token: "WETH", amount: "449022222222" },
    },
  },
  {
    to: "karura",
    token: "WBTC",
    xcm: {
      fee: { token: "WBTC", amount: "2" },
    },
  },
  {
    to: "statemine",
    token: "USDT",
    xcm: {
      fee: { token: "USDT", amount: "1183" },
    },
  },
  {
    to: "tinkernet",
    token: "TNKR",
    xcm: {
      fee: { token: "TNKR", amount: "9270203240" },
    },
  },
  {
    to: "robonomics",
    token: "XRT",
    xcm: {
      fee: { token: "XRT", amount: "4632" },
    },
  },
]);

export const basiliskTokensConfig: Record<string, ExtendedToken> = {
  BSX: {
    name: "BSX",
    symbol: "BSX",
    decimals: 12,
    ed: "1000000000000",
    toRaw: () => 0,
  },
  AUSD: {
    name: "aUSD",
    symbol: "aUSD",
    decimals: 12,
    ed: "10000000000",
    toRaw: () => 2,
  },
  KSM: {
    name: "KSM",
    symbol: "KSM",
    decimals: 12,
    ed: "100000000",
    toRaw: () => 1,
  },
  USDT: {
    name: "USDT",
    symbol: "USDT",
    decimals: 6,
    ed: "10000",
    toRaw: () => 14,
  },
  TNKR: {
    name: "TNKR",
    symbol: "TNKR",
    decimals: 12,
    ed: "1000000000",
    toRaw: () => 6,
  },
  XRT: {
    name: "XRT",
    symbol: "XRT",
    decimals: 9,
    ed: "1683502",
    toRaw: () => 16,
  },
  DAI: {
    name: "DAI",
    symbol: "DAI",
    decimals: 18,
    ed: "10000000000",
    toRaw: () => 13,
  },
  USDCET: {
    name: "USDCET",
    symbol: "USDCet",
    decimals: 6,
    ed: "10000",
    toRaw: () => 9,
  },
  WETH: {
    name: "WETH",
    symbol: "WETH",
    decimals: 18,
    ed: "6230529595016",
    toRaw: () => 10,
  },
  WBTC: {
    name: "WBTC",
    symbol: "WBTC",
    decimals: 8,
    ed: "33",
    toRaw: () => 11,
  },
};

export const hydradxRoutersConfig = createRouteConfigs("hydradx", [
  {
    to: "polkadot",
    token: "DOT",
    xcm: {
      fee: { token: "DOT", amount: "469417452" },
    },
  },
  {
    to: "acala",
    token: "DAI",
    xcm: {
      fee: { token: "DAI", amount: "926960000000000" },
    },
  },
  {
    to: "acala",
    token: "DOT",
    xcm: {
      fee: { token: "DOT", amount: "471820453" },
    },
  },
  {
    to: "acala",
    token: "WETH",
    xcm: {
      fee: { token: "WETH", amount: "687004000000" },
    },
  },
  {
    to: "acala",
    token: "WBTC",
    xcm: {
      fee: { token: "WBTC", amount: "4" },
    },
  },
  {
    to: "interlay",
    token: "IBTC",
    xcm: { fee: { token: "IBTC", amount: "62" } },
  },
  {
    to: "statemint",
    token: "USDT",
    xcm: {
      fee: { token: "USDT", amount: "700000" },
    },
  },
  {
    to: "zeitgeist",
    token: "ZTG",
    xcm: {
      fee: { token: "ZTG", amount: "93000000" },
    },
  },
  {
    to: "astar",
    token: "ASTR",
    xcm: {
      fee: { token: "ASTR", amount: "4041465440000000" },
    },
  },
  {
    to: "centrifuge",
    token: "CFG",
    xcm: {
      fee: { token: "CFG", amount: "9269600000000000" },
    },
  },
]);

export const hydradxTokensConfig: Record<string, ExtendedToken> = {
  HDX: {
    name: "HDX",
    symbol: "HDX",
    decimals: 12,
    ed: "1000000000000",
    toRaw: () => 0,
  },
  AWWETH: { // ACALA WORMHOLE
    name: "WETH",
    symbol: "WETH",
    decimals: 18,
    ed: "7000000000000",
    toRaw: () => 4,
  },
  AWWBTC: { name: "AWWBTC", symbol: "AWWBTC", decimals: 8, ed: "44", toRaw: () => 3 },
  IBTC: {
    name: "IBTC",
    symbol: "IBTC",
    decimals: 8,
    ed: "36",
    toRaw: () => 11,
  },
  DOT: {
    name: "DOT",
    symbol: "DOT",
    decimals: 10,
    ed: "17540000",
    toRaw: () => 5,
  },
  SUSDT: { // STATEMINT
    name: "SUSDT",
    symbol: "SUSDT",
    decimals: 6,
    ed: "10000",
    toRaw: () => 10,
  },
  MWUSDT: { // MOONBEAM WORMHOLE
    name: "MWUSDT",
    symbol: "MWUSDT",
    decimals: 6,
    ed: "10000",
    toRaw: () => 23,
  },
  ZTG: {
    name: "ZTG",
    symbol: "ZTG",
    decimals: 10,
    ed: "1204151916",
    toRaw: () => 12,
  },
  ASTR: {
    name: "ASTR",
    symbol: "ASTR",
    decimals: 18,
    ed: "147058823529412000",
    toRaw: () => 9,
  },
  CFG: {
    name: "CFG",
    symbol: "CFG",
    decimals: 18,
    ed: "32467532467532500",
    toRaw: () => 13,
  },
  AWUSDC: { // ACALA WORMHOLE USDC
    name: "AWUSDC",
    symbol: "AWUSDC",
    decimals: 6,
    ed: "32467532467532500",
    toRaw: () => 7,
  },
  MWUSDC: { // MOONBEAM WORMHOLE USDC
    name: "MWUSDC",
    symbol: "MWUSDC",
    decimals: 6,
    ed: "32467532467532500",
    toRaw: () => 21,
  },
  SUSDC: { // STATEMINT USDC
    name: "SUSDC",
    symbol: "SUSDC",
    decimals: 6,
    ed: "32467532467532500",
    toRaw: () => 22,
  },
  NODL: {
    name: "NODL",
    symbol: "NODL",
    decimals: 11,
    ed: "32467532467532500",
    toRaw: () => 26,
  },
  PHA: {
    name: "PHA",
    symbol: "PHA",
    decimals: 12,
    ed: "32467532467532500",
    toRaw: () => 8,
  },
  LRNA: {
    name: "LRNA",
    symbol: "LRNA",
    decimals: 12,
    ed: "32467532467532500",
    toRaw: () => 1,
  },
  ASTAR: {
    name: "ASTAR",
    symbol: "ASTAR",
    decimals: 18,
    ed: "32467532467532500",
    toRaw: () => 9,
  },
  GLMR: {
    name: "GLMR",
    symbol: "GLMR",
    decimals: 18,
    ed: "32467532467532500",
    toRaw: () => 16,
  },
  BNC: {
    name: "BNC",
    symbol: "BNC",
    decimals: 12,
    ed: "32467532467532500",
    toRaw: () => 14,
  },
  VDOT: {
    name: "VDOT",
    symbol: "VDOT",
    decimals: 10,
    ed: "32467532467532500",
    toRaw: () => 15,
  },
  SUB: {
    name: "SUB",
    symbol: "SUB",
    decimals: 10,
    ed: "32467532467532500",
    toRaw: () => 24,
  },
  AWDAI: {
    name: "AWDAI",
    symbol: "AWDAI",
    decimals: 18,
    ed: "32467532467532500",
    toRaw: () => 2,
  },
  MWDAI: {
    name: "MWDAI",
    symbol: "MWDAI",
    decimals: 18,
    ed: "32467532467532500",
    toRaw: () => 18,
  },
  CRU: {
    name: "CRU",
    symbol: "CRU",
    decimals: 12,
    ed: "32467532467532500",
    toRaw: () => 27,
  },
  MWWBTC: { // MOONBEAM WORMHOLE
    name: "MWWBTC",
    symbol: "MWWBTC",
    decimals: 10,
    ed: "32467532467532500",
    toRaw: () => 19,
  },
  INTR: {
    name: "INTR",
    symbol: "INTR",
    decimals: 10,
    ed: "32467532467532500",
    toRaw: () => 17,
  },
  MWWETH: {
    name: "MWWETH",
    symbol: "MWWETH",
    decimals: 18,
    ed: "32467532467532500",
    toRaw: () => 20,
  },
  UNQ: {
    name: "UNQ",
    symbol: "UNQ",
    decimals: 18,
    ed: "32467532467532500",
    toRaw: () => 25,
  },
  KILT: {
    name: "KILT",
    symbol: "KILT",
    decimals: 15,
    ed: "32467532467532500",
    toRaw: () => 28,
  },
  RING: {
    name: "RING",
    symbol: "RING",
    decimals: 18,
    ed: "32467532467532500",
    toRaw: () => 31,
  },
  ACA: {
    name: "ACA",
    symbol: "ACA",
    decimals: 12,
    ed: "32467532467532500",
    toRaw: () => 1000099,
  },
  "100": {
    name: "4-POOL",
    symbol: "4-POOL",
    decimals: 18,
    ed: "32467532467532500",
    toRaw: () => 100,
  },
  "101": {
    name: "2-POOL-1",
    symbol: "2-POOL-1",
    decimals: 18,
    ed: "32467532467532500",
    toRaw: () => 101,
  },
  "102": {
    name: "2-POOL-2",
    symbol: "2-POOL-2",
    decimals: 18,
    ed: "32467532467532500",
    toRaw: () => 102,
  },

};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const createBalanceStorages = (api: AnyApi) => {
  return {
    balances: (address: string) =>
      Storage.create<DeriveBalancesAll>({
        api,
        path: "derive.balances.all",
        params: [address],
      }),
    assets: (tokenId: number, address: string) =>
      Storage.create<any>({
        api,
        path: "query.tokens.accounts",
        params: [address, tokenId],
      }),
  };
};

class HydradxBalanceAdapter extends BalanceAdapter {
  private storages: ReturnType<typeof createBalanceStorages>;

  constructor({ api, chain, tokens }: BalanceAdapterConfigs) {
    super({ api, chain, tokens });
    this.storages = createBalanceStorages(api);
  }

  public subscribeBalance(
    tokenName: string,
    address: string,
    tokenId?: string
  ): Observable<BalanceData> {
    const storage = this.storages.balances(address);

    if (tokenName === this.nativeToken) {
      return storage.observable.pipe(
        map((data) => ({
          free: FN.fromInner(data.freeBalance.toString(), this.decimals),
          locked: FN.fromInner(data.lockedBalance.toString(), this.decimals),
          reserved: FN.fromInner(
            data.reservedBalance.toString(),
            this.decimals
          ),
          available: FN.fromInner(
            data.availableBalance.toString(),
            this.decimals
          ),
        }))
      );
    }

    const token = this.getToken<ExtendedToken>(tokenName, tokenId);

    return this.storages.assets(token.toRaw(), address).observable.pipe(
      map((balance) => {
        const amount = FN.fromInner(
          balance.free?.toString() || "0",
          token.decimals
        );

        return {
          free: amount,
          locked: new FN(0),
          reserved: new FN(0),
          available: amount,
        };
      })
    );
  }
}

class BaseHydradxAdapter extends BaseCrossChainAdapter {
  private balanceAdapter?: HydradxBalanceAdapter;

  public async init(api: AnyApi) {
    this.api = api;

    await api.isReady;

    this.balanceAdapter = new HydradxBalanceAdapter({
      chain: this.chain.id as ChainId,
      api,
      tokens: this.tokens,
    });
  }

  public subscribeTokenBalance(
    token: string,
    address: string,
    tokenId?: string
  ): Observable<BalanceData> {
    if (!this.balanceAdapter) {
      throw new ApiNotFound(this.chain.id);
    }

    return this.balanceAdapter.subscribeBalance(token, address, tokenId);
  }

  public subscribeMaxInput(
    token: string,
    address: string,
    to: ChainId
  ): Observable<FN> {
    if (!this.balanceAdapter) {
      throw new ApiNotFound(this.chain.id);
    }

    return combineLatest({
      txFee:
        token === this.balanceAdapter?.nativeToken
          ? this.estimateTxFee({
              amount: FN.ZERO,
              to,
              token,
              address,
              signer: address,
            })
          : "0",
      balance: this.balanceAdapter
        .subscribeBalance(token, address)
        .pipe(map((i) => i.available)),
    }).pipe(
      map(({ balance, txFee }) => {
        const tokenMeta = this.balanceAdapter?.getToken(token);
        const feeFactor = 1.2;
        const fee = FN.fromInner(txFee, tokenMeta?.decimals).mul(
          new FN(feeFactor)
        );

        // always minus ed
        return balance
          .minus(fee)
          .minus(FN.fromInner(tokenMeta?.ed || "0", tokenMeta?.decimals));
      })
    );
  }

  public createTx(
    params: TransferParams
  ):
    | SubmittableExtrinsic<"promise", ISubmittableResult>
    | SubmittableExtrinsic<"rxjs", ISubmittableResult> {
    if (!this.api) throw new ApiNotFound(this.chain.id);

    const { amount, to, token, address } = params;
    const toChain = chains[to];

    // For statemine & statemint
    if (
      isChainEqual(toChain, "statemine") ||
      isChainEqual(toChain, "statemint")
    ) {
      const tokenData: ExtendedToken = isChainEqual(toChain, "statemine")
        ? statemineTokensConfig[token]
        : statemintTokensConfig[token];

      const accountId = this.api?.createType("AccountId32", address).toHex();

      if (!token) throw new TokenNotFound(token);
      return this.api.tx.xTokens.transferMultiasset(
        createXTokensAssetsParam(
          this.api,
          toChain.paraChainId,
          tokenData.toRaw(),
          amount.toChainData()
        ),
        createXTokensDestParam(this.api, toChain.paraChainId, accountId) as any,
        "Unlimited"
      );
    }

    return this.createXTokensTx(params);
  }
}

export class BasiliskAdapter extends BaseHydradxAdapter {
  constructor() {
    super(chains.basilisk, basiliskRouteConfigs, basiliskTokensConfig);
  }
}

export class HydraDxAdapter extends BaseHydradxAdapter {
  constructor() {
    super(chains.hydradx, hydradxRoutersConfig, hydradxTokensConfig);
  }
}
