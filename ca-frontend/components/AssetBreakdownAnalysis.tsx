"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Coins, 
  TrendingUp,
  PieChart,
  BarChart3,
  Shield,
  Zap,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  DollarSign
} from 'lucide-react';

interface AssetCategory {
  category: string;
  current_assets: number;
  non_current_assets: number;
  total: number;
  liquidity_score: number;
  growth_potential: string;
  risk_level: 'low' | 'medium' | 'high';
}

interface AssetBreakdown {
  total_assets: number;
  asset_categories: AssetCategory[];
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

interface AssetBreakdownProps {
  data: AssetBreakdown;
  className?: string;
}

export default function AssetBreakdownAnalysis({ data, className = "" }: AssetBreakdownProps) {
  // Add safety check for data structure
  if (!data || typeof data !== 'object') {
    return (
      <div className={`w-full p-6 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No asset breakdown data available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Safe data access with fallbacks
  const safeTotalAssets = data.total_assets || 0;
  const safeAssetCategories = data.asset_categories || [];
  const safeLiquidityAnalysis = data.liquidity_analysis || {
    highly_liquid: 0,
    moderately_liquid: 0,
    illiquid: 0
  };
  const safeAssetEfficiency = data.asset_efficiency || {
    asset_turnover: 0,
    roa: 0,
    asset_utilization: 0
  };
  const safeInvestmentRecommendations = data.investment_recommendations || [];

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getLiquidityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getLiquidityBadge = (score: number) => {
    if (score >= 80) return { text: 'Highly Liquid', color: 'bg-green-100 text-green-800' };
    if (score >= 60) return { text: 'Moderately Liquid', color: 'bg-blue-100 text-blue-800' };
    if (score >= 40) return { text: 'Low Liquidity', color: 'bg-orange-100 text-orange-800' };
    return { text: 'Illiquid', color: 'bg-red-100 text-red-800' };
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return CheckCircle;
      case 'medium': return AlertCircle;
      case 'high': return AlertCircle;
      default: return Shield;
    }
  };

  const getGrowthIcon = (growth: string) => {
    if (growth.toLowerCase().includes('high')) return TrendingUp;
    if (growth.toLowerCase().includes('stable')) return Target;
    return Clock;
  };

  const getEfficiencyScore = (value: number, type: 'turnover' | 'roa' | 'utilization') => {
    switch (type) {
      case 'turnover':
        if (value >= 2.0) return { text: 'Excellent', color: 'text-green-600' };
        if (value >= 1.5) return { text: 'Good', color: 'text-blue-600' };
        if (value >= 1.0) return { text: 'Average', color: 'text-orange-600' };
        return { text: 'Poor', color: 'text-red-600' };
      
      case 'roa':
        if (value >= 15) return { text: 'Excellent', color: 'text-green-600' };
        if (value >= 10) return { text: 'Good', color: 'text-blue-600' };
        if (value >= 5) return { text: 'Average', color: 'text-orange-600' };
        return { text: 'Poor', color: 'text-red-600' };
      
      case 'utilization':
        if (value >= 80) return { text: 'Optimal', color: 'text-green-600' };
        if (value >= 60) return { text: 'Good', color: 'text-blue-600' };
        if (value >= 40) return { text: 'Moderate', color: 'text-orange-600' };
        return { text: 'Low', color: 'text-red-600' };
      
      default:
        return { text: 'Unknown', color: 'text-gray-600' };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`w-full space-y-6 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="border-2 border-indigo-200 shadow-xl overflow-hidden p-0 gap-0">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 m-0 gap-2">
            <CardTitle className="flex items-center text-2xl mb-0">
              <Building className="h-6 w-6 mr-3" />
              Asset Portfolio Analysis
            </CardTitle>
            <p className="text-indigo-100 mt-2 mb-0">
              Comprehensive asset allocation and liquidity assessment
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-6">
            {/* Asset Overview */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-indigo-600" />
                Asset Portfolio Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total Assets</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {formatCurrency(safeTotalAssets)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Portfolio Value</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Asset Turnover</p>
                      <p className={`text-2xl font-bold ${getEfficiencyScore(safeAssetEfficiency.asset_turnover, 'turnover').color}`}>
                        {safeAssetEfficiency.asset_turnover.toFixed(2)}×
                      </p>
                      <Badge className={getEfficiencyScore(safeAssetEfficiency.asset_turnover, 'turnover').color + ' bg-opacity-10'}>
                        {getEfficiencyScore(safeAssetEfficiency.asset_turnover, 'turnover').text}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">ROA</p>
                      <p className={`text-2xl font-bold ${getEfficiencyScore(safeAssetEfficiency.roa, 'roa').color}`}>
                        {safeAssetEfficiency.roa.toFixed(1)}%
                      </p>
                      <Badge className={getEfficiencyScore(safeAssetEfficiency.roa, 'roa').color + ' bg-opacity-10'}>
                        {getEfficiencyScore(safeAssetEfficiency.roa, 'roa').text}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-orange-50 to-red-50">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Utilization</p>
                      <p className={`text-2xl font-bold ${getEfficiencyScore(safeAssetEfficiency.asset_utilization, 'utilization').color}`}>
                        {safeAssetEfficiency.asset_utilization.toFixed(1)}%
                      </p>
                      <Badge className={getEfficiencyScore(safeAssetEfficiency.asset_utilization, 'utilization').color + ' bg-opacity-10'}>
                        {getEfficiencyScore(safeAssetEfficiency.asset_utilization, 'utilization').text}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Liquidity Analysis */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Coins className="h-5 w-5 mr-2 text-indigo-600" />
                Liquidity Distribution
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Highly Liquid</p>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(safeLiquidityAnalysis.highly_liquid)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {safeTotalAssets > 0 ? ((safeLiquidityAnalysis.highly_liquid / safeTotalAssets) * 100).toFixed(1) : '0'}% of total
                        </p>
                      </div>
                      <div className="text-green-600">
                        <Zap className="h-8 w-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Moderately Liquid</p>
                        <p className="text-xl font-bold text-blue-600">
                          {formatCurrency(safeLiquidityAnalysis.moderately_liquid)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {safeTotalAssets > 0 ? ((safeLiquidityAnalysis.moderately_liquid / safeTotalAssets) * 100).toFixed(1) : '0'}% of total
                        </p>
                      </div>
                      <div className="text-blue-600">
                        <Clock className="h-8 w-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-red-50 to-pink-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Illiquid</p>
                        <p className="text-xl font-bold text-red-600">
                          {formatCurrency(safeLiquidityAnalysis.illiquid)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {safeTotalAssets > 0 ? ((safeLiquidityAnalysis.illiquid / safeTotalAssets) * 100).toFixed(1) : '0'}% of total
                        </p>
                      </div>
                      <div className="text-red-600">
                        <Shield className="h-8 w-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Asset Categories Breakdown */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                Asset Categories Analysis
              </h3>
              <div className="space-y-4">
                {safeAssetCategories.map((category, index) => (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <Card className="bg-gradient-to-r from-gray-50 to-slate-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-full mr-3 ${getRiskColor(category.risk_level)}`}>
                              {React.createElement(getRiskIcon(category.risk_level), { className: "h-5 w-5" })}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">{category.category}</h4>
                              <p className="text-sm text-gray-600">
                                Total: {formatCurrency(category.total)} • 
                                {safeTotalAssets > 0 ? ((category.total / safeTotalAssets) * 100).toFixed(1) : '0'}% of portfolio
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getRiskColor(category.risk_level)}>
                              {category.risk_level} risk
                            </Badge>
                            <div className="mt-1 flex items-center">
                              {React.createElement(getGrowthIcon(category.growth_potential), { className: "h-4 w-4 mr-1 text-gray-500" })}
                              <span className="text-xs text-gray-500">{category.growth_potential}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white p-3 rounded border border-gray-200">
                            <p className="text-xs text-gray-500">Current Assets</p>
                            <p className="text-lg font-semibold text-blue-600">
                              {formatCurrency(category.current_assets)}
                            </p>
                          </div>
                          
                          <div className="bg-white p-3 rounded border border-gray-200">
                            <p className="text-xs text-gray-500">Non-Current Assets</p>
                            <p className="text-lg font-semibold text-purple-600">
                              {formatCurrency(category.non_current_assets)}
                            </p>
                          </div>
                          
                          <div className="bg-white p-3 rounded border border-gray-200">
                            <p className="text-xs text-gray-500">Liquidity Score</p>
                            <div className="flex items-center justify-between">
                              <span className={`text-lg font-semibold ${getLiquidityColor(category.liquidity_score)}`}>
                                {category.liquidity_score}/100
                              </span>
                              <Badge className={getLiquidityBadge(category.liquidity_score).color}>
                                {getLiquidityBadge(category.liquidity_score).text}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        {/* Asset allocation visualization */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Current vs Non-Current Split</span>
                            <span>{((category.current_assets / category.total) * 100).toFixed(1)}% : {((category.non_current_assets / category.total) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-l-full transition-all duration-500"
                              style={{ width: `${(category.current_assets / category.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Investment Recommendations */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-indigo-600" />
                Investment Recommendations
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {safeInvestmentRecommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <Card className="h-full">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-800">{rec.category}</h4>
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority} priority
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{rec.recommendation}</p>
                        <div className="p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-500">
                            <strong>Potential Impact:</strong> {rec.potential_impact}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Strategic Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200"
            >
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-indigo-600" />
                Asset Management Strategy
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-700">
                    <strong>Liquidity Position:</strong> {
                      safeTotalAssets > 0 && ((safeLiquidityAnalysis.highly_liquid / safeTotalAssets) * 100) >= 30 ?
                      'Strong liquidity with good cash availability' :
                      'Consider improving liquid asset allocation'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <strong>Asset Efficiency:</strong> {
                      safeAssetEfficiency.asset_turnover >= 1.5 ?
                      'Efficient asset utilization generating good returns' :
                      'Focus on improving asset productivity and turnover'
                    }
                  </p>
                </div>
              </div>
              <div className="mt-3 p-3 bg-white rounded border border-indigo-100">
                <p className="text-xs text-gray-600">
                  💡 <strong>Strategic Focus:</strong> {
                    safeAssetEfficiency.roa >= 10 ?
                    'Maintain current asset allocation strategy and explore growth opportunities' :
                    safeAssetEfficiency.asset_utilization >= 60 ?
                    'Optimize asset mix to improve returns while maintaining liquidity' :
                    'Comprehensive asset restructuring needed to improve efficiency and returns'
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