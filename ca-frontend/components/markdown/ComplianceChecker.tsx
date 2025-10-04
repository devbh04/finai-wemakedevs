"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, XCircle, Clock } from 'lucide-react';

interface ComplianceCheckerProps {
  items: {
    title: string;
    status: 'compliant' | 'pending' | 'non-compliant' | 'partial';
    description?: string;
  }[];
  title?: string;
}

export default function ComplianceChecker({ items, title = "Compliance Status" }: ComplianceCheckerProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'compliant':
        return {
          icon: CheckCircle2,
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'Compliant'
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'Pending'
        };
      case 'non-compliant':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'Non-Compliant'
        };
      case 'partial':
        return {
          icon: AlertCircle,
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'Partial'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'Unknown'
        };
    }
  };

  const getOverallScore = () => {
    const compliant = items.filter(item => item.status === 'compliant').length;
    const total = items.length;
    return Math.round((compliant / total) * 100);
  };

  const score = getOverallScore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            score >= 80 ? 'bg-green-100 text-green-800' :
            score >= 60 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {score}% Complete
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => {
          const config = getStatusConfig(item.status);
          const Icon = config.icon;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`flex items-start space-x-3 p-4 rounded-lg border ${config.bg} ${config.border}`}
            >
              <Icon className={`w-5 h-5 mt-0.5 ${config.color}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  <span className={`text-sm font-medium ${config.color}`}>
                    {config.text}
                  </span>
                </div>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}