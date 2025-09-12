'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PlayerManager, { PlayerClass } from '@/game/Player'

const CHARACTER_CLASSES = [
  {
    id: 'vagrant' as PlayerClass,
    name: 'Vagrant',
    description: 'A versatile starting class that can evolve into any path. Perfect for beginners.',
    image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/51f0717f-e1b9-4a02-ba3f-f726bfc6bd23.png',
    stats: { str: 15, sta: 15, dex: 15, int: 15 },
    evolution: 'Can become Mercenary, Assist, or Magician at level 15'
  }
]

export default function CharacterCreationPage() {
  const router = useRouter()
  const [characterName, setCharacterName] = useState('')
  const [selectedClass, setSelectedClass] = useState<PlayerClass>('vagrant')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateCharacter = async () => {
    if (!characterName.trim()) {
      alert('Please enter a character name')
      return
    }

    if (characterName.length < 3 || characterName.length > 12) {
      alert('Character name must be between 3-12 characters')
      return
    }

    if (!/^[a-zA-Z0-9]+$/.test(characterName)) {
      alert('Character name can only contain letters and numbers')
      return
    }

    setIsCreating(true)
    
    // Create character using PlayerManager
    const newPlayer = PlayerManager.createNewPlayer(characterName, selectedClass)
    
    // Save to localStorage for this demo (in real game, would save to server)
    localStorage.setItem('flyff_character', JSON.stringify(newPlayer))
    localStorage.setItem('flyff_player_id', newPlayer.id)
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsCreating(false)
    
    router.push('/game')
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-['Cinzel'] text-purple-300 mb-4">Create Your Character</h1>
          <p className="text-slate-400 text-lg">Begin your adventure in the world of FLYFF</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Character Preview */}
          <div className="lg:col-span-1">
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50">
              <CardHeader>
                <CardTitle className="text-purple-300 text-center">Character Preview</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-4">
                  <img 
                    src={CHARACTER_CLASSES[0].image}
                    alt="Character Preview"
                    className="w-48 h-72 mx-auto rounded-lg border border-purple-500/30 object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {characterName || 'Your Character'}
                </h3>
                <p className="text-purple-400">{CHARACTER_CLASSES[0].name}</p>
                <div className="mt-4 text-sm">
                  <h4 className="text-slate-300 font-medium mb-2">Starting Stats:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex justify-between">
                      <span className="text-red-400">STR:</span>
                      <span className="text-white">15</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">STA:</span>
                      <span className="text-white">15</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-400">DEX:</span>
                      <span className="text-white">15</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-400">INT:</span>
                      <span className="text-white">15</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Character Setup */}
          <div className="lg:col-span-2">
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50">
              <CardHeader>
                <CardTitle className="text-purple-300">Character Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Character Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Character Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter character name"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    className="bg-black/30 border-purple-500/30 text-white placeholder:text-slate-500"
                    maxLength={12}
                  />
                  <p className="text-xs text-slate-500 mt-1">3-12 characters, letters and numbers only</p>
                </div>

                {/* Class Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-4">
                    Starting Class
                  </label>
                  <div className="grid gap-4">
                    {CHARACTER_CLASSES.map((charClass) => (
                      <div
                        key={charClass.id}
                        className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedClass === charClass.id
                            ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20'
                            : 'border-slate-600 bg-black/20 hover:border-purple-400 hover:bg-purple-500/10'
                        }`}
                        onClick={() => setSelectedClass(charClass.id)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-semibold text-white">{charClass.name}</h3>
                          <div className="flex gap-3 text-sm">
                            <span className="text-red-400 font-medium">STR: {charClass.stats.str}</span>
                            <span className="text-green-400 font-medium">STA: {charClass.stats.sta}</span>
                            <span className="text-blue-400 font-medium">DEX: {charClass.stats.dex}</span>
                            <span className="text-purple-400 font-medium">INT: {charClass.stats.int}</span>
                          </div>
                        </div>
                        <p className="text-slate-300 mb-3 leading-relaxed">{charClass.description}</p>
                        <div className="bg-purple-900/30 rounded-md p-3 border border-purple-500/30">
                          <p className="text-sm text-purple-400 font-medium mb-1">Evolution Path:</p>
                          <p className="text-xs text-purple-300">{charClass.evolution}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Class Information */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                  <h3 className="text-white font-semibold mb-3">Starting Equipment & Abilities</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="text-purple-400 font-medium mb-2">Equipment:</h4>
                      <ul className="text-slate-300 space-y-1">
                        <li>• Basic Training Weapon</li>
                        <li>• Leather Outfit</li>
                        <li>• Health Potions (x5)</li>
                        <li>• Starting Penya: 1,000</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-purple-400 font-medium mb-2">Abilities:</h4>
                      <ul className="text-slate-300 space-y-1">
                        <li>• Basic Attack</li>
                        <li>• Item Usage</li>
                        <li>• Chat Communication</li>
                        <li>• Flying (Unlocks at level 20)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Create Button */}
                <div className="pt-4">
                  <Button
                    onClick={handleCreateCharacter}
                    disabled={isCreating || !characterName.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 text-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
                  >
                    {isCreating ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Creating Character...
                      </div>
                    ) : (
                      'Create Character & Enter Game'
                    )}
                  </Button>
                  
                  <p className="text-center text-xs text-slate-500 mt-2">
                    By creating a character, you agree to our terms of service
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-6">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ← Back to Main Menu
          </Button>
        </div>
      </div>
    </div>
  )
}