import { Storage } from "@acala-network/sdk/utils/storage";
import { AnyApi, FixedPointNumber as FN } from "@acala-network/sdk-core";
import { combineLatest, map, Observable } from "rxjs";

import { SubmittableExtrinsic } from "@polkadot/api/types";
import { ISubmittableResult } from "@polkadot/types/types";

import { BalanceAdapter, BalanceAdapterConfigs } from "../balance-adapter";
import { BaseCrossChainAdapter } from "../base-chain-adapter";
import { ChainId, chains } from "../configs";
import { ApiNotFound, InvalidAddress, TokenNotFound } from "../errors";
import { BalanceData, ExtendedToken, TransferParams } from "../types";
import { createRouteConfigs, validateAddress } from "../utils";

export const bifrostRouteConfigs = createRouteConfigs("bifrost", [
  {
    to: "karura",
    token: "BNC",
    xcm: {
      fee: { token: "BNC", amount: "5120000000" },
    },
  },
  {
    to: "karura",
    token: "VSKSM",
    xcm: {
      fee: { token: "VSKSM", amount: "64000000" },
    },
  },
  {
    to: "karura",
    token: "KSM",
    xcm: {
      fee: { token: "KSM", amount: "64000000" },
    },
  },
  {
    to: "karura",
    token: "KAR",
    xcm: {
      fee: { token: "KAR", amount: "6400000000" },
    },
  },
  {
    to: "karura",
    token: "KUSD",
    xcm: {
      fee: { token: "KUSD", amount: "10011896008" },
    },
  },
]);

export const bifrostTokensConfig: Record<string, ExtendedToken> = {
  BNC: {
    name: "BNC",
    symbol: "BNC",
    decimals: 12,
    ed: "10000000000",
    toRaw: () => ({ Native: "BNC" }),
  },
  VBNC: {
    name: "VBNC",
    symbol: "VBNC",
    decimals: 12,
    ed: "10000000000",
    toRaw: () => ({ VToken: "BNC" }),
  },
  VSKSM: {
    name: "VSKSM",
    symbol: "VSKSM",
    decimals: 12,
    ed: "100000000",
    toRaw: () => ({ VSToken: "KSM" }),
  },
  KSM: {
    name: "KSM",
    symbol: "KSM",
    decimals: 12,
    ed: "100000000",
    toRaw: () => ({ Token: "KSM" }),
  },
  KAR: {
    name: "KAR",
    symbol: "KAR",
    decimals: 12,
    ed: "148000000",
    toRaw: () => ({ Token: "KAR" }),
  },
  KUSD: {
    name: "KUSD",
    symbol: "KUSD",
    decimals: 12,
    ed: "100000000",
    toRaw: () => ({ Stable: "KUSD" }),
  },
  ZLK: {
    name: "ZLK",
    symbol: "ZLK",
    decimals: 18,
    ed: "1000000000000",
    toRaw: () => ({ Token: "ZLK" }),
  },
  
  VKSM: {
    name: "VKSM",
    symbol: "VKSM",
    decimals: 12,
    ed: "100000000",
    toRaw: () => ({ VToken: "KSM" }),
  },
  VMOVR: {
    name: "VMOVR",
    symbol: "VMOVR",
    decimals: 18,
    ed: "1000000000000",
    toRaw: () => ({ VToken: "MOVR" }),
  },
  USDT: {
    name: "USDT",
    symbol: "USDT",
    decimals: 6,
    ed: "1000",
    toRaw: () => ({ Token2: 0 }),
  },
  RMRK: {
    name: "RMRK",
    symbol: "RMRK",
    decimals: 10,
    ed: "10000",
    toRaw: () => ({ Token: "RMRK"}),
  },
  KBTC: {
    name: "KBTC",
    symbol: "KBTC",
    decimals: 8,
    ed: "100",
    toRaw: () => ({ Token2: 2}),
  }
};

export const bifrostPolkadotTokensConfig: Record<string, ExtendedToken> = {
  BNC: {
    name: "BNC",
    symbol: "BNC",
    decimals: 12,
    ed: "10000000000",
    toRaw: () => ({ Native: "BNC" }),
  },
  IBTC: {
    name: "IBTC",
    symbol: "IBTC",
    decimals: 8,
    ed: "10000000000",
    toRaw: () => ({ Token2: 6 }),
  },
  MANTA: {
    name: "MANTA",
    symbol: "MANTA",
    decimals: 8,
    ed: "10000000000",
    toRaw: () => ({ Token2: 8 }),
  },
  INTR: {
    name: "INTR",
    symbol: "INTR",
    decimals: 110,
    ed: "10000000000",
    toRaw: () => ({ Token2: 7}),
  },
  USDT: {
    name: "USDT",
    symbol: "USDT",
    decimals: 6,
    ed: "10000000000",
    toRaw: () => ({ Token2: 2 }),
  },
  USDC: {
    name: "USDC",
    symbol: "USDC",
    decimals: 6,
    ed: "10000000000",
    toRaw: () => ({ Token2: 5 }),
  },
  DOT: {
    name: "DOT",
    symbol: "DOT",
    decimals: 10,
    ed: "10000000000",
    toRaw: () => ({ Token2: 0 }),
  },
  GLMR: {
    name: "GLMR",
    symbol: "GLMR",
    decimals: 18,
    ed: "10000000000",
    toRaw: () => ({ Token2: 1 }),
  },
  vGLMR: {
    name: "vGLMR",
    symbol: "vGLMR",
    decimals: 18,
    ed: "10000000000",
    toRaw: () => ({ VToken2: 1 }),
  },
  PINK: {
    name: "PINK",
    symbol: "PINK",
    decimals: 10,
    ed: "10000000000",
    toRaw: () => ({ Token2:  10 }),
  },
  FIL: {
    name: "FIL",
    symbol: "FIL",
    decimals: 18,
    ed: "10000000000",
    toRaw: () => ({ Token2: 4 }),
  },
  VMANTA: {
    name: "VMANTA",
    symbol: "VMANTA",
    decimals: 18,
    ed: "10000000000",
    toRaw: () => ({ VToken2: 8 }),
  },
  VASTR: {
    name: "VASTR",
    symbol: "VASTR",
    decimals: 18,
    ed: "10000000000",
    toRaw: () => ({ VToken2: 3 }),
  },
  VDOT: {
    name: "VDOT",
    symbol: "VDOT",
    decimals: 10,
    ed: "10000000000",
    toRaw: () => ({ VToken2: 0 }),
  },
  ASTR: {
    name: "ASTR",
    symbol: "ASTR",
    decimals: 18,
    ed: "10000000000",
    toRaw: () => ({ Token2: 3 }),
  },
  VSDOT: {
    name: "VSDOT",
    symbol: "VSDOT",
    decimals: 10,
    ed: "10000000000",
    toRaw: () => ({ VSToken2: 0 }),
  },
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const createBalanceStorages = (api: AnyApi) => {
  return {
    balances: (address: string) =>
      Storage.create<any>({
        api,
        path: "query.system.account",
        params: [address],
      }),
    assets: (address: string, token: unknown) =>
      Storage.create<any>({
        api,
        path: "query.tokens.accounts",
        params: [address, token],
      }),
  };
};

class BifrostBalanceAdapter extends BalanceAdapter {
  private storages: ReturnType<typeof createBalanceStorages>;

  constructor({ api, chain, tokens }: BalanceAdapterConfigs) {
    super({ api, chain, tokens });
    this.storages = createBalanceStorages(api);
  }

  public subscribeBalance(
    token: string,
    address: string,
    tokenId: string
  ): Observable<BalanceData> {
    if (!validateAddress(address)) throw new InvalidAddress(address);

    const storage = this.storages.balances(address);
    const tokenData: ExtendedToken = this.getToken(token, tokenId);

    if (token === this.nativeToken) {
      return storage.observable.pipe(
        map(({ data }) => ({
          free: FN.fromInner(data.free.toString(), this.decimals),
          locked: FN.fromInner(data.frozen.toString(), this.decimals),
          reserved: FN.fromInner(data.reserved.toString(), this.decimals),
          available: FN.fromInner(
            data.free.sub(data.frozen).toString(),
            this.decimals
          ),
        }))
      );
    }

    if (!tokenData) throw new TokenNotFound(token);

    return this.storages.assets(address, tokenData.toRaw()).observable.pipe(
      map((balance) => {
        const amount = FN.fromInner(
          balance.free?.toString() || "0",
          this.getToken(token, tokenId).decimals
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

class BaseBifrostAdapter extends BaseCrossChainAdapter {
  private balanceAdapter?: BifrostBalanceAdapter;

  public async init(api: AnyApi) {
    this.api = api;

    await api.isReady;

    this.balanceAdapter = new BifrostBalanceAdapter({
      chain: this.chain.id as ChainId,
      api,
      tokens: this.tokens,
    });
  }

  public subscribeTokenBalance(
    token: string,
    address: string,
    tokenId: string
  ): Observable<BalanceData> {
    if (!this.balanceAdapter) {
      throw new ApiNotFound(this.chain.id);
    }

    return this.balanceAdapter.subscribeBalance(token, address, tokenId);
  }

  public subscribeMaxInput(
    token: string,
    tokenId: string,
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
              tokenId,
              address,
              signer: address,
            })
          : "0",
      balance: this.balanceAdapter
        .subscribeBalance(token, address,tokenId)
        .pipe(map((i) => i.available)),
    }).pipe(
      map(({ balance, txFee }) => {
        const tokenMeta = this.balanceAdapter?.getToken(token, tokenId);
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
    return this.createXTokensTx(params);
  }
}

export class BifrostAdapter extends BaseBifrostAdapter {
  constructor() {
    super(chains.bifrost, bifrostRouteConfigs, bifrostTokensConfig);
  }
}

export class BifrostPolkadotAdapter extends BaseBifrostAdapter {
  constructor() {
    super(chains.bifrostPolkadot, bifrostRouteConfigs, bifrostPolkadotTokensConfig);
  }
}
