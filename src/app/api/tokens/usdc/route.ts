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
        data = await connectors.usdc.getUSDCData();
        break;
      case "yields":
        data = await connectors.usdc.getYieldComparison();
        break;
      case "all":
      default:
        const [basicData, yieldData] = await Promise.all([
          connectors.usdc.getUSDCData(),
          connectors.usdc.getYieldComparison()
        ]);
        data = {
          tokenData: basicData,
          yieldComparison: yieldData,
          metadata: {
            lastUpdated: new Date().toISOString(),
            dataSource: "ethereum_mainnet"
          }
        };
        break;
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("USDC API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch USDC data" },
      { status: 500 }
    );
  }
}