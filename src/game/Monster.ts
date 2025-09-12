import { Vector3, Item } from './Player'

export interface MonsterStats {
  level: number
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  attack: number
  defense: number
  accuracy: number
  speed: number
  criticalRate: number
  
  // Special stats
  magicResist: number
  physicalResist: number
  expReward: number
  penyaReward: number
}

export interface Monster {
  id: string
  templateId: string
  name: string
  level: number
  position: Vector3
  rotation: number
  stats: MonsterStats
  
  // AI State
  state: MonsterState
  target: string | null // Player ID
  spawnPoint: Vector3
  patrolPath?: Vector3[]
  currentPatrolIndex: number
  
  // Combat
  isInCombat: boolean
  combatStartTime: number
  lastAttackTime: number
  
  // Drops
  dropTable: DropItem[]
  
  // Timing
  spawnTime: number
  lastMoveTime: number
  
  // Visual
  model: string
  texture: string
  scale: number
}

export type MonsterState = 
  | 'idle'
  | 'patrolling'
  | 'chasing'
  | 'attacking'
  | 'returning'
  | 'dead'
  | 'respawning'

export interface DropItem {
  itemId: string
  dropRate: number // 0-1 (0% to 100%)
  minQuantity: number
  maxQuantity: number
}

export interface MonsterTemplate {
  id: string
  name: string
  level: number
  baseStats: MonsterStats
  model: string
  texture: string
  scale: number
  
  // AI Behavior
  aggroRange: number
  maxChaseDistance: number
  attackRange: number
  attackCooldown: number
  patrolRadius: number
  
  // Rewards
  expReward: number
  penyaMin: number
  penyaMax: number
  dropTable: DropItem[]
  
  // Spawn settings
  spawnDelay: number // respawn time in ms
  maxSpawns: number
}

export class MonsterAI {
  static update(monster: Monster, players: Map<string, any>, deltaTime: number): Monster {
    const now = Date.now()
    let newMonster = { ...monster }

    switch (monster.state) {
      case 'idle':
        newMonster = this.handleIdleState(newMonster, players, now)
        break
      case 'patrolling':
        newMonster = this.handlePatrolState(newMonster, players, now, deltaTime)
        break
      case 'chasing':
        newMonster = this.handleChaseState(newMonster, players, now, deltaTime)
        break
      case 'attacking':
        newMonster = this.handleAttackState(newMonster, players, now)
        break
      case 'returning':
        newMonster = this.handleReturnState(newMonster, now, deltaTime)
        break
      case 'dead':
        newMonster = this.handleDeadState(newMonster, now)
        break
    }

    return newMonster
  }

  private static handleIdleState(monster: Monster, players: Map<string, any>, now: number): Monster {
    // Look for nearby players to aggro
    const nearbyPlayer = this.findNearestPlayerInRange(monster, players, 50) // 50 unit aggro range
    
    if (nearbyPlayer) {
      return {
        ...monster,
        state: 'chasing',
        target: nearbyPlayer.id,
        isInCombat: true,
        combatStartTime: now
      }
    }

    // Start patrolling if no players nearby and has patrol path
    if (monster.patrolPath && monster.patrolPath.length > 0) {
      return {
        ...monster,
        state: 'patrolling'
      }
    }

    return monster
  }

  private static handlePatrolState(monster: Monster, players: Map<string, any>, now: number, deltaTime: number): Monster {
    // Check for nearby players first
    const nearbyPlayer = this.findNearestPlayerInRange(monster, players, 50)
    
    if (nearbyPlayer) {
      return {
        ...monster,
        state: 'chasing',
        target: nearbyPlayer.id,
        isInCombat: true,
        combatStartTime: now
      }
    }

    // Move along patrol path
    if (monster.patrolPath && monster.patrolPath.length > 0) {
      const targetPoint = monster.patrolPath[monster.currentPatrolIndex]
      const distance = this.calculateDistance(monster.position, targetPoint)
      
      if (distance < 5) { // Close enough to patrol point
        const nextIndex = (monster.currentPatrolIndex + 1) % monster.patrolPath.length
        return {
          ...monster,
          currentPatrolIndex: nextIndex
        }
      } else {
        // Move towards patrol point
        const direction = this.normalize({
          x: targetPoint.x - monster.position.x,
          y: 0,
          z: targetPoint.z - monster.position.z
        })
        
        const speed = monster.stats.speed * deltaTime * 0.001 // Convert to units per ms
        const newPosition = {
          x: monster.position.x + direction.x * speed,
          y: monster.position.y,
          z: monster.position.z + direction.z * speed
        }
        
        return {
          ...monster,
          position: newPosition,
          lastMoveTime: now
        }
      }
    }

    return monster
  }

  private static handleChaseState(monster: Monster, players: Map<string, any>, now: number, deltaTime: number): Monster {
    const target = players.get(monster.target!)
    
    if (!target) {
      return {
        ...monster,
        state: 'returning',
        target: null,
        isInCombat: false
      }
    }

    const distance = this.calculateDistance(monster.position, target.position)
    const maxChaseDistance = 200 // Max chase distance
    const attackRange = 30 // Attack range
    
    // Too far from spawn point - return
    const spawnDistance = this.calculateDistance(monster.position, monster.spawnPoint)
    if (spawnDistance > maxChaseDistance) {
      return {
        ...monster,
        state: 'returning',
        target: null,
        isInCombat: false
      }
    }

    // Close enough to attack
    if (distance <= attackRange) {
      return {
        ...monster,
        state: 'attacking'
      }
    }

    // Chase the target
    const direction = this.normalize({
      x: target.position.x - monster.position.x,
      y: 0,
      z: target.position.z - monster.position.z
    })
    
    const chaseSpeed = monster.stats.speed * 1.2 // Slightly faster when chasing
    const speed = chaseSpeed * deltaTime * 0.001
    const newPosition = {
      x: monster.position.x + direction.x * speed,
      y: monster.position.y,
      z: monster.position.z + direction.z * speed
    }
    
    return {
      ...monster,
      position: newPosition,
      lastMoveTime: now
    }
  }

  private static handleAttackState(monster: Monster, players: Map<string, any>, now: number): Monster {
    const target = players.get(monster.target!)
    
    if (!target) {
      return {
        ...monster,
        state: 'returning',
        target: null,
        isInCombat: false
      }
    }

    const distance = this.calculateDistance(monster.position, target.position)
    const attackRange = 30
    
    // Target moved out of attack range
    if (distance > attackRange) {
      return {
        ...monster,
        state: 'chasing'
      }
    }

    // Check attack cooldown
    const attackCooldown = 2000 // 2 second attack cooldown
    if (now - monster.lastAttackTime >= attackCooldown) {
      // Perform attack
      return {
        ...monster,
        lastAttackTime: now
      }
    }

    return monster
  }

  private static handleReturnState(monster: Monster, now: number, deltaTime: number): Monster {
    const distance = this.calculateDistance(monster.position, monster.spawnPoint)
    
    if (distance < 5) { // Close enough to spawn point
      return {
        ...monster,
        state: 'idle',
        stats: {
          ...monster.stats,
          hp: monster.stats.maxHp,
          mp: monster.stats.maxMp
        }
      }
    }

    // Move back to spawn point
    const direction = this.normalize({
      x: monster.spawnPoint.x - monster.position.x,
      y: 0,
      z: monster.spawnPoint.z - monster.position.z
    })
    
    const speed = monster.stats.speed * deltaTime * 0.001
    const newPosition = {
      x: monster.position.x + direction.x * speed,
      y: monster.position.y,
      z: monster.position.z + direction.z * speed
    }
    
    return {
      ...monster,
      position: newPosition,
      lastMoveTime: now
    }
  }

  private static handleDeadState(monster: Monster, now: number): Monster {
    const respawnDelay = 30000 // 30 seconds respawn time
    
    if (now - monster.spawnTime >= respawnDelay) {
      return {
        ...monster,
        state: 'idle',
        position: monster.spawnPoint,
        stats: {
          ...monster.stats,
          hp: monster.stats.maxHp,
          mp: monster.stats.maxMp
        },
        spawnTime: now,
        target: null,
        isInCombat: false
      }
    }

    return monster
  }

  private static findNearestPlayerInRange(monster: Monster, players: Map<string, any>, range: number): any | null {
    let nearestPlayer = null
    let nearestDistance = range

    players.forEach((player) => {
      if (player.isDead) return
      
      const distance = this.calculateDistance(monster.position, player.position)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestPlayer = player
      }
    })

    return nearestPlayer
  }

  private static calculateDistance(pos1: Vector3, pos2: Vector3): number {
    const dx = pos1.x - pos2.x
    const dy = pos1.y - pos2.y
    const dz = pos1.z - pos2.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  private static normalize(vector: Vector3): Vector3 {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z)
    if (length === 0) return { x: 0, y: 0, z: 0 }
    
    return {
      x: vector.x / length,
      y: vector.y / length,
      z: vector.z / length
    }
  }

  static calculateDamage(monster: Monster, target: any): number {
    const baseDamage = monster.stats.attack
    const defense = target.stats.defense
    const random = 0.8 + Math.random() * 0.4 // 80% to 120% damage variance
    
    let damage = Math.max(1, Math.floor((baseDamage - defense * 0.5) * random))
    
    // Critical hit check
    const critChance = monster.stats.criticalRate / 1000 // Convert to percentage
    if (Math.random() < critChance) {
      damage = Math.floor(damage * 1.5)
    }
    
    return damage
  }
}

// Predefined monster templates
export const MONSTER_TEMPLATES: { [key: string]: MonsterTemplate } = {
  'small_fry': {
    id: 'small_fry',
    name: 'Small Fry',
    level: 1,
    baseStats: {
      level: 1,
      hp: 50,
      maxHp: 50,
      mp: 10,
      maxMp: 10,
      attack: 8,
      defense: 3,
      accuracy: 20,
      speed: 15,
      criticalRate: 10,
      magicResist: 0,
      physicalResist: 0,
      expReward: 25,
      penyaReward: 5
    },
    model: 'small_fry',
    texture: 'small_fry_texture',
    scale: 1.0,
    aggroRange: 40,
    maxChaseDistance: 150,
    attackRange: 25,
    attackCooldown: 2000,
    patrolRadius: 30,
    expReward: 25,
    penyaMin: 3,
    penyaMax: 8,
    dropTable: [
      { itemId: 'penya', dropRate: 1.0, minQuantity: 3, maxQuantity: 8 }
    ],
    spawnDelay: 30000,
    maxSpawns: 5
  },
  
  'mushpang': {
    id: 'mushpang',
    name: 'Mushpang',
    level: 3,
    baseStats: {
      level: 3,
      hp: 120,
      maxHp: 120,
      mp: 25,
      maxMp: 25,
      attack: 15,
      defense: 8,
      accuracy: 35,
      speed: 12,
      criticalRate: 15,
      magicResist: 5,
      physicalResist: 2,
      expReward: 85,
      penyaReward: 12
    },
    model: 'mushpang',
    texture: 'mushpang_texture',
    scale: 1.2,
    aggroRange: 50,
    maxChaseDistance: 200,
    attackRange: 30,
    attackCooldown: 2500,
    patrolRadius: 40,
    expReward: 85,
    penyaMin: 8,
    penyaMax: 18,
    dropTable: [
      { itemId: 'penya', dropRate: 1.0, minQuantity: 8, maxQuantity: 18 },
      { itemId: 'mushroom', dropRate: 0.3, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'leather_gloves', dropRate: 0.05, minQuantity: 1, maxQuantity: 1 }
    ],
    spawnDelay: 45000,
    maxSpawns: 3
  },

  'burudeng': {
    id: 'burudeng',
    name: 'Burudeng',
    level: 8,
    baseStats: {
      level: 8,
      hp: 450,
      maxHp: 450,
      mp: 80,
      maxMp: 80,
      attack: 42,
      defense: 25,
      accuracy: 65,
      speed: 18,
      criticalRate: 25,
      magicResist: 12,
      physicalResist: 8,
      expReward: 285,
      penyaReward: 35
    },
    model: 'burudeng',
    texture: 'burudeng_texture',
    scale: 1.5,
    aggroRange: 60,
    maxChaseDistance: 250,
    attackRange: 35,
    attackCooldown: 2000,
    patrolRadius: 50,
    expReward: 285,
    penyaMin: 25,
    penyaMax: 50,
    dropTable: [
      { itemId: 'penya', dropRate: 1.0, minQuantity: 25, maxQuantity: 50 },
      { itemId: 'iron_ore', dropRate: 0.4, minQuantity: 1, maxQuantity: 3 },
      { itemId: 'short_sword', dropRate: 0.08, minQuantity: 1, maxQuantity: 1 },
      { itemId: 'leather_armor', dropRate: 0.06, minQuantity: 1, maxQuantity: 1 }
    ],
    spawnDelay: 60000,
    maxSpawns: 2
  }
}

export class MonsterManager {
  static createMonster(templateId: string, position: Vector3, patrolPath?: Vector3[]): Monster {
    const template = MONSTER_TEMPLATES[templateId]
    if (!template) {
      throw new Error(`Monster template ${templateId} not found`)
    }

    return {
      id: `monster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId,
      name: template.name,
      level: template.level,
      position,
      rotation: Math.random() * Math.PI * 2,
      stats: { ...template.baseStats },
      state: 'idle',
      target: null,
      spawnPoint: { ...position },
      patrolPath,
      currentPatrolIndex: 0,
      isInCombat: false,
      combatStartTime: 0,
      lastAttackTime: 0,
      dropTable: [...template.dropTable],
      spawnTime: Date.now(),
      lastMoveTime: Date.now(),
      model: template.model,
      texture: template.texture,
      scale: template.scale
    }
  }

  static generateDrops(monster: Monster): Item[] {
    const drops: Item[] = []
    
    monster.dropTable.forEach(drop => {
      if (Math.random() < drop.dropRate) {
        const quantity = Math.floor(Math.random() * (drop.maxQuantity - drop.minQuantity + 1)) + drop.minQuantity
        
        // Create drop item (simplified - would normally fetch from item database)
        if (drop.itemId === 'penya') {
          // Handle penya differently as it's not a regular item
          return
        }
        
        for (let i = 0; i < quantity; i++) {
          drops.push({
            id: `${drop.itemId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: drop.itemId.replace('_', ' '),
            type: 'material',
            rarity: 'normal',
            level: 1,
            stats: {},
            description: `A ${drop.itemId.replace('_', ' ')} dropped by ${monster.name}`,
            icon: drop.itemId,
            value: 10,
            stackable: true,
            maxStack: 99
          })
        }
      }
    })
    
    return drops
  }
}

export default MonsterManager