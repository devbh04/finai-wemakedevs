"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Target,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface QuarterData {
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
  growth: number;
}

interface QuarterlyPerformance {
  Q1: QuarterData;
  Q2: QuarterData;
  Q3: QuarterData;
  Q4: QuarterData;
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

interface QuarterlyDashboardProps {
  data: QuarterlyPerformance;
  className?: string;
}

export default function QuarterlyDashboard({ data, className = "" }: QuarterlyDashboardProps) {
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'] as const;
  
  // Add safety check for data structure
  if (!data || typeof data !== 'object') {
    return (
      <div className={`w-full p-6 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No quarterly performance data available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Safe year-over-year data
  const yearOverYearData = data.year_over_year || {
    revenue_growth: 0,
    profit_growth: 0,
    margin_improvement: 0
  };

  // Safe seasonality patterns data
  const seasonalityData = data.seasonality_patterns || {
    peak_quarter: 'Q4',
    weak_quarter: 'Q1',
    seasonal_variance: 0
  };
  
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 5) return ArrowUp;
    if (growth < -5) return ArrowDown;
    return Minus;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 5) return 'text-green-500';
    if (growth < -5) return 'text-red-500';
    return 'text-gray-500';
  };

  const getPerformanceBadge = (margin: number) => {
    if (margin >= 20) return { text: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (margin >= 15) return { text: 'Very Good', color: 'bg-blue-100 text-blue-800' };
    if (margin >= 10) return { text: 'Good', color: 'bg-orange-100 text-orange-800' };
    if (margin >= 5) return { text: 'Average', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Below Par', color: 'bg-red-100 text-red-800' };
  };

  // Safe access to quarterly data with fallbacks
  // Safe data access helper function
  const getQuarterData = (quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'): QuarterData => {
    const quarterData = data[quarter];
    return quarterData || {
      revenue: 0,
      expenses: 0,
      profit: 0,
      margin: 0,
      growth: 0
    };
  };

  const validQuarters = quarters.filter(q => {
    const quarterData = data[q];
    return quarterData && typeof quarterData === 'object' && 'revenue' in quarterData;
  });
  
  const revenues = validQuarters.map(q => getQuarterData(q).revenue).filter(r => typeof r === 'number' && !isNaN(r));
  
  const maxRevenue = revenues.length > 0 ? Math.max(...revenues) : 0;
  const minRevenue = revenues.length > 0 ? Math.min(...revenues) : 0;

  return (
    <div className={`w-full space-y-6 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="border-2 border-blue-200 shadow-xl overflow-hidden p-0 gap-0">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 m-0 gap-2">
            <CardTitle className="flex items-center text-2xl mb-0">
              <Calendar className="h-6 w-6 mr-3" />
              Quarterly Performance Analysis
            </CardTitle>
            <p className="text-blue-100 mt-2 mb-0">
              Detailed quarterly breakdown and seasonal trends analysis
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-6">
            {/* Year-over-Year Summary */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Annual Performance Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Revenue Growth</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {yearOverYearData.revenue_growth > 0 ? '+' : ''}{yearOverYearData.revenue_growth.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">Year-over-Year</p>
                      </div>
                      <div className={`p-2 rounded-full ${getGrowthColor(yearOverYearData.revenue_growth)}`}>
                        {React.createElement(getGrowthIcon(yearOverYearData.revenue_growth), { className: "h-6 w-6" })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Profit Growth</p>
                        <p className="text-2xl font-bold text-green-600">
                          {yearOverYearData.profit_growth > 0 ? '+' : ''}{yearOverYearData.profit_growth.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">Year-over-Year</p>
                      </div>
                      <div className={`p-2 rounded-full ${getGrowthColor(yearOverYearData.profit_growth)}`}>
                        {React.createElement(getGrowthIcon(yearOverYearData.profit_growth), { className: "h-6 w-6" })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-purple-50 to-indigo-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Margin Change</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {yearOverYearData.margin_improvement > 0 ? '+' : ''}{yearOverYearData.margin_improvement.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">Points Change</p>
                      </div>
                      <div className={`p-2 rounded-full ${getGrowthColor(yearOverYearData.margin_improvement)}`}>
                        {React.createElement(getGrowthIcon(yearOverYearData.margin_improvement), { className: "h-6 w-6" })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quarterly Breakdown */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Quarterly Performance Breakdown
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                {quarters.map((quarter, index) => {
                  const quarterData = getQuarterData(quarter);
                  const isHighest = quarterData.revenue === maxRevenue && maxRevenue > 0;
                  const isLowest = quarterData.revenue === minRevenue && minRevenue > 0 && quarterData.revenue > 0;
                  
                  return (
                    <motion.div
                      key={quarter}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                      <Card className={`h-full ${
                        isHighest ? 'ring-2 ring-green-200 bg-gradient-to-br from-green-50 to-emerald-50' :
                        isLowest ? 'ring-2 ring-red-200 bg-gradient-to-br from-red-50 to-pink-50' :
                        'bg-gradient-to-br from-gray-50 to-slate-50'
                      }`}>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-800">{quarter}</span>
                            {isHighest && <Badge className="bg-green-100 text-green-800">Peak</Badge>}
                            {isLowest && <Badge className="bg-red-100 text-red-800">Low</Badge>}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-500">Revenue</p>
                              <p className="text-lg font-semibold text-blue-600">
                                {formatCurrency(quarterData.revenue)}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-xs text-gray-500">Profit</p>
                              <p className="text-lg font-semibold text-green-600">
                                {formatCurrency(quarterData.profit)}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-xs text-gray-500">Margin</p>
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-semibold text-purple-600">
                                  {quarterData.margin.toFixed(1)}%
                                </span>
                                <Badge className={getPerformanceBadge(quarterData.margin).color}>
                                  {getPerformanceBadge(quarterData.margin).text}
                                </Badge>
                              </div>
                            </div>
                            
                            {quarterData.growth !== 0 && (
                              <div>
                                <p className="text-xs text-gray-500">Growth</p>
                                <div className="flex items-center">
                                  <span className={`text-sm font-semibold ${getGrowthColor(quarterData.growth)}`}>
                                    {quarterData.growth > 0 ? '+' : ''}{quarterData.growth.toFixed(1)}%
                                  </span>
                                  <div className={`ml-1 ${getGrowthColor(quarterData.growth)}`}>
                                    {React.createElement(getGrowthIcon(quarterData.growth), { className: "h-4 w-4" })}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Seasonality Analysis */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Seasonality & Pattern Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-green-600 mb-2">
                        <TrendingUp className="h-8 w-8 mx-auto" />
                      </div>
                      <h4 className="font-semibold text-gray-800">Peak Quarter</h4>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        {seasonalityData.peak_quarter}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Strongest Performance</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-red-50 to-pink-50">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-red-600 mb-2">
                        <TrendingDown className="h-8 w-8 mx-auto" />
                      </div>
                      <h4 className="font-semibold text-gray-800">Weak Quarter</h4>
                      <p className="text-2xl font-bold text-red-600 mt-1">
                        {seasonalityData.weak_quarter}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Needs Attention</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-blue-600 mb-2">
                        <PieChart className="h-8 w-8 mx-auto" />
                      </div>
                      <h4 className="font-semibold text-gray-800">Variance</h4>
                      <p className="text-2xl font-bold text-blue-600 mt-1">
                        {Math.abs(seasonalityData.seasonal_variance).toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {seasonalityData.seasonal_variance < 15 ? 'Stable' : 'High Variation'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Strategic Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200"
            >
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                Quarterly Insights & Recommendations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-700">
                    <strong>Performance Trend:</strong> {
                      yearOverYearData.revenue_growth > 10 ? 'Strong growth trajectory across quarters' :
                      yearOverYearData.revenue_growth > 0 ? 'Steady improvement with growth potential' :
                      'Revenue challenges requiring strategic intervention'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <strong>Seasonality Impact:</strong> {
                      seasonalityData.seasonal_variance < 15 ? 
                      'Consistent performance across quarters' :
                      `High seasonal variation - focus on strengthening ${seasonalityData.weak_quarter}`
                    }
                  </p>
                </div>
              </div>
              <div className="mt-3 p-3 bg-white rounded border border-blue-100">
                <p className="text-xs text-gray-600">
                  💡 <strong>Strategic Focus:</strong> {
                    yearOverYearData.profit_growth > yearOverYearData.revenue_growth ?
                    'Excellent cost management - leverage operational efficiency for expansion' :
                    'Optimize cost structure and pricing strategy to improve profitability'
                  }
                </p>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}