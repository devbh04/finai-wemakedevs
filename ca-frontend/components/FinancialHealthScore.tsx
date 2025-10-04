"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, Shield, Zap, AlertCircle } from 'lucide-react';

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

interface FinancialHealthScoreProps {
  data: FinancialHealthData;
  className?: string;
}

export default function FinancialHealthScore({ data, className = "" }: FinancialHealthScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      excellent: 'bg-green-100 text-green-800 border-green-300',
      good: 'bg-blue-100 text-blue-800 border-blue-300',
      average: 'bg-orange-100 text-orange-800 border-orange-300',
      poor: 'bg-red-100 text-red-800 border-red-300'
    };
    return statusStyles[status as keyof typeof statusStyles] || statusStyles.average;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      profitability: TrendingUp,
      liquidity: Activity,
      solvency: Shield,
      efficiency: Zap
    };
    return icons[category as keyof typeof icons] || AlertCircle;
  };

  const getCategoryDescription = (category: string) => {
    const descriptions = {
      profitability: 'Ability to generate profit from operations',
      liquidity: 'Capability to meet short-term obligations',
      solvency: 'Long-term financial stability and debt management',
      efficiency: 'Effectiveness in using assets and resources'
    };
    return descriptions[category as keyof typeof descriptions] || '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`w-full ${className}`}
    >
      <Card className="border-2 border-blue-200 shadow-xl overflow-hidden p-0 gap-0">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 m-0 gap-2">
          <CardTitle className="flex items-center text-2xl mb-0">
            <Activity className="h-6 w-6 mr-3" />
            Financial Health Assessment
          </CardTitle>
          <p className="text-blue-100 mt-2 mb-0">
            Comprehensive analysis of your financial performance across key metrics
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {/* Overall Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  className={getScoreColor(data.overall_score)}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={`${data.overall_score}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(data.overall_score)}`}>
                    {data.overall_score}
                  </div>
                  <div className="text-sm text-gray-600">Overall Score</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Badge className={getStatusBadge(
                data.overall_score >= 80 ? 'excellent' : 
                data.overall_score >= 60 ? 'good' : 
                data.overall_score >= 40 ? 'average' : 'poor'
              )}>
                {data.overall_score >= 80 ? 'EXCELLENT' : 
                 data.overall_score >= 60 ? 'GOOD' : 
                 data.overall_score >= 40 ? 'AVERAGE' : 'NEEDS IMPROVEMENT'}
              </Badge>
            </div>
          </motion.div>

          {/* Category Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.categories.map((category, index) => {
              const IconComponent = getCategoryIcon(category.category);
              
              return (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${getScoreBackground(category.score)} bg-opacity-10`}>
                            <IconComponent className={`h-6 w-6 ${getScoreColor(category.score)}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 capitalize">
                              {category.category}
                            </h3>
                            <p className="text-xs text-gray-600">
                              {getCategoryDescription(category.category)}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusBadge(category.status)}>
                          {category.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Score</span>
                          <span className={`font-bold ${getScoreColor(category.score)}`}>
                            {category.score}/100
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${category.score}%` }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                            className={`h-2 rounded-full ${getScoreBackground(category.score)}`}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Key Indicator</p>
                        <p className="text-sm font-medium text-gray-800">
                          {category.key_indicator}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Health Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200"
          >
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-600" />
              Financial Health Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-700">
                  <strong>Strongest Area:</strong>{' '}
                  {data.categories.reduce((prev, current) => 
                    (prev.score > current.score) ? prev : current
                  ).category.charAt(0).toUpperCase() + 
                  data.categories.reduce((prev, current) => 
                    (prev.score > current.score) ? prev : current
                  ).category.slice(1)}
                </p>
              </div>
              <div>
                <p className="text-gray-700">
                  <strong>Area for Improvement:</strong>{' '}
                  {data.categories.reduce((prev, current) => 
                    (prev.score < current.score) ? prev : current
                  ).category.charAt(0).toUpperCase() + 
                  data.categories.reduce((prev, current) => 
                    (prev.score < current.score) ? prev : current
                  ).category.slice(1)}
                </p>
              </div>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-blue-100">
              <p className="text-xs text-gray-600">
                💡 <strong>Tip:</strong> Focus on improving your weakest financial health category to boost your overall score. 
                Regular monitoring and strategic planning can significantly enhance your financial position.
              </p>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}