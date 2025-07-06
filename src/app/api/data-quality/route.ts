import { NextResponse } from "next/server";
import { DataQualityChecker, DEFAULT_QUALITY_RULES } from "@/lib/dataQualityChecker";
import { getPoolData } from "@/lib/euler";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dataSource = searchParams.get("source") || "euler";
    const userAddress = searchParams.get("userAddress");
    
    // Get data to check
    let data;
    switch (dataSource) {
      case "euler":
        data = await getPoolData(userAddress || undefined);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid data source" },
          { status: 400 }
        );
    }

    // Run quality checks
    const checker = new DataQualityChecker();
    const report = await checker.runQualityChecks(data, dataSource);

    return NextResponse.json({
      report,
      metadata: {
        dataSource,
        userAddress,
        generatedAt: new Date().toISOString(),
        rulesApplied: DEFAULT_QUALITY_RULES.filter(r => r.enabled).length
      }
    });
    
  } catch (error) {
    console.error("Data quality check API error:", error);
    return NextResponse.json(
      { error: "Failed to run data quality checks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, dataSource, customRules } = body;

    if (!data || !dataSource) {
      return NextResponse.json(
        { error: "Data and dataSource are required" },
        { status: 400 }
      );
    }

    // Create checker with custom rules if provided
    const checker = new DataQualityChecker(customRules);
    const report = await checker.runQualityChecks(data, dataSource);

    return NextResponse.json({
      report,
      metadata: {
        dataSource,
        generatedAt: new Date().toISOString(),
        customRules: !!customRules
      }
    });
    
  } catch (error) {
    console.error("Data quality check API error:", error);
    return NextResponse.json(
      { error: "Failed to run data quality checks" },
      { status: 500 }
    );
  }
}