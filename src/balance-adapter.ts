import { AnyApi } from "@acala-network/sdk-core";

import { Observable } from "@polkadot/types/types";

import { ChainId, chains } from "./configs";
import { TokenNotFound } from "./errors";
import { BalanceData, BasicToken, ExtendedToken, FN, Relay, TokenData } from "./types";
import { createBasicTokenFromAsset, createExtendedTokenFromAsset, createTokenDataFromAsset, getAssetRegistryObject, getRelayForChainId } from "./custom-utils";

export interface BalanceAdapterConfigs {
  chain: ChainId;
  api: AnyApi;
  tokens: Record<string, BasicToken>;
}

export abstract class BalanceAdapter {
  readonly chain: ChainId;
  readonly decimals: number;
  readonly ed: FN;
  readonly nativeToken: string;
  readonly tokens: Record<string, BasicToken>;

  constructor({ api, chain, tokens }: BalanceAdapterConfigs) {
    this.chain = chain;
    this.decimals = api.registry.chainDecimals[0];
    this.ed = FN.fromInner(
      api.consts.balances?.existentialDeposit?.toString() || "0",
      this.decimals
    );
    this.nativeToken = api.registry.chainTokens[0];
    this.tokens = tokens;
  }

  // Get token by symbol, or by asset id if not found
  public getToken<R extends BasicToken = BasicToken>(token: string, tokenId?: string): R {
    
    let tokenConfig = this.tokens[token.toUpperCase()];

    // If token not in balance adapter database, check for asset in our asset registry. if it exists, create a new BasicToken with the appropriate values
    if (!tokenConfig){
      // If asset id not passed in
      // if(!tokenId) throw new TokenNotFound(token, this.chain);
      if(!tokenId) throw new Error(`Token Config not found for ${token} on ${this.chain}. Token ID was not passed to getToken()`)
      // Get chain number
      const paraId = chains[this.chain].paraChainId
      let relay: Relay = getRelayForChainId(this.chain)

      // get asset registry object by chain and id
      let assetRegistryObject = getAssetRegistryObject(paraId, tokenId, relay)
      
      // Check if the calling type is TokenData, ExtendedToken, or BasicToken
      if (this.isTokenData<R>()) {
        tokenConfig = createTokenDataFromAsset(assetRegistryObject)
      } else if (this.isExtendedToken<R>()) {
        tokenConfig = createExtendedTokenFromAsset(assetRegistryObject);
      } else {
        tokenConfig = createBasicTokenFromAsset(assetRegistryObject);
      }

      // Will throw AssetObjectNotFound error if not found
    } 
    


    return tokenConfig as R;
  }

  // Gets the balance adapter token database, and checks the types whether extended or tokendata, by seeing if 
  // the unique function exists on one of the tokens. Checks the second tokenm becuase the native token
  // might not have the toRaw or toQuery function
  // Type guard to check if R is ExtendedToken
  private isExtendedToken<R extends BasicToken>(): boolean {
    return (this.tokens as Record<string, ExtendedToken>)[Object.keys(this.tokens)[1]]?.toRaw !== undefined;
  }

  private isTokenData<R extends BasicToken>(): boolean {
    return (this.tokens as Record<string, TokenData>)[Object.keys(this.tokens)[1]]?.toQuery !== undefined;
  }

//   private isTokenData(token: any): token is TokenData {
//     return (
//         typeof token === 'object' &&
//         token !== null &&
//         typeof token.toQuery === 'function' &&
//         // Check for properties of ExtendedToken
//         typeof token.name === 'string' &&
//         typeof token.symbol === 'string' &&
//         typeof token.decimals === 'number' &&
//         typeof token.ed === 'string'
//     );
// }

  public abstract subscribeBalance(
    token: string,
    address: string,
    tokenId?: string
  ): Observable<BalanceData>;
}
