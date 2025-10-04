"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  DollarSign,
  Percent,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  type?: 'currency' | 'percentage' | 'number';
  subtitle?: string;
  color?: 'green' | 'red' | 'amber' | 'blue' | 'gray';
}

export default function MetricCard({
  title,
  value,
  change,
  trend,
  type = 'number',
  subtitle,
  color = 'amber'
}: MetricCardProps) {
  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      text: 'text-green-700',
      accent: 'bg-green-500'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      text: 'text-red-700',
      accent: 'bg-red-500'
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'text-amber-600',
      text: 'text-amber-700',
      accent: 'bg-amber-500'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-700',
      accent: 'bg-blue-500'
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      icon: 'text-gray-600',
      text: 'text-gray-700',
      accent: 'bg-gray-500'
    }
  };

  const colors = colorClasses[color];

  const getIcon = () => {
    switch (type) {
      case 'currency':
        return <DollarSign className="w-5 h-5" />;
      case 'percentage':
        return <Percent className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${colors.bg} ${colors.border} border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`${colors.accent} rounded-lg p-2`}>
          <div className="text-white">
            {getIcon()}
          </div>
        </div>
        {change !== undefined && (
          <div className="flex items-center space-x-1">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 
              'text-gray-500'
            }`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-600">
          {title}
        </h3>
        <p className="text-2xl font-bold text-gray-900">
          {value}
        </p>
        {subtitle && (
          <p className={`text-sm ${colors.text}`}>
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}