'use client'

import { Player } from '@/game/Player'
import { Button } from '@/components/ui/button'

interface GameSkillBarProps {
  player: Player
}

export function GameSkillBar({ player }: GameSkillBarProps) {
  const skillSlots = Array.from({ length: 8 }, (_, i) => i)

  return (
    <div className="bg-black/80 backdrop-blur-md rounded-lg border border-purple-500/30 p-2">
      <div className="flex gap-1">
        {skillSlots.map((slot) => {
          const skill = player.skills[slot]
          return (
            <div
              key={slot}
              className="w-12 h-12 border border-slate-600 rounded-md bg-slate-800/50 flex items-center justify-center cursor-pointer hover:bg-slate-700/50 transition-all relative"
              title={skill ? skill.name : `Skill Slot ${slot + 1} (F${slot + 1})`}
            >
              {skill ? (
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded flex items-center justify-center text-xs font-bold text-white">
                  {skill.name.substring(0, 2).toUpperCase()}
                </div>
              ) : (
                <span className="text-xs text-gray-500">F{slot + 1}</span>
              )}
              
              {skill && skill.cooldown > 0 && (
                <div className="absolute inset-0 bg-black/60 rounded-md flex items-center justify-center">
                  <span className="text-xs text-white">{Math.ceil(skill.cooldown / 1000)}</span>
                </div>
              )}
            </div>
          )
        })}
        
        {/* Attack Button */}
        <Button
          className="ml-2 bg-red-600 hover:bg-red-700 text-white px-4"
          size="sm"
        >
          Attack
        </Button>
      </div>
    </div>
  )
}

export default GameSkillBar