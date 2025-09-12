'use client'

import { Player, Item } from '@/game/Player'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface GameInventoryProps {
  player: Player
}

export function GameInventory({ player }: GameInventoryProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  const handleItemClick = (item: Item | null) => {
    if (item) {
      setSelectedItem(item)
    }
  }

  const getItemRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'normal': return 'border-gray-400'
      case 'rare': return 'border-blue-400'
      case 'unique': return 'border-purple-400'
      case 'legendary': return 'border-yellow-400'
      default: return 'border-gray-400'
    }
  }

  return (
    <div className="bg-black/80 backdrop-blur-md rounded-lg border border-purple-500/30 w-96">
      <div className="p-4 border-b border-purple-500/20">
        <h3 className="text-purple-300 font-semibold text-lg">Inventory</h3>
        <p className="text-xs text-slate-400 mt-1">
          Slots: {player.inventory.filter(slot => slot.item !== null).length}/42
        </p>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-6 gap-1 mb-4">
          {player.inventory.map((slot, index) => (
            <div
              key={index}
              className={`w-12 h-12 border-2 rounded-md cursor-pointer transition-all ${
                slot.item ? 
                  `${getItemRarityColor(slot.item.rarity)} bg-slate-700/30 hover:scale-110` : 
                  'border-slate-600 bg-slate-800/30'
              }`}
              onClick={() => handleItemClick(slot.item)}
            >
              {slot.item && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-xs font-bold text-white">
                    {slot.item.name.substring(0, 2).toUpperCase()}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedItem && (
          <Card className="bg-slate-800/50 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-300">
                {selectedItem.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-400">{selectedItem.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default GameInventory