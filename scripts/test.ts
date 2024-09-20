// import { firstValueFrom } from "rxjs";
import { BifrostAdapter } from "../src/adapters/bifrost";
import { ApiPromise, WsProvider } from "@polkadot/api";

const aliceAddress = "HNZata7iMYWmk5RvZRTiAsSDhV8366zq2YGb3tLH5Upf74F"

async function testAdapters(){
    let bfAdapter = new BifrostAdapter();
    let bfApi = new ApiPromise({provider: new WsProvider("ws://172.26.130.75:8009") });

    await bfAdapter.init(bfApi);
    const balanceObservable = bfAdapter.subscribeTokenBalance("KAR", aliceAddress);

    balanceObservable.subscribe((balance) => {
        console.log(balance.free.toNumber());
    });
    // console.log(balance.free.toNumber());

    // bfApi.disconnect();
    // bfAdapter.disconnect();
}

async function run(){
    await testAdapters();
}

run()
