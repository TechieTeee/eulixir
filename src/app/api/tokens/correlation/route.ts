import { NextResponse } from "next/server";
import { createTokenConnectors } from "@/lib/tokenConnectors";

const RPC_URL = `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "24h";
    const tokens = searchParams.get("tokens")?.split(",") || ["WETH", "USDC", "WBTC"];
    const analysisType = searchParams.get("type") || "correlation";
    
    const connectors = createTokenConnectors(RPC_URL);
    
    let data;
    
    switch (analysisType) {
      case "correlation":
        data = await connectors.correlation.getCorrelationData(tokens, timeframe);
        break;
      case "arbitrage":
        data = await connectors.correlation.getArbitrageOpportunities();
        break;
      case "all":
      default:
        const [correlationData, arbitrageData] = await Promise.all([
          connectors.correlation.getCorrelationData(tokens, timeframe),
          connectors.correlation.getArbitrageOpportunities()
        ]);
        data = {
          correlation: correlationData,
          arbitrage: arbitrageData,
          metadata: {
            lastUpdated: new Date().toISOString(),
            tokens,
            timeframe
          }
        };
        break;
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Token correlation API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch correlation data" },
      { status: 500 }
    );
  }
}