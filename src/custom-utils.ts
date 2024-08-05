import { PolkadotAdapter, KiltAdapter, PendulumAdapter, NodleAdapter, SubsocialAdapter, BifrostPolkadotAdapter, ListenAdapter, KicoAdapter, KaruraAdapter, ShidenAdapter, BifrostAdapter, AltairAdapter, ShadowAdapter, CrabAdapter, BasiliskAdapter, IntegriteeAdapter, KintsugiAdapter, PichiuAdapter, MangataAdapter, CalamariAdapter, MoonriverAdapter, TuringAdapter, HeikoAdapter, KhalaAdapter, KusamaAdapter, RobonomicsAdapter, StatemineAdapter, TinkernetAdapter, QuartzAdapter, StatemintAdapter, AcalaAdapter, HydraDxAdapter, InterlayAdapter, MoonbeamAdapter, ParallelAdapter, UniqueAdapter, CentrifugeAdapter, AstarAdapter, PhalaAdapter, CrustAdapter, MantaAdapter, DarwiniaAdapter, OakAdapter, InvarchAdapter, ZeitgeistAdapter} from './adapters/index'
import { BasicToken, ExtendedToken, MyAssetRegistryObject, Relay, TokenData } from './types'
import fs from 'fs'
import path from 'path';
import { fileURLToPath } from 'url';
import { ChainId } from './configs';
import { kusamaChains } from './configs/chains/kusama-chains';
import { polkadotChains } from './configs/chains/polkadot-chains';
import { AssetObjectNotFound } from './errors';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getAdapter(relay: Relay, paraId: number){
    if( relay == "kusama"){
        if(paraId == 0){
            return new KusamaAdapter()
        }

        if(paraId == 1000){
            return new StatemineAdapter()
        }
        if(paraId == 2001){
            return new BifrostAdapter()
        }
        if(paraId == 2000){
            return new KaruraAdapter()
        }
        if(paraId == 2004){
            return new KhalaAdapter()
        }
        if(paraId == 2095){
            return new QuartzAdapter()
        }
        if(paraId == 2092){
            return new KintsugiAdapter()
        }
        if(paraId == 2023){
            return new MoonriverAdapter()
        }
        if(paraId == 2085){
            return new HeikoAdapter()
        }
        if(paraId == 2107){
            return new KicoAdapter()
        }
        if(paraId == 2012){
            return new ShadowAdapter()
        }
        if(paraId == 2084){
            return new CalamariAdapter()
        }
        if(paraId == 2015){
            return new IntegriteeAdapter()
        }
        if(paraId == 2088){
            return new AltairAdapter()
        }
        if(paraId == 2105){
            return new CrabAdapter()
        }
        if(paraId == 2114){
            return new TuringAdapter()
        }
        if(paraId == 2007){
            return new ShidenAdapter()
        }
        if(paraId == 2102){
            return new PichiuAdapter()
        }
        if(paraId == 2090){
            return new BasiliskAdapter()
        }
        if(paraId == 2118){
            return new ListenAdapter()
        }

        if(paraId == 2048){
            return new RobonomicsAdapter()
        }
        if(paraId == 2125){
            return new TinkernetAdapter()
        }
        if(paraId == 2110){
            return new MangataAdapter()
        }
        throw new Error(`No adapter for ${relay} paraId ` + paraId)
    } else { // polkadot
        if(paraId == 0){
            return new PolkadotAdapter()
        }

        if(paraId == 1000){
            return new StatemintAdapter()
        }
        if(paraId == 2030){
            return new BifrostPolkadotAdapter()
        }
        if(paraId == 2000){
            return new AcalaAdapter()
        }
        
        if(paraId == 2034){
            return new HydraDxAdapter()
        }
        if(paraId == 2035){
            return new PhalaAdapter()
        }
        if(paraId == 2032){
            return new InterlayAdapter()
        }
        if(paraId == 2004){
            return new MoonbeamAdapter()
        }
        if(paraId == 2012){
            return new ParallelAdapter()
        }
        if(paraId == 2037){
            return new UniqueAdapter()
        }
        if(paraId == 2008){
            return new CrustAdapter()
        }
        if(paraId == 2104){
            return new MantaAdapter()
        }

        if(paraId == 2031){
            return new CentrifugeAdapter()
        }
        if(paraId == 2046){
            return new DarwiniaAdapter()
        }
        if(paraId == 2090){
            return new OakAdapter()
        }
        if(paraId == 2006){
            return new AstarAdapter()
        }

        if(paraId == 3340){
            return new InvarchAdapter()
        }
        if(paraId == 2086){
            return new KiltAdapter()
        }
        if(paraId == 2101){
            return new SubsocialAdapter()
        }
        if(paraId == 2094){
            return new PendulumAdapter()
        }
        if(paraId == 2026){
            return new NodleAdapter()
        }
        if(paraId == 2092){
            return new ZeitgeistAdapter()
        }
        throw new Error(`No adapter for ${relay} paraId ` + paraId)
        // if(paraId == 2110){
            
        // }
    }
}

export function getAssetRegistryObject(paraId: number, localId: string, relay: Relay): MyAssetRegistryObject{
    let assetRegistry = getAssetRegistry(relay)
    let asset = assetRegistry.find((assetRegistryObject: MyAssetRegistryObject) => {
        if(paraId == 0 && assetRegistryObject.tokenData.chain == 0){
            return true
        }
        // console.log(JSON.stringify(assetRegistryObject.tokenData.localId).replace(/\\|"/g, ""))
        return assetRegistryObject.tokenData.chain == paraId && JSON.stringify(assetRegistryObject.tokenData.localId).replace(/\\|"/g, "") == localId
    })
    if(asset == undefined){
        // throw new Error(`Balance Adapter: Asset not found in registry: chainId: ${paraId}, localId: ${localId} | localId stringify: ${JSON.stringify(localId)}`)
        throw new AssetObjectNotFound(localId, paraId)
    }
    return asset
}

export function getAssetRegistry(relay: Relay){
    // let assetRegistry: MyAssetRegistryObject[] = relay === 'kusama' ? JSON.parse(fs.readFileSync(path.join(__dirname, '../../allAssets.json'), 'utf8')) : JSON.parse(fs.readFileSync(path.join(__dirname, '../../../polkadot_assets/assets/asset_registry/allAssetsPolkadotCollected.json'), 'utf8'));
    let assetRegistryPath = relay === 'kusama' ? '../../allAssets.json' : '../../polkadot_assets/assets/asset_registry/allAssetsPolkadotCollected.json'
    let assetRegistry: MyAssetRegistryObject[] = JSON.parse(fs.readFileSync(path.join(__dirname, assetRegistryPath), 'utf8'));
    return assetRegistry
}

export function getRelayForChainId(chainId: ChainId): Relay{
    // Ensure chainId is of the correct type
    if (chainId in kusamaChains) {
        return 'kusama';
    } else if (chainId in polkadotChains) {
        return 'polkadot';
    } else {
        throw new Error(`Chain ID ${chainId} not found in any relay.`);
    }
    
    
}

export function createBasicTokenFromAsset(asset: MyAssetRegistryObject): BasicToken{
    let basicToken: BasicToken = {
        name: asset.tokenData.name,
        symbol: asset.tokenData.symbol,
        decimals: Number.parseInt(asset.tokenData.decimals),
        ed: '0'
    }
    return basicToken
}

export function createExtendedTokenFromAsset(asset: MyAssetRegistryObject): ExtendedToken{
    let extendedToken: ExtendedToken = {
        name: asset.tokenData.name,
        symbol: asset.tokenData.symbol,
        decimals: Number.parseInt(asset.tokenData.decimals),
        ed: '0',
        toRaw: () => asset.tokenData.localId
    }
    return extendedToken
}

export function createTokenDataFromAsset(asset: MyAssetRegistryObject): TokenData{
    let tokenData: TokenData = {
        name: asset.tokenData.name,
        symbol: asset.tokenData.symbol,
        decimals: Number.parseInt(asset.tokenData.decimals),
        ed: '0',
        toRaw: () => "",
        toQuery: () => asset.tokenData.localId

    }
    return tokenData
}