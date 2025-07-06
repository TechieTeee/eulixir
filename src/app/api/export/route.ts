import { NextResponse } from "next/server";
import { DataExporter, validateExportConfig } from "@/lib/dataExporter";
import { getPoolData } from "@/lib/euler";
import { EulerSwapConnector } from "@/lib/eulerSwapConnector";

const RPC_URL = `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      dataType, 
      exportConfig, 
      userAddress,
      positionId,
      templateName,
      customData 
    } = body;

    // Validate export config
    const configErrors = validateExportConfig(exportConfig);
    if (configErrors.length > 0) {
      return NextResponse.json(
        { error: "Invalid export configuration", details: configErrors },
        { status: 400 }
      );
    }

    const exporter = new DataExporter();
    let result;

    // Handle different data types
    switch (dataType) {
      case "euler-data":
        const eulerData = await getPoolData(userAddress);
        const exportData = {
          data: [
            {
              'Data Source': 'Euler Finance',
              'APY Data Points': eulerData.apyData.length,
              'Portfolio Assets': eulerData.portfolio.length,
              'Risk Score': eulerData.riskScore,
              'Total Portfolio Value': eulerData.portfolio.reduce((sum, asset) => sum + asset.valueUSD, 0),
              'Generated At': new Date().toISOString()
            }
          ],
          metadata: {
            source: 'Euler Finance',
            generatedAt: new Date().toISOString(),
            totalRecords: 1,
            description: 'Euler Finance portfolio and APY data'
          }
        };
        result = await exporter.exportData(exportData, exportConfig);
        break;

      case "lp-positions":
        if (!userAddress) {
          return NextResponse.json(
            { error: "User address required for LP positions export" },
            { status: 400 }
          );
        }
        const eulerSwap = new EulerSwapConnector(RPC_URL);
        const positions = await eulerSwap.getUserLPPositions(userAddress);
        result = await exporter.exportLPPositions(positions, exportConfig);
        break;

      case "yield-comparison":
        // Mock yield data for demonstration
        const yieldData = [
          {
            protocol: 'Aave V3',
            token: 'USDC',
            supplyAPY: 4.2,
            borrowAPY: 5.8,
            totalSupplied: 1000000,
            totalBorrowed: 600000,
            utilizationRate: 60,
            timestamp: new Date().toISOString()
          },
          {
            protocol: 'Compound V3',
            token: 'USDC',
            supplyAPY: 3.9,
            borrowAPY: 6.1,
            totalSupplied: 800000,
            totalBorrowed: 480000,
            utilizationRate: 60,
            timestamp: new Date().toISOString()
          }
        ];
        result = await exporter.exportYieldComparison(yieldData, exportConfig);
        break;

      case "il-data":
        if (!positionId) {
          return NextResponse.json(
            { error: "Position ID required for IL data export" },
            { status: 400 }
          );
        }
        const connector = new EulerSwapConnector(RPC_URL);
        const ilData = await connector.getImpermanentLossData(positionId);
        result = await exporter.exportILData(ilData.ilHistory, exportConfig);
        break;

      case "custom":
        if (!customData) {
          return NextResponse.json(
            { error: "Custom data required for custom export" },
            { status: 400 }
          );
        }
        result = await exporter.exportData(customData, exportConfig);
        break;

      case "template":
        if (!templateName || !customData) {
          return NextResponse.json(
            { error: "Template name and data required for template export" },
            { status: 400 }
          );
        }
        result = await exporter.exportFromTemplate(templateName, customData, exportConfig);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid data type" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: result.success,
      filename: result.filename,
      size: result.size,
      error: result.error,
      metadata: {
        dataType,
        exportFormat: exportConfig.format,
        generatedAt: new Date().toISOString(),
        userAddress: userAddress || null
      }
    });

  } catch (error) {
    console.error("Export API error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}

// GET endpoint for export templates and formats
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "formats":
        return NextResponse.json({
          formats: [
            {
              value: 'csv',
              label: 'CSV',
              description: 'Comma-separated values file',
              mimeType: 'text/csv'
            },
            {
              value: 'xlsx',
              label: 'Excel',
              description: 'Microsoft Excel spreadsheet',
              mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            },
            {
              value: 'json',
              label: 'JSON',
              description: 'JavaScript Object Notation',
              mimeType: 'application/json'
            },
            {
              value: 'pdf',
              label: 'PDF',
              description: 'Portable Document Format',
              mimeType: 'application/pdf'
            }
          ]
        });

      case "templates":
        return NextResponse.json({
          templates: [
            {
              id: 'lp-positions',
              name: 'LP Positions',
              description: 'Export liquidity provider positions with performance metrics',
              requiredFields: ['userAddress'],
              supportedFormats: ['csv', 'xlsx', 'pdf']
            },
            {
              id: 'yield-comparison',
              name: 'Yield Comparison',
              description: 'Compare yields across different protocols',
              requiredFields: [],
              supportedFormats: ['csv', 'xlsx', 'json']
            },
            {
              id: 'il-data',
              name: 'Impermanent Loss Data',
              description: 'Historical impermanent loss tracking',
              requiredFields: ['positionId'],
              supportedFormats: ['csv', 'xlsx', 'json']
            },
            {
              id: 'euler-data',
              name: 'Euler Finance Data',
              description: 'Complete Euler Finance portfolio data',
              requiredFields: [],
              supportedFormats: ['csv', 'xlsx', 'json', 'pdf']
            }
          ]
        });

      default:
        return NextResponse.json({
          availableActions: ['formats', 'templates'],
          usage: 'Use ?action=formats or ?action=templates'
        });
    }

  } catch (error) {
    console.error("Export GET API error:", error);
    return NextResponse.json(
      { error: "Failed to get export information" },
      { status: 500 }
    );
  }
}