'use client'

import { useState, useRef, useEffect } from 'react'
import { useGameStore, ChatMessage } from '@/game/GameState'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function GameChat() {
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { chatMessages, addChatMessage, player } = useGameStore()

  const sendMessage = () => {
    if (!message.trim() || !player) return

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      playerId: player.id,
      playerName: player.name,
      message: message.trim(),
      timestamp: Date.now(),
      type: 'world'
    }

    addChatMessage(newMessage)
    setMessage('')
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  return (
    <div className="bg-black/80 backdrop-blur-md rounded-lg border border-purple-500/30 w-96 h-64">
      <div className="p-2 border-b border-purple-500/20">
        <h4 className="text-purple-300 font-medium text-sm">Chat</h4>
      </div>

      <div className="h-36 overflow-y-auto p-2 space-y-1">
        {chatMessages.slice(-20).map((msg) => (
          <div key={msg.id} className="text-xs">
            <span className="text-gray-500 mr-1">{formatTime(msg.timestamp)}</span>
            <span className="text-purple-300 mr-1">{msg.playerName}:</span>
            <span className="text-white">{msg.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-2 border-t border-purple-500/20">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type message..."
            className="flex-1 bg-black/30 border-purple-500/30 text-white text-xs"
          />
          <Button onClick={sendMessage} size="sm">Send</Button>
        </div>
      </div>
    </div>
  )
}

export default GameChat