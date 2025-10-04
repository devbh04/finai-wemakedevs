"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, PieChart, DollarSign, Percent } from 'lucide-react';

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

interface IncomeExpenseBreakdownProps {
  expenseData: ExpenseItem[];
  incomeData: IncomeSource[];
  className?: string;
}

export default function IncomeExpenseBreakdown({ 
  expenseData, 
  incomeData, 
  className = "" 
}: IncomeExpenseBreakdownProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Minus;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-red-500';
      case 'down': return 'text-green-500';
      default: return 'text-gray-400';
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage > 30) return 'text-red-600 font-bold';
    if (percentage > 15) return 'text-orange-600 font-semibold';
    return 'text-gray-700';
  };

  const getTaxTreatmentBadge = (treatment: string) => {
    if (treatment.toLowerCase().includes('exempt')) {
      return 'bg-green-100 text-green-800 border-green-300';
    } else if (treatment.toLowerCase().includes('deductible')) {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    } else if (treatment.toLowerCase().includes('taxable')) {
      return 'bg-orange-100 text-orange-800 border-orange-300';
    }
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Income Sources */}
      {incomeData && incomeData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-2 border-green-200 shadow-lg overflow-hidden p-0 gap-0">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 m-0 gap-2">
              <CardTitle className="flex items-center text-xl mb-0">
                <DollarSign className="h-6 w-6 mr-2" />
                Income Sources Breakdown
              </CardTitle>
              <p className="text-green-100 text-sm mt-2 mb-0">
                Detailed analysis of your income streams and their tax implications
              </p>
            </CardHeader>
            <CardContent className="p-6 pt-6">
              <div className="space-y-4">
                {incomeData.map((income, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1 mr-4">
                      <h4 className="font-semibold text-gray-800 mb-1">{income.source}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge className={getTaxTreatmentBadge(income.tax_treatment)}>
                          {income.tax_treatment}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">{income.amount}</p>
                        <p className={`text-sm ${getPercentageColor(income.percentage)}`}>
                          {income.percentage}% of total
                        </p>
                      </div>
                      
                      <div className="w-16 h-16">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-gray-200"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          />
                          <path
                            className="text-green-500"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray={`${income.percentage}, 100`}
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Expense Breakdown */}
      {expenseData && expenseData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="border-2 border-red-200 shadow-lg overflow-hidden p-0 gap-0">
            <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-6 m-0 gap-2">
              <CardTitle className="flex items-center text-xl mb-0">
                <PieChart className="h-6 w-6 mr-2" />
                Expense Breakdown Analysis
              </CardTitle>
              <p className="text-red-100 text-sm mt-2 mb-0">
                Comprehensive view of your expense categories and spending trends
              </p>
            </CardHeader>
            <CardContent className="p-6 pt-6">
              <div className="space-y-4">
                {expenseData.map((expense, index) => {
                  const TrendIcon = getTrendIcon(expense.trend);
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1 mr-4">
                        <h4 className="font-semibold text-gray-800 mb-1">{expense.category}</h4>
                        <div className="flex items-center space-x-2">
                          <TrendIcon className={`h-4 w-4 ${getTrendColor(expense.trend)}`} />
                          <span className={`text-sm ${getTrendColor(expense.trend)}`}>
                            {expense.trend === 'up' ? 'Increasing' : 
                             expense.trend === 'down' ? 'Decreasing' : 'Stable'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900">{expense.amount}</p>
                          <p className={`text-sm ${getPercentageColor(expense.percentage)}`}>
                            {expense.percentage}% of total
                          </p>
                        </div>
                        
                        <div className="w-16 h-16">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-gray-200"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                            />
                            <path
                              className={expense.percentage > 30 ? 'text-red-500' : 
                                        expense.percentage > 15 ? 'text-orange-500' : 'text-blue-500'}
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeDasharray={`${expense.percentage}, 100`}
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              
              {/* Expense Summary */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200"
              >
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <Percent className="h-5 w-5 mr-2 text-red-600" />
                  Expense Analysis Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-700">
                      <strong>Highest Expense:</strong>{' '}
                      {expenseData.reduce((prev, current) => 
                        (prev.percentage > current.percentage) ? prev : current
                      ).category} ({expenseData.reduce((prev, current) => 
                        (prev.percentage > current.percentage) ? prev : current
                      ).percentage}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700">
                      <strong>Trends:</strong>{' '}
                      {expenseData.filter(e => e.trend === 'up').length} increasing, {' '}
                      {expenseData.filter(e => e.trend === 'down').length} decreasing
                    </p>
                  </div>
                </div>
                <div className="mt-2 p-2 bg-white rounded border border-red-100">
                  <p className="text-xs text-gray-600">
                    💡 <strong>Optimization Tip:</strong> Consider reducing expenses in categories above 20% of total spending 
                    and focus on categories showing upward trends for better financial health.
                  </p>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}