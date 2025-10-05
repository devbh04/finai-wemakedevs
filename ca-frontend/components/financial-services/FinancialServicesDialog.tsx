"use client";
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Building2, 
  TrendingUp, 
  ArrowRight,
  Calculator,
  Home,
  BarChart3
} from 'lucide-react';
import { ITRHelperForm } from './ITRHelperForm';
import { AssetInvestmentForm } from './AssetInvestmentForm';
import { EquityInvestmentForm } from './EquityInvestmentForm';

interface FinancialServicesDialogProps {
  children: React.ReactNode;
}

type ServiceType = 'main' | 'itr' | 'asset' | 'equity';

export function FinancialServicesDialog({ children }: FinancialServicesDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeService, setActiveService] = useState<ServiceType>('main');
  const [caReportData, setCaReportData] = useState<{
    markdown: string;
    clientType: string;
    isAvailable: boolean;
  }>({
    markdown: '',
    clientType: '',
    isAvailable: false
  });

  // Create unique identifier for this dialog instance
  const dialogId = React.useRef(Math.random().toString(36).substr(2, 9)).current;

  // Check for existing CA analysis report when dialog opens
  React.useEffect(() => {
    if (isOpen && activeService === 'main') {
      const storedResult = localStorage.getItem('caAnalysisResult');
      if (storedResult) {
        try {
          const result = JSON.parse(storedResult);
          if (result.markdown) {
            setCaReportData({
              markdown: result.markdown,
              clientType: result.client_category || result.client_type || '',
              isAvailable: true
            });
          }
        } catch (error) {
          console.error('Error parsing stored CA analysis result:', error);
        }
      }
    }
  }, [isOpen, activeService]);

  // Cleanup effect to ensure dialog closes when component unmounts or route changes
  React.useEffect(() => {
    return () => {
      setIsOpen(false);
      setActiveService('main');
    };
  }, []);

  const handleServiceSelect = (service: ServiceType) => {
    if (service !== 'itr' && !caReportData.isAvailable) {
      alert('CA Analysis report is required for this service. Please run CA analysis first.');
      return;
    }
    setActiveService(service);
  };

  const handleBack = () => {
    setActiveService('main');
  };

  const handleClose = () => {
    setIsOpen(false);
    setActiveService('main');
  };

  // Handle dialog state changes
  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setActiveService('main');
    }
  };

  const renderServiceSelection = () => (
    <div className="space-y-4">
      {/* CA Report Status Banner */}
      <div className={`rounded-lg p-4 border-2 ${
        caReportData.isAvailable 
          ? 'bg-green-50 border-green-200' 
          : 'bg-amber-50 border-amber-200'
      }`}>
        <div className="flex items-center justify-center text-sm">
          {caReportData.isAvailable ? (
            <div className="text-green-700 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <FileText className="h-4 w-4" />
                <span className="font-semibold">CA Analysis Available</span>
              </div>
              <p className="text-xs">
                Ready for investment recommendations
                {caReportData.clientType && ` • Client Type: ${caReportData.clientType}`}
              </p>
            </div>
          ) : (
            <div className="text-amber-700 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Calculator className="h-4 w-4" />
                <span className="font-semibold">CA Analysis Required</span>
              </div>
              <p className="text-xs">
                Run CA analysis first to unlock investment services
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Service Cards */}
      <div className="grid gap-4">
        {/* ITR Helper Service */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-amber-300"
          onClick={() => handleServiceSelect('itr')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Calculator className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-amber-700">ITR Helper</CardTitle>
                  <CardDescription className="text-sm">
                    Tax optimization & ITR filing assistance
                  </CardDescription>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-sm text-gray-600">
              • Upload financial documents
              • Get personalized tax recommendations
              • Optimize your ITR filing strategy
              • Available for all client types
            </div>
          </CardContent>
        </Card>

        {/* Asset Investment Service */}
        <Card 
          className={`cursor-pointer transition-all duration-300 border-2 ${
            caReportData.isAvailable 
              ? 'hover:shadow-lg hover:border-blue-300' 
              : 'opacity-60 cursor-not-allowed border-gray-200'
          }`}
          onClick={() => handleServiceSelect('asset')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  caReportData.isAvailable ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Home className={`h-6 w-6 ${
                    caReportData.isAvailable ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                </div>
                <div>
                  <CardTitle className={`text-lg ${
                    caReportData.isAvailable ? 'text-blue-700' : 'text-gray-500'
                  }`}>
                    Asset Investment
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Real estate & property investment analysis
                  </CardDescription>
                </div>
              </div>
              <ArrowRight className={`h-5 w-5 ${
                caReportData.isAvailable ? 'text-gray-400' : 'text-gray-300'
              }`} />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={`text-sm ${
              caReportData.isAvailable ? 'text-gray-600' : 'text-gray-400'
            }`}>
              • Location-based property analysis
              • Investment capacity assessment
              • Market research & recommendations
              • {!caReportData.isAvailable && '⚠️ Requires CA analysis'}
            </div>
          </CardContent>
        </Card>

        {/* Equity Investment Service */}
        <Card 
          className={`cursor-pointer transition-all duration-300 border-2 ${
            caReportData.isAvailable 
              ? 'hover:shadow-lg hover:border-green-300' 
              : 'opacity-60 cursor-not-allowed border-gray-200'
          }`}
          onClick={() => handleServiceSelect('equity')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  caReportData.isAvailable ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <TrendingUp className={`h-6 w-6 ${
                    caReportData.isAvailable ? 'text-green-600' : 'text-gray-400'
                  }`} />
                </div>
                <div>
                  <CardTitle className={`text-lg ${
                    caReportData.isAvailable ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    Equity Investment
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Stock market & equity portfolio guidance
                  </CardDescription>
                </div>
              </div>
              <ArrowRight className={`h-5 w-5 ${
                caReportData.isAvailable ? 'text-gray-400' : 'text-gray-300'
              }`} />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={`text-sm ${
              caReportData.isAvailable ? 'text-gray-600' : 'text-gray-400'
            }`}>
              • Personalized investment strategy
              • Sector-wise recommendations
              • Risk-based portfolio allocation
              • {!caReportData.isAvailable && '⚠️ Requires CA analysis'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderActiveService = () => {
    switch (activeService) {
      case 'itr':
        return <ITRHelperForm onBack={handleBack} onClose={handleClose} />;
      case 'asset':
        return (
          <AssetInvestmentForm 
            onBack={handleBack} 
            onClose={handleClose}
            caReportData={caReportData}
          />
        );
      case 'equity':
        return (
          <EquityInvestmentForm 
            onBack={handleBack} 
            onClose={handleClose}
            caReportData={caReportData}
          />
        );
      default:
        return renderServiceSelection();
    }
  };

  return (
    <Dialog key={dialogId} open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <BarChart3 className="h-6 w-6 text-amber-600" />
            {activeService === 'main' && 'Financial Services Hub'}
            {activeService === 'itr' && 'ITR Helper - Tax Optimization'}
            {activeService === 'asset' && 'Asset Investment Analysis'}
            {activeService === 'equity' && 'Equity Investment Strategy'}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            {activeService === 'main' && 'Choose from our comprehensive financial services suite'}
            {activeService === 'itr' && 'Upload documents and get personalized tax recommendations'}
            {activeService === 'asset' && 'Get location-based real estate investment insights'}
            {activeService === 'equity' && 'Build your personalized equity investment portfolio'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {renderActiveService()}
        </div>
      </DialogContent>
    </Dialog>
  );
}