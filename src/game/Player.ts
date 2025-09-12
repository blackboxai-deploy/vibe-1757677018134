export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface PlayerStats {
  level: number
  experience: number
  experienceToNext: number
  
  // Primary Stats
  strength: number      // Affects physical damage
  stamina: number       // Affects HP and defense
  dexterity: number     // Affects accuracy and speed
  intelligence: number  // Affects MP and magic damage
  
  // Derived Stats
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  attack: number
  defense: number
  accuracy: number
  speed: number
  criticalRate: number
  
  // Available stat points
  statPoints: number
}

export interface PlayerEquipment {
  weapon: Item | null
  armor: Item | null
  helmet: Item | null
  boots: Item | null
  gloves: Item | null
  shield: Item | null
  suit: Item | null
  ring1: Item | null
  ring2: Item | null
  necklace: Item | null
  flyingBoard: Item | null
}

export interface Item {
  id: string
  name: string
  type: ItemType
  rarity: ItemRarity
  level: number
  stats: Partial<PlayerStats>
  description: string
  icon: string
  value: number
  stackable: boolean
  maxStack?: number
}

export type ItemType = 
  | 'weapon' | 'armor' | 'helmet' | 'boots' | 'gloves' | 'shield' 
  | 'suit' | 'ring' | 'necklace' | 'consumable' | 'quest' | 'flying'
  | 'material' | 'upgrade'

export type ItemRarity = 'normal' | 'rare' | 'unique' | 'legendary'

export interface InventorySlot {
  item: Item | null
  quantity: number
}

export interface PlayerSkill {
  id: string
  name: string
  level: number
  maxLevel: number
  description: string
  icon: string
  cooldown: number
  lastUsed: number
  damage?: number
  cost: {
    mp?: number
    hp?: number
    stamina?: number
  }
  requirements: {
    level?: number
    class?: PlayerClass
    skills?: string[]
  }
}

export type PlayerClass = 
  | 'vagrant'     // Starting class
  | 'mercenary'   // Fighter -> Mercenary
  | 'assist'      // Assist
  | 'magician'    // Magician
  | 'acrobat'     // Fighter -> Acrobat (unlock at Mercenary)
  | 'elementor'   // Magician -> Elementor
  | 'psykeeper'   // Magician -> Psykeeper
  | 'ringmaster'  // Assist -> Ringmaster
  | 'billposter'  // Assist -> Billposter
  | 'knight'      // Mercenary -> Knight
  | 'blade'       // Mercenary -> Blade
  | 'jester'      // Acrobat -> Jester
  | 'ranger'      // Acrobat -> Ranger

export interface Player {
  id: string
  name: string
  class: PlayerClass
  position: Vector3
  rotation: number
  
  // Character progression
  stats: PlayerStats
  equipment: PlayerEquipment
  inventory: InventorySlot[]
  skills: PlayerSkill[]
  
  // Game state
  isFlying: boolean
  isInCombat: boolean
  isDead: boolean
  
  // Social
  guildId?: string
  partyId?: string
  
  // Game mechanics
  penya: number // FLYFF currency
  bankPenya: number
  bankItems: InventorySlot[]
  
  // Time tracking
  onlineTime: number
  lastLogin: number
  createdAt: number
}

export class PlayerManager {
  static calculateExperienceToNext(level: number): number {
    // FLYFF-like experience curve
    const baseExp = 1000
    const multiplier = Math.pow(1.2, level - 1)
    return Math.floor(baseExp * multiplier)
  }

  static calculateDerivedStats(stats: PlayerStats, equipment: PlayerEquipment): Partial<PlayerStats> {
    let equipmentBonus = {
      strength: 0,
      stamina: 0,
      dexterity: 0,
      intelligence: 0,
      hp: 0,
      mp: 0,
      attack: 0,
      defense: 0,
      accuracy: 0,
      speed: 0,
      criticalRate: 0
    }

    // Calculate equipment bonuses
    Object.values(equipment).forEach(item => {
      if (item) {
        equipmentBonus.strength += item.stats.strength || 0
        equipmentBonus.stamina += item.stats.stamina || 0
        equipmentBonus.dexterity += item.stats.dexterity || 0
        equipmentBonus.intelligence += item.stats.intelligence || 0
        equipmentBonus.attack += item.stats.attack || 0
        equipmentBonus.defense += item.stats.defense || 0
      }
    })

    const totalStrength = stats.strength + equipmentBonus.strength
    const totalStamina = stats.stamina + equipmentBonus.stamina
    const totalDexterity = stats.dexterity + equipmentBonus.dexterity
    const totalIntelligence = stats.intelligence + equipmentBonus.intelligence

    // Calculate derived stats based on FLYFF formulas
    const maxHp = Math.floor((stats.level * 10) + (totalStamina * 5) + equipmentBonus.hp)
    const maxMp = Math.floor((stats.level * 8) + (totalIntelligence * 4) + equipmentBonus.mp)
    const attack = Math.floor(totalStrength * 1.5 + stats.level * 2 + equipmentBonus.attack)
    const defense = Math.floor(totalStamina * 1.2 + stats.level * 1.5 + equipmentBonus.defense)
    const accuracy = Math.floor(totalDexterity * 1.3 + stats.level * 1.2)
    const speed = Math.floor(totalDexterity * 0.8 + stats.level * 0.5)
    const criticalRate = Math.floor(totalDexterity * 0.3 + totalStrength * 0.2)

    return {
      maxHp,
      maxMp,
      attack,
      defense,
      accuracy,
      speed,
      criticalRate,
      hp: Math.min(stats.hp, maxHp),
      mp: Math.min(stats.mp, maxMp)
    }
  }

  static levelUp(player: Player): Player {
    const newLevel = player.stats.level + 1
    const newStats = {
      ...player.stats,
      level: newLevel,
      experience: player.stats.experience - player.stats.experienceToNext,
      experienceToNext: this.calculateExperienceToNext(newLevel),
      statPoints: player.stats.statPoints + 5 // Gain 5 stat points per level
    }

    // Recalculate derived stats
    const derivedStats = this.calculateDerivedStats(newStats, player.equipment)
    
    return {
      ...player,
      stats: {
        ...newStats,
        ...derivedStats,
        hp: derivedStats.maxHp || newStats.hp,
        mp: derivedStats.maxMp || newStats.mp
      }
    }
  }

  static gainExperience(player: Player, amount: number): Player {
    const newExperience = player.stats.experience + amount
    let newPlayer = { ...player }
    
    newPlayer.stats = {
      ...player.stats,
      experience: newExperience
    }

    // Check for level up
    while (newPlayer.stats.experience >= newPlayer.stats.experienceToNext && newPlayer.stats.level < 120) {
      newPlayer = this.levelUp(newPlayer)
    }

    return newPlayer
  }

  static allocateStatPoints(player: Player, stat: keyof Pick<PlayerStats, 'strength' | 'stamina' | 'dexterity' | 'intelligence'>, points: number): Player {
    if (player.stats.statPoints < points) {
      throw new Error('Not enough stat points')
    }

    const newStats = {
      ...player.stats,
      [stat]: player.stats[stat] + points,
      statPoints: player.stats.statPoints - points
    }

    const derivedStats = this.calculateDerivedStats(newStats, player.equipment)

    return {
      ...player,
      stats: {
        ...newStats,
        ...derivedStats
      }
    }
  }

  static equipItem(player: Player, item: Item, slot: keyof PlayerEquipment): Player {
    const newEquipment = { ...player.equipment }
    const oldItem = newEquipment[slot]
    
    // Unequip old item to inventory if exists
    let newInventory = [...player.inventory]
    if (oldItem) {
      const emptySlot = newInventory.findIndex(slot => slot.item === null)
      if (emptySlot !== -1) {
        newInventory[emptySlot] = { item: oldItem, quantity: 1 }
      } else {
        throw new Error('Inventory is full')
      }
    }

    // Remove item from inventory
    const itemSlot = newInventory.findIndex(slot => slot.item?.id === item.id)
    if (itemSlot !== -1) {
      if (newInventory[itemSlot].quantity > 1) {
        newInventory[itemSlot] = {
          ...newInventory[itemSlot],
          quantity: newInventory[itemSlot].quantity - 1
        }
      } else {
        newInventory[itemSlot] = { item: null, quantity: 0 }
      }
    }

    newEquipment[slot] = item

    // Recalculate stats with new equipment
    const derivedStats = this.calculateDerivedStats(player.stats, newEquipment)

    return {
      ...player,
      equipment: newEquipment,
      inventory: newInventory,
      stats: {
        ...player.stats,
        ...derivedStats
      }
    }
  }

  static createNewPlayer(name: string, playerClass: PlayerClass = 'vagrant'): Player {
    const baseStats: PlayerStats = {
      level: 1,
      experience: 0,
      experienceToNext: this.calculateExperienceToNext(1),
      strength: 15,
      stamina: 15,
      dexterity: 15,
      intelligence: 15,
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      attack: 20,
      defense: 10,
      accuracy: 50,
      speed: 10,
      criticalRate: 5,
      statPoints: 0
    }

    const emptyEquipment: PlayerEquipment = {
      weapon: null,
      armor: null,
      helmet: null,
      boots: null,
      gloves: null,
      shield: null,
      suit: null,
      ring1: null,
      ring2: null,
      necklace: null,
      flyingBoard: null
    }

    // Initialize inventory with empty slots
    const inventory: InventorySlot[] = Array(42).fill(null).map(() => ({ item: null, quantity: 0 }))
    const bankItems: InventorySlot[] = Array(192).fill(null).map(() => ({ item: null, quantity: 0 }))

    const player: Player = {
      id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      class: playerClass,
      position: { x: 0, y: 0, z: 0 },
      rotation: 0,
      stats: baseStats,
      equipment: emptyEquipment,
      inventory,
      skills: [],
      isFlying: false,
      isInCombat: false,
      isDead: false,
      penya: 1000, // Starting money
      bankPenya: 0,
      bankItems,
      onlineTime: 0,
      lastLogin: Date.now(),
      createdAt: Date.now()
    }

    // Calculate initial derived stats
    const derivedStats = this.calculateDerivedStats(baseStats, emptyEquipment)
    player.stats = { ...baseStats, ...derivedStats }

    return player
  }
}

export default PlayerManager