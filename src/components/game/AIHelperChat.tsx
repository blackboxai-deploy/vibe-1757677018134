'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import AIGameHelper from '@/game/AIHelper'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  message: string
  timestamp: number
  confidence?: number
  followUp?: string[]
}

interface AIHelperChatProps {
  isOpen: boolean
  onClose: () => void
}

export function AIHelperChat({ isOpen, onClose }: AIHelperChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const aiHelper = useRef(new AIGameHelper())

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'ai',
        message: "🧙‍♂️ Hallo! Ich bin **Sage Iris**, dein persönlicher FLYFF-Assistent!\n\nIch kann dir bei allem helfen:\n• Charaktererstellung & Klassen\n• Leveling & Stats\n• Combat & Monster\n• Items & Equipment\n• Flying System\n• Maps & Navigation\n\nStell mir einfach deine Fragen! 🎮",
        timestamp: Date.now(),
        followUp: aiHelper.current.getPopularQuestions().slice(0, 3)
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, messages.length])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const simulateTyping = (callback: () => void, delay: number = 1000) => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      callback()
    }, delay)
  }

  const sendMessage = async (message: string = inputMessage) => {
    if (!message.trim()) return

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      message: message.trim(),
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')

    // Simulate AI thinking
    simulateTyping(() => {
      const response = aiHelper.current.findAnswer(message.trim())
      
      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        type: 'ai',
        message: response.answer,
        timestamp: Date.now(),
        confidence: response.confidence,
        followUp: response.followUp
      }

      setMessages(prev => [...prev, aiMessage])

      // Add a random tip occasionally
      if (Math.random() < 0.3) {
        setTimeout(() => {
          const tipMessage: ChatMessage = {
            id: `tip_${Date.now()}`,
            type: 'ai',
            message: aiHelper.current.getRandomTip(),
            timestamp: Date.now()
          }
          setMessages(prev => [...prev, tipMessage])
        }, 2000)
      }
    }, 800 + Math.random() * 1200)
  }

  const handleQuickQuestion = (question: string) => {
    sendMessage(question)
  }

  const formatMessage = (message: string) => {
    // Simple markdown formatting
    return message
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-300 font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-purple-200 italic">$1</em>')
      .replace(/•/g, '•')
      .split('\n')
      .map((line, i) => (
        <div key={i} dangerouslySetInnerHTML={{ __html: line || '<br />' }} />
      ))
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border-purple-500/50 w-full max-w-2xl h-[600px] shadow-2xl">
        <CardHeader className="border-b border-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-2xl">🧙‍♂️</span>
              </div>
              <div>
                <CardTitle className="text-purple-300 font-['Cinzel']">Sage Iris</CardTitle>
                <p className="text-xs text-purple-400">AI Game Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-500 text-green-400">
                Online
              </Badge>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 h-[480px] flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {msg.type === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm">
                    🧙‍♂️
                  </div>
                )}
                
                <div className={`max-w-[80%] ${msg.type === 'user' ? 'ml-auto' : ''}`}>
                  <div
                    className={`rounded-lg p-3 text-sm ${
                      msg.type === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800/60 text-slate-200 border border-purple-500/20'
                    }`}
                  >
                    <div className="space-y-1">
                      {formatMessage(msg.message)}
                    </div>
                    
                    {msg.confidence && msg.confidence < 60 && (
                      <div className="mt-2 text-xs text-yellow-400">
                        ⚠️ Ich bin mir nicht ganz sicher. Kannst du präziser fragen?
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-1 px-1">
                    <span className="text-xs text-slate-500">{formatTime(msg.timestamp)}</span>
                    {msg.confidence && (
                      <span className={`text-xs ${
                        msg.confidence > 80 ? 'text-green-400' :
                        msg.confidence > 50 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {msg.confidence}% sicher
                      </span>
                    )}
                  </div>

                  {/* Follow-up Questions */}
                  {msg.followUp && msg.followUp.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-purple-400 font-medium">Weitere Fragen:</p>
                      <div className="flex flex-wrap gap-1">
                        {msg.followUp.map((question, i) => (
                          <button
                            key={i}
                            onClick={() => handleQuickQuestion(question)}
                            className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded hover:bg-purple-500/30 transition-colors border border-purple-500/30"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm">
                  🧙‍♂️
                </div>
                <div className="bg-slate-800/60 rounded-lg p-3 border border-purple-500/20">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-purple-500/30 p-4">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Stelle deine FLYFF-Frage..."
                className="flex-1 bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-500"
                disabled={isTyping}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4"
              >
                Senden
              </Button>
            </div>
            
            {/* Quick Questions */}
            <div className="mt-2 flex flex-wrap gap-1">
              {aiHelper.current.getPopularQuestions().slice(0, 4).map((question, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickQuestion(question)}
                  className="text-xs px-2 py-1 bg-slate-700/50 text-slate-300 rounded hover:bg-slate-600/50 transition-colors"
                  disabled={isTyping}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AIHelperChat