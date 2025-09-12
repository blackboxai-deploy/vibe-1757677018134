'use client'

import { useState, useRef, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useGameStore } from '@/game/GameState'
import AIKnowledgeBase from '@/game/AIKnowledgeBase'

interface AIResponse {
  id: string
  question: string
  answer: string
  timestamp: number
  helpful: boolean | null
}

const QUICK_QUESTIONS = AIKnowledgeBase.getQuickQuestions()

export function AIGameGuide({ onClose }: { onClose?: () => void }) {
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [responses, setResponses] = useState<AIResponse[]>([])
  const [showQuickQuestions, setShowQuickQuestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { player } = useGameStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [responses])

   // Use AI Knowledge Base for responses
  const generateAIResponse = async (userQuestion: string): Promise<string> => {
    // Simulate API delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))
    
    // Get context information
    const context = { player }
    
    // Use knowledge base to generate response
    return AIKnowledgeBase.searchKnowledge(userQuestion, context)
  }

  const handleAskQuestion = async (questionText?: string) => {
    const finalQuestion = questionText || question
    if (!finalQuestion.trim()) return

    setIsLoading(true)
    setShowQuickQuestions(false)
    
    try {
      const aiAnswer = await generateAIResponse(finalQuestion)
      
      const newResponse: AIResponse = {
        id: `ai_${Date.now()}`,
        question: finalQuestion,
        answer: aiAnswer,
        timestamp: Date.now(),
        helpful: null
      }
      
      setResponses(prev => [...prev, newResponse])
      setQuestion('')
    } catch (error) {
      console.error('Error generating AI response:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedback = (responseId: string, helpful: boolean) => {
    setResponses(prev => 
      prev.map(resp => 
        resp.id === responseId ? { ...resp, helpful } : resp
      )
    )
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="bg-black/90 backdrop-blur-md rounded-lg border border-purple-500/40 w-[480px] max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-purple-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">🤖</span>
          </div>
          <div>
            <h3 className="text-purple-300 font-semibold text-lg">AI Game Guide</h3>
            <p className="text-xs text-slate-400">Ask me anything about FLYFF!</p>
          </div>
          <Badge className="ml-auto bg-green-600 text-white">Online</Badge>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        )}
      </div>

      {/* Quick Questions */}
      {showQuickQuestions && responses.length === 0 && (
        <div className="p-4 border-b border-purple-500/10">
          <p className="text-sm text-slate-300 mb-3">Popular questions:</p>
          <div className="grid grid-cols-1 gap-2">
            {QUICK_QUESTIONS.slice(0, 4).map((q, index) => (
              <button
                key={index}
                onClick={() => handleAskQuestion(q)}
                className="text-left text-xs text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 p-2 rounded transition-all"
              >
                💡 {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[350px]">
        {responses.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎮</div>
            <p className="text-slate-400 text-sm">Welcome! I'm your AI Game Assistant.</p>
            <p className="text-slate-500 text-xs mt-1">Ask me anything about FLYFF mechanics!</p>
          </div>
        )}

        {responses.map((response) => (
          <div key={response.id} className="space-y-3">
            {/* User Question */}
            <div className="flex justify-end">
              <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-3 max-w-[80%]">
                <p className="text-white text-sm">{response.question}</p>
                <span className="text-xs text-purple-300">{formatTime(response.timestamp)}</span>
              </div>
            </div>

            {/* AI Response */}
            <div className="flex justify-start">
              <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-3 max-w-[90%]">
                <div className="text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                  {response.answer}
                </div>
                
                {/* Feedback Buttons */}
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-600/30">
                  <span className="text-xs text-slate-400">Was this helpful?</span>
                  <button
                    onClick={() => handleFeedback(response.id, true)}
                    className={`px-2 py-1 text-xs rounded transition-all ${
                      response.helpful === true 
                        ? 'bg-green-600 text-white' 
                        : 'text-green-400 hover:bg-green-600/20'
                    }`}
                  >
                    👍 Yes
                  </button>
                  <button
                    onClick={() => handleFeedback(response.id, false)}
                    className={`px-2 py-1 text-xs rounded transition-all ${
                      response.helpful === false 
                        ? 'bg-red-600 text-white' 
                        : 'text-red-400 hover:bg-red-600/20'
                    }`}
                  >
                    👎 No
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading Animation */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm text-slate-400">AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-purple-500/20">
        <div className="flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleAskQuestion()}
            placeholder="Ask about flying, classes, leveling, PvP..."
            className="flex-1 bg-black/30 border-purple-500/30 text-white text-sm placeholder:text-gray-500"
            disabled={isLoading}
            maxLength={200}
          />
          <Button
            onClick={() => handleAskQuestion()}
            disabled={!question.trim() || isLoading}
            className="px-4 bg-purple-600 hover:bg-purple-700 text-white"
            size="sm"
          >
            {isLoading ? '⏳' : '📤'}
          </Button>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-slate-500">
            {question.length}/200 characters
          </p>
          <button
            onClick={() => setShowQuickQuestions(!showQuickQuestions)}
            className="text-xs text-purple-400 hover:text-purple-300"
          >
            {showQuickQuestions ? 'Hide' : 'Show'} quick questions
          </button>
        </div>
      </div>
    </div>
  )
}

export default AIGameGuide