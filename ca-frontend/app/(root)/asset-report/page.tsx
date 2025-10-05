'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, Download, Share2, FileText, TrendingUp, DollarSign, Home } from 'lucide-react'
import Link from 'next/link'
import ITRHelperButton from '@/components/itr-helper/ITRHelperButton'
import ChatbotOverlay from '@/components/chatbot/ChatbotOverlay'

export default function AssetReportPage() {
  const [markdownContent, setMarkdownContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<any>(null)

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('assetAnalysisResult')
      if (storedData) {
        const parsedData = JSON.parse(storedData)
        setReportData(parsedData)
        if (parsedData.analysis_summary) {
          setMarkdownContent(parsedData.analysis_summary)
        }
      }
    } catch (error) {
      console.error('Error loading asset analysis data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDownload = () => {
    const element = document.createElement('a')
    const file = new Blob([markdownContent], { type: 'text/markdown' })
    element.href = URL.createObjectURL(file)
    element.download = 'asset-investment-analysis-report.md'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Asset Investment Analysis Report',
          text: 'Check out my personalized asset investment analysis report',
          url: window.location.href,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert('Report link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-600 text-lg">Loading your asset analysis report...</p>
        </div>
      </div>
    )
  }

  if (!markdownContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <FileText className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">No Report Found</h2>
          <p className="text-purple-600 mb-6">
            We couldn't find your asset analysis report. Please generate a new report first.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-lg hover:from-emerald-500 hover:to-teal-600 transition-all duration-200 shadow-sm"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/85 backdrop-blur-sm border-b border-purple-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/ca-report"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-md transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Back Home
              </Link>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
                <h1 className="text-xl font-bold text-slate-800">Asset Investment Analysis</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-sm font-medium rounded-md hover:from-emerald-500 hover:to-teal-600 transition-all duration-200 shadow-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-purple-200/60 overflow-hidden">
          {/* Report Header */}
          <div className="bg-gradient-to-r from-rose-400 via-pink-400 to-purple-500 px-8 py-6 text-white">
            <div className="flex items-center space-x-3 mb-2">
              <DollarSign className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Asset Investment Analysis Report</h1>
            </div>
            <p className="text-pink-100">
              Comprehensive financial analysis and investment recommendations
            </p>
          </div>

          {/* Markdown Content */}
          <div className="p-8">
            <div className="markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                // Custom styling for different elements
                h1: ({ children }) => <h1>{children}</h1>,
                h2: ({ children }) => <h2>{children}</h2>,
                h3: ({ children }) => <h3>{children}</h3>,
                h4: ({ children }) => <h4>{children}</h4>,
                p: ({ children }) => <p>{children}</p>,
                table: ({ children }) => (
                  <div className="table-container">
                    <table>
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead>
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody>
                    {children}
                  </tbody>
                ),
                th: ({ children }) => (
                  <th>
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td>
                    {children}
                  </td>
                ),
                ul: ({ children }) => <ul>{children}</ul>,
                ol: ({ children }) => <ol>{children}</ol>,
                li: ({ children }) => <li>{children}</li>,
                blockquote: ({ children }) => <blockquote>{children}</blockquote>,
                code: ({ children }) => <code>{children}</code>,
                hr: () => <hr />,
                strong: ({ children }) => <strong>{children}</strong>,
                em: ({ children }) => <em>{children}</em>,
              }}
                >
                {markdownContent}
              </ReactMarkdown>
            </div>
          </div>
        </div>        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-purple-500/80 text-sm">
            This report was generated based on your financial data and current market conditions.
            <br />
            Please consult with a financial advisor before making investment decisions.
          </p>
        </div>
      </main>

      {/* Custom CSS for Markdown styling */}
      <style jsx>{`
        :global(.markdown-content h1) {
          color: #7c3aed;
          font-size: 1.875rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          margin-top: 2rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #e9d5ff;
        }
        
        :global(.markdown-content h1:first-child) {
          margin-top: 0;
        }
        
        :global(.markdown-content h2) {
          color: #8b5cf6;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          margin-top: 2rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #ddd6fe;
        }
        
        :global(.markdown-content h3) {
          color: #a855f7;
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          margin-top: 1.5rem;
        }
        
        :global(.markdown-content h4) {
          color: #c084fc;
          font-size: 1.125rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          margin-top: 1rem;
        }
        
        :global(.markdown-content p) {
          color: #475569;
          margin-bottom: 1rem;
          line-height: 1.75;
        }
        
        :global(.markdown-content strong) {
          color: #7c3aed;
          font-weight: 600;
        }
        
        :global(.markdown-content table) {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin: 1.5rem 0;
          border-radius: 0.75rem;
          overflow: hidden;
          border: 1px solid #ddd6fe;
          box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.1), 0 2px 4px -1px rgba(139, 92, 246, 0.06);
        }
        
        :global(.markdown-content table thead) {
          background: linear-gradient(to right, #fdf4ff, #fae8ff);
        }
        
        :global(.markdown-content table th) {
          padding: 0.75rem 1rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 500;
          color: #7c3aed;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #ddd6fe;
        }
        
        :global(.markdown-content table th:first-child) {
          border-top-left-radius: 0.75rem;
        }
        
        :global(.markdown-content table th:last-child) {
          border-top-right-radius: 0.75rem;
        }
        
        :global(.markdown-content table td) {
          padding: 1rem;
          font-size: 0.875rem;
          color: #374151;
          border-bottom: 1px solid #f3f4f6;
          white-space: nowrap;
        }
        
        :global(.markdown-content table tbody tr:nth-child(even)) {
          background: linear-gradient(to right, #fefcff, #fdf7ff);
        }
        
        :global(.markdown-content table tbody tr:hover) {
          background: linear-gradient(to right, #fae8ff, #f3e8ff);
          transform: translateY(-1px);
          transition: all 0.2s ease;
        }
        
        :global(.markdown-content table tbody tr:last-child td:first-child) {
          border-bottom-left-radius: 0.75rem;
        }
        
        :global(.markdown-content table tbody tr:last-child td:last-child) {
          border-bottom-right-radius: 0.75rem;
        }
        
        :global(.markdown-content table tbody tr:last-child td) {
          border-bottom: none;
        }
        
        :global(.markdown-content ul) {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
          list-style-type: disc;
        }
        
        :global(.markdown-content ol) {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
          list-style-type: decimal;
        }
        
        :global(.markdown-content li) {
          color: #475569;
          margin-bottom: 0.5rem;
          line-height: 1.75;
        }
        
        :global(.markdown-content blockquote) {
          border-left: 4px solid #c084fc;
          background: linear-gradient(to right, #fdf4ff, #fae8ff);
          padding: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #7c3aed;
          border-radius: 0.5rem;
        }
        
        :global(.markdown-content code) {
          background: linear-gradient(to right, #fdf4ff, #fae8ff);
          color: #7c3aed;
          padding: 0.125rem 0.375rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          border: 1px solid #e9d5ff;
        }
        
        :global(.markdown-content hr) {
          margin: 2rem 0;
          border: none;
          height: 2px;
          background: linear-gradient(to right, #fae8ff, #c084fc, #fae8ff);
          border-radius: 1px;
        }
        
        :global(.markdown-content em) {
          font-style: italic;
          color: #475569;
        }
        
        /* Table overflow handling for mobile */
        :global(.table-container) {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          margin: 1.5rem 0;
          border-radius: 0.75rem;
        }
        
        @media (max-width: 768px) {
          :global(.markdown-content table) {
            font-size: 0.75rem;
          }
          
          :global(.markdown-content table th),
          :global(.markdown-content table td) {
            padding: 0.5rem;
          }
        }
      `}</style>
      <ITRHelperButton />
      <ChatbotOverlay reportType="asset-report" />
    </div>
  )
}
