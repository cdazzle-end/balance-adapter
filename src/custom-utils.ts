import { ListenAdapter, KicoAdapter, KaruraAdapter, ShidenAdapter, BifrostAdapter, AltairAdapter, ShadowAdapter, CrabAdapter, BasiliskAdapter, IntegriteeAdapter, KintsugiAdapter, PichiuAdapter, MangataAdapter, CalamariAdapter, MoonriverAdapter, TuringAdapter, HeikoAdapter, KhalaAdapter, KusamaAdapter, RobonomicsAdapter, StatemineAdapter, TinkernetAdapter, QuartzAdapter} from './adapters/index'

export function getAdapter(paraId: number){
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
    throw new Error("No adapter for paraId " + paraId)
}