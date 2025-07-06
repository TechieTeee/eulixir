import { NextResponse } from "next/server";
import { EulerSwapConnector } from "@/lib/eulerSwapConnector";

const RPC_URL = `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("user");
    const positionId = searchParams.get("positionId");
    const dataType = searchParams.get("type") || "positions";
    
    if (!userAddress && !positionId) {
      return NextResponse.json(
        { error: "User address or position ID is required" },
        { status: 400 }
      );
    }

    const connector = new EulerSwapConnector(RPC_URL);
    let data;

    switch (dataType) {
      case "positions":
        if (!userAddress) {
          return NextResponse.json(
            { error: "User address is required for positions" },
            { status: 400 }
          );
        }
        data = await connector.getUserLPPositions(userAddress);
        break;
        
      case "yield":
        if (!positionId) {
          return NextResponse.json(
            { error: "Position ID is required for yield data" },
            { status: 400 }
          );
        }
        data = await connector.getYieldMetrics(positionId);
        break;
        
      case "performance":
        if (!positionId) {
          return NextResponse.json(
            { error: "Position ID is required for performance data" },
            { status: 400 }
          );
        }
        data = await connector.getPositionPerformance(positionId);
        break;
        
      case "il":
      case "impermanent-loss":
        if (!positionId) {
          return NextResponse.json(
            { error: "Position ID is required for IL data" },
            { status: 400 }
          );
        }
        data = await connector.getImpermanentLossData(positionId);
        break;
        
      default:
        return NextResponse.json(
          { error: "Invalid data type. Use: positions, yield, performance, or il" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      data,
      metadata: {
        lastUpdated: new Date().toISOString(),
        dataType,
        userAddress,
        positionId
      }
    });
    
  } catch (error) {
    console.error("EulerSwap positions API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch EulerSwap data" },
      { status: 500 }
    );
  }
}