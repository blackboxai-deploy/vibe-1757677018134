import { Player, PlayerStats, PlayerSkill } from './Player'
import { Monster, MonsterAI } from './Monster'
import { Vector3 } from './Player'

export interface CombatResult {
  damage: number
  isCritical: boolean
  isHit: boolean
  attacker: string
  target: string
  skillUsed?: string
  effects?: CombatEffect[]
}

export interface CombatEffect {
  type: EffectType
  duration: number
  power: number
  stackable: boolean
}

export type EffectType = 
  | 'damage_over_time'
  | 'heal_over_time'
  | 'buff_attack'
  | 'buff_defense'
  | 'buff_speed'
  | 'debuff_attack'
  | 'debuff_defense'
  | 'debuff_speed'
  | 'stun'
  | 'silence'
  | 'blind'

export interface CombatInstance {
  id: string
  participants: string[] // Player/Monster IDs
  startTime: number
  lastActionTime: number
  isActive: boolean
}

export class CombatEngine {
  private static readonly CRITICAL_MULTIPLIER = 1.5
  private static readonly MISS_CHANCE_BASE = 0.05 // 5% base miss chance
  private static readonly COMBAT_TIMEOUT = 10000 // 10 seconds out of combat

  static calculatePlayerAttack(attacker: Player, target: Monster | Player): CombatResult {
    const attackerStats = attacker.stats
    const isMonsterTarget = 'templateId' in target
    const targetStats = isMonsterTarget ? target.stats : (target as Player).stats

    // Base damage calculation
    let baseDamage = attackerStats.attack
    
    // Add weapon damage if equipped
    if (attacker.equipment.weapon) {
      baseDamage += attacker.equipment.weapon.stats.attack || 0
    }

    // Calculate hit chance
    const hitChance = this.calculateHitChance(attackerStats.accuracy, targetStats.accuracy)
    const isHit = Math.random() < hitChance

    if (!isHit) {
      return {
        damage: 0,
        isCritical: false,
        isHit: false,
        attacker: attacker.id,
        target: target.id
      }
    }

    // Calculate defense reduction
    const defense = targetStats.defense
    const damageAfterDefense = Math.max(1, baseDamage - Math.floor(defense * 0.5))

    // Apply random variance (80% to 120%)
    const variance = 0.8 + Math.random() * 0.4
    let finalDamage = Math.floor(damageAfterDefense * variance)

    // Check for critical hit
    const criticalChance = attackerStats.criticalRate / 1000 // Convert to decimal
    const isCritical = Math.random() < criticalChance

    if (isCritical) {
      finalDamage = Math.floor(finalDamage * this.CRITICAL_MULTIPLIER)
    }

    // Apply class bonuses based on target type
    finalDamage = this.applyClassBonuses(attacker.class, finalDamage, isMonsterTarget)

    return {
      damage: Math.max(1, finalDamage),
      isCritical,
      isHit: true,
      attacker: attacker.id,
      target: target.id
    }
  }

  static calculateMonsterAttack(attacker: Monster, target: Player): CombatResult {
    return MonsterAI.calculateDamage(attacker, target) as any // Using the existing method
  }

  static calculateSkillDamage(caster: Player, target: Monster | Player, skill: PlayerSkill): CombatResult {
    const casterStats = caster.stats
    const isMonsterTarget = 'templateId' in target
    const targetStats = isMonsterTarget ? target.stats : (target as Player).stats

    // Base skill damage
    let baseDamage = skill.damage || 0
    
    // Scale with relevant stats based on skill type
    const statMultiplier = this.getSkillStatMultiplier(caster.class, skill, casterStats)
    baseDamage = Math.floor(baseDamage * (1 + statMultiplier))

    // Apply skill level scaling
    const levelMultiplier = 1 + (skill.level - 1) * 0.1 // 10% increase per level
    baseDamage = Math.floor(baseDamage * levelMultiplier)

    // Calculate hit chance (skills generally have higher accuracy)
    const skillAccuracy = casterStats.accuracy + 50 // Skills have bonus accuracy
    const hitChance = this.calculateHitChance(skillAccuracy, targetStats.accuracy)
    const isHit = Math.random() < hitChance

    if (!isHit) {
      return {
        damage: 0,
        isCritical: false,
        isHit: false,
        attacker: caster.id,
        target: target.id,
        skillUsed: skill.id
      }
    }

    // Calculate defense (skills may have different defense calculations)
    const defense = targetStats.defense
    const damageAfterDefense = Math.max(1, baseDamage - Math.floor(defense * 0.3)) // Skills penetrate more defense

    // Apply variance
    const variance = 0.9 + Math.random() * 0.2 // Less variance for skills (90% to 110%)
    let finalDamage = Math.floor(damageAfterDefense * variance)

    // Critical hits for skills
    const criticalChance = (casterStats.criticalRate + skill.level * 5) / 1000
    const isCritical = Math.random() < criticalChance

    if (isCritical) {
      finalDamage = Math.floor(finalDamage * this.CRITICAL_MULTIPLIER)
    }

    return {
      damage: Math.max(1, finalDamage),
      isCritical,
      isHit: true,
      attacker: caster.id,
      target: target.id,
      skillUsed: skill.id
    }
  }

  private static calculateHitChance(attackerAccuracy: number, targetAccuracy: number): number {
    const accuracyDiff = attackerAccuracy - targetAccuracy
    let hitChance = 0.95 - this.MISS_CHANCE_BASE // Base 95% hit rate
    
    // Modify based on accuracy difference
    if (accuracyDiff > 0) {
      hitChance = Math.min(0.99, hitChance + (accuracyDiff / 1000)) // Cap at 99%
    } else {
      hitChance = Math.max(0.5, hitChance + (accuracyDiff / 500)) // Minimum 50% hit chance
    }

    return hitChance
  }

  private static applyClassBonuses(playerClass: string, damage: number, isMonsterTarget: boolean): number {
    let multiplier = 1.0

    // Class-specific bonuses
    switch (playerClass) {
      case 'mercenary':
      case 'knight':
      case 'blade':
        // Physical damage classes get bonus against monsters
        if (isMonsterTarget) {
          multiplier = 1.1
        }
        break
      case 'magician':
      case 'elementor':
      case 'psykeeper':
        // Magic classes get different bonuses
        multiplier = 1.05
        break
      case 'assist':
      case 'ringmaster':
      case 'billposter':
        // Support classes have balanced damage
        multiplier = 1.0
        break
      case 'acrobat':
      case 'jester':
      case 'ranger':
        // Agility classes have higher crit but same base damage
        multiplier = 1.0
        break
    }

    return Math.floor(damage * multiplier)
  }

  private static getSkillStatMultiplier(playerClass: string, _skill: PlayerSkill, stats: PlayerStats): number {
    // Determine which stat affects the skill based on class
    switch (playerClass) {
      case 'mercenary':
      case 'knight':
      case 'blade':
      case 'acrobat':
      case 'jester':
      case 'ranger':
        return stats.strength / 100 // Strength-based
      
      case 'magician':
      case 'elementor':
      case 'psykeeper':
        return stats.intelligence / 100 // Intelligence-based
      
      case 'assist':
      case 'ringmaster':
      case 'billposter':
        return (stats.intelligence + stats.stamina) / 200 // Hybrid
      
      default:
        return stats.strength / 100
    }
  }

  static canUseSkill(player: Player, skill: PlayerSkill): { canUse: boolean; reason?: string } {
    const now = Date.now()

    // Check cooldown
    if (now - skill.lastUsed < skill.cooldown) {
      return {
        canUse: false,
        reason: 'Skill is on cooldown'
      }
    }

    // Check MP cost
    if (skill.cost.mp && player.stats.mp < skill.cost.mp) {
      return {
        canUse: false,
        reason: 'Not enough MP'
      }
    }

    // Check HP cost
    if (skill.cost.hp && player.stats.hp < skill.cost.hp) {
      return {
        canUse: false,
        reason: 'Not enough HP'
      }
    }

    // Check level requirement
    if (skill.requirements.level && player.stats.level < skill.requirements.level) {
      return {
        canUse: false,
        reason: 'Level too low'
      }
    }

    // Check class requirement
    if (skill.requirements.class && player.class !== skill.requirements.class) {
      return {
        canUse: false,
        reason: 'Wrong class'
      }
    }

    return { canUse: true }
  }

  static useSkill(player: Player, skill: PlayerSkill): Player {
    const canUse = this.canUseSkill(player, skill)
    if (!canUse.canUse) {
      throw new Error(canUse.reason)
    }

    const now = Date.now()
    const updatedSkills = player.skills.map(s => 
      s.id === skill.id ? { ...s, lastUsed: now } : s
    )

    const newStats = { ...player.stats }
    
    // Consume resources
    if (skill.cost.mp) {
      newStats.mp = Math.max(0, newStats.mp - skill.cost.mp)
    }
    if (skill.cost.hp) {
      newStats.hp = Math.max(1, newStats.hp - skill.cost.hp)
    }

    return {
      ...player,
      stats: newStats,
      skills: updatedSkills
    }
  }

  static calculateDistance(pos1: Vector3, pos2: Vector3): number {
    const dx = pos1.x - pos2.x
    const dy = pos1.y - pos2.y
    const dz = pos1.z - pos2.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  static isInAttackRange(attacker: { position: Vector3 }, target: { position: Vector3 }, range: number = 30): boolean {
    return this.calculateDistance(attacker.position, target.position) <= range
  }

  static calculateExperienceGain(playerLevel: number, monsterLevel: number, baseExp: number, partySize: number = 1): number {
    // Level difference modifier
    const levelDiff = monsterLevel - playerLevel
    let expMultiplier = 1.0

    if (levelDiff > 5) {
      expMultiplier = 1.5 // Bonus for fighting higher level monsters
    } else if (levelDiff < -5) {
      expMultiplier = Math.max(0.1, 1.0 + (levelDiff / 10)) // Penalty for lower level monsters
    }

    // Party experience bonus (diminishing returns)
    const partyBonus = partySize > 1 ? 1.0 + (partySize - 1) * 0.1 : 1.0

    return Math.floor(baseExp * expMultiplier * partyBonus)
  }

  static applyDamage(target: Player | Monster, damage: number): Player | Monster {
    const newHp = Math.max(0, target.stats.hp - damage)
    const isDead = newHp === 0

    if ('templateId' in target) {
      // Monster
      return {
        ...target,
        stats: {
          ...target.stats,
          hp: newHp
        },
        state: isDead ? 'dead' : target.state
      }
    } else {
      // Player
      return {
        ...target,
        stats: {
          ...target.stats,
          hp: newHp
        },
        isDead
      }
    }
  }

  static regenerateResources(player: Player, deltaTime: number): Player {
    const regenRate = deltaTime / 1000 // Convert to seconds

    // HP regeneration (1% of max HP per second out of combat)
    let newHp = player.stats.hp
    if (!player.isInCombat && newHp < player.stats.maxHp) {
      const hpRegen = Math.max(1, player.stats.maxHp * 0.01) * regenRate
      newHp = Math.min(player.stats.maxHp, newHp + hpRegen)
    }

    // MP regeneration (2% of max MP per second)
    let newMp = player.stats.mp
    if (newMp < player.stats.maxMp) {
      const mpRegen = Math.max(1, player.stats.maxMp * 0.02) * regenRate
      newMp = Math.min(player.stats.maxMp, newMp + mpRegen)
    }

    return {
      ...player,
      stats: {
        ...player.stats,
        hp: Math.floor(newHp),
        mp: Math.floor(newMp)
      }
    }
  }

  static createCombatInstance(participants: string[]): CombatInstance {
    return {
      id: `combat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      participants,
      startTime: Date.now(),
      lastActionTime: Date.now(),
      isActive: true
    }
  }

  static shouldEndCombat(combatInstance: CombatInstance): boolean {
    return Date.now() - combatInstance.lastActionTime > this.COMBAT_TIMEOUT
  }
}

export default CombatEngine