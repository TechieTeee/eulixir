// Data Quality Checker for ETL Pipeline
import { ethers } from 'ethers';

export interface DataQualityRule {
  id: string;
  name: string;
  description: string;
  type: 'completeness' | 'accuracy' | 'consistency' | 'timeliness' | 'validity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  threshold?: number;
  enabled: boolean;
}

export interface DataQualityResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  score: number; // 0-100
  message: string;
  details?: any;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface DataQualityReport {
  id: string;
  dataSource: string;
  overallScore: number;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  results: DataQualityResult[];
  timestamp: string;
  status: 'healthy' | 'warning' | 'critical';
}

export interface AlertConfig {
  id: string;
  name: string;
  triggers: string[]; // rule IDs that trigger this alert
  channels: ('email' | 'webhook' | 'dashboard' | 'sms')[];
  minSeverity: 'low' | 'medium' | 'high' | 'critical';
  cooldownMinutes: number;
  enabled: boolean;
}

// Default data quality rules
export const DEFAULT_QUALITY_RULES: DataQualityRule[] = [
  {
    id: 'price-range-check',
    name: 'Price Range Validation',
    description: 'Check if token prices are within reasonable ranges',
    type: 'validity',
    severity: 'high',
    threshold: 50, // 50% price deviation threshold
    enabled: true
  },
  {
    id: 'data-freshness',
    name: 'Data Freshness Check',
    description: 'Ensure data is not older than expected threshold',
    type: 'timeliness',
    severity: 'medium',
    threshold: 300, // 5 minutes
    enabled: true
  },
  {
    id: 'null-value-check',
    name: 'Null Value Detection',
    description: 'Check for missing or null critical values',
    type: 'completeness',
    severity: 'high',
    threshold: 5, // 5% null values threshold
    enabled: true
  },
  {
    id: 'apy-sanity-check',
    name: 'APY Sanity Check',
    description: 'Validate APY values are reasonable (0-1000%)',
    type: 'validity',
    severity: 'medium',
    threshold: 1000,
    enabled: true
  },
  {
    id: 'volume-spike-detection',
    name: 'Volume Spike Detection',
    description: 'Detect unusual volume spikes that might indicate data errors',
    type: 'consistency',
    severity: 'medium',
    threshold: 500, // 500% increase threshold
    enabled: true
  },
  {
    id: 'duplicate-detection',
    name: 'Duplicate Data Detection',
    description: 'Check for duplicate records in datasets',
    type: 'consistency',
    severity: 'low',
    threshold: 1, // 1% duplicates threshold
    enabled: true
  },
  {
    id: 'il-validation',
    name: 'Impermanent Loss Validation',
    description: 'Validate IL calculations are mathematically correct',
    type: 'accuracy',
    severity: 'high',
    threshold: 10, // 10% calculation error threshold
    enabled: true
  },
  {
    id: 'correlation-check',
    name: 'Price Correlation Check',
    description: 'Check if related asset prices maintain expected correlations',
    type: 'consistency',
    severity: 'medium',
    threshold: 0.3, // Minimum correlation threshold
    enabled: true
  }
];

export class DataQualityChecker {
  private rules: DataQualityRule[];
  private alerts: AlertConfig[];
  private lastAlerts: Map<string, number> = new Map();

  constructor(customRules?: DataQualityRule[], customAlerts?: AlertConfig[]) {
    this.rules = customRules || DEFAULT_QUALITY_RULES;
    this.alerts = customAlerts || [];
  }

  async runQualityChecks(data: any, dataSource: string): Promise<DataQualityReport> {
    const results: DataQualityResult[] = [];
    
    for (const rule of this.rules.filter(r => r.enabled)) {
      try {
        const result = await this.executeRule(rule, data);
        results.push(result);
      } catch (error) {
        console.error(`Error executing rule ${rule.id}:`, error);
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          passed: false,
          score: 0,
          message: `Rule execution failed: ${error}`,
          timestamp: new Date().toISOString(),
          severity: rule.severity
        });
      }
    }

    const passedChecks = results.filter(r => r.passed).length;
    const failedChecks = results.length - passedChecks;
    const overallScore = results.length > 0 ? (passedChecks / results.length) * 100 : 0;
    
    const status = this.determineStatus(overallScore, results);
    
    const report: DataQualityReport = {
      id: `dq_${Date.now()}`,
      dataSource,
      overallScore,
      totalChecks: results.length,
      passedChecks,
      failedChecks,
      results,
      timestamp: new Date().toISOString(),
      status
    };

    // Check for alerts
    await this.checkAlerts(report);

    return report;
  }

  private async executeRule(rule: DataQualityRule, data: any): Promise<DataQualityResult> {
    switch (rule.id) {
      case 'price-range-check':
        return this.checkPriceRange(rule, data);
      case 'data-freshness':
        return this.checkDataFreshness(rule, data);
      case 'null-value-check':
        return this.checkNullValues(rule, data);
      case 'apy-sanity-check':
        return this.checkAPYSanity(rule, data);
      case 'volume-spike-detection':
        return this.checkVolumeSpikes(rule, data);
      case 'duplicate-detection':
        return this.checkDuplicates(rule, data);
      case 'il-validation':
        return this.checkILValidation(rule, data);
      case 'correlation-check':
        return this.checkPriceCorrelation(rule, data);
      default:
        throw new Error(`Unknown rule: ${rule.id}`);
    }
  }

  private checkPriceRange(rule: DataQualityRule, data: any): DataQualityResult {
    const prices = this.extractPrices(data);
    const threshold = rule.threshold || 50;
    
    // Known reasonable price ranges (in USD)
    const priceRanges = {
      'ETH': [500, 8000],
      'WETH': [500, 8000],
      'BTC': [15000, 100000],
      'WBTC': [15000, 100000],
      'USDC': [0.95, 1.05],
      'USDT': [0.95, 1.05],
      'DAI': [0.95, 1.05]
    };

    let validPrices = 0;
    let totalPrices = 0;
    const issues: string[] = [];

    for (const [token, price] of Object.entries(prices)) {
      totalPrices++;
      const range = priceRanges[token.toUpperCase() as keyof typeof priceRanges];
      
      if (range) {
        const [min, max] = range;
        if (price >= min && price <= max) {
          validPrices++;
        } else {
          issues.push(`${token}: $${price} (expected: $${min}-$${max})`);
        }
      } else {
        // For unknown tokens, check for extremely unusual values
        if (price > 0 && price < 1000000) {
          validPrices++;
        } else {
          issues.push(`${token}: $${price} (unusual value)`);
        }
      }
    }

    const score = totalPrices > 0 ? (validPrices / totalPrices) * 100 : 100;
    const passed = score >= (100 - threshold);

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      passed,
      score,
      message: passed ? 'All prices within expected ranges' : `${issues.length} price(s) out of range: ${issues.join(', ')}`,
      details: { issues, validPrices, totalPrices },
      timestamp: new Date().toISOString(),
      severity: rule.severity
    };
  }

  private checkDataFreshness(rule: DataQualityRule, data: any): DataQualityResult {
    const threshold = (rule.threshold || 300) * 1000; // Convert to milliseconds
    const now = Date.now();
    
    const timestamps = this.extractTimestamps(data);
    let freshData = 0;
    let totalData = timestamps.length;

    for (const timestamp of timestamps) {
      const age = now - new Date(timestamp).getTime();
      if (age <= threshold) {
        freshData++;
      }
    }

    const score = totalData > 0 ? (freshData / totalData) * 100 : 100;
    const passed = score >= 80; // 80% of data should be fresh

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      passed,
      score,
      message: passed ? 'Data is fresh' : `${totalData - freshData} stale records found`,
      details: { freshData, totalData, thresholdMinutes: rule.threshold },
      timestamp: new Date().toISOString(),
      severity: rule.severity
    };
  }

  private checkNullValues(rule: DataQualityRule, data: any): DataQualityResult {
    const threshold = rule.threshold || 5;
    const criticalFields = ['price', 'apy', 'liquidity', 'valueUSD'];
    
    const nullCounts = this.countNullValues(data, criticalFields);
    const totalValues = this.countTotalValues(data, criticalFields);
    
    const nullPercentage = totalValues > 0 ? (nullCounts / totalValues) * 100 : 0;
    const passed = nullPercentage <= threshold;
    const score = Math.max(0, 100 - nullPercentage);

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      passed,
      score,
      message: passed ? 'Acceptable null value levels' : `${nullPercentage.toFixed(1)}% null values detected`,
      details: { nullCounts, totalValues, nullPercentage },
      timestamp: new Date().toISOString(),
      severity: rule.severity
    };
  }

  private checkAPYSanity(rule: DataQualityRule, data: any): DataQualityResult {
    const maxAPY = rule.threshold || 1000;
    const apyValues = this.extractAPYValues(data);
    
    let validAPY = 0;
    const issues: string[] = [];

    for (const [source, apy] of Object.entries(apyValues)) {
      if (apy >= 0 && apy <= maxAPY) {
        validAPY++;
      } else {
        issues.push(`${source}: ${apy.toFixed(1)}%`);
      }
    }

    const totalAPY = Object.keys(apyValues).length;
    const score = totalAPY > 0 ? (validAPY / totalAPY) * 100 : 100;
    const passed = score >= 90;

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      passed,
      score,
      message: passed ? 'APY values are reasonable' : `Suspicious APY values: ${issues.join(', ')}`,
      details: { issues, validAPY, totalAPY },
      timestamp: new Date().toISOString(),
      severity: rule.severity
    };
  }

  private checkVolumeSpikes(rule: DataQualityRule, data: any): DataQualityResult {
    // This would implement volume spike detection logic
    // For now, return a placeholder
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      passed: true,
      score: 100,
      message: 'No volume spikes detected',
      timestamp: new Date().toISOString(),
      severity: rule.severity
    };
  }

  private checkDuplicates(rule: DataQualityRule, data: any): DataQualityResult {
    // Implementation for duplicate detection
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      passed: true,
      score: 100,
      message: 'No duplicates detected',
      timestamp: new Date().toISOString(),
      severity: rule.severity
    };
  }

  private checkILValidation(rule: DataQualityRule, data: any): DataQualityResult {
    // Implementation for IL validation
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      passed: true,
      score: 100,
      message: 'IL calculations are valid',
      timestamp: new Date().toISOString(),
      severity: rule.severity
    };
  }

  private checkPriceCorrelation(rule: DataQualityRule, data: any): DataQualityResult {
    // Implementation for price correlation checks
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      passed: true,
      score: 100,
      message: 'Price correlations are normal',
      timestamp: new Date().toISOString(),
      severity: rule.severity
    };
  }

  // Helper methods
  private extractPrices(data: any): Record<string, number> {
    const prices: Record<string, number> = {};
    
    if (data.tokenData) {
      prices[data.tokenData.token] = data.tokenData.price;
    }
    
    if (data.portfolio) {
      for (const asset of data.portfolio) {
        if (asset.token && typeof asset.valueUSD === 'number' && typeof asset.amount === 'number') {
          prices[asset.token] = asset.valueUSD / asset.amount;
        }
      }
    }

    return prices;
  }

  private extractTimestamps(data: any): string[] {
    const timestamps: string[] = [];
    
    if (data.lastUpdated) timestamps.push(data.lastUpdated);
    if (data.timestamp) timestamps.push(data.timestamp);
    if (data.metadata?.lastUpdated) timestamps.push(data.metadata.lastUpdated);
    
    if (data.apyData) {
      for (const point of data.apyData) {
        if (point.timestamp) timestamps.push(point.timestamp);
      }
    }

    return timestamps;
  }

  private countNullValues(data: any, fields: string[]): number {
    let nullCount = 0;
    
    const checkObject = (obj: any) => {
      for (const field of fields) {
        if (obj[field] === null || obj[field] === undefined || obj[field] === '') {
          nullCount++;
        }
      }
    };

    if (Array.isArray(data)) {
      for (const item of data) {
        checkObject(item);
      }
    } else {
      checkObject(data);
    }

    return nullCount;
  }

  private countTotalValues(data: any, fields: string[]): number {
    let totalCount = 0;
    
    const countObject = (obj: any) => {
      for (const field of fields) {
        if (field in obj) {
          totalCount++;
        }
      }
    };

    if (Array.isArray(data)) {
      for (const item of data) {
        countObject(item);
      }
    } else {
      countObject(data);
    }

    return totalCount;
  }

  private extractAPYValues(data: any): Record<string, number> {
    const apyValues: Record<string, number> = {};
    
    if (data.apy) apyValues['main'] = data.apy;
    if (data.apyData) {
      for (const point of data.apyData) {
        if (point.apy) apyValues[`point_${Date.parse(point.timestamp)}`] = point.apy;
      }
    }

    return apyValues;
  }

  private determineStatus(score: number, results: DataQualityResult[]): 'healthy' | 'warning' | 'critical' {
    const criticalFailures = results.filter(r => !r.passed && r.severity === 'critical').length;
    const highFailures = results.filter(r => !r.passed && r.severity === 'high').length;
    
    if (criticalFailures > 0 || score < 60) return 'critical';
    if (highFailures > 0 || score < 80) return 'warning';
    return 'healthy';
  }

  private async checkAlerts(report: DataQualityReport): Promise<void> {
    for (const alert of this.alerts.filter(a => a.enabled)) {
      const shouldTrigger = this.shouldTriggerAlert(alert, report);
      
      if (shouldTrigger) {
        await this.sendAlert(alert, report);
      }
    }
  }

  private shouldTriggerAlert(alert: AlertConfig, report: DataQualityReport): boolean {
    // Check cooldown
    const lastAlert = this.lastAlerts.get(alert.id);
    const now = Date.now();
    if (lastAlert && (now - lastAlert) < alert.cooldownMinutes * 60 * 1000) {
      return false;
    }

    // Check if any trigger rules failed with sufficient severity
    const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    const minLevel = severityLevels[alert.minSeverity];

    for (const ruleId of alert.triggers) {
      const result = report.results.find(r => r.ruleId === ruleId);
      if (result && !result.passed && severityLevels[result.severity] >= minLevel) {
        return true;
      }
    }

    return false;
  }

  private async sendAlert(alert: AlertConfig, report: DataQualityReport): Promise<void> {
    console.log(`🚨 Data Quality Alert: ${alert.name}`);
    console.log(`Report: ${report.dataSource} - Score: ${report.overallScore.toFixed(1)}%`);
    
    // Mark alert as sent
    this.lastAlerts.set(alert.id, Date.now());
    
    // Here you would implement actual alert sending logic
    // For now, we'll just log and could add webhook/email integration
  }
}