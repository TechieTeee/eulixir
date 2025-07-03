import { NextResponse } from "next/server";
import { getPoolData } from "@/lib/euler";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("userAddress") || undefined;

    const data = await getPoolData(userAddress);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pool data" },
      { status: 500 }
    );
  }
}
