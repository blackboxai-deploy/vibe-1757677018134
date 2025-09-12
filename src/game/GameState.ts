import { create } from 'zustand'
import { Player } from './Player'
import { World, GameMap } from './World'
import { Monster } from './Monster'

export interface GameState {
  // Player State
  player: Player | null
  playersOnline: Map<string, Player>
  
  // World State
  currentMap: GameMap | null
  world: World | null
  
  // UI State
  isInventoryOpen: boolean
  isChatOpen: boolean
  isCharacterSheetOpen: boolean
  isQuestLogOpen: boolean
  
  // Game State
  isGameStarted: boolean
  isLoading: boolean
  gameTime: number
  
  // Combat State
  selectedTarget: Monster | Player | null
  inCombat: boolean
  
  // Chat State
  chatMessages: ChatMessage[]
  
  // Party State
  currentParty: Party | null
  partyInvites: PartyInvite[]
}

export interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  message: string
  timestamp: number
  type: 'world' | 'party' | 'whisper' | 'system'
  target?: string
}

export interface Party {
  id: string
  leaderId: string
  members: string[]
  maxMembers: number
  shareExp: boolean
}

export interface PartyInvite {
  id: string
  fromPlayerId: string
  fromPlayerName: string
  timestamp: number
}

export interface GameActions {
  // Player Actions
  setPlayer: (player: Player) => void
  updatePlayer: (updates: Partial<Player>) => void
  addPlayerOnline: (playerId: string, player: Player) => void
  removePlayerOnline: (playerId: string) => void
  
  // World Actions
  setCurrentMap: (map: GameMap) => void
  setWorld: (world: World) => void
  
  // UI Actions
  toggleInventory: () => void
  toggleChat: () => void
  toggleCharacterSheet: () => void
  toggleQuestLog: () => void
  
  // Game Actions
  startGame: () => void
  setLoading: (loading: boolean) => void
  updateGameTime: (time: number) => void
  
  // Combat Actions
  setTarget: (target: Monster | Player | null) => void
  enterCombat: () => void
  exitCombat: () => void
  
  // Chat Actions
  addChatMessage: (message: ChatMessage) => void
  clearChatMessages: () => void
  
  // Party Actions
  createParty: (leaderId: string) => void
  joinParty: (partyId: string, playerId: string) => void
  leaveParty: (playerId: string) => void
  addPartyInvite: (invite: PartyInvite) => void
  removePartyInvite: (inviteId: string) => void
}

export const useGameStore = create<GameState & GameActions>((set) => ({
  // Initial State
  player: null,
  playersOnline: new Map(),
  currentMap: null,
  world: null,
  isInventoryOpen: false,
  isChatOpen: true,
  isCharacterSheetOpen: false,
  isQuestLogOpen: false,
  isGameStarted: false,
  isLoading: false,
  gameTime: 0,
  selectedTarget: null,
  inCombat: false,
  chatMessages: [],
  currentParty: null,
  partyInvites: [],

  // Player Actions
  setPlayer: (player: Player) => set({ player }),
  
  updatePlayer: (updates: Partial<Player>) => set((state) => ({
    player: state.player ? { ...state.player, ...updates } : null
  })),
  
  addPlayerOnline: (playerId: string, player: Player) => set((state) => {
    const newPlayersOnline = new Map(state.playersOnline)
    newPlayersOnline.set(playerId, player)
    return { playersOnline: newPlayersOnline }
  }),
  
  removePlayerOnline: (playerId: string) => set((state) => {
    const newPlayersOnline = new Map(state.playersOnline)
    newPlayersOnline.delete(playerId)
    return { playersOnline: newPlayersOnline }
  }),

  // World Actions
  setCurrentMap: (map: GameMap) => set({ currentMap: map }),
  setWorld: (world: World) => set({ world }),

  // UI Actions
  toggleInventory: () => set((state) => ({ isInventoryOpen: !state.isInventoryOpen })),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  toggleCharacterSheet: () => set((state) => ({ isCharacterSheetOpen: !state.isCharacterSheetOpen })),
  toggleQuestLog: () => set((state) => ({ isQuestLogOpen: !state.isQuestLogOpen })),

  // Game Actions
  startGame: () => set({ isGameStarted: true, isLoading: false }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  updateGameTime: (time: number) => set({ gameTime: time }),

  // Combat Actions
  setTarget: (target: Monster | Player | null) => set({ selectedTarget: target }),
  enterCombat: () => set({ inCombat: true }),
  exitCombat: () => set({ inCombat: false, selectedTarget: null }),

  // Chat Actions
  addChatMessage: (message: ChatMessage) => set((state) => ({
    chatMessages: [...state.chatMessages.slice(-49), message] // Keep last 50 messages
  })),
  
  clearChatMessages: () => set({ chatMessages: [] }),

  // Party Actions
  createParty: (leaderId: string) => set({
    currentParty: {
      id: `party_${Date.now()}`,
      leaderId,
      members: [leaderId],
      maxMembers: 8,
      shareExp: true
    }
  }),
  
  joinParty: (partyId: string, playerId: string) => set((state) => {
    if (state.currentParty && state.currentParty.id === partyId) {
      return {
        currentParty: {
          ...state.currentParty,
          members: [...state.currentParty.members, playerId]
        }
      }
    }
    return state
  }),
  
  leaveParty: (playerId: string) => set((state) => {
    if (state.currentParty) {
      const newMembers = state.currentParty.members.filter(id => id !== playerId)
      if (newMembers.length === 0) {
        return { currentParty: null }
      }
      return {
        currentParty: {
          ...state.currentParty,
          members: newMembers,
          leaderId: state.currentParty.leaderId === playerId ? newMembers[0] : state.currentParty.leaderId
        }
      }
    }
    return state
  }),
  
  addPartyInvite: (invite: PartyInvite) => set((state) => ({
    partyInvites: [...state.partyInvites, invite]
  })),
  
  removePartyInvite: (inviteId: string) => set((state) => ({
    partyInvites: state.partyInvites.filter(invite => invite.id !== inviteId)
  }))
}))

// Game Event System
export class GameEventEmitter {
  private listeners: Map<string, Function[]> = new Map()

  on(event: string, listener: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(listener)
  }

  off(event: string, listener: Function) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(listener)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  emit(event: string, ...args: any[]) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(listener => listener(...args))
    }
  }

  removeAllListeners(event?: string) {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }
}

export const gameEvents = new GameEventEmitter()

// Game Constants
export const GAME_CONFIG = {
  MAX_LEVEL: 120,
  MAX_PARTY_SIZE: 8,
  MAX_GUILD_SIZE: 100,
  RESPAWN_TIME: 30000, // 30 seconds
  COMBAT_TIMEOUT: 10000, // 10 seconds out of combat
  CHAT_MESSAGE_LIMIT: 50,
  EXP_PENALTY_ON_DEATH: 0.05, // 5% exp loss
  MAX_INVENTORY_SLOTS: 42,
  MAX_BANK_SLOTS: 192,
  
  // Map boundaries
  MAP_BOUNDS: {
    MIN_X: -1000,
    MAX_X: 1000,
    MIN_Z: -1000,
    MAX_Z: 1000
  },
  
  // Flying mechanics
  FLYING: {
    MIN_LEVEL: 20,
    SPEED_MULTIPLIER: 1.5,
    STAMINA_DRAIN_RATE: 1, // per second
    MAX_FLYING_TIME: 300 // 5 minutes without stamina items
  }
}

export type GameEvent = 
  | 'player_joined'
  | 'player_left'
  | 'player_level_up'
  | 'player_died'
  | 'monster_killed'
  | 'item_acquired'
  | 'quest_completed'
  | 'party_formed'
  | 'party_disbanded'
  | 'combat_started'
  | 'combat_ended'
  | 'flying_started'
  | 'flying_ended'