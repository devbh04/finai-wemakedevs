"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface ChartData {
  type: 'pie' | 'bar' | 'line' | 'doughnut';
  title: string;
  data: {
    labels: string[];
    values: number[];
  };
  color_scheme: string;
  description?: string;
  insights?: string[];
}

interface SimpleChartProps {
  chartData: ChartData;
  className?: string;
}

export default function SimpleChart({ chartData, className = "" }: SimpleChartProps) {
  const { type, title, data } = chartData;

  // Generate colors based on the color scheme
  const getColors = (scheme: string, count: number) => {
    const colorSchemes = {
      blue: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
      green: ['#10b981', '#34d399', '#6ee7b7', '#9deccc', '#c6f6d5'],
      purple: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'],
      orange: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'],
      red: ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2']
    };
    
    const colors = colorSchemes[scheme as keyof typeof colorSchemes] || colorSchemes.blue;
    return data.labels.map((_, index) => colors[index % colors.length]);
  };

  const colors = getColors(chartData.color_scheme || 'blue', data.labels.length);
  const total = data.values.reduce((sum, value) => sum + value, 0);

  if (type === 'pie' || type === 'doughnut') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`bg-white rounded-lg shadow-lg p-6 ${className}`}
      >
        <div className="text-center mb-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">{title}</h4>
          {chartData.description && (
            <p className="text-sm text-gray-600">{chartData.description}</p>
          )}
        </div>
        <div className="flex flex-col items-center">
          {/* Simple pie chart representation */}
          <div className="relative w-48 h-48 mb-4">
            <svg className="w-full h-full" viewBox="0 0 42 42">
              <circle
                cx="21"
                cy="21"
                r="15.915"
                fill="transparent"
                stroke="#e5e7eb"
                strokeWidth="3"
              />
              {data.values.map((value, index) => {
                const percentage = (value / total) * 100;
                const strokeDasharray = `${percentage} ${100 - percentage}`;
                const rotation = data.values.slice(0, index).reduce((acc, val) => acc + (val / total) * 360, 0);
                
                return (
                  <circle
                    key={index}
                    cx="21"
                    cy="21"
                    r="15.915"
                    fill="transparent"
                    stroke={colors[index]}
                    strokeWidth="3"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset="25"
                    transform={`rotate(${rotation} 21 21)`}
                  />
                );
              })}
            </svg>
          </div>
          
          {/* Legend */}
          <div className="w-full space-y-2">
            {data.labels.map((label, index) => {
              const percentage = ((data.values[index] / total) * 100).toFixed(1);
              return (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: colors[index] }}
                    />
                    <span className="text-gray-700">{label}</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {data.values[index]} ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        {chartData.insights && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h5 className="text-sm font-medium text-blue-800 mb-1">Key Insights</h5>
            <p className="text-xs text-blue-700">{chartData.insights}</p>
          </div>
        )}
      </motion.div>
    );
  }

  if (type === 'bar') {
    const maxValue = Math.max(...data.values);
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`bg-white rounded-lg shadow-lg p-6 ${className}`}
      >
        <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h4>
        <div className="space-y-3">
          {data.labels.map((label, index) => {
            const percentage = (data.values[index] / maxValue) * 100;
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">{label}</span>
                  <span className="font-medium text-gray-900">{data.values[index]}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="h-3 rounded-full"
                    style={{ backgroundColor: colors[index] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {chartData.insights && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h5 className="text-sm font-medium text-blue-800 mb-1">Key Insights</h5>
            <p className="text-xs text-blue-700">{chartData.insights}</p>
          </div>
        )}
      </motion.div>
    );
  }

  // Fallback for unsupported chart types
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-lg shadow-lg p-6 ${className}`}
    >
      <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h4>
      <div className="text-center text-gray-600">
        <p>Chart type "{type}" is not yet supported</p>
        <div className="mt-4 space-y-2">
          {data.labels.map((label, index) => (
            <div key={index} className="flex justify-between">
              <span>{label}</span>
              <span className="font-medium">{data.values[index]}</span>
            </div>
          ))}
        </div>
        {chartData.insights && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h5 className="text-sm font-medium text-blue-800 mb-1">Key Insights</h5>
            <p className="text-xs text-blue-700">{chartData.insights}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}