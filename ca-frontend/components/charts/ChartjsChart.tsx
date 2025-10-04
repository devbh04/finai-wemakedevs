"use client";
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

interface ChartjsChartProps {
  title: string;
  type: 'bar' | 'pie' | 'line' | 'doughnut';
  data: {
    labels: string[];
    values: number[];
  };
  description?: string;
  insights?: string;
  className?: string;
}

const colorPalettes = {
  primary: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'],
  gradient: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'],
  professional: ['#1f2937', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6', '#f9fafb'],
  vibrant: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f']
};

export default function ChartjsChart({ 
  title, 
  type, 
  data, 
  description, 
  insights, 
  className = "" 
}: ChartjsChartProps) {
  const colors = colorPalettes.primary;

  // Ensure data has valid values
  if (!data?.values || data.values.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <h4 className="text-lg font-semibold text-gray-800 mb-2">{title}</h4>
        <div className="text-center text-gray-500 py-8">
          <p>No data available for Chart.js visualization</p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: title,
        data: data.values,
        backgroundColor: type === 'line' ? 'rgba(59, 130, 246, 0.1)' : colors.slice(0, data.values.length),
        borderColor: type === 'line' ? '#3B82F6' : colors.slice(0, data.values.length),
        borderWidth: type === 'line' ? 3 : 1,
        fill: type === 'line' ? true : false,
        tension: type === 'line' ? 0.4 : 0,
        pointBackgroundColor: type === 'line' ? '#3B82F6' : undefined,
        pointBorderColor: type === 'line' ? '#ffffff' : undefined,
        pointBorderWidth: type === 'line' ? 2 : undefined,
        pointRadius: type === 'line' ? 6 : undefined,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3B82F6',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y || context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    scales: type === 'bar' || type === 'line' ? {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
        },
      },
    } : undefined,
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'pie':
        return <Pie data={chartData} options={options} />;
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={options} />;
      default:
        return <Bar data={chartData} options={options} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-xl shadow-lg p-6 ${className}`}
    >
      <div className="text-center mb-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-2">{title}</h4>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </div>
      
      <div className="relative h-80 mb-4">
        {renderChart()}
      </div>

      {insights && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-400">
          <h5 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Key Insights
          </h5>
          <p className="text-sm text-blue-700 leading-relaxed">{insights}</p>
        </div>
      )}
    </motion.div>
  );
}