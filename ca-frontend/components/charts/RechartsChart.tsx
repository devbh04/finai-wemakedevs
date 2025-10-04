"use client";
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { motion } from 'framer-motion';

interface RechartsChartProps {
  title: string;
  type: 'bar' | 'pie' | 'line' | 'area' | 'radialBar';
  data: {
    labels: string[];
    values: number[];
  };
  description?: string;
  insights?: string;
  className?: string;
}

const colorSchemes = {
  sunset: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'],
  ocean: ['#667eea', '#764ba2', '#36d1dc', '#5b86e5', '#667eea', '#764ba2', '#36d1dc', '#5b86e5'],
  forest: ['#11998e', '#38ef7d', '#56ab2f', '#a8edea', '#fed6e3', '#d299c2', '#fef9d3', '#eaf4f4'],
  corporate: ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#84fab0', '#8fd3f4']
};

export default function RechartsChart({ 
  title, 
  type, 
  data, 
  description, 
  insights, 
  className = "" 
}: RechartsChartProps) {
  const colors = colorSchemes.sunset;

  // Ensure data has valid values
  if (!data?.values || data.values.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-200 ${className}`}>
        <h4 className="text-lg font-semibold text-gray-800 mb-2">{title}</h4>
        <div className="text-center text-gray-500 py-8">
          <p>No data available for Recharts visualization</p>
        </div>
      </div>
    );
  }

  // Transform data for Recharts format
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.values[index],
    fill: colors[index % colors.length],
  }));

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = chartData.reduce((sum, item) => sum + item.value, 0);
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg border border-gray-600">
          <p className="font-medium">{label || data.payload.name}</p>
          <p className="text-sm">
            <span className="text-blue-300">Value: </span>
            {data.value} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip content={customTooltip} />
              <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }: any) => `${name}: ${((percent as number) * 100).toFixed(1)}%`}
                labelLine={false}
                fontSize={11}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip content={customTooltip} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip content={customTooltip} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#667eea" 
                strokeWidth={3}
                dot={{ fill: '#667eea', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: '#667eea' }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip content={customTooltip} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#667eea" 
                fillOpacity={0.6}
                fill="url(#colorGradient)"
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'radialBar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={chartData}>
              <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </RadialBar>
              <Tooltip content={customTooltip} />
              <Legend 
                iconSize={12}
                wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                formatter={(value: any, entry: any) => entry?.payload ? `${entry.payload.name}: ${entry.payload.value}` : ''}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300 ${className}`}
    >
      <div className="text-center mb-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-2">{title}</h4>
        {description && (
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        )}
      </div>
      
      <div className="relative h-80 mb-4">
        {renderChart()}
      </div>

      {insights && (
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-400">
          <h5 className="text-sm font-semibold text-purple-800 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clipRule="evenodd" />
            </svg>
            Key Insights
          </h5>
          <p className="text-sm text-purple-700 leading-relaxed">{insights}</p>
        </div>
      )}
    </motion.div>
  );
}