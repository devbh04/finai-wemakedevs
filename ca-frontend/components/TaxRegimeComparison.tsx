"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, TrendingDown, TrendingUp, Calculator } from 'lucide-react';

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

interface TaxRegimeComparisonProps {
  data: TaxRegimeData;
  className?: string;
}

export default function TaxRegimeComparison({ data, className = "" }: TaxRegimeComparisonProps) {
  const isNewRegimeBetter = data.recommendation === 'new';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`w-full ${className}`}
    >
      <Card className="border-2 border-amber-200 shadow-xl overflow-hidden p-0 gap-0">
        <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 m-0 gap-2">
          <CardTitle className="flex items-center text-2xl mb-0">
            <Calculator className="h-6 w-6 mr-3" />
            Tax Regime Comparison Analysis
          </CardTitle>
          <p className="text-amber-100 mt-2 mb-0">
            Compare Old vs New Tax Regime to optimize your tax liability
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Old Regime */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className={`p-6 ${!isNewRegimeBetter ? 'bg-green-50 border-r-2 border-green-300' : 'bg-gray-50 border-r border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Old Tax Regime</h3>
                {!isNewRegimeBetter && (
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Recommended
                  </Badge>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Taxable Income</p>
                    <p className="text-lg font-semibold text-gray-900">{data.old_regime.taxable_income}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tax Liability</p>
                    <p className="text-lg font-semibold text-gray-900">{data.old_regime.tax_liability}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Effective Rate</p>
                    <p className="text-lg font-semibold text-blue-600">{data.old_regime.effective_rate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Final Amount</p>
                    <p className={`text-lg font-bold ${data.old_regime.final_amount.includes('Refundale') ? 'text-green-600' : 'text-red-600'}`}>
                      {data.old_regime.final_amount}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Available Deductions</p>
                  <div className="flex flex-wrap gap-2">
                    {data.old_regime.deductions_used.map((deduction, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {deduction}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* New Regime */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className={`p-6 ${isNewRegimeBetter ? 'bg-green-50' : 'bg-gray-50'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">New Tax Regime</h3>
                {isNewRegimeBetter && (
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Recommended
                  </Badge>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Taxable Income</p>
                    <p className="text-lg font-semibold text-gray-900">{data.new_regime.taxable_income}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tax Liability</p>
                    <p className="text-lg font-semibold text-gray-900">{data.new_regime.tax_liability}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Effective Rate</p>
                    <p className="text-lg font-semibold text-blue-600">{data.new_regime.effective_rate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Final Amount</p>
                    <p className={`text-lg font-bold ${data.new_regime.final_amount.includes('Refund') ? 'text-green-600' : 'text-red-600'}`}>
                      {data.new_regime.final_amount}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Available Deductions</p>
                  <div className="flex flex-wrap gap-2">
                    {data.new_regime.deductions_used.length > 0 ? (
                      data.new_regime.deductions_used.map((deduction, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {deduction}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs text-gray-500">
                        Limited deductions available
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Savings Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="border-t border-gray-200 p-6 bg-gradient-to-r from-green-50 to-blue-50"
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                {isNewRegimeBetter ? (
                  <TrendingDown className="h-8 w-8 text-green-500 mr-2" />
                ) : (
                  <TrendingUp className="h-8 w-8 text-blue-500 mr-2" />
                )}
                <h4 className="text-2xl font-bold text-gray-800">
                  Tax Savings Summary
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Recommended Regime</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {data.recommendation === 'new' ? 'New Regime' : 'Old Regime'}
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Potential Savings</p>
                  <p className="text-2xl font-bold text-green-600">
                    {data.savings_amount}
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Savings Percentage</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {data.savings_percentage}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white rounded-lg border border-amber-200">
                <p className="text-sm text-gray-700">
                  <strong>Recommendation:</strong> Based on your financial profile, the{' '}
                  <span className="font-semibold text-blue-600">
                    {data.recommendation === 'new' ? 'New Tax Regime' : 'Old Tax Regime'}
                  </span>{' '}
                  offers better tax efficiency with potential savings of{' '}
                  <span className="font-semibold text-green-600">{data.savings_amount}</span>.
                </p>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}