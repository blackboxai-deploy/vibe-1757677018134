'use client'

import { Player } from '@/game/Player'

interface GameHUDProps {
  player: Player
}

export function GameHUD({ player }: GameHUDProps) {
  const hpPercentage = (player.stats.hp / player.stats.maxHp) * 100
  const mpPercentage = (player.stats.mp / player.stats.maxMp) * 100
  const expPercentage = (player.stats.experience / player.stats.experienceToNext) * 100

  return (
    <div className="absolute top-4 left-4 space-y-3">
      {/* Player Info Card */}
      <div className="bg-black/70 backdrop-blur-md rounded-lg p-4 border border-purple-500/30 min-w-[300px]">
        {/* Character Name and Level */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="text-white font-semibold text-lg">{player.name}</h3>
            <p className="text-purple-300 text-sm capitalize">{player.class}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-yellow-400">Lv. {player.stats.level}</p>
            <p className="text-xs text-slate-400">Penya: {player.penya.toLocaleString()}</p>
          </div>
        </div>

        {/* Health Bar */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-red-400 text-sm font-medium">HP</span>
            <span className="text-white text-sm">
              {Math.floor(player.stats.hp)} / {player.stats.maxHp}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <div 
              className="health-bar h-full rounded-full transition-all duration-300"
              style={{ width: `${hpPercentage}%` }}
            />
          </div>
        </div>

        {/* Mana Bar */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-blue-400 text-sm font-medium">MP</span>
            <span className="text-white text-sm">
              {Math.floor(player.stats.mp)} / {player.stats.maxMp}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <div 
              className="mana-bar h-full rounded-full transition-all duration-300"
              style={{ width: `${mpPercentage}%` }}
            />
          </div>
        </div>

        {/* Experience Bar */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-yellow-400 text-sm font-medium">EXP</span>
            <span className="text-white text-sm">
              {player.stats.experience.toLocaleString()} / {player.stats.experienceToNext.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <div 
              className="exp-bar h-full rounded-full transition-all duration-300"
              style={{ width: `${expPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Combat Stats */}
      <div className="bg-black/70 backdrop-blur-md rounded-lg p-3 border border-purple-500/30">
        <h4 className="text-purple-300 font-medium text-sm mb-2">Combat Stats</h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">ATK:</span>
            <span className="text-white">{player.stats.attack}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">DEF:</span>
            <span className="text-white">{player.stats.defense}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">ACC:</span>
            <span className="text-white">{player.stats.accuracy}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">CRIT:</span>
            <span className="text-white">{player.stats.criticalRate}%</span>
          </div>
        </div>
      </div>

      {/* Status Effects */}
      {player.isFlying && (
        <div className="bg-blue-500/20 backdrop-blur-md rounded-lg p-2 border border-blue-500/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-blue-300 text-sm font-medium">Flying Mode</span>
          </div>
        </div>
      )}

      {player.isInCombat && (
        <div className="bg-red-500/20 backdrop-blur-md rounded-lg p-2 border border-red-500/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-red-300 text-sm font-medium">In Combat</span>
          </div>
        </div>
      )}

      {player.isDead && (
        <div className="bg-gray-500/20 backdrop-blur-md rounded-lg p-2 border border-gray-500/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-gray-300 text-sm font-medium">Defeated</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameHUD