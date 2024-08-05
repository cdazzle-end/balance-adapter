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

export const mangataRouteConfigs = createRouteConfigs("mangata", [

]);

export const mangataTokensConfig: Record<string, ExtendedToken> = {
    USDT: {
      name: "Tether USD",
      symbol: "USDT",
      decimals: 6,
      ed: "1",
      toRaw: () => (30),
    },
    MGX: {
      name: "Mangata",
      symbol: "MGX",
      decimals: 18,
      ed: "1",
      toRaw: () => (0),
    },
    ZLK: {
      name: "Zenlink",
      symbol: "ZLK",
      decimals: 18,
      ed: "1",
      toRaw: () => (26),
    },
    // KSM: {
    //   name: "KSM",
    //   symbol: "KSM",
    //   decimals: 12,
    //   ed: "100000000",
    //   toRaw: () => ({ Token: "KSM" }),
    // }
    KSM: {
      name: "KSM",
      symbol: "KSM",
      decimals: 12,
      ed: "0",
      toRaw: () => (4),
    },
    BNC: {
      name: "BNC",
      symbol: "BNC",
      decimals: 12,
      ed: "0",
      toRaw: () => (14),
    },
    VBNC: {
      name: "VBNC",
      symbol: "VBNC",
      decimals: 12,
      ed: "0",
      toRaw: () => (23),
    },
    VKSM: {
      name: "VKSM",
      symbol: "VKSM",
      decimals: 12,
      ed: "0",
      toRaw: () => (15),
    },
    VSKSM: {
      name: "VSKSM",
      symbol: "VSKSM",
      decimals: 12,
      ed: "0",
      toRaw: () => (16),
    },
    RMRK: {
      name: "RMRK",
      symbol: "RMRK",
      decimals: 10,
      ed: "0",
      toRaw: () => (31),
    },
    MOVR: {
      name: "MOVR",
      symbol: "MOVR",
      decimals: 18,
      ed: "0",
      toRaw: () => (39),
    },
    TUR: {
      name: "TUR",
      symbol: "TUR",
      decimals: 12,
      ed: "0",
      toRaw: () => (7),
    },
    IMBU: {
      name: "IMBU",
      symbol: "IMBU",
      decimals: 12,
      ed: "0",
      toRaw: () => (11),
    }

};


const createBalanceStorages = (api: AnyApi) => {
    return {
        // balances: (address: string) =>
        // Storage.create<any>({
        //     api,
        //     path: "query.system.account",
        //     params: [address],
        // }),
        assets: (address: string, token: unknown) =>
        Storage.create<any>({
            api,
            path: "query.tokens.accounts",
            params: [address, token],
        }),
    };
};

class MangataBalanceAdapter extends BalanceAdapter {
    private storages: ReturnType<typeof createBalanceStorages>;

    constructor({ api, chain, tokens }: BalanceAdapterConfigs) {
        super({ api, chain, tokens });
        this.storages = createBalanceStorages(api);
    }

    public subscribeBalance(
        token: string,
        address: string,
        tokenId?: string
      ): Observable<BalanceData> {
        if (!validateAddress(address)) throw new InvalidAddress(address);
    
        // const storage = this.storages.balances(address);
        const tokenData: ExtendedToken = this.getToken(token, tokenId);
    
        // if (token === this.nativeToken) {
        //   return storage.observable.pipe(
        //     map(({ data }) => ({
        //       free: FN.fromInner(data.free.toString(), this.decimals),
        //       locked: FN.fromInner(data.frozen.toString(), this.decimals),
        //       reserved: FN.fromInner(data.reserved.toString(), this.decimals),
        //       available: FN.fromInner(
        //         data.free.sub(data.frozen).toString(),
        //         this.decimals
        //       ),
        //     }))
        //   );
        // }

        if (!tokenData) throw new TokenNotFound(token);

        return this.storages.assets(address, tokenData.toRaw()).observable.pipe(
          map((balance) => {
            const amount = FN.fromInner(
              balance.free?.toString() || "0",
              this.getToken(token).decimals
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

class BaseMangataAdapter extends BaseCrossChainAdapter {
  private balanceAdapter?: MangataBalanceAdapter;

  public async init(api: AnyApi) {
    this.api = api;

    await api.isReady;

    this.balanceAdapter = new MangataBalanceAdapter({
      chain: this.chain.id as ChainId,
      api,
      tokens: mangataTokensConfig,
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
    return this.createXTokensTx(params);
  }
}
  
export class MangataAdapter extends BaseMangataAdapter {
  constructor() {
    super(chains.mangata, mangataRouteConfigs, mangataTokensConfig);
  }
}
  