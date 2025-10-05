"use client";
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft,
  TrendingUp,
  FileText,
  Target,
  Clock,
  Shield
} from 'lucide-react';

interface EquityInvestmentFormProps {
  onBack: () => void;
  onClose: () => void;
  caReportData: {
    markdown: string;
    clientType: string;
    isAvailable: boolean;
  };
}

export function EquityInvestmentForm({ onBack, onClose, caReportData }: EquityInvestmentFormProps) {
  const [formData, setFormData] = useState({
    sector: '',
    goal: '',
    style: '',
    duration: '',
    risk_level: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitEquityInvestment = async () => {
    // Validate required fields
    const requiredFields = ['goal', 'style', 'duration', 'risk_level'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData].trim());
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (!caReportData.isAvailable || !caReportData.markdown.trim()) {
      alert("CA analysis report is required. Please run CA analysis first.");
      return;
    }

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('sector', formData.sector);
      formDataToSend.append('goal', formData.goal);
      formDataToSend.append('style', formData.style);
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('risk_level', formData.risk_level);
      formDataToSend.append('ca_report', caReportData.markdown);

      const response = await fetch('http://127.0.0.1:8000/equity/analyze', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze equity investment');
      }

      const result = await response.json();
      console.log('Equity Investment Analysis Result:', result);
      
      // Store result and navigate to equity report page
      localStorage.setItem('equityAnalysisResult', JSON.stringify(result));
      window.location.href = '/equity-report';
      
    } catch (error) {
      console.error('Equity Investment Analysis failed:', error);
      alert('Failed to analyze equity investment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sectorOptions = [
    { value: '', label: 'Any Sector' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Financial Services', label: 'Financial Services' },
    { value: 'Consumer Goods', label: 'Consumer Goods' },
    { value: 'Energy', label: 'Energy' },
    { value: 'Real Estate', label: 'Real Estate' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Telecommunications', label: 'Telecommunications' },
    { value: 'Agriculture', label: 'Agriculture' },
    { value: 'Infrastructure', label: 'Infrastructure' }
  ];

  const goalOptions = [
    { value: '', label: 'Select your goal' },
    { value: 'Wealth creation', label: 'Long-term wealth creation' },
    { value: 'Regular income', label: 'Regular income generation' },
    { value: 'Capital appreciation', label: 'Capital appreciation' },
    { value: 'Retirement planning', label: 'Retirement planning' },
    { value: 'Child education', label: "Child's education" },
    { value: 'Emergency fund', label: 'Emergency fund building' },
    { value: 'Tax saving', label: 'Tax saving' }
  ];

  const styleOptions = [
    { value: '', label: 'Select investment style' },
    { value: 'invest', label: 'Long-term Investing (Hold for years)' },
    { value: 'swing_trade', label: 'Swing Trading (Hold for weeks/months)' },
    { value: 'trade', label: 'Day Trading (Short-term)' }
  ];

  const durationOptions = [
    { value: '', label: 'Select duration' },
    { value: 'Less than 1 year', label: 'Less than 1 year' },
    { value: '1-3 years', label: '1-3 years' },
    { value: '3-5 years', label: '3-5 years' },
    { value: '5-10 years', label: '5-10 years' },
    { value: '10+ years', label: '10+ years' }
  ];

  const riskOptions = [
    { value: '', label: 'Select risk level' },
    { value: 'low', label: 'Low Risk (Conservative)' },
    { value: 'medium', label: 'Medium Risk (Moderate)' },
    { value: 'high', label: 'High Risk (Aggressive)' }
  ];

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Services
        </Button>
      </div>

      {/* Service Description */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-xl font-bold text-green-800">Equity Investment Strategy</h3>
              <p className="text-green-600">Build your personalized stock market portfolio</p>
            </div>
          </div>
          <div className="text-sm text-green-700 space-y-1">
            <div>✓ Personalized investment strategy based on your risk profile</div>
            <div>✓ Sector-wise stock recommendations and analysis</div>
            <div>✓ Portfolio allocation suggestions</div>
            <div>✓ Risk assessment and expected returns</div>
          </div>
        </CardContent>
      </Card>

      {/* CA Report Status */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-green-600" />
            <div>
              <h4 className="font-semibold text-green-800">CA Analysis Report Connected</h4>
              <p className="text-sm text-green-600">
                Using your financial analysis for personalized equity recommendations
                {caReportData.clientType && ` • Client Type: ${caReportData.clientType}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Parameters Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sector Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Sector Preference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="sector" className="text-sm font-medium text-gray-700">
              Preferred Sector (Optional)
            </Label>
            <select
              id="sector"
              value={formData.sector}
              onChange={(e) => handleInputChange('sector', e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {sectorOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Investment Goal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Investment Goal *
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="goal" className="text-sm font-medium text-gray-700">
              What's your primary investment objective?
            </Label>
            <select
              id="goal"
              value={formData.goal}
              onChange={(e) => handleInputChange('goal', e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {goalOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Investment Style */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Investment Style *
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="style" className="text-sm font-medium text-gray-700">
              Choose your trading/investing approach
            </Label>
            <select
              id="style"
              value={formData.style}
              onChange={(e) => handleInputChange('style', e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            >
              {styleOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Investment Duration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Investment Duration *
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
              How long do you plan to invest?
            </Label>
            <select
              id="duration"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            >
              {durationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      </div>

      {/* Risk Level - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Risk Tolerance *
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="risk_level" className="text-sm font-medium text-gray-700">
            What's your risk appetite for investments?
          </Label>
          <select
            id="risk_level"
            value={formData.risk_level}
            onChange={(e) => handleInputChange('risk_level', e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            required
          >
            {riskOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="mt-3 text-xs text-gray-600 space-y-1">
            <div><strong>Low Risk:</strong> Stable returns with minimal volatility (Large-cap stocks, dividend stocks)</div>
            <div><strong>Medium Risk:</strong> Balanced growth with moderate volatility (Mid-cap stocks, balanced funds)</div>
            <div><strong>High Risk:</strong> High growth potential with higher volatility (Small-cap stocks, growth stocks)</div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Preview */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">Investment Profile Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Sector:</span>
              <p className="text-gray-800">{formData.sector || 'Any'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Goal:</span>
              <p className="text-gray-800">{formData.goal || 'Not selected'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Style:</span>
              <p className="text-gray-800">{formData.style || 'Not selected'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Duration:</span>
              <p className="text-gray-800">{formData.duration || 'Not selected'}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="font-medium text-gray-600">Risk Level:</span>
            <p className="text-gray-800">{formData.risk_level || 'Not selected'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmitEquityInvestment}
          disabled={!formData.goal || !formData.style || !formData.duration || !formData.risk_level || isLoading || !caReportData.isAvailable}
          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Building Investment Strategy...
            </div>
          ) : (
            <>
              📈 Build My Portfolio Strategy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}