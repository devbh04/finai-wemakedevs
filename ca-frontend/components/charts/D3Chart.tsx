"use client";
import React from 'react';
import { motion } from 'framer-motion';

interface D3ChartProps {
  title: string;
  type: 'donut' | 'gauge' | 'treemap';
  data: {
    labels: string[];
    values: number[];
  };
  description?: string;
  insights?: string;
  className?: string;
}

const colorPalettes = {
  modern: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'],
  neon: ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#0080ff', '#80ff00', '#ff0040', '#40ff00'],
  pastel: ['#ffd1dc', '#ffe4e1', '#e0ffff', '#f0fff0', '#fff8dc', '#e6e6fa', '#ffefd5', '#f5f5dc']
};

export default function D3Chart({ 
  title, 
  type, 
  data, 
  description, 
  insights, 
  className = "" 
}: D3ChartProps) {
  const colors = colorPalettes.modern;

  // Ensure data has valid values
  if (!data?.values || data.values.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-200 ${className}`}>
        <h4 className="text-lg font-semibold text-gray-800 mb-2">{title}</h4>
        <div className="text-center text-gray-500 py-8">
          <p>No data available for D3.js visualization</p>
        </div>
      </div>
    );
  }

  const total = data.values.reduce((sum, val) => sum + val, 0);

  const renderGaugeChart = () => {
    const percentage = (data.values[0] / total) * 100;
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center">
        <svg width="200" height="200" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="45"
            fill="transparent"
            stroke="#e5e7eb"
            strokeWidth="10"
          />
          {/* Progress circle */}
          <motion.circle
            cx="100"
            cy="100"
            r="45"
            fill="transparent"
            stroke={colors[0]}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">{percentage.toFixed(1)}%</span>
          <span className="text-sm text-gray-600">{data.labels[0]}</span>
        </div>
      </div>
    );
  };

  const renderDonutChart = () => {
    let cumulativePercentage = 0;
    const radius = 45;
    const strokeWidth = 10;

    return (
      <div className="relative flex items-center justify-center">
        <svg width="200" height="200" className="transform -rotate-90">
          {data.values.map((value, index) => {
            const percentage = (value / total) * 100;
            const circumference = 2 * Math.PI * radius;
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((cumulativePercentage / 100) * circumference);
            
            cumulativePercentage += percentage;

            return (
              <motion.circle
                key={index}
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke={colors[index % colors.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray, strokeDashoffset }}
                transition={{ duration: 1.5, delay: index * 0.2, ease: "easeOut" }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-lg font-bold text-gray-800">Total</span>
            <br />
            <span className="text-sm text-gray-600">{total}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7 }}
      className={`bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 ${className}`}
    >
      <div className="text-center mb-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-2">{title}</h4>
        {description && (
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        )}
      </div>
      
      <div className="flex justify-center mb-4">
        {type === 'gauge' ? renderGaugeChart() : renderDonutChart()}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {data.labels.map((label, index) => {
          const percentage = ((data.values[index] / total) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-gray-700 truncate">{label}</span>
              </div>
              <span className="font-medium text-gray-900">{percentage}%</span>
            </div>
          );
        })}
      </div>

      {insights && (
        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-l-4 border-green-400">
          <h5 className="text-sm font-semibold text-green-800 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Advanced Analysis
          </h5>
          <p className="text-sm text-green-700 leading-relaxed">{insights}</p>
        </div>
      )}
    </motion.div>
  );
}