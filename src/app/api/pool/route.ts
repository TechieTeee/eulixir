import { NextResponse } from "next/server";

export async function GET() {
  // Mock data simulating EulerSwap USDC/WETH pool
  const apyData = [
    { timestamp: "2025-07-01T00:00:00Z", apy: 5.2 },
    { timestamp: "2025-07-02T00:00:00Z", apy: 5.5 },
    { timestamp: "2025-07-03T00:00:00Z", apy: 5.3 },
    { timestamp: "2025-07-04T00:00:00Z", apy: 5.7 },
    { timestamp: "2025-07-05T00:00:00Z", apy: 5.4 },
  ];

  const portfolio = [
    { token: "USDC", amount: 1000, valueUSD: 1000 },
    { token: "WETH", amount: 0.5, valueUSD: 1500 },
  ];

  const ilRisk = 1.25; // Mock impermanent loss risk percentage

  return NextResponse.json({ apyData, portfolio, ilRisk });
}
