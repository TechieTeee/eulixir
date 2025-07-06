// Data Export System for ETL Pipeline
import { utils } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface ExportConfig {
  format: 'csv' | 'json' | 'xlsx' | 'pdf';
  filename?: string;
  includeMetadata?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
}

export interface ExportData {
  data: any[];
  metadata?: {
    source: string;
    generatedAt: string;
    totalRecords: number;
    filters?: Record<string, any>;
    description?: string;
  };
}

export interface ExportResult {
  success: boolean;
  filename: string;
  size: number;
  downloadUrl?: string;
  error?: string;
}

export class DataExporter {
  
  async exportData(exportData: ExportData, config: ExportConfig): Promise<ExportResult> {
    try {
      const filename = this.generateFilename(config);
      
      switch (config.format) {
        case 'csv':
          return await this.exportCSV(exportData, filename, config);
        case 'json':
          return await this.exportJSON(exportData, filename, config);
        case 'xlsx':
          return await this.exportXLSX(exportData, filename, config);
        case 'pdf':
          return await this.exportPDF(exportData, filename, config);
        default:
          throw new Error(`Unsupported export format: ${config.format}`);
      }
    } catch (error) {
      return {
        success: false,
        filename: '',
        size: 0,
        error: error instanceof Error ? error.message : 'Unknown export error'
      };
    }
  }

  private generateFilename(config: ExportConfig): string {
    if (config.filename) {
      return config.filename;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    return `eulixir-export-${timestamp}.${config.format}`;
  }

  private async exportCSV(exportData: ExportData, filename: string, config: ExportConfig): Promise<ExportResult> {
    let csvContent = '';
    
    if (exportData.data.length === 0) {
      csvContent = 'No data available\n';
    } else {
      // Get headers from first object
      const headers = Object.keys(exportData.data[0]);
      csvContent += headers.join(',') + '\n';
      
      // Add data rows
      for (const row of exportData.data) {
        const values = headers.map(header => {
          const value = row[header];
          // Handle values that might contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        });
        csvContent += values.join(',') + '\n';
      }
    }

    // Add metadata as comments if requested
    if (config.includeMetadata && exportData.metadata) {
      const metadataComments = [
        `# Source: ${exportData.metadata.source}`,
        `# Generated: ${exportData.metadata.generatedAt}`,
        `# Total Records: ${exportData.metadata.totalRecords}`,
      ];
      
      if (exportData.metadata.description) {
        metadataComments.push(`# Description: ${exportData.metadata.description}`);
      }
      
      csvContent = metadataComments.join('\n') + '\n\n' + csvContent;
    }

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = this.createDownloadUrl(blob, filename);

    return {
      success: true,
      filename,
      size: blob.size,
      downloadUrl
    };
  }

  private async exportJSON(exportData: ExportData, filename: string, config: ExportConfig): Promise<ExportResult> {
    const jsonData = {
      ...(config.includeMetadata ? { metadata: exportData.metadata } : {}),
      data: exportData.data
    };

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const downloadUrl = this.createDownloadUrl(blob, filename);

    return {
      success: true,
      filename,
      size: blob.size,
      downloadUrl
    };
  }

  private async exportXLSX(exportData: ExportData, filename: string, config: ExportConfig): Promise<ExportResult> {
    const workbook = utils.book_new();

    // Main data sheet
    if (exportData.data.length > 0) {
      const worksheet = utils.json_to_sheet(exportData.data);
      utils.book_append_sheet(workbook, worksheet, 'Data');
    }

    // Metadata sheet if requested
    if (config.includeMetadata && exportData.metadata) {
      const metadataArray = Object.entries(exportData.metadata).map(([key, value]) => ({
        Property: key,
        Value: typeof value === 'object' ? JSON.stringify(value) : value
      }));
      const metadataSheet = utils.json_to_sheet(metadataArray);
      utils.book_append_sheet(workbook, metadataSheet, 'Metadata');
    }

    // Generate Excel file
    const excelBuffer = utils.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' 
    });
    const downloadUrl = this.createDownloadUrl(blob, filename);

    return {
      success: true,
      filename,
      size: blob.size,
      downloadUrl
    };
  }

  private async exportPDF(exportData: ExportData, filename: string, config: ExportConfig): Promise<ExportResult> {
    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(20);
    pdf.text('Eulixir Data Export', 20, 20);
    
    // Add metadata if requested
    let yPosition = 40;
    if (config.includeMetadata && exportData.metadata) {
      pdf.setFontSize(12);
      pdf.text(`Source: ${exportData.metadata.source}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`Generated: ${exportData.metadata.generatedAt}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`Total Records: ${exportData.metadata.totalRecords}`, 20, yPosition);
      yPosition += 20;
    }

    // Add data table
    if (exportData.data.length > 0) {
      const headers = Object.keys(exportData.data[0]);
      const rows = exportData.data.map(item => headers.map(header => item[header]));

      (pdf as any).autoTable({
        startY: yPosition,
        head: [headers],
        body: rows,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [147, 51, 234], // Purple theme
          textColor: 255,
        },
      });
    }

    // Generate PDF blob
    const pdfBlob = pdf.output('blob');
    const downloadUrl = this.createDownloadUrl(pdfBlob, filename);

    return {
      success: true,
      filename,
      size: pdfBlob.size,
      downloadUrl
    };
  }

  private createDownloadUrl(blob: Blob, filename: string): string {
    const url = URL.createObjectURL(blob);
    
    // Auto-download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL after a delay
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    return url;
  }

  // Specialized export methods for common data types
  async exportLPPositions(positions: any[], config?: Partial<ExportConfig>): Promise<ExportResult> {
    const exportData: ExportData = {
      data: positions.map(pos => ({
        'Position ID': pos.id,
        'Protocol': pos.protocol || pos.poolAddress,
        'Token Pair': `${pos.token0?.symbol || pos.token0}/${pos.token1?.symbol || pos.token1}`,
        'Liquidity': pos.liquidity,
        'Value USD': pos.valueUSD,
        'Current APY': `${pos.apy}%`,
        'Fees Earned': pos.feesEarnedUSD || pos.feesEarned,
        'Impermanent Loss': `${pos.impermanentLoss}%`,
        'Age (Days)': pos.age,
        'In Range': pos.inRange ? 'Yes' : 'No',
        'Last Update': pos.lastUpdate
      })),
      metadata: {
        source: 'LP Positions',
        generatedAt: new Date().toISOString(),
        totalRecords: positions.length,
        description: 'Liquidity Provider positions with performance metrics'
      }
    };

    return this.exportData(exportData, {
      format: 'xlsx',
      includeMetadata: true,
      ...config
    });
  }

  async exportYieldComparison(yieldData: any[], config?: Partial<ExportConfig>): Promise<ExportResult> {
    const exportData: ExportData = {
      data: yieldData.map(yield_ => ({
        'Protocol': yield_.protocol,
        'Token': yield_.token,
        'Supply APY': `${yield_.supplyAPY}%`,
        'Borrow APY': `${yield_.borrowAPY}%`,
        'Total Supplied': yield_.totalSupplied,
        'Total Borrowed': yield_.totalBorrowed,
        'Utilization Rate': `${yield_.utilizationRate}%`,
        'Last Updated': yield_.timestamp
      })),
      metadata: {
        source: 'Yield Comparison',
        generatedAt: new Date().toISOString(),
        totalRecords: yieldData.length,
        description: 'Cross-protocol yield comparison data'
      }
    };

    return this.exportData(exportData, {
      format: 'xlsx',
      includeMetadata: true,
      ...config
    });
  }

  async exportILData(ilData: any[], config?: Partial<ExportConfig>): Promise<ExportResult> {
    const exportData: ExportData = {
      data: ilData.map(il => ({
        'Position ID': il.positionId,
        'Current IL %': il.currentIL,
        'Current IL USD': il.currentILUSD,
        'Max IL %': il.maxIL,
        'Max IL USD': il.maxILUSD,
        'Timestamp': il.timestamp,
        'Token 0 Price': il.token0Price,
        'Token 1 Price': il.token1Price
      })),
      metadata: {
        source: 'Impermanent Loss Data',
        generatedAt: new Date().toISOString(),
        totalRecords: ilData.length,
        description: 'Historical impermanent loss tracking data'
      }
    };

    return this.exportData(exportData, {
      format: 'xlsx',
      includeMetadata: true,
      ...config
    });
  }

  async exportDataQualityReport(report: any, config?: Partial<ExportConfig>): Promise<ExportResult> {
    const exportData: ExportData = {
      data: report.results.map((result: any) => ({
        'Rule Name': result.ruleName,
        'Rule ID': result.ruleId,
        'Passed': result.passed ? 'Yes' : 'No',
        'Score': result.score,
        'Severity': result.severity,
        'Message': result.message,
        'Timestamp': result.timestamp
      })),
      metadata: {
        source: 'Data Quality Report',
        generatedAt: new Date().toISOString(),
        totalRecords: report.results.length,
        description: `Data quality report for ${report.dataSource}`,
        filters: {
          'Overall Score': `${report.overallScore}%`,
          'Status': report.status,
          'Passed Checks': report.passedChecks,
          'Failed Checks': report.failedChecks
        }
      }
    };

    return this.exportData(exportData, {
      format: 'pdf',
      includeMetadata: true,
      ...config
    });
  }

  // Batch export functionality
  async exportMultiple(exports: Array<{
    name: string;
    data: ExportData;
    config: ExportConfig;
  }>): Promise<ExportResult[]> {
    const results: ExportResult[] = [];
    
    for (const exportItem of exports) {
      const result = await this.exportData(exportItem.data, exportItem.config);
      results.push(result);
    }
    
    return results;
  }

  // Template-based exports
  async exportFromTemplate(templateName: string, data: any[], config?: Partial<ExportConfig>): Promise<ExportResult> {
    switch (templateName) {
      case 'lp-positions':
        return this.exportLPPositions(data, config);
      case 'yield-comparison':
        return this.exportYieldComparison(data, config);
      case 'il-data':
        return this.exportILData(data, config);
      default:
        throw new Error(`Unknown export template: ${templateName}`);
    }
  }
}

// Export format validators
export const validateExportConfig = (config: ExportConfig): string[] => {
  const errors: string[] = [];
  
  if (!['csv', 'json', 'xlsx', 'pdf'].includes(config.format)) {
    errors.push('Invalid format. Must be csv, json, xlsx, or pdf');
  }
  
  if (config.dateRange) {
    const start = new Date(config.dateRange.start);
    const end = new Date(config.dateRange.end);
    
    if (isNaN(start.getTime())) {
      errors.push('Invalid start date');
    }
    
    if (isNaN(end.getTime())) {
      errors.push('Invalid end date');
    }
    
    if (start > end) {
      errors.push('Start date must be before end date');
    }
  }
  
  return errors;
};

// Utility functions
export const formatDataForExport = (data: any[], format: string): any[] => {
  if (format === 'csv' || format === 'xlsx') {
    // Flatten nested objects for tabular formats
    return data.map(item => flattenObject(item));
  }
  
  return data;
};

const flattenObject = (obj: any, prefix = ''): any => {
  const flattened: any = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(flattened, flattenObject(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    }
  }
  
  return flattened;
};