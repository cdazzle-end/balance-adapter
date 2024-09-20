import { Storage } from "@acala-network/sdk/dist/esm/utils/storage";
import { AnyApi, FixedPointNumber as FN } from "@acala-network/sdk-core";
import { combineLatest, map, Observable } from "rxjs";

import { SubmittableExtrinsic } from "@polkadot/api/types";
import { DeriveBalancesAll } from "@polkadot/api-derive/balances/types";
import { ISubmittableResult } from "@polkadot/types/types";

import { BalanceAdapter, BalanceAdapterConfigs } from "../balance-adapter";
import { BaseCrossChainAdapter } from "../base-chain-adapter";
import { ChainId, chains } from "../configs";
import { BalanceData, BasicToken, ExtendedToken, TransferParams } from "../types";
import { ApiNotFound, TokenNotFound } from "../errors";
import { isChainEqual } from "../utils/is-chain-equal";
import {
  createXTokensAssetsParam,
  createXTokensDestParam,
  createRouteConfigs,
} from "../utils";

import { statemineTokensConfig, statemintTokensConfig } from "./statemint";

export const kiltRouteConfigs = createRouteConfigs("kilt", [

  ]);

export const kiltTokensConfig: Record<string, BasicToken> = {
  KILT: {
    name: "KILT",
    symbol: "KILT",
    decimals: 15,
    ed: "0",
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const createBalanceStorages = (api: AnyApi) => {
  return {
    balances: (address: string) =>
      Storage.create<DeriveBalancesAll>({
        api,
        path: "derive.balances.all",
        params: [address],
      })
  };
};

class KiltBalanceAdapter extends BalanceAdapter {
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
    } else {
        throw new TokenNotFound(tokenName);
    }

  }
}

class BaseKiltAdapter extends BaseCrossChainAdapter {
  private balanceAdapter?: KiltBalanceAdapter;

  public async init(api: AnyApi) {
    this.api = api;

    await api.isReady;

    this.balanceAdapter = new KiltBalanceAdapter({
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
        .subscribeBalance(token, address)
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

export class KiltAdapter extends BaseKiltAdapter {
  constructor() {
    super(chains.kilt, kiltRouteConfigs, kiltTokensConfig);
  }
}