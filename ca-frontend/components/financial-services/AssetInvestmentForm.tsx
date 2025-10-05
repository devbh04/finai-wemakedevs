"use client";
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft,
  MapPin,
  FileText,
  Building2
} from 'lucide-react';

interface AssetInvestmentFormProps {
  onBack: () => void;
  onClose: () => void;
  caReportData: {
    markdown: string;
    clientType: string;
    isAvailable: boolean;
  };
}

export function AssetInvestmentForm({ onBack, onClose, caReportData }: AssetInvestmentFormProps) {
  const [location, setLocation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitAssetInvestment = async () => {
    if (!location.trim()) {
      alert("Please enter a location for asset investment analysis");
      return;
    }

    if (!caReportData.isAvailable || !caReportData.markdown.trim()) {
      alert("CA analysis report is required. Please run CA analysis first.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('location', location);
      formData.append('financial_report_text', caReportData.markdown);

      const response = await fetch('http://127.0.0.1:8000/asset/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze asset investment');
      }

      const result = await response.json();
      console.log('Asset Investment Analysis Result:', result);
      
      // Store result and navigate to asset report page
      localStorage.setItem('assetAnalysisResult', JSON.stringify(result));
      window.location.href = '/asset-report';
      
    } catch (error) {
      console.error('Asset Investment Analysis failed:', error);
      alert('Failed to analyze asset investment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-xl font-bold text-blue-800">Asset Investment Analysis</h3>
              <p className="text-blue-600">Get location-based real estate investment insights</p>
            </div>
          </div>
          <div className="text-sm text-blue-700 space-y-1">
            <div>✓ Financial capacity assessment based on your CA report</div>
            <div>✓ Location-specific market research and analysis</div>
            <div>✓ Investment recommendations tailored to your profile</div>
            <div>✓ Risk assessment and ROI projections</div>
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
                Using your existing financial analysis for personalized recommendations
                {caReportData.clientType && ` • Client Type: ${caReportData.clientType}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Investment Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="location" className="text-sm font-medium text-gray-700">
              Preferred Location for Asset Investment *
            </Label>
            <Input
              id="location"
              type="text"
              value={location}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
              placeholder="e.g., Mumbai, Bangalore, Delhi, Pune, Gurgaon..."
              className="mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the city or area where you're considering property investment
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">What you'll get:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>• Market analysis for {location || 'your chosen location'}</div>
              <div>• Property price trends and forecasts</div>
              <div>• Investment capacity based on your financial profile</div>
              <div>• Recommended property types and price ranges</div>
              <div>• ROI calculations and risk assessment</div>
              <div>• Financing options and loan eligibility</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Connected Financial Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-xs text-gray-600 max-h-20 overflow-y-auto">
              {caReportData.markdown.slice(0, 300)}...
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Length: {caReportData.markdown.length} characters | 
              Source: CA Analysis Report
            </p>
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
          onClick={handleSubmitAssetInvestment}
          disabled={!location.trim() || isLoading || !caReportData.isAvailable}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Analyzing Investment Opportunities...
            </div>
          ) : (
            <>
              🏠 Analyze Investment Opportunities
            </>
          )}
        </Button>
      </div>
    </div>
  );
}