"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  DollarSign, 
  BarChart3, 
  PieChart,
  Activity,
  Target
} from 'lucide-react';

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

interface BusinessKPIsDashboardProps {
  data: BusinessKPIs;
  className?: string;
}

export default function BusinessKPIsDashboard({ data, className = "" }: BusinessKPIsDashboardProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Activity;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getRatioStatus = (value: number, type: 'margin' | 'liquidity' | 'efficiency' | 'leverage') => {
    switch (type) {
      case 'margin':
        if (value >= 20) return { status: 'excellent', color: 'bg-green-100 text-green-800' };
        if (value >= 10) return { status: 'good', color: 'bg-blue-100 text-blue-800' };
        if (value >= 5) return { status: 'average', color: 'bg-orange-100 text-orange-800' };
        return { status: 'poor', color: 'bg-red-100 text-red-800' };
      
      case 'liquidity':
        if (value >= 1.5) return { status: 'healthy', color: 'bg-green-100 text-green-800' };
        if (value >= 1.0) return { status: 'adequate', color: 'bg-blue-100 text-blue-800' };
        if (value >= 0.8) return { status: 'tight', color: 'bg-orange-100 text-orange-800' };
        return { status: 'critical', color: 'bg-red-100 text-red-800' };
      
      case 'efficiency':
        if (value >= 4) return { status: 'efficient', color: 'bg-green-100 text-green-800' };
        if (value >= 2) return { status: 'good', color: 'bg-blue-100 text-blue-800' };
        if (value >= 1) return { status: 'average', color: 'bg-orange-100 text-orange-800' };
        return { status: 'poor', color: 'bg-red-100 text-red-800' };
      
      case 'leverage':
        if (value <= 0.5) return { status: 'conservative', color: 'bg-green-100 text-green-800' };
        if (value <= 1.0) return { status: 'moderate', color: 'bg-blue-100 text-blue-800' };
        if (value <= 2.0) return { status: 'leveraged', color: 'bg-orange-100 text-orange-800' };
        return { status: 'high risk', color: 'bg-red-100 text-red-800' };
      
      default:
        return { status: 'unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className={`w-full space-y-6 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="border-2 border-purple-200 shadow-xl overflow-hidden p-0 gap-0">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-6 m-0 gap-2">
            <CardTitle className="flex items-center text-2xl mb-0">
              <Building2 className="h-6 w-6 mr-3" />
              Business Performance Dashboard
            </CardTitle>
            <p className="text-purple-100 mt-2 mb-0">
              Comprehensive KPI analysis for strategic business insights
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-6">
            {/* Revenue Growth */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                Revenue Performance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-purple-50 to-indigo-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Growth Rate</p>
                        <p className="text-2xl font-bold text-purple-600">{data.revenue_growth.value}</p>
                        <p className="text-xs text-gray-500">{data.revenue_growth.period}</p>
                      </div>
                      <div className={`p-2 rounded-full ${getTrendColor(data.revenue_growth.trend)}`}>
                        {React.createElement(getTrendIcon(data.revenue_growth.trend), { className: "h-6 w-6" })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">Gross Margin</p>
                    <p className="text-2xl font-bold text-green-600">{data.profit_margins.gross.toFixed(1)}%</p>
                    <Badge className={getRatioStatus(data.profit_margins.gross, 'margin').color}>
                      {getRatioStatus(data.profit_margins.gross, 'margin').status}
                    </Badge>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">Net Margin</p>
                    <p className="text-2xl font-bold text-blue-600">{data.profit_margins.net.toFixed(1)}%</p>
                    <Badge className={getRatioStatus(data.profit_margins.net, 'margin').color}>
                      {getRatioStatus(data.profit_margins.net, 'margin').status}
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Financial Ratios Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Liquidity Ratios */}
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg text-blue-600">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Liquidity Ratios
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Current Ratio</span>
                      <div className="text-right">
                        <span className="font-semibold">{data.liquidity_ratios.current_ratio.toFixed(2)}</span>
                        <Badge className={`ml-2 ${getRatioStatus(data.liquidity_ratios.current_ratio, 'liquidity').color}`}>
                          {getRatioStatus(data.liquidity_ratios.current_ratio, 'liquidity').status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Quick Ratio</span>
                      <div className="text-right">
                        <span className="font-semibold">{data.liquidity_ratios.quick_ratio.toFixed(2)}</span>
                        <Badge className={`ml-2 ${getRatioStatus(data.liquidity_ratios.quick_ratio, 'liquidity').color}`}>
                          {getRatioStatus(data.liquidity_ratios.quick_ratio, 'liquidity').status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Cash Ratio</span>
                      <div className="text-right">
                        <span className="font-semibold">{data.liquidity_ratios.cash_ratio.toFixed(2)}</span>
                        <Badge className={`ml-2 ${getRatioStatus(data.liquidity_ratios.cash_ratio, 'liquidity').color}`}>
                          {getRatioStatus(data.liquidity_ratios.cash_ratio, 'liquidity').status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Efficiency Ratios */}
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg text-green-600">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Efficiency Ratios
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Inventory Turnover</span>
                      <div className="text-right">
                        <span className="font-semibold">{data.efficiency_ratios.inventory_turnover.toFixed(1)}×</span>
                        <Badge className={`ml-2 ${getRatioStatus(data.efficiency_ratios.inventory_turnover, 'efficiency').color}`}>
                          {getRatioStatus(data.efficiency_ratios.inventory_turnover, 'efficiency').status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Receivables Turnover</span>
                      <div className="text-right">
                        <span className="font-semibold">{data.efficiency_ratios.receivables_turnover.toFixed(1)}×</span>
                        <Badge className={`ml-2 ${getRatioStatus(data.efficiency_ratios.receivables_turnover, 'efficiency').color}`}>
                          {getRatioStatus(data.efficiency_ratios.receivables_turnover, 'efficiency').status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Asset Turnover</span>
                      <div className="text-right">
                        <span className="font-semibold">{data.efficiency_ratios.asset_turnover.toFixed(1)}×</span>
                        <Badge className={`ml-2 ${getRatioStatus(data.efficiency_ratios.asset_turnover, 'efficiency').color}`}>
                          {getRatioStatus(data.efficiency_ratios.asset_turnover, 'efficiency').status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Leverage Ratios */}
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg text-orange-600">
                    <Target className="h-5 w-5 mr-2" />
                    Leverage Ratios
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Debt-to-Equity</span>
                      <div className="text-right">
                        <span className="font-semibold">{data.leverage_ratios.debt_to_equity.toFixed(2)}</span>
                        <Badge className={`ml-2 ${getRatioStatus(data.leverage_ratios.debt_to_equity, 'leverage').color}`}>
                          {getRatioStatus(data.leverage_ratios.debt_to_equity, 'leverage').status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Interest Coverage</span>
                      <div className="text-right">
                        <span className="font-semibold">{data.leverage_ratios.interest_coverage.toFixed(1)}×</span>
                        <Badge className="ml-2 bg-green-100 text-green-800">
                          {data.leverage_ratios.interest_coverage >= 2.5 ? 'safe' : 'risky'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Debt Service Coverage</span>
                      <div className="text-right">
                        <span className="font-semibold">{data.leverage_ratios.debt_service_coverage.toFixed(1)}×</span>
                        <Badge className="ml-2 bg-green-100 text-green-800">
                          {data.leverage_ratios.debt_service_coverage >= 1.25 ? 'healthy' : 'stressed'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200"
            >
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-purple-600" />
                Business Performance Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-700">
                    <strong>Financial Health:</strong> {data.liquidity_ratios.current_ratio >= 1.5 ? 'Strong liquidity position' : 'Monitor liquidity closely'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <strong>Operational Efficiency:</strong> {data.efficiency_ratios.asset_turnover >= 1.0 ? 'Good asset utilization' : 'Improve asset efficiency'}
                  </p>
                </div>
              </div>
              <div className="mt-3 p-3 bg-white rounded border border-purple-100">
                <p className="text-xs text-gray-600">
                  💡 <strong>Strategic Insight:</strong> Focus on improving {
                    data.profit_margins.net < 10 ? 'profit margins through cost optimization' :
                    data.liquidity_ratios.current_ratio < 1.2 ? 'working capital management' :
                    'operational efficiency and market expansion'
                  } for sustainable growth.
                </p>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}