"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  TrendingDown, 
  TrendingUp,
  AlertTriangle,
  Target,
  DollarSign,
  PieChart,
  BarChart3,
  Lightbulb,
  CheckCircle
} from 'lucide-react';

interface CostCategory {
  category: string;
  amount: number;
  percentage: number;
  optimization_potential: number;
  priority: 'high' | 'medium' | 'low';
  recommendations: string[];
}

interface CostStructure {
  total_costs: number;
  cost_breakdown: CostCategory[];
  cost_efficiency_score: number;
  optimization_opportunities: {
    immediate: CostCategory[];
    medium_term: CostCategory[];
    long_term: CostCategory[];
  };
  benchmark_comparison: {
    industry_average: number;
    position: 'better' | 'average' | 'needs_improvement';
  };
}

interface CostStructureProps {
  data: CostStructure;
  className?: string;
}

export default function CostStructureAnalysis({ data, className = "" }: CostStructureProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return AlertTriangle;
      case 'medium': return Target;
      case 'low': return CheckCircle;
      default: return DollarSign;
    }
  };

  const getEfficiencyScore = (score: number) => {
    if (score >= 80) return { text: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 70) return { text: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 60) return { text: 'Average', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { text: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getOptimizationColor = (potential: number) => {
    if (potential >= 15) return 'text-red-600';
    if (potential >= 10) return 'text-orange-600';
    if (potential >= 5) return 'text-yellow-600';
    return 'text-green-600';
  };

  const totalOptimizationPotential = data.cost_breakdown.reduce((sum, category) => 
    sum + (category.amount * category.optimization_potential / 100), 0
  );

  return (
    <div className={`w-full space-y-6 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="border-2 border-green-200 shadow-xl overflow-hidden p-0 gap-0">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 m-0 gap-2">
            <CardTitle className="flex items-center text-2xl mb-0">
              <Calculator className="h-6 w-6 mr-3" />
              Cost Structure Analysis
            </CardTitle>
            <p className="text-green-100 mt-2 mb-0">
              Comprehensive cost optimization and efficiency analysis
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-6">
            {/* Cost Overview */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-green-600" />
                Cost Structure Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total Costs</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(data.total_costs)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Annual</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Efficiency Score</p>
                      <p className={`text-2xl font-bold ${getEfficiencyScore(data.cost_efficiency_score).color}`}>
                        {data.cost_efficiency_score}/100
                      </p>
                      <Badge className={getEfficiencyScore(data.cost_efficiency_score).bg + ' ' + getEfficiencyScore(data.cost_efficiency_score).color}>
                        {getEfficiencyScore(data.cost_efficiency_score).text}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-orange-50 to-red-50">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Optimization Potential</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency(totalOptimizationPotential)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {((totalOptimizationPotential / data.total_costs) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-purple-50 to-indigo-50">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Industry Position</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {data.benchmark_comparison.position === 'better' ? '👍' : 
                         data.benchmark_comparison.position === 'average' ? '😐' : '👎'}
                      </p>
                      <Badge className={
                        data.benchmark_comparison.position === 'better' ? 'bg-green-100 text-green-800' :
                        data.benchmark_comparison.position === 'average' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {data.benchmark_comparison.position.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                Detailed Cost Breakdown
              </h3>
              <div className="space-y-4">
                {data.cost_breakdown.map((category, index) => (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <Card className="bg-gradient-to-r from-gray-50 to-slate-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-full mr-3 ${getPriorityColor(category.priority)}`}>
                              {React.createElement(getPriorityIcon(category.priority), { className: "h-5 w-5" })}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">{category.category}</h4>
                              <p className="text-sm text-gray-600">
                                {formatCurrency(category.amount)} • {category.percentage.toFixed(1)}% of total
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getPriorityColor(category.priority)}>
                              {category.priority} priority
                            </Badge>
                            <p className={`text-sm font-semibold mt-1 ${getOptimizationColor(category.optimization_potential)}`}>
                              {category.optimization_potential.toFixed(1)}% optimization potential
                            </p>
                          </div>
                        </div>
                        
                        {/* Progress bar for percentage */}
                        <div className="mb-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${category.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Recommendations */}
                        {category.recommendations && category.recommendations.length > 0 && (
                          <div className="bg-white p-3 rounded border border-gray-200">
                            <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                              <Lightbulb className="h-4 w-4 mr-1 text-yellow-500" />
                              Optimization Recommendations
                            </h5>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {category.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-green-500 mr-1">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Optimization Roadmap */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-green-600" />
                Cost Optimization Roadmap
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Immediate Opportunities */}
                <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg text-red-600">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Immediate (0-3 months)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {data.optimization_opportunities.immediate.length > 0 ? (
                      <div className="space-y-3">
                        {data.optimization_opportunities.immediate.map((item, idx) => (
                          <div key={idx} className="p-3 bg-white rounded border border-red-100">
                            <p className="font-semibold text-sm text-gray-800">{item.category}</p>
                            <p className="text-xs text-gray-600">
                              Potential savings: {formatCurrency(item.amount * item.optimization_potential / 100)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No immediate optimization opportunities identified</p>
                    )}
                  </CardContent>
                </Card>

                {/* Medium-term Opportunities */}
                <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg text-orange-600">
                      <Target className="h-5 w-5 mr-2" />
                      Medium-term (3-12 months)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {data.optimization_opportunities.medium_term.length > 0 ? (
                      <div className="space-y-3">
                        {data.optimization_opportunities.medium_term.map((item, idx) => (
                          <div key={idx} className="p-3 bg-white rounded border border-orange-100">
                            <p className="font-semibold text-sm text-gray-800">{item.category}</p>
                            <p className="text-xs text-gray-600">
                              Potential savings: {formatCurrency(item.amount * item.optimization_potential / 100)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No medium-term opportunities identified</p>
                    )}
                  </CardContent>
                </Card>

                {/* Long-term Opportunities */}
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg text-green-600">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Long-term (12+ months)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {data.optimization_opportunities.long_term.length > 0 ? (
                      <div className="space-y-3">
                        {data.optimization_opportunities.long_term.map((item, idx) => (
                          <div key={idx} className="p-3 bg-white rounded border border-green-100">
                            <p className="font-semibold text-sm text-gray-800">{item.category}</p>
                            <p className="text-xs text-gray-600">
                              Potential savings: {formatCurrency(item.amount * item.optimization_potential / 100)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No long-term opportunities identified</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Strategic Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
            >
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Cost Optimization Strategy
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-700">
                    <strong>Priority Focus:</strong> {
                      data.cost_breakdown.find(c => c.priority === 'high')?.category ||
                      data.cost_breakdown[0]?.category || 'Cost efficiency'
                    } requires immediate attention for maximum impact
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <strong>Optimization Potential:</strong> {
                      ((totalOptimizationPotential / data.total_costs) * 100).toFixed(1)
                    }% cost reduction possible through strategic initiatives
                  </p>
                </div>
              </div>
              <div className="mt-3 p-3 bg-white rounded border border-green-100">
                <p className="text-xs text-gray-600">
                  💡 <strong>Strategic Recommendation:</strong> {
                    data.cost_efficiency_score >= 75 ?
                    'Maintain current efficiency levels and focus on innovation investments' :
                    data.cost_efficiency_score >= 60 ?
                    'Implement medium-term optimization strategies for improved efficiency' :
                    'Urgent cost restructuring required - prioritize immediate optimization opportunities'
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