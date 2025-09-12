export interface GameKnowledge {
  topic: string
  keywords: string[]
  answer: string
  followUp?: string[]
}

export class AIGameHelper {
  private knowledge: GameKnowledge[] = [
    // Character & Classes
    {
      topic: "character_creation",
      keywords: ["character", "create", "class", "vagrant", "stats", "beginning"],
      answer: "Um einen Charakter zu erstellen, wähle einen Namen und die Vagrant-Klasse. Als Vagrant startest du mit ausgeglichenen Stats (15 STR/STA/DEX/INT) und kannst ab Level 15 zu Mercenary, Assist oder Magician wechseln.",
      followUp: ["Welche Klasse ist am besten für Anfänger?", "Wie funktioniert das Leveling?"]
    },
    {
      topic: "classes",
      keywords: ["mercenary", "assist", "magician", "klasse", "class", "evolution", "job"],
      answer: "Es gibt 3 Hauptklassen:\n• Mercenary (STR-basiert): Hoher Schaden, tanky, wird zu Knight/Blade\n• Assist (INT/STA): Supporter, Buffs/Heals, wird zu Ringmaster/Billposter\n• Magician (INT): Magische Angriffe, wird zu Elementor/Psykeeper",
      followUp: ["Wann kann ich die Klasse wechseln?", "Welche Klasse macht am meisten Schaden?"]
    },
    
    // Leveling & Stats
    {
      topic: "leveling",
      keywords: ["level", "exp", "experience", "leveling", "schnell", "grinding"],
      answer: "Leveling funktioniert durch das Töten von Monstern. Du bekommst mehr EXP von Monstern deines Levels oder höher. Party-Spiel gibt Boni! Pro Level erhältst du 5 Stat-Punkte zum Verteilen.",
      followUp: ["Wo kann ich am besten leveln?", "Wie teile ich Stat-Punkte auf?"]
    },
    {
      topic: "stats",
      keywords: ["stats", "str", "sta", "dex", "int", "strength", "stamina", "dexterity", "intelligence", "punkte"],
      answer: "Stat-System erklärt:\n• STR: Erhöht physischen Schaden\n• STA: Erhöht HP und Verteidigung\n• DEX: Erhöht Genauigkeit, Geschwindigkeit und Krit\n• INT: Erhöht MP und magischen Schaden\n\nVerteilung hängt von deiner Klasse ab!",
      followUp: ["Welche Stats für Mercenary?", "Kann ich Stats zurücksetzen?"]
    },
    
    // Combat & Monsters
    {
      topic: "combat",
      keywords: ["kampf", "combat", "attack", "angriff", "damage", "schaden", "fighting"],
      answer: "Kampf-Basics:\n• Klicke Monster an zum Auswählen\n• Spacebar oder Attack-Button zum Angreifen\n• Beobachte HP/MP während dem Kampf\n• Nutze Potions mit Rechtsklick\n• Kritische Treffer machen 150% Schaden",
      followUp: ["Wie funktionieren Skills?", "Welche Monster sind gut für mein Level?"]
    },
    {
      topic: "monsters",
      keywords: ["monster", "mob", "small fry", "mushpang", "burudeng", "grinding", "drops"],
      answer: "Monster-Guide:\n• Small Fry (Lv.1): Perfekt für Anfänger, spawnen schnell\n• Mushpang (Lv.3): Droppen Leder-Items, gute EXP\n• Burudeng (Lv.8): Für fortgeschrittene Spieler, droppen Waffen\n\nKämpfe gegen Monster auf deinem Level für beste EXP!",
      followUp: ["Wo finde ich stärkere Monster?", "Was sind gute Drops?"]
    },
    
    // Flying System
    {
      topic: "flying",
      keywords: ["flying", "fliegen", "board", "broom", "sky", "himmel", "level 20"],
      answer: "Das Flying-System ist FLYFFs Markenzeichen!\n• Verfügbar ab Level 20\n• Braucht Flying Board oder Broom\n• 50% schneller als Laufen\n• Verbraucht Stamina\n• Ermöglicht Zugang zu Sky-Gebieten",
      followUp: ["Wo bekomme ich ein Flying Board?", "Gibt es Flying-Skills?"]
    },
    
    // Items & Equipment
    {
      topic: "items",
      keywords: ["items", "equipment", "waffen", "rüstung", "inventory", "inventar", "drops"],
      answer: "Item-System:\n• Normal (grau): Basis-Equipment\n• Rare (blau): Verbesserte Stats\n• Unique (lila): Seltene Items mit Boni\n• Legendary (gold): Beste Items im Spiel\n\nAusrüstung erhöht deine Stats automatisch!",
      followUp: ["Wie upgrade ich Items?", "Wo finde ich bessere Ausrüstung?"]
    },
    
    // Maps & Navigation
    {
      topic: "maps",
      keywords: ["map", "flaris", "saint morning", "teleport", "teleporter", "training ground", "karte"],
      answer: "Verfügbare Maps:\n• Flaris: Starting Stadt, Level 1-30\n• Training Ground: Sicherer Übungsbereich\n• Saint Morning: Intermediate Stadt, Level 15-60\n\nTeleporter kosten Penya aber sparen Zeit!",
      followUp: ["Wie komme ich zu anderen Maps?", "Welche Map ist gut für mein Level?"]
    },
    
    // Social Features
    {
      topic: "party",
      keywords: ["party", "gruppe", "team", "friends", "guild", "social"],
      answer: "Social Features:\n• Party: Gruppiere dich mit Freunden für EXP-Boni\n• Chat: World, Party, Whisper Kanäle\n• Guild: Tritt Gilden bei für Community\n\nParty-Spiel macht mehr Spaß und gibt Boni!",
      followUp: ["Wie erstelle ich eine Party?", "Was sind Guild-Vorteile?"]
    },
    
    // Controls
    {
      topic: "controls",
      keywords: ["controls", "steuerung", "keys", "tasten", "movement", "bewegung"],
      answer: "Steuerung:\n• WASD / Pfeiltasten: Bewegung\n• I: Inventar öffnen/schließen\n• Enter: Chat öffnen\n• Spacebar: Angreifen\n• F1-F8: Skill-Shortcuts\n• ESC: Menü\n• Maus: Kamera bewegen",
      followUp: ["Kann ich die Tasten ändern?", "Gibt es Shortcuts für Items?"]
    },
    
    // Tips & Tricks
    {
      topic: "tips",
      keywords: ["tips", "tricks", "anfänger", "beginner", "hilfe", "help", "advice"],
      answer: "Einsteiger-Tipps:\n• Töte Monster deines Levels für beste EXP\n• Sammle alle Drops - verkaufen für Penya\n• Nutze Potions im Kampf\n• Tritt einer Party bei für Boni\n• Speichere Penya für bessere Ausrüstung\n• Training Ground ist perfekt zum Üben",
      followUp: ["Wie verdiene ich schnell Penya?", "Welche Items soll ich behalten?"]
    },
    
    // Game Mechanics
    {
      topic: "game_mechanics",
      keywords: ["mechanics", "system", "how does", "wie funktioniert", "explain"],
      answer: "FLYFF basiert auf klassischen MMORPG-Mechaniken:\n• Kill Monsters → Get EXP → Level Up\n• Höhere Level → Bessere Equipment → Stärker\n• Stats beeinflussen Kampf-Performance\n• Items haben Qualitätsstufen (Normal bis Legendary)\n• Social Play wird mit Boni belohnt",
      followUp: ["Wie funktioniert das Level-System?", "Was macht gute Ausrüstung aus?"]
    },
    
    // Troubleshooting
    {
      topic: "problems",
      keywords: ["problem", "bug", "fehler", "nicht", "can't", "won't", "doesn't work", "funktioniert nicht"],
      answer: "Häufige Probleme & Lösungen:\n• Kann nicht angreifen → Monster anklicken, dann Attack\n• Kein EXP → Kämpfe gegen Monster deines Levels\n• Items verschwunden → Check Inventory (I-Taste)\n• Kann nicht fliegen → Brauchst Level 20 + Flying Board\n• Chat geht nicht → Enter-Taste drücken",
      followUp: ["Wie ziele ich richtig?", "Warum bekomme ich wenig EXP?"]
    },
    
    // Economy
    {
      topic: "economy",
      keywords: ["penya", "money", "geld", "shop", "selling", "buying", "verkaufen", "kaufen"],
      answer: "Wirtschafts-System:\n• Penya ist die Hauptwährung\n• Verkaufe Drops an NPCs für Penya\n• Kaufe bessere Ausrüstung in Shops\n• Teleporter kosten Penya\n• Repariere Equipment bei NPCs\n\nSammle alles - jeder Drop ist Geld wert!",
      followUp: ["Welche Items sind am wertvollsten?", "Wie spare ich Penya?"]
    }
  ]

  public findAnswer(question: string): { answer: string; confidence: number; followUp?: string[] } {
    const questionLower = question.toLowerCase()
    let bestMatch: GameKnowledge | null = null
    let highestScore = 0

    for (const knowledge of this.knowledge) {
      let score = 0
      
      // Check if any keywords match
      for (const keyword of knowledge.keywords) {
        if (questionLower.includes(keyword.toLowerCase())) {
          score += 2 // Keyword match gives 2 points
        }
      }
      
      // Check for topic relevance
      if (questionLower.includes(knowledge.topic)) {
        score += 3 // Topic match gives 3 points
      }
      
      // Bonus for exact matches
      knowledge.keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'g')
        const matches = questionLower.match(regex)
        if (matches) {
          score += matches.length * 1.5
        }
      })

      if (score > highestScore) {
        highestScore = score
        bestMatch = knowledge
      }
    }

    if (bestMatch && highestScore > 1) {
      return {
        answer: bestMatch.answer,
        confidence: Math.min(100, (highestScore / 10) * 100),
        followUp: bestMatch.followUp
      }
    }

    return this.getDefaultResponse(question)
  }

  private getDefaultResponse(question: string): { answer: string; confidence: number; followUp?: string[] } {
    const questionLower = question.toLowerCase()
    
    // Detect language and respond accordingly
    const isGerman = /\b(wie|was|wo|wann|warum|welche|können|soll|ist|sind|hat|haben|gibt|machen)\b/.test(questionLower)
    
    if (questionLower.includes('hallo') || questionLower.includes('hi') || questionLower.includes('hello')) {
      return {
        answer: isGerman 
          ? "Hallo Abenteurer! Ich bin dein AI-Spielassistent. Ich kann dir bei allen FLYFF-Fragen helfen - frag mich einfach über Klassen, Leveling, Combat, Items oder alles andere!" 
          : "Hello adventurer! I'm your AI game assistant. I can help you with all FLYFF questions - just ask me about classes, leveling, combat, items, or anything else!",
        confidence: 95,
        followUp: ["Wie erstelle ich einen Charakter?", "Welche Klasse ist am besten?", "Wo kann ich leveln?"]
      }
    }
    
    const fallbackResponses = isGerman ? [
      "Entschuldigung, ich habe deine Frage nicht ganz verstanden. Könntest du sie anders formulieren? Ich kann bei Themen wie Charaktererstellung, Klassen, Leveling, Combat und Items helfen!",
      "Das ist eine interessante Frage! Ich kann dir am besten bei FLYFF-spezifischen Themen helfen wie Stats, Monster, Flying oder Equipment. Magst du präziser fragen?",
      "Hmm, ich bin nicht sicher wie ich das beantworten soll. Frag mich gerne über Gameplay-Mechaniken, Klassen-Guides, Leveling-Tipps oder Item-Infos!"
    ] : [
      "Sorry, I didn't quite understand your question. Could you rephrase it? I can help with topics like character creation, classes, leveling, combat, and items!",
      "That's an interesting question! I can best help you with FLYFF-specific topics like stats, monsters, flying, or equipment. Would you like to be more specific?",
      "Hmm, I'm not sure how to answer that. Feel free to ask me about gameplay mechanics, class guides, leveling tips, or item information!"
    ]
    
    return {
      answer: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      confidence: 20,
      followUp: isGerman 
        ? ["Wie funktioniert das Leveling?", "Welche Klassen gibt es?", "Wo finde ich Monster?"]
        : ["How does leveling work?", "What classes are available?", "Where can I find monsters?"]
    }
  }

  public getRandomTip(): string {
    const tips = [
      "💡 Tipp: Party-Spiel gibt EXP-Boni! Suche dir Mitspieler für effizienteres Leveling.",
      "💡 Tipp: Sammle alle Monster-Drops! Auch scheinbar wertlose Items können verkauft werden.",
      "💡 Tipp: Das Training Ground ist perfekt für neue Spieler - Monster respawnen schnell!",
      "💡 Tipp: Ab Level 20 kannst du fliegen! Das macht Reisen viel schneller.",
      "💡 Tipp: Nutze Potions im Kampf! Rechtsklick auf HP/MP Potions für schnelle Heilung.",
      "💡 Tipp: Verschiedene Monster droppen verschiedene Items - experimentiere!",
      "💡 Tipp: Teleporter sparen Zeit, kosten aber Penya. Laufen ist kostenlos!",
      "💡 Tipp: Stat-Verteilung ist wichtig! STR für Damage, STA für HP, DEX für Krit, INT für MP.",
      "🎯 Profi-Tipp: Monster deines Levels +/- 5 geben optimale EXP. Zu schwach = wenig EXP!",
      "⚡ Kampf-Tipp: Kritische Treffer machen 150% Schaden - DEX erhöht deine Krit-Rate!",
      "🛡️ Überlebens-Tipp: Immer Potions dabei haben! HP unter 30% ist gefährlich!",
      "💰 Wirtschafts-Tipp: Verkaufe Items regelmäßig - volles Inventar = keine neuen Drops!",
    ]
    
    return tips[Math.floor(Math.random() * tips.length)]
  }

  public getAdvancedTip(playerLevel: number): string {
    if (playerLevel < 5) {
      return "🌟 Anfänger-Fokus: Konzentriere dich aufs Leveling! Kämpfe gegen Small Fry im Training Ground für sichere EXP."
    } else if (playerLevel < 15) {
      return "⚔️ Fortgeschritten: Zeit für stärkere Monster! Mushpang in Flaris droppen bessere Items und mehr EXP."
    } else if (playerLevel < 20) {
      return "🎯 Pre-Flying: Bereite dich auf Level 20 vor! Spare Penya für ein Flying Board - es verändert alles!"
    } else {
      return "🚀 Flying Verfügbar: Du kannst jetzt fliegen! Erkunde Saint Morning und andere Maps vom Himmel aus!"
    }
  }

  public getClassSpecificAdvice(playerClass: string): string {
    const advice: { [key: string]: string } = {
      vagrant: "🔰 Als Vagrant hast du alle Möglichkeiten offen! Experimentiere mit verschiedenen Kampfstilen bis Level 15.",
      mercenary: "⚔️ Mercenary-Tipp: Fokussiere STR für Damage und STA für Überleben. Du bist ein Nahkämpfer!",
      assist: "🛡️ Assist-Tipp: INT und STA sind deine Hauptstats. Du wirst zum wertvollen Supporter!",
      magician: "🔮 Magician-Tipp: INT ist alles für dich! Magische Angriffe skalieren stark mit Intelligence.",
    }
    
    return advice[playerClass] || "🎮 Spiele deinen Stil! Jede Klasse hat ihre Stärken - finde deine!"
  }

  public getPopularQuestions(): string[] {
    return [
      "Wie erstelle ich einen Charakter?",
      "Welche Klasse ist am besten für Anfänger?",
      "Wo kann ich am besten leveln?",
      "Wie funktioniert das Flying-System?",
      "Welche Stats soll ich skillen?",
      "Wo finde ich bessere Ausrüstung?",
      "Wie mache ich eine Party?",
      "Was sind die Steuerungstasten?"
    ]
  }
}

export default AIGameHelper