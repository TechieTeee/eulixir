import { NextResponse } from "next/server";
import { createTokenConnectors } from "@/lib/tokenConnectors";

const RPC_URL = `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dataType = searchParams.get("type") || "all";
    
    const connectors = createTokenConnectors(RPC_URL);
    
    let data;
    
    switch (dataType) {
      case "basic":
        data = await connectors.wbtc.getWBTCData();
        break;
      case "custodians":
        data = await connectors.wbtc.getCustodianHealth();
        break;
      case "all":
      default:
        const [basicData, custodianData] = await Promise.all([
          connectors.wbtc.getWBTCData(),
          connectors.wbtc.getCustodianHealth()
        ]);
        data = {
          tokenData: basicData,
          custodians: custodianData,
          metadata: {
            lastUpdated: new Date().toISOString(),
            dataSource: "ethereum_mainnet"
          }
        };
        break;
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("WBTC API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch WBTC data" },
      { status: 500 }
    );
  }
}