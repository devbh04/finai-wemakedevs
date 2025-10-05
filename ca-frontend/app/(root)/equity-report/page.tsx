'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, Download, Share2, TrendingUp, Calculator, PieChart, BarChart3, Wallet, Target, AlertCircle, CheckCircle, Home } from 'lucide-react';
import ITRHelperButton from '@/components/itr-helper/ITRHelperButton';
import ChatbotOverlay from '@/components/chatbot/ChatbotOverlay';

const EquityReportPage = () => {
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Function to manually set content for testing
  const setTestContent = () => {
    const testContent = `# Personalized Investment Plan

## Financial Capacity Analysis

### User Financial Profile
| Item | Detail |
|------|--------|
| User Type | Business (owner-operator) – based on CA report |
| Annual Income (Net Profit after Tax) | ₹6,580,950 |
| Monthly Surplus (estimated) | ₹250,000 – derived from net profit (₹6.58 m ÷ 12 ≈ ₹548 k) less a conservative 45% buffer for working-capital needs and tax obligations |
| Emergency Fund Status | **Inadequate** – cash & bank balance ₹2,850,000 is far below the recommended 6-month expense reserve (≈ ₹13.2 m). Liquidity ratios (cash ratio 0.45) confirm the shortfall. |
| Risk Capacity | **Low** – moderate leverage (Debt-to-Equity 1.24), strong profitability but limited liquid buffer. The investor prefers low-risk exposure. |

### Investment Capacity Calculation

| Parameter | Amount (₹) | Calculation Basis |
|-----------|------------|-------------------|
| **Total Investment Capacity** | **₹3,900,000** | Lump-sum cash available for investment (₹1,500,000) + 12 × monthly SIP (₹200,000) |
| **Monthly SIP Capacity** | **₹200,000** | Derived from monthly surplus after reserving ~₹50,000 for unforeseen outflows |
| **Lump-Sum Available** | **₹1,500,000** | Portion of cash & bank (₹2,850,000) that can be safely deployed while retaining a minimum ₹1,350,000 emergency buffer |
| **Recommended Equity Allocation** | **30%** of total capacity | Aligns with low-risk profile – majority placed in diversified, low-volatility pharma mutual funds |
| **Recommended Mutual-Fund Allocation** | **70%** of total capacity | Provides stable returns, lower market-price volatility, and aligns with swing-trade horizon (< 1 yr) by allowing easy entry/exit |

---

## Recommended Investment Portfolio

### Stock Investments (₹1,170,000) – 30% of total capacity

| Stock | Allocation % | Investment Amount (₹) | Rationale |
|-------|--------------|-----------------------|-----------|
| **Sun Pharmaceutical Industries Ltd. (SUNPHARMA)** | 23.4% | ₹274,380 | Largest market-cap pharma, solid ROCE 21.5%, low debt (D/E 0.12), dividend yield 1.38% – suitable for low-risk swing-trade. |
| **Dr. Reddy's Laboratories Ltd. (DRREDDY)** | 23.4% | ₹274,380 | Strong earnings growth, moderate valuation (P/E 31.1), low leverage (D/E 0.18). |
| **Cipla Ltd. (CIPLA)** | 23.4% | ₹274,380 | Consistent profit growth, low debt (D/E 0.09), decent dividend yield 0.71%. |
| **Abbott India Ltd. (ABBOTINDIA)** | 23.4% | ₹274,380 | High ROCE 22.1%, ultra-low debt (D/E 0.07), exposure to medical-devices segment adds diversification. |
| **Divi's Laboratories Ltd. (DIVISLAB)** | 23.4% | ₹274,380 | Highest ROCE 24.7% among peers, very low debt (D/E 0.04), strong API growth – adds specialty-chemical tilt. |

*Total Stock Allocation = ₹1,170,000*

---

### Mutual-Fund Investments (₹2,730,000) – 70% of total capacity

| Fund | Allocation % | Investment Amount (₹) | Monthly SIP (₹) | Rationale |
|------|--------------|-----------------------|----------------|-----------|
| **Nippon India Pharma Fund** | 20% | ₹546,000 | ₹40,000 | Low-risk large-cap pharma fund, expense ratio 1.12%, top holdings align with selected stocks. |
| **HDFC Healthcare Fund** | 20% | ₹546,000 | ₹40,000 | Consistently low volatility, expense ratio 1.05%, diversified across pharma & medical-devices. |
| **ICICI Prudential Pharma & Healthcare Fund** | 20% | ₹546,000 | ₹40,000 | Slightly higher concentration but still low-risk; 1-yr return 12% (best-in-class). |
| **SBI Healthcare Opportunities Fund** | 20% | ₹546,000 | ₹40,000 | Strong track record, expense ratio 1.08%, low exit load after 1 yr. |
| **Axis Pharma Fund** | 20% | ₹546,000 | ₹40,000 | Balanced exposure, expense ratio 1.10%, good 5-yr CAGR (14%). |

*Total Mutual-Fund Allocation = ₹2,730,000*

**SIP Summary:**
- **Total Monthly SIP:** ₹200,000 (₹40,000 into each of the five funds)
- **SIP Date:** 5th of each month (aligned with cash-flow receipt)

---

## Investment Implementation Strategy

### Option 1 – One-Time Lump-Sum Investment (Stocks)
| Week | Action |
|------|--------|
| **Week 1** (Oct 2025) | Purchase **SUNPHARMA** and **DRREDDY** – total ₹548,760 |
| **Week 2** (Oct 2025) | Purchase **CIPLA** and **ABBOTINDIA** – total ₹548,760 |
| **Week 3** (Oct 2025) | Purchase **DIVISLAB** – ₹274,380 |
| **Week 4** (Nov 2025) | Allocate ₹2,730,000 across the five mutual funds as per the SIP plan (initial lump-sum entry to meet the 12-month target). |

### Option 2 – Systematic Investment Plan (SIP) – Mutual Funds Only
| Month | Fund | SIP Amount (₹) | Execution Date |
|-------|------|----------------|----------------|
| **Every month (1-12)** | Nippon India Pharma Fund | 40,000 | 5th |
| **Every month (1-12)** | HDFC Healthcare Fund | 40,000 | 5th |
| **Every month (1-12)** | ICICI Prudential Pharma & Healthcare Fund | 40,000 | 5th |
| **Every month (1-12)** | SBI Healthcare Opportunities Fund | 40,000 | 5th |
| **Every month (1-12)** | Axis Pharma Fund | 40,000 | 5th |

*Total SIP per month = ₹200,000*

---

## Portfolio Characteristics

| Attribute | Detail |
|-----------|--------|
| **Overall Risk Level** | **Low** – Majority in large-cap, low-volatility pharma funds; stocks are blue-chip with strong balance sheets and low debt. |
| **Expected Return (annualised)** | **≈ 11-13%** – Weighted average of 1-yr fund returns (≈ 12%) plus modest equity upside (≈ 10-12%). |
| **Sector Diversification** | 100% healthcare (as per user preference). Within healthcare, exposure is spread across pharmaceuticals, medical-devices, and specialty chemicals. |
| **Weighted Expense Ratio (Funds)** | **≈ 1.10%** (average of the five funds). |
| **Liquidity** | Mutual-fund units are redeemable daily; stocks are highly liquid on NSE/BSE – suitable for swing-trade horizon (< 1 yr). |

---

## Important Disclaimers

- All investments involve market risk; past performance is **not** indicative of future results.
- The suggested amounts are based on the financial data provided and assume the business owner can safely allocate the stated cash without jeopardising operations.
- Tax implications can vary with individual circumstances; consult a tax advisor before executing trades.
- Review the portfolio at least quarterly and adjust for changes in personal cash-flow, market conditions, or risk tolerance.`;
    
    setMarkdownContent(testContent);
    localStorage.setItem('equityAnalysisResult', testContent);
    console.log('Test content set');
  };

  useEffect(() => {
    try {
      // Get the JSON from localStorage
      const storedJson = localStorage.getItem('equityAnalysisResult');
      
      if (storedJson) {
        // Parse the JSON and extract the result field
        const parsedData = JSON.parse(storedJson);
        let cleanContent = parsedData.result;
        
        if (cleanContent) {
          // Clean up the markdown content
          if (cleanContent.startsWith('** \n\n')) {
            cleanContent = cleanContent.substring(4);
          }
          
          // Replace any weird characters with proper ones
          cleanContent = cleanContent
            .replace(/‑/g, '-') // Replace en-dash with regular dash
            .replace(/₹ /g, '₹') // Clean up currency symbols
            .trim();
            
          setMarkdownContent(cleanContent);
          console.log('Loaded markdown content from localStorage JSON');
        } else {
          setError('No result field found in the stored data.');
        }
      } else {
        setError('No equity analysis data found in localStorage. Please generate a report first.');
      }
    } catch (err) {
      console.error('Error loading content:', err);
      setError('Failed to parse equity analysis data from localStorage.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equity-investment-plan-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Personalized Investment Plan',
          text: 'Check out my personalized investment plan',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-700 font-medium">Loading your investment plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Report Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Personalized Investment Plan</h1>
                <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.location.href = '/ca-report'}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>Back Home</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
          <div className="p-8">
            <div className="markdown-container">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdownContent}
              </ReactMarkdown>
            </div>

            <style jsx>{`
              .markdown-container :global(h1) {
                font-size: 2.5rem;
                font-weight: 700;
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 2px solid #e9d5ff;
                background: linear-gradient(to right, #9333ea, #ec4899);
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                margin-top: 2rem;
              }

              .markdown-container :global(h2) {
                font-size: 2rem;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 1rem;
                margin-top: 2rem;
                border-left: 4px solid #9333ea;
                padding-left: 1rem;
              }

              .markdown-container :global(h3) {
                font-size: 1.5rem;
                font-weight: 600;
                color: #374151;
                margin-bottom: 0.75rem;
                margin-top: 1.5rem;
                border-left: 2px solid #60a5fa;
                padding-left: 0.75rem;
              }

              .markdown-container :global(h4) {
                font-size: 1.25rem;
                font-weight: 600;
                color: #374151;
                margin-bottom: 0.75rem;
                margin-top: 1rem;
              }

              .markdown-container :global(h5) {
                font-size: 1.125rem;
                font-weight: 500;
                color: #4b5563;
                margin-bottom: 0.5rem;
                margin-top: 0.75rem;
              }

              .markdown-container :global(h6) {
                font-size: 1rem;
                font-weight: 500;
                color: #4b5563;
                margin-bottom: 0.5rem;
                margin-top: 0.5rem;
              }

              .markdown-container :global(p) {
                color: #374151;
                line-height: 1.75;
                margin-bottom: 1rem;
              }

              .markdown-container {
                overflow-x: auto;
              }

              .markdown-container :global(table) {
                width: 100%;
                margin-bottom: 1.5rem;
                background-color: white;
                border-radius: 0.75rem;
                box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
                border: 1px solid #e9d5ff;
                min-width: 800px;
                overflow: hidden;
                border-collapse: separate;
                border-spacing: 0;
              }

              .markdown-container :global(thead) {
                background: linear-gradient(to right, #f3e8ff, #fce7f3);
              }

              .markdown-container :global(th) {
                padding: 0.75rem 1.5rem;
                text-align: left;
                font-size: 0.75rem;
                font-weight: 500;
                color: #7c3aed;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                border: none;
              }

              .markdown-container :global(th:first-child) {
                border-top-left-radius: 0.75rem;
              }

              .markdown-container :global(th:last-child) {
                border-top-right-radius: 0.75rem;
              }

              .markdown-container :global(td) {
                padding: 1rem 1.5rem;
                font-size: 0.875rem;
                color: #374151;
                border-top: 1px solid #f8fafc;
                border: none;
              }

              .markdown-container :global(tbody tr:last-child td:first-child) {
                border-bottom-left-radius: 0.75rem;
              }

              .markdown-container :global(tbody tr:last-child td:last-child) {
                border-bottom-right-radius: 0.75rem;
              }

              .markdown-container :global(tr):hover {
                background-color: rgba(248, 250, 252, 0.3);
              }

              .markdown-container :global(ul) {
                list-style-type: disc;
                list-style-position: inside;
                margin-bottom: 1rem;
                margin-left: 1rem;
              }

              .markdown-container :global(ol) {
                list-style-type: decimal;
                list-style-position: inside;
                margin-bottom: 1rem;
                margin-left: 1rem;
              }

              .markdown-container :global(li) {
                color: #374151;
                line-height: 1.75;
                margin-bottom: 0.5rem;
              }

              .markdown-container :global(blockquote) {
                border-left: 4px solid #a855f7;
                background-color: #faf5ff;
                padding: 1rem;
                margin-bottom: 1rem;
                border-radius: 0 0.5rem 0.5rem 0;
                font-style: italic;
                color: #7c3aed;
              }

              .markdown-container :global(code) {
                background-color: #f3e8ff;
                color: #7c3aed;
                padding: 0.25rem 0.5rem;
                border-radius: 0.25rem;
                font-size: 0.875rem;
                font-family: 'Courier New', monospace;
              }

              .markdown-container :global(pre) {
                background-color: #111827;
                color: #f9fafb;
                padding: 1rem;
                border-radius: 0.5rem;
                overflow-x: auto;
                margin-bottom: 1rem;
              }

              .markdown-container :global(pre code) {
                background-color: transparent;
                color: #f9fafb;
                padding: 0;
              }

              .markdown-container :global(strong) {
                font-weight: 700;
                color: #7c3aed;
              }

              .markdown-container :global(em) {
                font-style: italic;
                color: #4b5563;
              }

              .markdown-container :global(hr) {
                margin: 2rem 0;
                border: none;
                height: 1px;
                background: linear-gradient(to right, transparent, #a855f7, transparent);
              }

              .markdown-container :global(a) {
                color: #9333ea;
                text-decoration: underline;
                transition: color 0.2s;
              }

              .markdown-container :global(a):hover {
                color: #7c3aed;
              }
            `}</style>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-purple-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Wallet className="h-6 w-6 text-purple-600" />
              <span className="text-lg font-semibold text-gray-800">FinAI Investment Advisory</span>
            </div>
            <p className="text-gray-600 mb-4">
              This investment plan is generated based on your financial profile and risk tolerance.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <AlertCircle className="h-4 w-4" />
                <span>Investment involves risks</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="h-4 w-4" />
                <span>Past performance doesn't guarantee future results</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calculator className="h-4 w-4" />
                <span>Consult a financial advisor before investing</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <ITRHelperButton />
      <ChatbotOverlay reportType="equity-report" />
    </div>
  );
};

export default EquityReportPage;
