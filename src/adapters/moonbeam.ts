import { AnyApi, FixedPointNumber as FN } from "@acala-network/sdk-core";
import { Storage } from "@acala-network/sdk/utils/storage";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { ISubmittableResult } from "@polkadot/types/types";

import { BaseCrossChainAdapter } from "../base-chain-adapter";
import { ChainId, chains } from "../configs";
import { BalanceData, TokenData, TransferParams } from "../types";
// import { map } from "lodash";
import { map, Observable } from "rxjs";
import { BalanceAdapter, BalanceAdapterConfigs } from "../balance-adapter";
import { ApiNotFound, TokenNotFound } from "../errors";



export const moonbeamTokensConfig: Record<string, TokenData> = {
  GLMR: {
    name: "GLMR",
    symbol: "GLMR",
    decimals: 18,
    ed: "100000000000000000",
    toRaw: () => ({ Native: "GLMR" }),
  } as TokenData,
  XCACA: { 
    name: "ACA", 
    symbol: "ACA", 
    decimals: 12, 
    ed: "100000000000", 
    toRaw: ()=>{ Token: "ACA" },
    toQuery: () => "224821240862170613278369189818311486111" 
  },
  XCAUSD: { 
    name: "AUSD", 
    symbol: "AUSD", 
    decimals: 12, 
    ed: "100000000000", 
    toRaw: ()=>{ Token: "AUSD" },
    toQuery: () => "110021739665376159354538090254163045594" 
  },
  XCLDOT: { 
    name: "XCLDOT", 
    symbol: "XCLDOT", 
    decimals: 10, 
    ed: "100000000000", 
    toRaw: ()=>{ Token: "LDOT" },
    toQuery: () => "225719522181998468294117309041779353812" 
  },
  XCDOT: { 
    name: "XCDOT", 
    symbol: "XCDOT", 
    decimals: 10, 
    ed: "100000000000", 
    toRaw: ()=>{ Token: "XCDOT" },
    toQuery: () => "42259045809535163221576417993425387648" 
  },
  XCHDX: { 
    name: "XCHDX", 
    symbol: "XCHDX", 
    decimals: 12, 
    ed: "100000000000", 
    toRaw: ()=>{ Token: "XCHDX" },
    toQuery: () => "69606720909260275826784788104880799692" 
  },
   XCUSDT: { 
    name: "USDT", 
    symbol: "XCUSDT", 
    decimals: 6, ed: "0",
    toRaw: () => "",
    toQuery: () => "311091173110107856861649819128533077277" 
  },
  XCSUB: { 
    name: "XCSUB", 
    symbol: "XCSUB", 
    decimals: 10, ed: "0",
    toRaw: () => "",
    toQuery: () => "89994634370519791027168048838578580624" 
  },
  XCUSDC: { 
    name: "XCUSDC", 
    symbol: "XCUSDC", 
    decimals: 6, ed: "0",
    toRaw: () => "",
    toQuery: () => "166377000701797186346254371275954761085" 
  },
  XCASTAR: { 
    name: "XCASTAR", 
    symbol: "XCASTAR", 
    decimals: 18, ed: "0",
    toRaw: () => "",
    toQuery: () => "224077081838586484055667086558292981199" 
  },
  XCVDOT: { 
    name: "XCVDOT", 
    symbol: "XCVDOT", 
    decimals: 10, ed: "0",
    toRaw: () => "",
    toQuery: () => "29085784439601774464560083082574142143" 
  },
  XCEQ: { 
    name: "XCEQ", 
    symbol: "XCEQ", 
    decimals: 9, ed: "0",
    toRaw: () => "",
    toQuery: () => "190590555344745888270686124937537713878" 
  },
  XCEQD: { 
    name: "XCEQD", 
    symbol: "XCEQD", 
    decimals: 9, ed: "0",
    toRaw: () => "",
    toQuery: () => "187224307232923873519830480073807488153" 
  },
  XCCFG: { 
    name: "XCCFG", 
    symbol: "XCCFG", 
    decimals: 18, ed: "0",
    toRaw: () => "",
    toQuery: () => "91372035960551235635465443179559840483" 
  },
  XCRING: { 
    name: "XCRING", 
    symbol: "XCRING", 
    decimals: 18, ed: "0",
    toRaw: () => "",
    toQuery: () => "125699734534028342599692732320197985871" 
  },
  XCPDEX: { 
    name: "XCPDEX", 
    symbol: "XCPDEX", 
    decimals: 12, ed: "0",
    toRaw: () => "",
    toQuery: () => "90225766094594282577230355136633846906" 
  },
  XCZTG: { 
    name: "XCZTG", 
    symbol: "XCZTG", 
    decimals: 10, ed: "0",
    toRaw: () => "",
    toQuery: () => "150874409661081770150564009349448205842" 
  },
  XCPHA: { 
    name: "XCPHA", 
    symbol: "XCPHA", 
    decimals: 12, ed: "0",
    toRaw: () => "",
    toQuery: () => "132685552157663328694213725410064821485" 
  },
  XCOTP: { 
    name: "XCOTP", 
    symbol: "XCOTP", 
    decimals: 12, ed: "0",
    toRaw: () => "",
    toQuery: () => "238111524681612888331172110363070489924" 
  },
  XCVASTR: { 
    name: "XCVASTR", 
    symbol: "XCVASTR", 
    decimals: 18, ed: "0",
    toRaw: () => "",
    toQuery: () => "114018676402354620972806895487280206446" 
  },
  XCPARA: { 
    name: "XCPARA", 
    symbol: "XCPARA", 
    decimals: 12, ed: "0",
    toRaw: () => "",
    toQuery: () => "32615670524745285411807346420584982855" 
  },
  XCBNC: { 
    name: "XCBNC", 
    symbol: "XCBNC", 
    decimals: 12, ed: "0",
    toRaw: () => "",
    toQuery: () => "165823357460190568952172802245839421906" 
  },
  XCINTR: { 
    name: "XCINTR", 
    symbol: "XCINTR", 
    decimals: 10, ed: "0",
    toRaw: () => "",
    toQuery: () => "101170542313601871197860408087030232491" 
  },
  XCMANTA: { 
    name: "XCMANTA", 
    symbol: "XCMANTA", 
    decimals: 18, ed: "0",
    toRaw: () => "",
    toQuery: () => "166446646689194205559791995948102903873" 
  },
  XCIBTC: { 
    name: "XCIBTC", 
    symbol: "XCIBTC", 
    decimals: 8, ed: "0",
    toRaw: () => "",
    toQuery: () => "120637696315203257380661607956669368914" 
  },
  XCNODL: { 
    name: "XCNODL", 
    symbol: "XCNODL", 
    decimals: 11, ed: "0",
    toRaw: () => "",
    toQuery: () => "309163521958167876851250718453738106865" 
  },
  XCPINK: { 
    name: "XCPINK", 
    symbol: "XCPINK", 
    decimals: 10, ed: "0",
    toRaw: () => "",
    toQuery: () => "64174511183114006009298114091987195453" 
  },
  XCIBCPICA: { 
    name: "XCIBCPICA", 
    symbol: "XCIBCPICA", 
    decimals: 12, ed: "0",
    toRaw: () => "",
    toQuery: () => "228510780171552721666262089780561563481" 
  },
  XCIBCATOM: { 
    name: "XCIBCATOM", 
    symbol: "XCIBCATOM", 
    decimals: 6, ed: "0",
    toRaw: () => "",
    toQuery: () => "138280378441551394289980644963240827219" 
  },
  XCFIL: { 
    name: "XCFIL", 
    symbol: "XCFIL", 
    decimals: 18, ed: "0",
    toRaw: () => "",
    toQuery: () => "144012926827374458669278577633504620722" 
  },
  XCPEN: { 
    name: "XCPEN", 
    symbol: "XCPEN", 
    decimals: 12, ed: "0",
    toRaw: () => "",
    toQuery: () => "45647473099451451833602657905356404688" 
  },

};

export const moonriverTokensConfig: Record<string, TokenData> = {
  MOVR: { 
    name: "MOVR",
    symbol: "MOVR",
    decimals: 18, 
    ed: "1000000000000000", 
    toRaw: () => ""
   } as TokenData,
  XCKAR: { 
    name: "Karura", 
    symbol: "XCKAR", 
    decimals: 12, ed: "0",
    toRaw: () => "KAR",
    toQuery: () => "10810581592933651521121702237638664357" 
  },
  XCBNC: { 
    name: "XCBNC", 
    symbol: "XCBNC", 
    decimals: 12, ed: "0",
    toRaw: () => "",
    toQuery: () => "319623561105283008236062145480775032445" 
  },
  XCKINT: { 
    name: "Kintsugi", 
    symbol: "XCKINT", 
    decimals: 12, ed: "0",
    toRaw: () => "",
    toQuery: () => "175400718394635817552109270754364440562" 
  },
  XCASEED: { 
    name: "aUSD", 
    symbol: "ASEED", 
    decimals: 12, ed: "0",
    toRaw: () => "",
    toQuery: () => "214920334981412447805621250067209749032" 
  },
  XCPICA: { 
    name: "Picasso", 
    symbol: "XCPICA", 
    decimals: 12, ed: "0",
    toRaw: () => "",
    toQuery: () => "167283995827706324502761431814209211090" 
  },  
  XCCSM: { 
    name: "KAR", 
    symbol: "KAR", 
    decimals: 12, ed: "0",
    toRaw: () => "KAR",
    toQuery: () => "108457044225666871745333730479173774551" 
  },
  XCSDN: { 
    name: "Shiden", 
    symbol: "XCSDN", 
    decimals: 18, ed: "0",
    toRaw: () => "",
    toQuery: () => "16797826370226091782818345603793389938" 
  },
  XCHKO: { 
    name: "Heiko", 
    symbol: "HKO", 
    decimals: 12, ed: "0",
    toRaw: () => "",
    toQuery: () => "76100021443485661246318545281171740067" 
  },
  XCKBTC: { 
    name: "KBTC", 
    symbol: "XCKBTC", 
    decimals: 8, ed: "0",
    toRaw: () => "",
    toQuery: () => "328179947973504579459046439826496046832" 
  },
  XCXRT: { 
    name: "Robonomics", 
    symbol: "XCXRT", 
    decimals: 9, ed: "0",
    toRaw: () => "",
    toQuery: () => "108036400430056508975016746969135344601" 
  },
  XCTUR: { 
    name: "Turing", 
    symbol: "XCTUR", 
    decimals: 10, ed: "0",
    toRaw: () => "",
    toQuery: () => "133300872918374599700079037156071917454" 
  },
  XCKMA: { 
    name: "Calamari", 
    symbol: "XCKMA", 
    decimals: 12, ed: "0",
    toRaw: () => "",
    toQuery: () => "213357169630950964874127107356898319277" 
  },
  XCLIT: { 
    name: "Litentry", 
    symbol: "XCLIT", 
    decimals: 12, ed: "0",
    toRaw: () => "",
    toQuery: () => "65216491554813189869575508812319036608" 
  },
  XCCRAB: { 
    name: "Darwinia Crab", 
    symbol: "XCCRAB", 
    decimals: 18, ed: "0",
    toRaw: () => "",
    toQuery: () => "173481220575862801646329923366065693029" 
  },
  XCPHA: { 
    name: "Khala", 
    symbol: "XCPHA", 
    decimals: 12, ed: "0",
    toRaw: () => "",
    toQuery: () => "189307976387032586987344677431204943363" 
  },
  XCVKSM: { 
    name: "Bifrost Voucher KSM", 
    symbol: "XCVKSM", 
    decimals: 12, ed: "0",
    toRaw: () => "",
    toQuery: () => "264344629840762281112027368930249420542" 
  },
  XCVBNC: { 
    name: "Bifrost Voucher BNC", 
    symbol: "XCVBNC", 
    decimals: 12, ed: "0",
    toRaw: () => "",
    toQuery: () => "72145018963825376852137222787619937732" 
  },
  XCKSM: { 
    name: "Kusama", 
    symbol: "XCKSM", 
    decimals: 12, ed: "0",
    toRaw: () => "",
    toQuery: () => "42259045809535163221576417993425387648" 
  },
  XCRMRK: { 
    name: "RMRK", 
    symbol: "XCRMRK", 
    decimals: 10, ed: "0",
    toRaw: () => "",
    toQuery: () => "182365888117048807484804376330534607370" 
  },
  XCUSDT: { 
    name: "USDT", 
    symbol: "XCUSDT", 
    decimals: 6, ed: "0",
    toRaw: () => "",
    toQuery: () => "311091173110107856861649819128533077277" 
  },
  XCMGX: { 
    name: "Mangata X", 
    symbol: "XCMGX", 
    decimals: 18, ed: "0",
    toRaw: () => "",
    toQuery: () => "118095707745084482624853002839493125353" 
  },
  XCTEER: { 
    name: "TEER", 
    symbol: "XCTEER", 
    decimals: 12, ed: "0",
    toRaw: () => "",
    toQuery: () => "105075627293246237499203909093923548958" 
  },
  XCVMOVR: { 
    name: "Bifrost Voucher MOVR", 
    symbol: "XCVMOVR", 
    decimals: 18, ed: "0",
    toRaw: () => "",
    toQuery: () => "203223821023327994093278529517083736593" 
  }
};



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
          path: "query.assets.account",
          params: [address, token],
      }),
  };
};

class MoonbeamBalanceAdapter extends BalanceAdapter {
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
    const storage = this.storages.balances(address);

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

    // console.log("SEARCHING FOR TOKEN", token)
    // console.log("TOKEN LIST " + JSON.stringify(this.tokens))
    const tokenData: TokenData = this.getToken(token, tokenId);

    if (!tokenData) throw new TokenNotFound(token);

    return this.storages.assets(tokenData.toQuery(), address).observable.pipe(
      map((balance) => {
        const amount = FN.fromInner(
          balance.unwrapOrDefault()?.balance?.toString() || "0",
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

class BaseMoonbeamAdapter extends BaseCrossChainAdapter {
  private balanceAdapter?: MoonbeamBalanceAdapter;
  

  public async init(api: AnyApi) {
    this.api = api;

    await api.isReady;

    const chain = this.chain.id as ChainId;
    const tokenConfig = this.tokens;
    this.balanceAdapter = new MoonbeamBalanceAdapter({
      chain,
      api,
      tokens: tokenConfig,
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
    _: string,
    __: string,
    ___: ChainId
  ): Observable<FN> {
    throw new Error("Calling subscribeMaxInput on Moonbeam is not supported");
  }

  public createTx(
    _: TransferParams
  ):
    | SubmittableExtrinsic<"promise", ISubmittableResult>
    | SubmittableExtrinsic<"rxjs", ISubmittableResult> {
      throw new Error("Calling createTx on Moonbeam is not supported");
  }
}

export class MoonbeamAdapter extends BaseMoonbeamAdapter {
  constructor() {
    super(chains.moonbeam, [], moonbeamTokensConfig);
  }
}

export class MoonriverAdapter extends BaseMoonbeamAdapter {
  constructor() {
    super(chains.moonriver, [], moonriverTokensConfig);
  }
}
