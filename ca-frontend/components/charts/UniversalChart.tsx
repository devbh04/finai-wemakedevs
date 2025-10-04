"use client";
import React from 'react';
import ChartjsChart from './ChartjsChart';
import RechartsChart from './RechartsChart';
import D3Chart from './D3Chart';
import SimpleChart from '../SimpleChart';

interface ChartData {
  title: string;
  type: 'pie' | 'bar' | 'line' | 'doughnut' | 'area' | 'radialBar' | 'donut' | 'gauge';
  data: {
    labels: string[];
    values: number[];
  };
  description?: string;
  insights?: string;
  library?: 'chartjs' | 'recharts' | 'd3' | 'simple';
}

interface UniversalChartProps extends ChartData {
  className?: string;
  preference?: 'performance' | 'aesthetics' | 'interactivity' | 'simplicity';
}

// Chart library selection logic based on chart type and preference
const getOptimalLibrary = (
  type: string, 
  preference: string = 'aesthetics',
  dataSize: number
): 'chartjs' | 'recharts' | 'd3' | 'simple' => {
  
  // For large datasets, prefer performance
  if (dataSize > 50) {
    return 'simple';
  }

  // Chart type specific recommendations
  const libraryMap: Record<string, Record<string, string[]>> = {
    pie: {
      aesthetics: ['chartjs', 'recharts', 'd3'],
      performance: ['simple', 'chartjs'],
      interactivity: ['recharts', 'chartjs'],
      simplicity: ['simple', 'recharts']
    },
    bar: {
      aesthetics: ['recharts', 'chartjs'],
      performance: ['chartjs', 'simple'],
      interactivity: ['recharts', 'chartjs'],
      simplicity: ['simple', 'recharts']
    },
    line: {
      aesthetics: ['chartjs', 'recharts'],
      performance: ['chartjs', 'simple'],
      interactivity: ['recharts', 'chartjs'],
      simplicity: ['simple', 'recharts']
    },
    doughnut: {
      aesthetics: ['chartjs', 'd3'],
      performance: ['chartjs', 'simple'],
      interactivity: ['chartjs', 'recharts'],
      simplicity: ['simple', 'chartjs']
    },
    area: {
      aesthetics: ['recharts', 'chartjs'],
      performance: ['recharts', 'simple'],
      interactivity: ['recharts', 'chartjs'],
      simplicity: ['simple', 'recharts']
    },
    radialBar: {
      aesthetics: ['recharts', 'd3'],
      performance: ['recharts', 'simple'],
      interactivity: ['recharts'],
      simplicity: ['simple', 'recharts']
    },
    donut: {
      aesthetics: ['d3', 'chartjs'],
      performance: ['simple', 'chartjs'],
      interactivity: ['chartjs', 'd3'],
      simplicity: ['simple', 'd3']
    },
    gauge: {
      aesthetics: ['d3', 'chartjs'],
      performance: ['d3', 'simple'],
      interactivity: ['d3', 'chartjs'],
      simplicity: ['simple', 'd3']
    }
  };

  const options = libraryMap[type]?.[preference] || ['simple'];
  return options[0] as 'chartjs' | 'recharts' | 'd3' | 'simple';
};

// Map chart types between libraries
const mapChartType = (type: string, library: string): string => {
  const typeMap: Record<string, Record<string, string>> = {
    chartjs: {
      pie: 'pie',
      bar: 'bar',
      line: 'line',
      doughnut: 'doughnut',
      donut: 'doughnut',
      gauge: 'doughnut'
    },
    recharts: {
      pie: 'pie',
      bar: 'bar',
      line: 'line',
      area: 'area',
      radialBar: 'radialBar',
      doughnut: 'pie',
      donut: 'pie',
      gauge: 'radialBar'
    },
    d3: {
      donut: 'donut',
      gauge: 'gauge',
      pie: 'donut',
      doughnut: 'donut'
    },
    simple: {
      pie: 'pie',
      bar: 'bar',
      doughnut: 'pie',
      donut: 'pie',
      line: 'bar',
      area: 'bar',
      radialBar: 'bar',
      gauge: 'pie'
    }
  };

  return typeMap[library]?.[type] || type;
};

export default function UniversalChart({
  title,
  type,
  data,
  description,
  insights,
  library,
  className = "",
  preference = 'aesthetics',
}: UniversalChartProps) {
  
  // Ensure data has default values
  const safeData = {
    labels: data?.labels || [],
    values: data?.values || []
  };
  
  // Early return if no data
  if (safeData.values.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-200 ${className}`}>
        <h4 className="text-lg font-semibold text-gray-800 mb-2">{title}</h4>
        <div className="text-center text-gray-500 py-8">
          <p>No data available for visualization</p>
        </div>
      </div>
    );
  }
  
  // Determine the best library if not specified
  const selectedLibrary = library || getOptimalLibrary(type, preference, safeData.values.length);
  const mappedType = mapChartType(type, selectedLibrary);

  // Common props for all chart components
  const commonProps = {
    title,
    data: safeData,
    description,
    insights,
    className,
  };

  // Render appropriate chart based on selected library
  switch (selectedLibrary) {
    case 'chartjs':
      return (
        <div className="relative">
          <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            Chart.js
          </div>
          <ChartjsChart
            {...commonProps}
            type={mappedType as 'bar' | 'pie' | 'line' | 'doughnut'}
          />
        </div>
      );

    case 'recharts':
      return (
        <div className="relative">
          <div className="absolute top-2 right-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
            Recharts
          </div>
          <RechartsChart
            {...commonProps}
            type={mappedType as 'bar' | 'pie' | 'line' | 'area' | 'radialBar'}
          />
        </div>
      );

    case 'd3':
      return (
        <div className="relative">
          <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            D3.js
          </div>
          <D3Chart
            {...commonProps}
            type={mappedType as 'donut' | 'gauge' | 'treemap'}
          />
        </div>
      );

    case 'simple':
    default:
      return (
        <div className="relative">
          <div className="absolute top-2 right-2 bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
            Simple
          </div>
          <SimpleChart
            chartData={{
              title,
              type: mappedType as 'pie' | 'bar',
              data: safeData,
              color_scheme: 'modern',
              description,
              insights: insights ? [insights] : undefined,
            }}
            className={className}
          />
        </div>
      );
  }
}

// Export the type for use in other components
export type { ChartData, UniversalChartProps };