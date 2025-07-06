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
        data = await connectors.weth.getWETHData();
        break;
      case "lending":
        data = await connectors.weth.getLendingRates();
        break;
      case "all":
      default:
        const [basicData, lendingRates] = await Promise.all([
          connectors.weth.getWETHData(),
          connectors.weth.getLendingRates()
        ]);
        data = {
          tokenData: basicData,
          lendingRates,
          metadata: {
            lastUpdated: new Date().toISOString(),
            dataSource: "ethereum_mainnet"
          }
        };
        break;
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("WETH API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch WETH data" },
      { status: 500 }
    );
  }
}