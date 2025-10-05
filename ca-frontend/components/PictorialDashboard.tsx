"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  DollarSign, 
  Percent, 
  Calendar,
  User,
  Building,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Lightbulb,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import UniversalChart from './charts/UniversalChart';
import TaxRegimeComparison from './TaxRegimeComparison';
import IncomeExpenseBreakdown from './IncomeExpenseBreakdown';
import BusinessKPIsDashboard from './BusinessKPIsDashboard';
import QuarterlyDashboard from './QuarterlyDashboard';
import CostStructureAnalysis from './CostStructureAnalysis';
import AssetBreakdownAnalysis from './AssetBreakdownAnalysis';

interface KeyMetric {
  title: string;
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  color: 'green' | 'red' | 'blue' | 'orange' | 'purple';
  icon: 'dollar' | 'percent' | 'calendar' | 'user' | 'building' | 'chart';
  description: string;
}

interface ChartData {
  type: 'pie' | 'bar' | 'line' | 'doughnut';
  title: string;
  data: {
    labels: string[];
    values: number[];
  };
  color_scheme: string;
  description?: string;
  insights?: string[];
}

interface Highlight {
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  icon: string;
}

interface RiskAlert {
  level: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action_required: string;
}

interface ComplianceItem {
  item: string;
  status: 'compliant' | 'non_compliant' | 'pending';
  description: string;
  due_date: string;
}

interface TimelineEvent {
  date: string;
  event: string;
  importance: 'high' | 'medium' | 'low';
  status: 'completed' | 'pending' | 'upcoming';
  category: 'filing' | 'payment' | 'compliance' | 'planning';
}

interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  category: 'tax_saving' | 'investment' | 'compliance' | 'planning' | 'operational';
  title: string;
  description: string;
  potential_savings: string;
  timeline: string;
  complexity: 'easy' | 'medium' | 'complex';
}

interface TaxRegimeData {
  old_regime: {
    taxable_income: string;
    tax_liability: string;
    effective_rate: string;
    deductions_used: string[];
    final_amount: string;
  };
  new_regime: {
    taxable_income: string;
    tax_liability: string;
    effective_rate: string;
    deductions_used: string[];
    final_amount: string;
  };
  recommendation: 'old' | 'new';
  savings_amount: string;
  savings_percentage: string;
}

interface HealthCategory {
  category: 'profitability' | 'liquidity' | 'solvency' | 'efficiency';
  score: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
  key_indicator: string;
}

interface FinancialHealthData {
  overall_score: number;
  categories: HealthCategory[];
}

interface ExpenseItem {
  category: string;
  amount: string;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

interface IncomeSource {
  source: string;
  amount: string;
  percentage: number;
  tax_treatment: string;
}

interface BenchmarkItem {
  metric: string;
  your_value: string;
  industry_average: string;
  performance: 'above' | 'at' | 'below';
  recommendation: string;
}

interface BusinessKPIs {
  revenue_growth: {
    value: string;
    trend: 'up' | 'down' | 'stable';
    period: string;
  };
  profit_margins: {
    gross: number;
    ebitda: number;
    net: number;
  };
  efficiency_ratios: {
    inventory_turnover: number;
    receivables_turnover: number;
    asset_turnover: number;
  };
  liquidity_ratios: {
    current_ratio: number;
    quick_ratio: number;
    cash_ratio: number;
  };
  leverage_ratios: {
    debt_to_equity: number;
    interest_coverage: number;
    debt_service_coverage: number;
  };
}

interface QuarterlyPerformance {
  Q1: {
    revenue: number;
    expenses: number;
    profit: number;
    margin: number;
    growth: number;
  };
  Q2: {
    revenue: number;
    expenses: number;
    profit: number;
    margin: number;
    growth: number;
  };
  Q3: {
    revenue: number;
    expenses: number;
    profit: number;
    margin: number;
    growth: number;
  };
  Q4: {
    revenue: number;
    expenses: number;
    profit: number;
    margin: number;
    growth: number;
  };
  year_over_year: {
    revenue_growth: number;
    profit_growth: number;
    margin_improvement: number;
  };
  seasonality_patterns: {
    peak_quarter: string;
    weak_quarter: string;
    seasonal_variance: number;
  };
}

interface CostStructure {
  total_costs: number;
  cost_breakdown: {
    category: string;
    amount: number;
    percentage: number;
    optimization_potential: number;
    priority: 'high' | 'medium' | 'low';
    recommendations: string[];
  }[];
  cost_efficiency_score: number;
  optimization_opportunities: {
    immediate: any[];
    medium_term: any[];
    long_term: any[];
  };
  benchmark_comparison: {
    industry_average: number;
    position: 'better' | 'average' | 'needs_improvement';
  };
}

interface AssetBreakdown {
  total_assets: number;
  asset_categories: {
    category: string;
    current_assets: number;
    non_current_assets: number;
    total: number;
    liquidity_score: number;
    growth_potential: string;
    risk_level: 'low' | 'medium' | 'high';
  }[];
  liquidity_analysis: {
    highly_liquid: number;
    moderately_liquid: number;
    illiquid: number;
  };
  asset_efficiency: {
    asset_turnover: number;
    roa: number;
    asset_utilization: number;
  };
  investment_recommendations: {
    category: string;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
    potential_impact: string;
  }[];
}

interface PictorialData {
  key_metrics: KeyMetric[];
  tax_regime_comparison?: TaxRegimeData;
  financial_health_score?: FinancialHealthData;
  charts_data: ChartData[];
  expense_breakdown: ExpenseItem[];
  income_sources: IncomeSource[];
  highlights: Highlight[];
  risk_alerts: RiskAlert[];
  compliance_status: ComplianceItem[];
  timeline_events: TimelineEvent[];
  recommendations: Recommendation[];
  benchmark_analysis: BenchmarkItem[];
  business_kpis?: BusinessKPIs;
  quarterly_performance?: QuarterlyPerformance;
  cost_structure?: CostStructure;
  asset_breakdown?: AssetBreakdown;
}

interface PictorialDashboardProps {
  markdownContent: string;
  reportType: string;
}

export default function PictorialDashboard({ markdownContent, reportType }: PictorialDashboardProps) {
  const [data, setData] = useState<PictorialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    extractPictorialData();
  }, [markdownContent, reportType]);

  // Helper function to get fallback data based on user type
  const getFallbackDataByUserType = (userType: string): PictorialData => {
    const baseData: PictorialData = {
      key_metrics: [
        {
          title: "Total Income",
          value: "₹0",
          unit: "",
          trend: 'stable' as const,
          color: 'green' as const,
          icon: 'dollar' as const,
          description: "Annual income from all sources"
        }
      ],
      charts_data: [
        {
          type: 'pie' as const,
          title: 'Sample Distribution',
          data: {
            labels: ['Category A', 'Category B', 'Category C'],
            values: [1, 1, 1]
          },
          color_scheme: 'blue',
          description: 'Sample chart showing data distribution',
          insights: ['Sample insight for demonstration']
        }
      ],
      highlights: [
        {
          type: 'info' as const,
          title: 'Dashboard Ready',
          message: 'Components will populate with your CA report data',
          icon: 'check'
        }
      ],
      risk_alerts: [],
      compliance_status: [],
      timeline_events: [],
      recommendations: [],
      benchmark_analysis: [],
      expense_breakdown: [],
      income_sources: []
    };

    switch (userType.toLowerCase()) {
      case 'salaried':
        return {
          ...baseData,
          tax_regime_comparison: {
            old_regime: {
              taxable_income: "₹0",
              tax_liability: "₹0",
              effective_rate: "0%",
              deductions_used: [],
              final_amount: "₹0"
            },
            new_regime: {
              taxable_income: "₹0",
              tax_liability: "₹0",
              effective_rate: "0%",
              deductions_used: [],
              final_amount: "₹0"
            },
            recommendation: 'new' as const,
            savings_amount: "₹0",
            savings_percentage: "0%"
          }
        };

      case 'self_employed':
      case 'business':
      case 'corporate':
        return {
          ...baseData,
          financial_health_score: {
            overall_score: 0,
            categories: [
              { category: 'profitability' as const, score: 0, status: 'average' as const, key_indicator: 'Revenue growth' },
              { category: 'liquidity' as const, score: 0, status: 'average' as const, key_indicator: 'Current ratio' },
              { category: 'solvency' as const, score: 0, status: 'average' as const, key_indicator: 'Debt to equity' },
              { category: 'efficiency' as const, score: 0, status: 'average' as const, key_indicator: 'Asset turnover' }
            ]
          },
          business_kpis: {
            revenue_growth: { value: "0%", trend: 'stable' as const, period: "Annual" },
            profit_margins: { gross: 0, ebitda: 0, net: 0 },
            efficiency_ratios: { inventory_turnover: 0, receivables_turnover: 0, asset_turnover: 0 },
            liquidity_ratios: { current_ratio: 0, quick_ratio: 0, cash_ratio: 0 },
            leverage_ratios: { debt_to_equity: 0, interest_coverage: 0, debt_service_coverage: 0 }
          },
          quarterly_performance: {
            Q1: { revenue: 0, expenses: 0, profit: 0, margin: 0, growth: 0 },
            Q2: { revenue: 0, expenses: 0, profit: 0, margin: 0, growth: 0 },
            Q3: { revenue: 0, expenses: 0, profit: 0, margin: 0, growth: 0 },
            Q4: { revenue: 0, expenses: 0, profit: 0, margin: 0, growth: 0 },
            year_over_year: { revenue_growth: 0, profit_growth: 0, margin_improvement: 0 },
            seasonality_patterns: { peak_quarter: 'Q4', weak_quarter: 'Q1', seasonal_variance: 0 }
          },
          cost_structure: {
            total_costs: 0,
            cost_breakdown: [],
            cost_efficiency_score: 0,
            optimization_opportunities: { immediate: [], medium_term: [], long_term: [] },
            benchmark_comparison: { industry_average: 0, position: 'average' as const }
          },
          asset_breakdown: {
            total_assets: 0,
            asset_categories: [],
            liquidity_analysis: { highly_liquid: 0, moderately_liquid: 0, illiquid: 0 },
            asset_efficiency: { asset_turnover: 0, roa: 0, asset_utilization: 0 },
            investment_recommendations: []
          }
        };

      default:
        return baseData;
    }
  };

  const extractPictorialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://127.0.0.1:8000/api/extract-pictorial-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          markdown_content: markdownContent,
          report_type: reportType
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const pictorialData = await response.json();
      
      // Merge API data with fallback data to ensure all components have data
      const fallbackData = getFallbackDataByUserType(reportType);
      const mergedData = { ...fallbackData, ...pictorialData };
      
      setData(mergedData);
    } catch (err) {
      console.error('Error extracting pictorial data:', err);
      
      // Even on error, provide fallback data so components can still render
      const fallbackData = getFallbackDataByUserType(reportType);
      setData(fallbackData);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    const icons = {
      dollar: DollarSign,
      percent: Percent,
      calendar: Calendar,
      user: User,
      building: Building,
      chart: BarChart3,
      check: CheckCircle,
      alert: AlertTriangle,
      clock: Clock,
      target: Target,
      lightbulb: Lightbulb,
      shield: Shield
    };
    return icons[iconName as keyof typeof icons] || BarChart3;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Minus;
    }
  };

  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border' = 'bg') => {
    const colorMap = {
      green: { bg: 'bg-green-500', text: 'text-green-600', border: 'border-green-200' },
      red: { bg: 'bg-red-500', text: 'text-red-600', border: 'border-red-200' },
      blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200' },
      orange: { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-200' },
      purple: { bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-200' }
    };
    return colorMap[color as keyof typeof colorMap]?.[type] || colorMap.blue[type];
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full py-8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing report for visual insights...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full py-8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Unable to Generate Visual Analysis
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={extractPictorialData} variant="outline" className="border-red-300">
                Retry Analysis
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full py-8 bg-gradient-to-br from-amber-50 to-orange-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Toggle */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              📊 Visual Analysis Dashboard
            </h2>
            <p className="text-gray-600">
              AI-powered insights and visualizations from your CA report
            </p>
          </div>
          <Button
            onClick={() => setIsVisible(!isVisible)}
            variant="outline"
            className="border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            {isVisible ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {isVisible ? 'Hide Dashboard' : 'Show Dashboard'}
          </Button>
        </div>

        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Demo Mode Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Lightbulb className="h-5 w-5 text-amber-600" />
                        <div>
                          <h4 className="font-semibold text-amber-800">Demo Mode Active</h4>
                          <p className="text-sm text-amber-700">
                            Showing dashboard preview with sample data. Components will populate with real data when analysis completes.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              {/* Tax Regime Comparison - For Salaried */}
              {reportType.toLowerCase() === 'salaried' && data.tax_regime_comparison && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <TaxRegimeComparison data={data.tax_regime_comparison} />
                </motion.section>
              )}

              {/* Income & Expense Breakdown */}
              {((data.income_sources && data.income_sources.length > 0) || 
                (data.expense_breakdown && data.expense_breakdown.length > 0)) && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                >
                  <IncomeExpenseBreakdown
                    incomeData={data.income_sources || []}
                    expenseData={data.expense_breakdown || []}
                  />
                </motion.section>
              )}

              {/* Business-Specific Professional Components */}
              {(['self_employed', 'business', 'corporate'].includes(reportType.toLowerCase())) && data.business_kpis && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.09 }}
                >
                  <BusinessKPIsDashboard data={data.business_kpis} className="mb-8" />
                </motion.section>
              )}

              {(['self_employed', 'business', 'corporate'].includes(reportType.toLowerCase())) && data.quarterly_performance && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <QuarterlyDashboard data={data.quarterly_performance} className="mb-8" />
                </motion.section>
              )}

              {(['self_employed', 'business', 'corporate'].includes(reportType.toLowerCase())) && data.cost_structure && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.11 }}
                >
                  <CostStructureAnalysis data={data.cost_structure} className="mb-8" />
                </motion.section>
              )}

              {(['self_employed', 'business', 'corporate'].includes(reportType.toLowerCase())) && data.asset_breakdown && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                >
                  <AssetBreakdownAnalysis data={data.asset_breakdown} className="mb-8" />
                </motion.section>
              )}

              {/* Key Metrics */}
              {data.key_metrics && data.key_metrics.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <BarChart3 className="h-6 w-6 mr-2 text-amber-600" />
                    Key Financial Metrics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {data.key_metrics.map((metric, index) => {
                      const IconComponent = getIcon(metric.icon);
                      const TrendIcon = getTrendIcon(metric.trend);
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="hover:shadow-lg transition-shadow duration-300 border-amber-200">
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <IconComponent className={`h-8 w-8 ${getColorClasses(metric.color, 'text')}`} />
                                <TrendIcon className={`h-5 w-5 ${
                                  metric.trend === 'up' ? 'text-green-500' : 
                                  metric.trend === 'down' ? 'text-red-500' : 
                                  'text-gray-400'
                                }`} />
                              </div>
                              <CardTitle className="text-sm font-medium text-gray-600">
                                {metric.title}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold text-gray-900 mb-1">
                                {metric.value}
                                <span className="text-sm font-normal text-gray-500 ml-1">
                                  {metric.unit}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600">{metric.description}</p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {/* Highlights */}
              {data.highlights && data.highlights.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <Target className="h-6 w-6 mr-2 text-amber-600" />
                    Key Highlights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.highlights.map((highlight, index) => {
                      const IconComponent = getIcon(highlight.icon);
                      const alertColors = {
                        success: 'border-green-200 bg-green-50',
                        warning: 'border-orange-200 bg-orange-50',
                        info: 'border-blue-200 bg-blue-50',
                        error: 'border-red-200 bg-red-50'
                      };
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className={`${alertColors[highlight.type]} border-2`}>
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-3">
                                <IconComponent className="h-6 w-6 mt-0.5 text-current" />
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-1">
                                    {highlight.title}
                                  </h4>
                                  <p className="text-sm text-gray-700">
                                    {highlight.message}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {/* Charts */}
              {data.charts_data && data.charts_data.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <BarChart3 className="h-6 w-6 mr-2 text-amber-600" />
                    Financial Visualizations
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {data.charts_data?.filter(chart => 
                      chart && chart.data && chart.data.values && chart.data.values.length > 0
                    ).map((chart, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <UniversalChart 
                          title={chart.title || 'Chart'}
                          type={chart.type as any}
                          data={chart.data}
                          description={chart.description}
                          insights={chart.insights?.[0]}
                          preference="aesthetics"
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Risk Alerts */}
              {data.risk_alerts && data.risk_alerts.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <Shield className="h-6 w-6 mr-2 text-amber-600" />
                    Risk Analysis
                  </h3>
                  <div className="space-y-4">
                    {data.risk_alerts.map((alert, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="border-l-4 border-l-red-500">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge className={getRiskLevelColor(alert.level)}>
                                    {alert.level.toUpperCase()} RISK
                                  </Badge>
                                  <h4 className="font-semibold text-gray-900">
                                    {alert.title}
                                  </h4>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">
                                  {alert.description}
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  Action Required: {alert.action_required}
                                </p>
                              </div>
                              <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Recommendations */}
              {data.recommendations && data.recommendations.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <Lightbulb className="h-6 w-6 mr-2 text-amber-600" />
                    AI Recommendations
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {data.recommendations.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="hover:shadow-lg transition-shadow duration-300">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <Badge variant="outline" className="mb-2">
                                  {rec.category.replace('_', ' ').toUpperCase()}
                                </Badge>
                                <CardTitle className="text-lg">
                                  {rec.title}
                                </CardTitle>
                              </div>
                              <Badge className={
                                rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                                rec.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                                'bg-green-100 text-green-800'
                              }>
                                {rec.priority.toUpperCase()}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-700 mb-4">
                              {rec.description}
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                              <div>
                                <span className="font-medium text-gray-900">Potential Savings:</span>
                                <p className="text-green-600 font-semibold">{rec.potential_savings}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-900">Timeline:</span>
                                <p className="text-blue-600">{rec.timeline}</p>
                              </div>
                            </div>
                            {rec.complexity && (
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-600">Complexity:</span>
                                <Badge className={
                                  rec.complexity === 'easy' ? 'bg-green-100 text-green-800' :
                                  rec.complexity === 'medium' ? 'bg-orange-100 text-orange-800' :
                                  'bg-red-100 text-red-800'
                                }>
                                  {rec.complexity.toUpperCase()}
                                </Badge>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}