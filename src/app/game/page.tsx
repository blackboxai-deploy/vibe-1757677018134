'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/game/GameState'
import PlayerManager, { Player } from '@/game/Player'
import { World } from '@/game/World'
import { GameRenderer } from '@/game/Renderer'
import { GameHUD } from '@/components/game/GameHUD'
import { GameInventory } from '@/components/game/GameInventory'
import { GameChat } from '@/components/game/GameChat'
import { GameSkillBar } from '@/components/game/GameSkillBar'
import { AIHelperButton } from '@/components/game/AIHelperButton'

export default function GamePage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<GameRenderer | null>(null)
  const worldRef = useRef<World | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState('Initializing game world...')
  
  const {
    player,
    setPlayer,
    setWorld,
    setCurrentMap,
    isInventoryOpen,
    isChatOpen,
    startGame,
    setLoading,
    isGameStarted
  } = useGameStore()

  useEffect(() => {
    initializeGame()
    return () => {
      // Cleanup on unmount
      if (rendererRef.current) {
        rendererRef.current.dispose()
      }
    }
  }, [])

  const initializeGame = async () => {
    try {
      // Load character from localStorage
      setLoadingMessage('Loading your character...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const savedCharacter = localStorage.getItem('flyff_character')
      if (!savedCharacter) {
        router.push('/character')
        return
      }
      
      const characterData = JSON.parse(savedCharacter) as Player
      setPlayer(characterData)
      
      // Initialize world
      setLoadingMessage('Loading world data...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const world = new World()
      worldRef.current = world
      setWorld(world)
      
      // Set starting map
      const startingMap = world.getMap('flaris')
      if (startingMap) {
        setCurrentMap(startingMap)
        
        // Spawn player at random spawn point
        const spawnPoint = world.getRandomSpawnPoint('flaris')
        if (spawnPoint) {
          const updatedPlayer = {
            ...characterData,
            position: spawnPoint
          }
          setPlayer(updatedPlayer)
        }
      }
      
      // Initialize renderer
      setLoadingMessage('Loading 3D world...')
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      if (canvasRef.current && startingMap) {
        const renderer = new GameRenderer(canvasRef.current, {
          antialias: true,
          shadows: true,
          fogEnabled: true,
          particleCount: 500
        })
        
        rendererRef.current = renderer
        
        // Load the map
        renderer.loadMap(startingMap)
        
        // Add player to renderer
        renderer.addPlayer(characterData)
        
        // Spawn some monsters for the map
        world.spawnMonstersForMap('flaris')
        
        // Add monsters to renderer
        world.activeMonsters.forEach((monster) => {
          renderer.addMonster(monster)
        })
      }
      
      setLoadingMessage('Ready to play!')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setIsLoading(false)
      setLoading(false)
      startGame()
      
    } catch (error) {
      console.error('Failed to initialize game:', error)
      setLoadingMessage('Failed to load game. Returning to main menu...')
      setTimeout(() => router.push('/'), 2000)
    }
  }

  const handleMovement = (direction: { x: number; z: number }) => {
    if (!player || !rendererRef.current) return
    
    const moveSpeed = 50
    const newPosition = {
      x: player.position.x + direction.x * moveSpeed,
      y: player.position.y,
      z: player.position.z + direction.z * moveSpeed
    }
    
    // Update player position
    const updatedPlayer = { ...player, position: newPosition }
    setPlayer(updatedPlayer)
    
    // Update renderer
    rendererRef.current.updatePlayer(updatedPlayer)
    rendererRef.current.updateCameraPosition(newPosition)
  }

  const handleKeyPress = (event: KeyboardEvent) => {
    if (!isGameStarted) return
    
    switch (event.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        handleMovement({ x: 0, z: -1 })
        break
      case 's':
      case 'arrowdown':
        handleMovement({ x: 0, z: 1 })
        break
      case 'a':
      case 'arrowleft':
        handleMovement({ x: -1, z: 0 })
        break
      case 'd':
      case 'arrowright':
        handleMovement({ x: 1, z: 0 })
        break
      case 'i':
        useGameStore.getState().toggleInventory()
        break
      case 'enter':
        useGameStore.getState().toggleChat()
        break
      case 'escape':
        // Show game menu
        break
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [isGameStarted, player])

  // Game loop
  useEffect(() => {
    if (!isGameStarted || !worldRef.current) return
    
    const gameLoop = setInterval(() => {
      // Update world (monster AI, etc.)
      worldRef.current!.update(16) // ~60 FPS
      
      // Update monsters in renderer
      if (rendererRef.current) {
        worldRef.current!.activeMonsters.forEach((monster) => {
          rendererRef.current!.updateMonster(monster)
        })
      }
    }, 16)
    
    return () => {
      clearInterval(gameLoop)
    }
  }, [isGameStarted])

  if (isLoading || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-purple-400 mx-auto mb-8"></div>
          <h2 className="text-4xl font-['Cinzel'] text-white mb-4">FLYFF Online</h2>
          <p className="text-xl text-purple-300 mb-2">{loadingMessage}</p>
          <div className="w-96 bg-slate-800 rounded-full h-2 mx-auto">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full animate-pulse w-full"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-black relative">
      {/* 3D Game Canvas */}
      <div 
        ref={canvasRef} 
        className="absolute inset-0 z-0"
        style={{ cursor: 'crosshair' }}
      />
      
      {/* Game UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="relative h-full w-full">
          {/* HUD - Always visible */}
          <div className="pointer-events-auto">
            <GameHUD player={player} />
          </div>
          
          {/* Skill Bar - Bottom center */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
            <GameSkillBar player={player} />
          </div>
          
          {/* Chat - Bottom left */}
          {isChatOpen && (
            <div className="absolute bottom-20 left-4 pointer-events-auto">
              <GameChat />
            </div>
          )}
          
          {/* Inventory - Right side */}
          {isInventoryOpen && (
            <div className="absolute top-4 right-4 pointer-events-auto">
              <GameInventory player={player} />
            </div>
          )}
          
          {/* Game Menu Buttons - Top right */}
          <div className="absolute top-4 right-4 pointer-events-auto flex gap-3">
            <AIHelperButton />
            <button
              onClick={() => router.push('/')}
              className="bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg backdrop-blur-sm border border-red-500/50 transition-all"
            >
              Exit Game
            </button>
          </div>
          
          {/* Controls Help - Top left */}
          <div className="absolute top-4 left-4 pointer-events-auto">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30 text-white text-sm">
              <h3 className="font-semibold mb-2 text-purple-300">Controls:</h3>
              <div className="space-y-1 text-xs">
                <p><span className="text-yellow-400">WASD / Arrow Keys:</span> Move</p>
                <p><span className="text-yellow-400">I:</span> Toggle Inventory</p>
                <p><span className="text-yellow-400">Enter:</span> Toggle Chat</p>
                <p><span className="text-yellow-400">Mouse:</span> Look Around</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading overlay for map changes */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 items-center justify-center hidden" id="map-loading">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-lg">Changing area...</p>
        </div>
      </div>
    </div>
  )
}