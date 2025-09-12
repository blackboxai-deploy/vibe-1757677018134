'use client'

import { useState } from 'react'
import { NPC } from '@/game/World'
import { Button } from '@/components/ui/button'
import AIGameGuide from './AIGameGuide'

interface GameNPCProps {
  npc: NPC
  onClose?: () => void
}

export function GameNPC({ npc, onClose }: GameNPCProps) {
  const [showAIGuide, setShowAIGuide] = useState(false)

  const handleTalkToNPC = () => {
    if (npc.id === 'ai_guide') {
      setShowAIGuide(true)
    }
  }

  if (showAIGuide) {
    return (
      <AIGameGuide 
        onClose={() => setShowAIGuide(false)}
      />
    )
  }

  return (
    <div className="bg-black/90 backdrop-blur-md rounded-lg border border-purple-500/40 w-96">
      {/* NPC Header */}
      <div className="p-4 border-b border-purple-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {npc.id === 'ai_guide' ? '🤖' : '👤'}
            </span>
          </div>
          <div>
            <h3 className="text-purple-300 font-semibold text-lg">{npc.name}</h3>
            <p className="text-xs text-slate-400">{npc.type}</p>
          </div>
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

      {/* NPC Dialogue */}
      <div className="p-4">
        <div className="mb-4">
          <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
            <p className="text-white text-sm leading-relaxed">
              {npc.dialogue?.[0]?.text || 'Hello, adventurer!'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {npc.id === 'ai_guide' && (
            <Button
              onClick={handleTalkToNPC}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              🤖 Ask AI Assistant
            </Button>
          )}
          
          {npc.type === 'shop_keeper' && (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              🛒 Open Shop
            </Button>
          )}
          
          {npc.type === 'teleporter' && (
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              🌀 Travel
            </Button>
          )}
          
          {npc.type === 'guild_master' && (
            <Button
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              🏰 Guild Services
            </Button>
          )}

          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/30"
          >
            👋 Goodbye
          </Button>
        </div>
      </div>
    </div>
  )
}

export default GameNPC