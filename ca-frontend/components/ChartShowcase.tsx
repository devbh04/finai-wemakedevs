"use client";
import React from 'react';
import { motion } from 'framer-motion';
import UniversalChart from './charts/UniversalChart';

const sampleData = {
  labels: ['Revenue', 'Expenses', 'Taxes', 'Profit'],
  values: [100000, 65000, 15000, 20000]
};

const chartDemos = [
  {
    title: "Chart.js Pie Chart",
    type: "pie" as const,
    library: "chartjs" as const,
    description: "Professional pie chart with smooth animations using Chart.js",
    insights: "Revenue represents 50% of total financial activity, with expenses being the largest component."
  },
  {
    title: "Recharts Bar Chart",
    type: "bar" as const,
    library: "recharts" as const,
    description: "Interactive bar chart with hover effects using Recharts",
    insights: "Revenue significantly exceeds expenses, indicating healthy profit margins."
  },
  {
    title: "Recharts Area Chart",
    type: "area" as const,
    library: "recharts" as const,
    description: "Elegant area chart showing trends over time using Recharts",
    insights: "The filled area visualization makes it easy to understand the magnitude of each component."
  },
  {
    title: "D3.js Donut Chart",
    type: "donut" as const,
    library: "d3" as const,
    description: "Custom donut chart with advanced interactions using D3.js",
    insights: "The donut visualization provides focus on individual segments while maintaining overall context."
  },
  {
    title: "D3.js Gauge Chart",
    type: "gauge" as const,
    library: "d3" as const,
    description: "Performance gauge showing efficiency metrics using D3.js",
    insights: "The gauge clearly shows performance levels with intuitive visual feedback."
  },
  {
    title: "Recharts Radial Bar",
    type: "radialBar" as const,
    library: "recharts" as const,
    description: "Modern radial bar chart for performance metrics using Recharts",
    insights: "Radial bars provide an engaging way to show multiple performance indicators simultaneously."
  },
  {
    title: "Chart.js Line Chart",
    type: "line" as const,
    library: "chartjs" as const,
    description: "Smooth line chart with gradients showing trends using Chart.js",
    insights: "The line chart effectively shows the progression and relationships between different financial components."
  },
  {
    title: "Chart.js Doughnut Chart",
    type: "doughnut" as const,
    library: "chartjs" as const,
    description: "Stylized doughnut chart with modern aesthetics using Chart.js",
    insights: "The doughnut design creates visual hierarchy while maintaining data clarity."
  }
];

export default function ChartShowcase() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Multi-Library Chart System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Showcasing diverse visualization libraries including Chart.js, Recharts, and D3.js 
            for creating stunning, interactive financial dashboards with intelligent library selection.
          </p>
          <div className="mt-6 flex justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              Chart.js - Professional & Performant
            </div>
            <div className="flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              Recharts - React Native & Interactive
            </div>
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              D3.js - Advanced & Customizable
            </div>
            <div className="flex items-center gap-2 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              Simple - Lightweight & Fast
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {chartDemos.map((demo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <UniversalChart
                title={demo.title}
                type={demo.type}
                data={sampleData}
                description={demo.description}
                insights={demo.insights}
                library={demo.library}
                className="h-full"
                preference="aesthetics"
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 bg-white rounded-xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Intelligent Library Selection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Performance</h3>
              <p className="text-sm text-gray-600">Chart.js for large datasets and smooth animations</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Interactivity</h3>
              <p className="text-sm text-gray-600">Recharts for rich user interactions and React integration</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Aesthetics</h3>
              <p className="text-sm text-gray-600">D3.js for custom designs and advanced visualizations</p>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Simplicity</h3>
              <p className="text-sm text-gray-600">Simple charts for basic needs and quick loading</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}