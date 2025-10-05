'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ChatMessage {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

interface ChatbotOverlayProps {
  reportType: 'asset-report' | 'ca-report' | 'equity-report' | 'itr-report'
}

export default function ChatbotOverlay({ reportType }: ChatbotOverlayProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [reportData, setReportData] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load report data based on report type
  useEffect(() => {
    try {
      let data = ''
      switch (reportType) {
        case 'asset-report':
          const assetData = localStorage.getItem('assetAnalysisResult')
          if (assetData) {
            const parsed = JSON.parse(assetData)
            data = parsed.analysis_summary || ''
          }
          break
        case 'ca-report':
          const caData = localStorage.getItem('caAnalysisResult')
          if (caData) {
            const parsed = JSON.parse(caData)
            data = caData
          }
          break
        case 'equity-report':
          const equityData = localStorage.getItem('equityAnalysisResult')
          if (equityData) {
            const parsed = JSON.parse(equityData)
            data = parsed.result || ''
          }
          break
        case 'itr-report':
          const itrData = localStorage.getItem('itrAnalysisResult')
          if (itrData) {
            const parsed = JSON.parse(itrData)
            data = parsed.markdown || ''
          }
          break
      }
      setReportData(data)
    } catch (error) {
      console.error('Error loading report data:', error)
    }
  }, [reportType])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const reportTypeFormatted = reportType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
      const welcomeMessage: ChatMessage = {
        id: '1',
        type: 'bot',
        content: `Hello! 👋 I'm your AI assistant. I've analyzed your ${reportTypeFormatted} and I'm here to help answer any questions you might have about it. You can ask me about:\n\n• Investment recommendations\n• Risk analysis\n• Financial calculations\n• Tax implications\n• Any specific sections of your report\n\nWhat would you like to know?`,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [reportType, messages.length])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('markdown_input', reportData)
      formData.append('user_question', inputMessage)

      const response = await fetch('/api/chatbot/chat', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: data.response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      let errorContent = 'Sorry, I encountered an error while processing your question. Please try again later.'
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorContent = 'Unable to connect to the AI service. Please check if the backend server is running and try again.'
        } else if (error.message.includes('NetworkError')) {
          errorContent = 'Network error occurred. Please check your internet connection and try again.'
        }
      }
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: errorContent,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getReportTitle = () => {
    switch (reportType) {
      case 'asset-report': return 'Asset Investment Analysis'
      case 'ca-report': return 'CA Analysis Report'
      case 'equity-report': return 'Equity Investment Report'
      case 'itr-report': return 'ITR Optimization Report'
      default: return 'Report'
    }
  }

  const getQuickQuestions = (): string[] => {
    switch (reportType) {
      case 'asset-report':
        return [
          'What are my best investment options?',
          'How much should I invest monthly?',
          'What is my risk level?',
          'Explain the loan recommendations'
        ]
      case 'ca-report':
        return [
          'Summarize my financial health',
          'What are the key findings?',
          'Any tax optimization tips?',
          'Explain the ratios'
        ]
      case 'equity-report':
        return [
          'Which stocks should I buy?',
          'Explain the portfolio allocation',
          'What is my expected return?',
          'How to implement this plan?'
        ]
      case 'itr-report':
        return [
          'How can I save more tax?',
          'What deductions am I missing?',
          'Explain my tax savings',
          'Any investment suggestions?'
        ]
      default:
        return ['Tell me about this report', 'What are the key points?']
    }
  }

  return (
    <>
      {/* Chatbot Toggle Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center ${
          isOpen ? 'hidden' : 'flex'
        }`}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chatbot Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-2xl border border-purple-200/50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">AI Assistant</h3>
                  <p className="text-xs text-purple-100">{getReportTitle()}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto h-80 bg-gradient-to-b from-purple-50/30 to-white">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.type === 'bot' && (
                        <Bot className="w-4 h-4 mt-0.5 text-purple-500" />
                      )}
                      {message.type === 'user' && (
                        <User className="w-4 h-4 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.type === 'user' ? 'text-purple-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-purple-500" />
                      <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Quick Action Buttons */}
              {messages.length === 1 && !isLoading && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 text-center">Quick questions:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {getQuickQuestions().map((question, index) => (
                      <button
                        key={index}
                        onClick={() => setInputMessage(question)}
                        className="px-3 py-1 text-xs bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-colors border border-purple-200"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about your report..."
                  disabled={isLoading}
                  className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                AI responses are based on your report data
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
