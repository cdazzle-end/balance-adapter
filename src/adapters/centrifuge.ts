import { Storage } from "@acala-network/sdk/dist/esm/utils/storage";
import { AnyApi, FixedPointNumber as FN } from "@acala-network/sdk-core";
import { combineLatest, map, Observable } from "rxjs";

import { SubmittableExtrinsic } from "@polkadot/api/types";
import { DeriveBalancesAll } from "@polkadot/api-derive/balances/types";
import { ISubmittableResult } from "@polkadot/types/types";

import { BalanceAdapter, BalanceAdapterConfigs } from "../balance-adapter";
import { BaseCrossChainAdapter } from "../base-chain-adapter";
import { ChainId, chains } from "../configs";
import { ApiNotFound, InvalidAddress } from "../errors";
import { BalanceData, ExtendedToken, TransferParams } from "../types";
import { createRouteConfigs, validateAddress } from "../utils";

const DEST_WEIGHT = "Unlimited";

const centrifugeRouteConfigs = createRouteConfigs("centrifuge", [
  {
    to: "hydradx",
    token: "CFG",
    xcm: {
      fee: { token: "CFG", amount: "6373834498834048" },
      weightLimit: DEST_WEIGHT,
    },
  },
]);

export const centrifugeTokensConfig: Record<string, ExtendedToken> = {
  CFG: {
    name: "CFG",
    symbol: "CFG",
    decimals: 18,
    ed: "1000000000000",
    toRaw: () => "Native",
  },
};

const altairRouteConfigs = createRouteConfigs("altair", [
  {
    to: "karura",
    token: "AIR",
    xcm: {
      fee: { token: "AIR", amount: "8082400000000000" },
      weightLimit: DEST_WEIGHT,
    },
  },
  {
    to: "karura",
    token: "KUSD",
    xcm: {
      fee: { token: "KUSD", amount: "3481902463" },
      weightLimit: DEST_WEIGHT,
    },
  },
]);

export const altairTokensConfig: Record<string, ExtendedToken> = {
  AIR: {
    name: "AIR",
    symbol: "AIR",
    decimals: 18,
    ed: "1000000000000",
    toRaw: () => "Native",
  },
  KUSD: {
    name: "KUSD",
    symbol: "KUSD",
    decimals: 12,
    ed: "100000000000",
    toRaw: () => "AUSD",
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
    assets: (address: string, token: string) =>
      Storage.create<any>({
        api,
        path: "query.ormlTokens.accounts",
        params: [address, token],
      }),
  };
};

class CentrifugeBalanceAdapter extends BalanceAdapter {
  private storages: ReturnType<typeof createBalanceStorages>;

  constructor({ api, chain, tokens }: BalanceAdapterConfigs) {
    super({ api, chain, tokens });
    this.storages = createBalanceStorages(api);
  }

  public subscribeBalance(
    name: string,
    address: string,
    tokenId: string
  ): Observable<BalanceData> {
    if (!validateAddress(address)) throw new InvalidAddress(address);

    const storage = this.storages.balances(address);

    if (name === this.nativeToken) {
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

    const token = this.getToken<ExtendedToken>(name, tokenId);

    return this.storages.assets(address, token.toRaw()).observable.pipe(
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

class BaseCentrifugeAdapter extends BaseCrossChainAdapter {
  private balanceAdapter?: CentrifugeBalanceAdapter;

  public async init(api: AnyApi) {
    this.api = api;

    await api.isReady;

    this.balanceAdapter = new CentrifugeBalanceAdapter({
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
        .subscribeBalance(token, address, tokenId)
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

export class AltairAdapter extends BaseCentrifugeAdapter {
  constructor() {
    super(chains.altair, altairRouteConfigs, altairTokensConfig);
  }
}

export class CentrifugeAdapter extends BaseCentrifugeAdapter {
  constructor() {
    super(chains.centrifuge, centrifugeRouteConfigs, centrifugeTokensConfig);
  }
}
