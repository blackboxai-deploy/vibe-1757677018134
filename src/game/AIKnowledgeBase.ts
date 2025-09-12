export interface GameKnowledge {
  category: string
  keywords: string[]
  response: (context?: any) => string
}

export class AIKnowledgeBase {
  private static knowledge: GameKnowledge[] = [
    // Flying System
    {
      category: 'flying',
      keywords: ['fly', 'flying', 'board', 'wings', 'aerial', 'sky', 'flight'],
      response: (context) => `🪶 **Flying System in FLYFF:**

**Unlock Requirements:**
• Reach **Level 20** minimum
• Complete "Wings of Freedom" quest in Saint Morning
• Purchase Flying Board from Flying Instructor NPC (located near Saint Morning teleporter)

**Flying Controls:**
• **Space Bar**: Take off/Land
• **WASD**: Move while flying (50% faster than walking!)
• **Shift + W**: Fly higher (up to 300 units altitude)
• **Ctrl + S**: Fly lower/land
• **Mouse**: Control camera while flying

**Flying Mechanics:**
• Consumes **5 MP per second** while flying
• Flying speed: 150% of walking speed
• Can attack monsters while flying (aerial combat)
• Some areas are no-fly zones (dungeons, certain towns)
• Better boards = faster flying speed + less MP consumption

**Flying Board Types:**
• **Beginner Board**: Basic flight, cheap (1,000 Penya)
• **Advanced Board**: Faster, more efficient (5,000 Penya)
• **Master Board**: Professional flying (15,000 Penya)
• **Legendary Wings**: Fastest flight, premium item

${context?.player?.level < 20 ? `**Your Progress**: Level ${context.player.level}/20 - ${20 - context.player.level} levels to go! 🎯` : '**You can fly now!** Visit Saint Morning to get your board! ✨'}`
    },

    // Character Classes
    {
      category: 'classes',
      keywords: ['class', 'job', 'character', 'mercenary', 'assist', 'magician', 'vagrant'],
      response: (context) => `⚔️ **FLYFF Character Class System:**

**Starting Class (Level 1-14):**
• **Vagrant**: Versatile beginner - balanced stats, can become any class

**First Job Change (Level 15):**
• **Mercenary**: Melee fighter - High HP/Defense, sword/axe weapons
• **Assist**: Support class - Healing, buffs, party support
• **Magician**: Ranged caster - Powerful spells, low HP but high damage

**Second Job Change (Level 60):**

**Mercenary Path:**
• **Blade**: Speed fighter - Critical hits, dual weapons, fast attacks
• **Knight**: Tank specialist - Shields, high defense, party protection

**Assist Path:**
• **Ringmaster**: Master healer - Best healing/buffs, essential for parties
• **Billposter**: Battle support - Knuckle weapons, combat + healing

**Magician Path:**
• **Elementor**: Elemental magic - Fire/Water/Earth spells, AoE damage
• **Psychikeeper**: Mind magic - Powerful single-target, crowd control

**Class Change Requirements:**
• Level 15 for first job change
• Level 60 for second job change
• Visit Class Master NPCs in major cities
• Complete class-specific quests

${context?.player ? `**Your Status**: ${context.player.playerClass} - Level ${context.player.level}` : ''}

**Pro Tips:**
• Each class has unique skill trees
• Plan your build before job changes
• Second job change is permanent - choose wisely!`
    },

    // Leveling Guide
    {
      category: 'leveling',
      keywords: ['level', 'exp', 'experience', 'grind', 'farm', 'training'],
      response: (context) => {
        const playerLevel = context?.player?.level || 1
        let levelGuide = ''
        
        if (playerLevel <= 10) {
          levelGuide = `**Levels 1-10 (Beginner Zone):**
• **Location**: Flaris surroundings
• **Monsters**: Small Fry, Peakon, Lawolf
• **Strategy**: Complete all tutorial quests first
• **Time**: 30-45 minutes
• **Tips**: Learn basic controls, experiment with skills`
        } else if (playerLevel <= 20) {
          levelGuide = `**Levels 10-20 (Pre-Flying):**
• **Location**: Training Ground, outer Flaris
• **Monsters**: Mushpang, Dumpling, Fefern
• **Strategy**: Join parties for 15% EXP bonus
• **Time**: 1-2 hours
• **Tips**: Prepare for job change at level 15`
        } else if (playerLevel <= 40) {
          levelGuide = `**Levels 20-40 (Flying Unlocked!):**
• **Location**: Saint Morning area
• **Monsters**: Bangdoll, Cardpuppet, Burudeng
• **Strategy**: Use flying for efficient monster hunting
• **Time**: 3-5 hours
• **Tips**: Aerial combat gives positioning advantage`
        } else if (playerLevel <= 60) {
          levelGuide = `**Levels 40-60 (Advanced Areas):**
• **Location**: Darkon regions
• **Monsters**: Higher level creatures
• **Strategy**: Group hunting recommended
• **Time**: 8-12 hours
• **Tips**: Prepare for second job change at 60`
        } else {
          levelGuide = `**Levels 60+ (Endgame):**
• **Location**: High-level dungeons, raid areas
• **Strategy**: Guild activities, premium content
• **Focus**: Equipment upgrades, PvP, guild wars
• **Tips**: Master your second job skills`
        }
        
        return `📈 **Complete Leveling Guide:**

${levelGuide}

**Universal Leveling Tips:**
• **Party Bonus**: 2+ players = 15% extra EXP
• **Monster Level**: Hunt monsters ±5 levels for optimal EXP
• **Color System**: Green monsters = best EXP/time ratio
• **EXP Potions**: Use during active grinding sessions
• **Quests**: Complete all available quests (huge EXP rewards)

**EXP Multipliers:**
• Solo grinding: 100% EXP
• 2-player party: 115% EXP each
• 3+ player party: 120% EXP each
• Premium account: +50% EXP boost
• EXP potions: +25-100% temporary boost

**Efficient Grinding Strategy:**
1. Find monster cluster with fast respawn
2. Form party with complementary classes
3. Use AoE skills for multiple monsters
4. Keep HP/MP potions stocked
5. Repair equipment regularly

${context?.player ? `**Current Recommendation for Level ${playerLevel}**: ${levelGuide.split('**Strategy**')[1]?.split('•')[1] || 'Focus on your current level range!'} 🎯` : ''}`
      }
    },

    // Party System
    {
      category: 'party',
      keywords: ['party', 'group', 'team', 'invite', 'join', 'guild'],
      response: () => `👥 **Party & Social System:**

**Party Formation:**
• **Create**: Right-click player → "Invite to Party"
• **Command**: Type \`/party [playername]\` in chat
• **Accept**: Click "Yes" when invited
• **Maximum**: 8 players per party

**Party Benefits:**
• **EXP Bonus**: 15-20% extra experience for all members
• **Shared EXP**: All party members get EXP from kills
• **Area Looting**: Items drop for everyone nearby
• **Party Chat**: Private communication channel
• **Buff Sharing**: Assist skills affect entire party
• **Safety**: Revive fallen party members

**Party Commands:**
• \`/party [name]\` - Invite player to party
• \`/party kick [name]\` - Remove player (leader only)
• \`/party leave\` - Leave current party
• \`/party leader [name]\` - Transfer party leadership
• \`/party info\` - Show party member list

**Optimal Party Compositions:**

**Balanced Party (4 players):**
• 1 Tank (Knight) - Draw monster aggro
• 1 Healer (Ringmaster) - Keep party alive
• 2 DPS (Blade/Elementor) - Deal damage

**EXP Grinding Party (6 players):**
• 1 Ringmaster (buffs + healing)
• 4-5 Damage dealers (any class)
• Focus on fast monster clearing

**Flying Party:**
• All members with flying boards
• Aerial monster hunting
• Cover more ground quickly

**Guild System:**
• **Create Guild**: Visit Guild Master NPC (10,000 Penya)
• **Guild Benefits**: Guild chat, shared resources, guild wars
• **Guild Skills**: Special abilities for guild members
• **Guild Hall**: Private area for guild activities

**Social Tips:**
• Be respectful - reputation matters
• Share rare items with party
• Coordinate attacks for efficiency
• Use voice chat for advanced strategies
• Help lower level players - build community`
    },

    // Equipment & Items
    {
      category: 'equipment',
      keywords: ['equipment', 'weapon', 'armor', 'item', 'gear', 'upgrade', 'enhance'],
      response: (context) => `⚔️ **Equipment & Item System:**

**Equipment Rarity & Colors:**
• **White (Normal)**: Basic items, common drops
• **Blue (Rare)**: Enhanced stats, uncommon drops
• **Purple (Unique)**: Significantly better stats, rare drops
• **Gold (Legendary)**: Best equipment, extremely rare

**Equipment Slots:**
• **Main Hand**: Weapon (sword, wand, bow, knuckle, etc.)
• **Off Hand**: Shield, dual weapon, or two-handed space
• **Helmet**: Head protection
• **Armor**: Chest protection
• **Gauntlets**: Hand protection
• **Boots**: Foot protection
• **Suit**: Fashion item with stats
• **Ring**: Accessory (2 slots)
• **Necklace**: Accessory (1 slot)

**Where to Get Equipment:**

**NPC Shops:**
• Basic equipment for your level
• Reliable but limited selection
• Good for starting gear

**Monster Drops:**
• Rare and unique items
• Random stats and bonuses
• Best source for upgrades

**Player Trading:**
• Best deals and rare items
• Negotiate prices
• Check market values

**Dungeons & Raids:**
• Highest tier equipment
• Legendary items
• Group content required

**Equipment Enhancement:**

**Safe Enhancement (1-3):**
• Visit Weapon/Armor Smith NPCs
• Use basic enhancement stones
• 100% success rate
• Small stat increases

**Risky Enhancement (4+):**
• Higher level stones required
• Chance of failure increases
• Item may break on failure
• Massive stat bonuses if successful

**Enhancement Materials:**
• **Sunstone**: Weapon enhancement
• **Moonstone**: Armor enhancement
• **Glow Stone**: Higher success chance
• **Bless of Nature**: Prevents item destruction

**Equipment Maintenance:**
• **Durability**: Equipment degrades with use
• **Repair**: Visit repair NPCs to restore durability
• **Cost**: Repair cost based on item value
• **Broken Items**: 0 durability = no bonuses

**Shopping Strategy:**
• Check required level before buying
• Compare stats with current equipment
• Consider class restrictions
• Factor in enhancement potential
• Don't forget to repair regularly

${context?.player ? `**For Level ${context.player.level}**: Look for equipment in the level ${Math.max(1, context.player.level - 5)}-${context.player.level + 5} range for optimal stats! 🎯` : ''}

**Pro Tips:**
• Higher level = better base stats
• Enhanced equipment is always better
• Set items provide bonus effects
• Some items are class-specific
• Store valuable items in bank`
    },

    // Combat System
    {
      category: 'combat',
      keywords: ['combat', 'fight', 'battle', 'pvp', 'pk', 'skill', 'attack'],
      response: () => `⚡ **Combat System Guide:**

**Basic Combat Mechanics:**
• **Target Selection**: Click monster to select target
• **Auto Attack**: Click attack button or press spacebar
• **Attack Speed**: Determined by weapon type + DEX stat
• **Critical Hits**: Based on DEX stat + weapon bonuses
• **Block/Dodge**: STR affects block rate, DEX affects dodge

**Combat Controls:**
• **Left Click**: Select target
• **Spacebar**: Attack selected target
• **F1-F8**: Use skills in skill slots
• **Tab**: Target nearest enemy
• **Ctrl+Click**: Force attack (PvP mode)

**Damage Calculation:**
• **Base Damage**: Weapon attack + STR stat bonus
• **Defense**: Target's defense reduces damage
• **Elemental**: Some attacks have elemental bonuses
• **Critical**: 150-300% damage on critical hits

**Skill System:**
• **Skill Points**: Gained each level up
• **Skill Trees**: Class-specific abilities
• **Cooldowns**: Most skills have reuse timers
• **MP Cost**: Skills consume MP
• **Skill Slots**: Drag skills to F1-F8 for quick use

**PvP Combat:**
• **Level Requirement**: Must be level 15+
• **PvP Mode**: Type \`/pvp\` to enable
• **Challenge**: Right-click player → "Challenge to PvP"
• **Honor System**: Fair fights increase honor rating
• **Consequences**: PKing may reduce honor

**Combat Strategies by Class:**

**Mercenary/Blade:**
• High close-range damage
• Use speed and criticals
• Hit-and-run tactics
• Stack STR and DEX

**Knight:**
• Tank damage for party
• Use shields effectively
• Focus on defense
• Stack STA and STR

**Assist/Ringmaster:**
• Support party with buffs
• Heal during combat
• Stay at safe distance
• Focus on INT for healing

**Magician/Elementor:**
• Long-range magical damage
• Use AoE spells for groups
• Kite enemies
• Stack INT for damage

**Psychikeeper:**
• Powerful single-target spells
• Crowd control abilities
• Tactical positioning
• Balance INT and STA

**Flying Combat:**
• 3D movement advantage
• Aerial positioning
• Flying monsters require flying
• Harder to target but more mobile

**Combat Tips:**
• Always carry HP/MP potions
• Learn your class skill rotations
• Use terrain to your advantage
• Practice combo attacks
• Master flying combat for endgame`
    },

    // NPCs and Locations
    {
      category: 'locations',
      keywords: ['npc', 'location', 'where', 'find', 'town', 'city', 'map'],
      response: () => `📍 **NPC & Location Guide:**

**Flaris (Starting City):**
• **Instructor Iris** - Tutorial quests, beginner shop
• **Banker Raymond** - Bank services, item storage
• **Oracle Guide** - AI assistant (that's me! 🤖)
• **Teleporter** - Fast travel to other cities
• **General Shop** - Potions, basic equipment
• **Weapon Smith** - Equipment enhancement

**Saint Morning (Level 15+ City):**
• **Class Master John** - First job changes (level 15)
• **Flying Instructor** - Flying boards and lessons
• **Advanced Shops** - Higher tier equipment
• **Guild Master** - Guild creation and management
• **Upgrade Masters** - High-level enhancements

**Training Ground:**
• **Training Master** - Combat tutorials
• **Safe Grinding** - Practice area for new players
• **Respawn Area** - Fast monster respawns

**Darkon Areas (High Level):**
• **Second Job Masters** - Level 60 job changes
• **Dungeon Entrances** - Group content
• **Raid Masters** - Organize raid parties
• **Premium NPCs** - Special services

**Important NPC Types:**

**Shops & Services:**
• **Weapon Shop** - Swords, axes, wands, bows
• **Armor Shop** - Helmets, armor, boots, gloves
• **General Store** - Potions, food, basic items
• **Bank** - Item storage, safe keeping
• **Repair Shop** - Fix damaged equipment

**Enhancement & Upgrades:**
• **Weapon Smith** - Enhance weapons
• **Armor Smith** - Enhance armor
• **Jewel Master** - Ring/necklace services

**Special NPCs:**
• **Quest Masters** - Major story quests
• **Class Masters** - Job change services
• **Flying Instructors** - Flight training
• **Guild Masters** - Guild services
• **Teleporters** - Fast travel between cities

**Navigation Tips:**
• **Mini-Map**: Top-right corner shows nearby NPCs
• **World Map**: Press 'M' key for full map
• **NPC Markers**: ! = new quest, ? = turn in quest
• **Shop Icons**: Different symbols for different services
• **Flying Routes**: Aerial paths between major cities

**Fast Travel Network:**
• **Teleporter Cost**: 500-2000 Penya depending on distance
• **Level Requirements**: Some destinations require minimum level
• **Flying Alternative**: Often faster than teleporting
• **Guild Halls**: Private teleport points for guild members

**Hidden Locations:**
• **Secret Dungeons** - Discovered through exploration
• **Flying-Only Areas** - Accessible only by air
• **Event Locations** - Temporary during special events
• **PvP Zones** - Dedicated player combat areas

**Location Tips:**
• Talk to all NPCs - they give valuable information
• Explore thoroughly - hidden treasures everywhere
• Use landmarks to navigate
• Flying gives best overview of areas
• Some NPCs only appear at certain times`
    },

    // General Game Help
    {
      category: 'general',
      keywords: ['help', 'how', 'what', 'when', 'why', 'guide', 'tutorial'],
      response: () => `🎮 **General FLYFF Guide:**

**New Player Checklist:**
1. Complete tutorial quests in Flaris
2. Learn basic combat mechanics
3. Join your first party at level 10
4. Plan your job change for level 15
5. Save money for flying board at level 20
6. Explore Saint Morning after job change
7. Prepare for second job change at level 60

**Essential Game Mechanics:**
• **Stats**: STR (attack), STA (HP), DEX (critical/accuracy), INT (MP/magic)
• **Leveling**: Hunt monsters, complete quests, join parties
• **Equipment**: Upgrade weapons/armor for better stats
• **Flying**: Unlock at level 20 for faster travel
• **Classes**: Choose path at level 15, specialize at level 60

**Daily Activities:**
• **Quests**: Complete available daily/weekly quests
• **Grinding**: Hunt monsters for EXP and items
• **Social**: Chat with other players, join parties
• **Trading**: Buy/sell items with other players
• **Guild**: Participate in guild activities

**Resource Management:**
• **Penya**: Primary currency - save for important purchases
• **Inventory**: Manage space, store valuable items in bank
• **Potions**: Always carry HP/MP recovery items
• **Equipment**: Regular maintenance and upgrades
• **Skills**: Plan skill point allocation carefully

**Important Hotkeys:**
• **M**: World map
• **I**: Inventory
• **C**: Character stats
• **K**: Skill tree
• **Enter**: Chat
• **F1-F8**: Use skills
• **Space**: Attack
• **Tab**: Target nearest enemy

**Community Guidelines:**
• Be respectful to other players
• Help newcomers learn the game
• Trade fairly and honestly
• Report bugs and cheaters
• Participate in community events

**Getting Help:**
• **NPCs**: Talk to everyone for information
• **Players**: Ask in world chat
• **Guides**: Check community guides and wikis
• **AI Assistant**: Ask me specific questions! 🤖

**Troubleshooting:**
• **Lag**: Check your internet connection
• **Bugs**: Report to administrators
• **Stuck**: Use /unstick command or relog
• **Lost**: Check map or ask for directions
• **Confused**: Don't hesitate to ask for help!`
    }
  ]

  public static searchKnowledge(query: string, context?: any): string {
    const queryLower = query.toLowerCase()
    
    // Find matching knowledge by keywords
    const matchingKnowledge = this.knowledge.find(knowledge => 
      knowledge.keywords.some(keyword => queryLower.includes(keyword))
    )
    
    if (matchingKnowledge) {
      return matchingKnowledge.response(context)
    }
    
    // Default fallback response
    return this.getDefaultResponse(query)
  }

  private static getDefaultResponse(query: string): string {
    return `🤖 **AI Assistant Response:**

I'm still learning about: "${query}"

**I can help you with:**
• ✈️ **Flying System** - How to fly, boards, controls
• ⚔️ **Character Classes** - Job changes, skills, builds
• 📈 **Leveling Guide** - Where to grind, EXP tips
• 👥 **Party System** - Group play, social features
• 🛡️ **Equipment** - Gear, upgrades, enhancement
• ⚡ **Combat** - Fighting, PvP, skills
• 📍 **Locations** - NPCs, towns, navigation
• 🎮 **General Help** - Game mechanics, tips

**Suggestions:**
• Try rephrasing your question
• Ask about specific game features
• Use keywords like "flying", "classes", "leveling"
• Check the in-game help system (F1)

**Popular Questions:**
• "How do I fly in the game?"
• "What character class should I choose?"
• "Where should I level up?"
• "How does the party system work?"

Feel free to ask me anything about these topics! 🎯`
  }

  public static getQuickQuestions(): string[] {
    return [
      "How do I fly in the game?",
      "What are the different character classes?", 
      "Where can I level up efficiently?",
      "How does the party system work?",
      "What monsters should I fight at my level?",
      "How do I get better equipment?",
      "Where are the important NPCs?",
      "How does PvP combat work?"
    ]
  }

  public static getCategories(): string[] {
    return [...new Set(this.knowledge.map(k => k.category))]
  }
}

export default AIKnowledgeBase