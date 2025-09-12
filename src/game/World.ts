import { Vector3 } from './Player'
import { Monster, MonsterManager, MONSTER_TEMPLATES } from './Monster'

export interface GameMap {
  id: string
  name: string
  description: string
  
  // Map boundaries
  bounds: {
    minX: number
    maxX: number
    minZ: number
    maxZ: number
    minY: number
    maxY: number
  }
  
  // Spawn points
  playerSpawnPoints: Vector3[]
  monsterSpawns: MonsterSpawn[]
  
  // NPCs
  npcs: NPC[]
  
  // Teleporters
  teleporters: Teleporter[]
  
  // Environment
  skybox: string
  terrain: string
  ambientLight: {
    color: string
    intensity: number
  }
  
  // Flying zones
  flyingEnabled: boolean
  flyingAreas?: FlyingArea[]
  
  // PvP settings
  pvpEnabled: boolean
  
  // Level restrictions
  minLevel: number
  maxLevel: number
}

export interface MonsterSpawn {
  id: string
  templateId: string
  position: Vector3
  spawnRadius: number
  maxCount: number
  respawnTime: number
  patrolPath?: Vector3[]
  
  // Conditional spawning
  timeRestriction?: {
    startHour: number
    endHour: number
  }
  levelRestriction?: {
    minLevel: number
    maxLevel: number
  }
}

export interface NPC {
  id: string
  name: string
  position: Vector3
  rotation: number
  type: NPCType
  
  // Appearance
  model: string
  texture: string
  scale: number
  
  // Interaction
  dialogue: DialogueNode[]
  questIds: string[]
  shopItems?: ShopItem[]
  
  // Services
  services: NPCService[]
}

export type NPCType = 
  | 'quest_giver'
  | 'shop_keeper' 
  | 'guild_master'
  | 'flying_instructor'
  | 'class_master'
  | 'banker'
  | 'teleporter'
  | 'general'

export type NPCService = 
  | 'shop'
  | 'bank'
  | 'repair'
  | 'upgrade'
  | 'quest'
  | 'class_change'
  | 'guild'
  | 'flying_license'
  | 'teleport'
  | 'ai_guide'

export interface DialogueNode {
  id: string
  text: string
  options: DialogueOption[]
  conditions?: DialogueCondition[]
}

export interface DialogueOption {
  id: string
  text: string
  nextNodeId?: string
  action?: DialogueAction
}

export interface DialogueCondition {
  type: 'level' | 'class' | 'quest' | 'item' | 'penya'
  value: any
  operator: '>' | '<' | '=' | '>=' | '<=' | '!='
}

export interface DialogueAction {
  type: 'shop' | 'quest' | 'class_change' | 'teleport' | 'bank' | 'close' | 'ai_guide'
  data?: any
}

export interface ShopItem {
  itemId: string
  price: number
  stock: number
  restockTime?: number
  requiredLevel?: number
  requiredClass?: string[]
}

export interface Teleporter {
  id: string
  name: string
  position: Vector3
  targetMapId: string
  targetPosition: Vector3
  cost: number
  requiredLevel: number
  activationRange: number
}

export interface FlyingArea {
  id: string
  name: string
  bounds: {
    minX: number
    maxX: number
    minZ: number
    maxZ: number
    minY: number
    maxY: number
  }
  requiredLevel: number
  flyingOnly: boolean
}

export class World {
  public maps: Map<string, GameMap> = new Map()
  public activeMonsters: Map<string, Monster> = new Map()
  public lastUpdate: number = Date.now()
  
  constructor() {
    this.initializeMaps()
  }

  private initializeMaps(): void {
    // Initialize default maps
    this.maps.set('flaris', this.createFlarisMap())
    this.maps.set('saint_morning', this.createSaintMorningMap())
    this.maps.set('training_ground', this.createTrainingGroundMap())
  }

  private createFlarisMap(): GameMap {
    return {
      id: 'flaris',
      name: 'Flaris',
      description: 'The peaceful starting city where all adventures begin.',
      bounds: {
        minX: -500,
        maxX: 500,
        minZ: -500,
        maxZ: 500,
        minY: 0,
        maxY: 200
      },
      playerSpawnPoints: [
        { x: 0, y: 0, z: 0 },
        { x: 50, y: 0, z: 50 },
        { x: -50, y: 0, z: -50 }
      ],
      monsterSpawns: [
        {
          id: 'fry_spawn_1',
          templateId: 'small_fry',
          position: { x: 200, y: 0, z: 100 },
          spawnRadius: 50,
          maxCount: 8,
          respawnTime: 30000,
          patrolPath: [
            { x: 180, y: 0, z: 80 },
            { x: 220, y: 0, z: 120 },
            { x: 200, y: 0, z: 140 },
            { x: 160, y: 0, z: 100 }
          ]
        },
        {
          id: 'mushpang_spawn_1',
          templateId: 'mushpang',
          position: { x: -200, y: 0, z: -150 },
          spawnRadius: 80,
          maxCount: 5,
          respawnTime: 45000
        }
      ],
      npcs: [
        {
          id: 'instructor_iris',
          name: 'Instructor Iris',
          position: { x: 0, y: 0, z: -100 },
          rotation: 0,
          type: 'quest_giver',
          model: 'instructor_female',
          texture: 'instructor_iris',
          scale: 1.0,
          dialogue: [
            {
              id: 'welcome',
              text: 'Welcome to Flaris, young adventurer! Are you ready to begin your journey?',
              options: [
                {
                  id: 'yes',
                  text: 'Yes, I\'m ready!',
                  nextNodeId: 'tutorial_quest'
                },
                {
                  id: 'shop',
                  text: 'I need some equipment first.',
                  action: { type: 'shop' }
                },
                {
                  id: 'no',
                  text: 'Not yet.',
                  action: { type: 'close' }
                }
              ]
            },
            {
              id: 'tutorial_quest',
              text: 'Excellent! Your first task is to defeat 5 Small Fry to the east. This will help you learn the basics of combat.',
              options: [
                {
                  id: 'accept',
                  text: 'I accept!',
                  action: { type: 'quest', data: { questId: 'tutorial_combat' } }
                }
              ]
            }
          ],
          questIds: ['tutorial_combat', 'welcome_to_flaris'],
          shopItems: [
            { itemId: 'short_sword', price: 100, stock: 10, requiredLevel: 1 },
            { itemId: 'leather_armor', price: 150, stock: 5, requiredLevel: 1 },
            { itemId: 'health_potion', price: 25, stock: 50 }
          ],
          services: ['quest', 'shop']
        },
         {
          id: 'banker_raymond',
          name: 'Banker Raymond',
          position: { x: -150, y: 0, z: 0 },
          rotation: Math.PI / 2,
          type: 'banker',
          model: 'banker_male',
          texture: 'banker_raymond',
          scale: 1.0,
          dialogue: [
            {
              id: 'welcome_bank',
              text: 'Welcome to the Flaris Bank! How may I help you today?',
              options: [
                {
                  id: 'deposit',
                  text: 'I want to deposit items.',
                  action: { type: 'bank', data: { mode: 'deposit' } }
                },
                {
                  id: 'withdraw',
                  text: 'I want to withdraw items.',
                  action: { type: 'bank', data: { mode: 'withdraw' } }
                },
                {
                  id: 'goodbye',
                  text: 'Nothing for now, thanks.',
                  action: { type: 'close' }
                }
              ]
            }
          ],
          questIds: [],
          services: ['bank']
        },
        {
          id: 'ai_guide',
          name: 'Oracle Guide',
          position: { x: 100, y: 0, z: -100 },
          rotation: 0,
          type: 'general',
          model: 'oracle_guide',
          texture: 'oracle_guide',
          scale: 1.1,
          dialogue: [
            {
              id: 'ai_welcome',
              text: 'Greetings, adventurer! I am the Oracle Guide, powered by ancient AI magic. I possess knowledge of all things in this world - from the secrets of flying to the mysteries of combat classes. What would you like to learn about your journey through FLYFF?',
              options: [
                {
                  id: 'ask_ai',
                  text: '🤖 Ask AI Assistant',
                  action: { type: 'ai_guide' }
                },
                {
                  id: 'quick_flying',
                  text: '✈️ Tell me about flying',
                  action: { type: 'ai_guide', data: { question: 'How do I fly in the game?' } }
                },
                {
                  id: 'quick_classes',
                  text: '⚔️ Explain character classes',
                  action: { type: 'ai_guide', data: { question: 'What are the different character classes?' } }
                },
                {
                  id: 'goodbye',
                  text: '👋 Maybe later',
                  action: { type: 'close' }
                }
              ]
            }
          ],
          questIds: [],
          services: ['ai_guide' as NPCService]
        }
      ],
      teleporters: [
        {
          id: 'flaris_to_saint_morning',
          name: 'Teleporter to Saint Morning',
          position: { x: 400, y: 0, z: 0 },
          targetMapId: 'saint_morning',
          targetPosition: { x: -400, y: 0, z: 0 },
          cost: 500,
          requiredLevel: 15,
          activationRange: 30
        }
      ],
      skybox: 'flaris_sky',
      terrain: 'flaris_terrain',
      ambientLight: {
        color: '#ffffff',
        intensity: 0.8
      },
      flyingEnabled: true,
      flyingAreas: [
        {
          id: 'flaris_sky',
          name: 'Flaris Sky Area',
          bounds: {
            minX: -500,
            maxX: 500,
            minZ: -500,
            maxZ: 500,
            minY: 50,
            maxY: 300
          },
          requiredLevel: 20,
          flyingOnly: false
        }
      ],
      pvpEnabled: false,
      minLevel: 1,
      maxLevel: 30
    }
  }

  private createSaintMorningMap(): GameMap {
    return {
      id: 'saint_morning',
      name: 'Saint Morning',
      description: 'A bustling city for intermediate adventurers.',
      bounds: {
        minX: -800,
        maxX: 800,
        minZ: -800,
        maxZ: 800,
        minY: 0,
        maxY: 300
      },
      playerSpawnPoints: [
        { x: -400, y: 0, z: 0 }
      ],
      monsterSpawns: [
        {
          id: 'burudeng_spawn_1',
          templateId: 'burudeng',
          position: { x: 300, y: 0, z: 200 },
          spawnRadius: 120,
          maxCount: 6,
          respawnTime: 60000
        }
      ],
      npcs: [
        {
          id: 'class_master_john',
          name: 'Class Master John',
          position: { x: -350, y: 0, z: -50 },
          rotation: 0,
          type: 'class_master',
          model: 'class_master_male',
          texture: 'class_master_john',
          scale: 1.1,
          dialogue: [
            {
              id: 'class_change',
              text: 'I can help you change your class when you reach level 15. What class interests you?',
              options: [
                {
                  id: 'mercenary',
                  text: 'I want to become a Mercenary.',
                  action: { type: 'class_change', data: { targetClass: 'mercenary' } },
                  nextNodeId: 'mercenary_info'
                },
                {
                  id: 'assist',
                  text: 'I want to become an Assist.',
                  action: { type: 'class_change', data: { targetClass: 'assist' } }
                },
                {
                  id: 'magician',
                  text: 'I want to become a Magician.',
                  action: { type: 'class_change', data: { targetClass: 'magician' } }
                }
              ],
              conditions: [
                { type: 'level', value: 15, operator: '>=' }
              ]
            }
          ],
          questIds: [],
          services: ['class_change']
        }
      ],
      teleporters: [
        {
          id: 'saint_morning_to_flaris',
          name: 'Teleporter to Flaris',
          position: { x: -400, y: 0, z: 0 },
          targetMapId: 'flaris',
          targetPosition: { x: 400, y: 0, z: 0 },
          cost: 500,
          requiredLevel: 1,
          activationRange: 30
        }
      ],
      skybox: 'saint_morning_sky',
      terrain: 'saint_morning_terrain',
      ambientLight: {
        color: '#ffffcc',
        intensity: 0.9
      },
      flyingEnabled: true,
      pvpEnabled: false,
      minLevel: 15,
      maxLevel: 60
    }
  }

  private createTrainingGroundMap(): GameMap {
    return {
      id: 'training_ground',
      name: 'Training Ground',
      description: 'A safe area for new players to practice combat.',
      bounds: {
        minX: -300,
        maxX: 300,
        minZ: -300,
        maxZ: 300,
        minY: 0,
        maxY: 100
      },
      playerSpawnPoints: [
        { x: 0, y: 0, z: -250 }
      ],
      monsterSpawns: [
        {
          id: 'training_fry_spawn',
          templateId: 'small_fry',
          position: { x: 0, y: 0, z: 100 },
          spawnRadius: 150,
          maxCount: 15,
          respawnTime: 15000,
          levelRestriction: {
            minLevel: 1,
            maxLevel: 10
          }
        }
      ],
      npcs: [
        {
          id: 'training_master',
          name: 'Training Master',
          position: { x: 0, y: 0, z: -200 },
          rotation: 0,
          type: 'general',
          model: 'training_master',
          texture: 'training_master',
          scale: 1.2,
          dialogue: [
            {
              id: 'training_welcome',
              text: 'Welcome to the Training Ground! Here you can safely practice combat against Small Fry. They respawn quickly and give good experience for beginners.',
              options: [
                {
                  id: 'thanks',
                  text: 'Thanks for the information!',
                  action: { type: 'close' }
                },
                {
                  id: 'tips',
                  text: 'Any combat tips?',
                  nextNodeId: 'combat_tips'
                }
              ]
            },
            {
              id: 'combat_tips',
              text: 'Click on a monster to select it, then click the attack button or press the spacebar to attack. Watch your HP and use potions when needed!',
              options: [
                {
                  id: 'understood',
                  text: 'I understand!',
                  action: { type: 'close' }
                }
              ]
            }
          ],
          questIds: [],
          services: []
        }
      ],
      teleporters: [],
      skybox: 'training_sky',
      terrain: 'training_terrain',
      ambientLight: {
        color: '#ffffff',
        intensity: 1.0
      },
      flyingEnabled: false,
      pvpEnabled: false,
      minLevel: 1,
      maxLevel: 15
    }
  }

  public update(_deltaTime: number): void {
    const now = Date.now()
    
    // Update all active monsters
    this.activeMonsters.forEach((monster, monsterId) => {
      if (monster.state === 'dead') {
        // Check if monster should respawn
        const template = MONSTER_TEMPLATES[monster.templateId]
        if (template && now - monster.spawnTime >= template.spawnDelay) {
          // Respawn monster
          const respawnedMonster = {
            ...monster,
            state: 'idle' as const,
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
          this.activeMonsters.set(monsterId, respawnedMonster)
        }
      } else {
        // Update monster AI - would need players map from game state
        // For now, we'll just update the monster in place
        // const updatedMonster = MonsterAI.update(monster, playersMap, deltaTime)
        // this.activeMonsters.set(monsterId, updatedMonster)
      }
    })

    this.lastUpdate = now
  }

  public getMap(mapId: string): GameMap | undefined {
    return this.maps.get(mapId)
  }

  public spawnMonstersForMap(mapId: string): void {
    const gameMap = this.maps.get(mapId)
    if (!gameMap) return

    gameMap.monsterSpawns.forEach(spawn => {
      const currentCount = this.countMonstersInSpawn(spawn.id)
      const spawnNeeded = spawn.maxCount - currentCount

      for (let i = 0; i < spawnNeeded; i++) {
        const angle = Math.random() * Math.PI * 2
        const distance = Math.random() * spawn.spawnRadius
        const position: Vector3 = {
          x: spawn.position.x + Math.cos(angle) * distance,
          y: spawn.position.y,
          z: spawn.position.z + Math.sin(angle) * distance
        }

        const monster = MonsterManager.createMonster(spawn.templateId, position, spawn.patrolPath)
        this.activeMonsters.set(monster.id, monster)
      }
    })
  }

  private countMonstersInSpawn(_spawnId: string): number {
    // Count monsters that belong to this spawn
    // This would need to track which spawn each monster came from
    // For now, return 0 to allow spawning
    return 0
  }

  public removeMonster(monsterId: string): void {
    this.activeMonsters.delete(monsterId)
  }

  public getMonstersInRange(position: Vector3, range: number): Monster[] {
    const monstersInRange: Monster[] = []
    
    this.activeMonsters.forEach(monster => {
      const distance = this.calculateDistance(position, monster.position)
      if (distance <= range && monster.state !== 'dead') {
        monstersInRange.push(monster)
      }
    })

    return monstersInRange
  }

  private calculateDistance(pos1: Vector3, pos2: Vector3): number {
    const dx = pos1.x - pos2.x
    const dy = pos1.y - pos2.y
    const dz = pos1.z - pos2.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  public isPositionValid(mapId: string, position: Vector3): boolean {
    const gameMap = this.maps.get(mapId)
    if (!gameMap) return false

    return (
      position.x >= gameMap.bounds.minX &&
      position.x <= gameMap.bounds.maxX &&
      position.y >= gameMap.bounds.minY &&
      position.y <= gameMap.bounds.maxY &&
      position.z >= gameMap.bounds.minZ &&
      position.z <= gameMap.bounds.maxZ
    )
  }

  public getRandomSpawnPoint(mapId: string): Vector3 | null {
    const gameMap = this.maps.get(mapId)
    if (!gameMap || gameMap.playerSpawnPoints.length === 0) return null

    const randomIndex = Math.floor(Math.random() * gameMap.playerSpawnPoints.length)
    return { ...gameMap.playerSpawnPoints[randomIndex] }
  }
}

export default World