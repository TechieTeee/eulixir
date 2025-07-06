import { NextResponse } from "next/server";
import { getPoolData } from "@/lib/euler";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("userAddress") || undefined;

    console.log('Fetching pool data for user:', userAddress);
    const data = await getPoolData(userAddress);
    console.log('Pool data fetched successfully');
    return NextResponse.json(data);
  } catch (error) {
    console.error("Pool API error details:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      userAddress: new URL(request.url).searchParams.get("userAddress")
    });
    return NextResponse.json(
      { 
        error: "Failed to fetch pool data",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
