import { NextResponse } from "next/server";
import { EulerSwapConnector } from "@/lib/eulerSwapConnector";

const RPC_URL = `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const strategy = searchParams.get("strategy");
    const positionId = searchParams.get("positionId");
    const targetIL = parseFloat(searchParams.get("targetIL") || "5");
    const riskTolerance = searchParams.get("riskTolerance") || "Medium";
    
    const connector = new EulerSwapConnector(RPC_URL);
    
    let data;
    
    if (strategy) {
      // Get specific hedging strategy details
      const strategies = connector.getAvailableHedgingStrategies();
      data = strategies.find(s => s.id === strategy);
      
      if (!data) {
        return NextResponse.json(
          { error: "Hedging strategy not found" },
          { status: 404 }
        );
      }
    } else {
      // Get all available hedging strategies
      const allStrategies = connector.getAvailableHedgingStrategies();
      
      // Filter strategies based on parameters
      data = allStrategies.filter(s => {
        if (s.targetIL > targetIL * 2) return false; // Too aggressive
        if (riskTolerance === 'Low' && s.riskLevel === 'High') return false;
        if (riskTolerance === 'High' && s.riskLevel === 'Low') return false;
        return true;
      }).sort((a, b) => b.effectiveness - a.effectiveness);
    }

    // If position ID provided, add position-specific recommendations
    if (positionId) {
      const ilData = await connector.getImpermanentLossData(positionId);
      
      return NextResponse.json({
        strategies: Array.isArray(data) ? data : [data],
        positionAnalysis: {
          currentIL: ilData.currentIL,
          maxIL: ilData.maxIL,
          recommendations: ilData.hedgingRecommendations,
          urgency: ilData.currentIL > targetIL ? 'High' : 
                  ilData.currentIL > targetIL * 0.7 ? 'Medium' : 'Low'
        },
        metadata: {
          lastUpdated: new Date().toISOString(),
          positionId,
          targetIL,
          riskTolerance
        }
      });
    }

    return NextResponse.json({
      strategies: Array.isArray(data) ? data : [data],
      metadata: {
        lastUpdated: new Date().toISOString(),
        targetIL,
        riskTolerance,
        totalStrategies: Array.isArray(data) ? data.length : 1
      }
    });
    
  } catch (error) {
    console.error("EulerSwap hedging API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch hedging strategies" },
      { status: 500 }
    );
  }
}