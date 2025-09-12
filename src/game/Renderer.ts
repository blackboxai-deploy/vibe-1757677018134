import * as THREE from 'three'
import { Player, Vector3 } from './Player'
import { Monster } from './Monster'
import { GameMap } from './World'

export interface RendererConfig {
  antialias: boolean
  alpha: boolean
  powerPreference: 'default' | 'high-performance' | 'low-power'
  shadows: boolean
  fogEnabled: boolean
  particleCount: number
}

export class GameRenderer {
  private scene!: THREE.Scene
  private camera!: THREE.PerspectiveCamera
  private renderer!: THREE.WebGLRenderer
  private controls!: any // Camera controls
  
  // Game objects
  private playerMeshes: Map<string, THREE.Group> = new Map()
  private monsterMeshes: Map<string, THREE.Group> = new Map()
  private terrainMesh: THREE.Mesh | null = null
  
  // Lighting
  private ambientLight!: THREE.AmbientLight
  private directionalLight!: THREE.DirectionalLight
  private pointLights: THREE.PointLight[] = []
  
  // Effects
  private particles: THREE.Points | null = null
  private skybox: THREE.Mesh | null = null
  private water: THREE.Mesh | null = null
  
  // Camera settings
  private cameraDistance = 300
  private cameraHeight = 150
  private cameraTarget = new THREE.Vector3(0, 0, 0)
  
  private config: RendererConfig = {
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
    shadows: true,
    fogEnabled: true,
    particleCount: 1000
  }

  constructor(container: HTMLElement, config?: Partial<RendererConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
    
    this.initializeRenderer(container)
    this.initializeScene()
    this.initializeLighting()
    this.initializeEffects()
    this.initializeControls()
    
    this.animate()
  }

  private initializeRenderer(container: HTMLElement): void {
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: this.config.antialias,
      alpha: this.config.alpha,
      powerPreference: this.config.powerPreference
    })
    
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2
    
    if (this.config.shadows) {
      this.renderer.shadowMap.enabled = true
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    }
    
    container.appendChild(this.renderer.domElement)
    
    // Handle resize
    window.addEventListener('resize', () => this.handleResize(container))
  }

  private initializeScene(): void {
    this.scene = new THREE.Scene()
    
    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    )
    
    // Add fog for atmosphere
    if (this.config.fogEnabled) {
      this.scene.fog = new THREE.Fog(0x87CEEB, 1000, 8000)
    }
    
    this.updateCameraPosition(new THREE.Vector3(0, 0, 0))
  }

  private initializeLighting(): void {
    // Ambient light for general illumination
    this.ambientLight = new THREE.AmbientLight(0x404040, 0.4)
    this.scene.add(this.ambientLight)
    
    // Main directional light (sun)
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
    this.directionalLight.position.set(1000, 1000, 500)
    this.directionalLight.castShadow = this.config.shadows
    
    if (this.config.shadows) {
      this.directionalLight.shadow.mapSize.width = 2048
      this.directionalLight.shadow.mapSize.height = 2048
      this.directionalLight.shadow.camera.near = 0.1
      this.directionalLight.shadow.camera.far = 5000
      this.directionalLight.shadow.camera.left = -2000
      this.directionalLight.shadow.camera.right = 2000
      this.directionalLight.shadow.camera.top = 2000
      this.directionalLight.shadow.camera.bottom = -2000
    }
    
    this.scene.add(this.directionalLight)
  }

  private initializeEffects(): void {
    // Create particle system for atmospheric effects
    this.createParticleSystem()
    
    // Create skybox
    this.createSkybox()
  }

  private initializeControls(): void {
    // Simple camera controls (would use OrbitControls in real implementation)
    // For now, we'll handle this manually in the update methods
  }

  private createParticleSystem(): void {
    const particleGeometry = new THREE.BufferGeometry()
    const particleCount = this.config.particleCount
    
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      // Random positions within a large area
      positions[i * 3] = (Math.random() - 0.5) * 4000
      positions[i * 3 + 1] = Math.random() * 500 + 50
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4000
      
      // Soft colors for magical atmosphere
      const color = new THREE.Color()
      color.setHSL(0.6 + Math.random() * 0.2, 0.7, 0.8)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 3,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.6,
      vertexColors: true,
      blending: THREE.AdditiveBlending
    })
    
    this.particles = new THREE.Points(particleGeometry, particleMaterial)
    this.scene.add(this.particles)
  }

  private createSkybox(): void {
    const skyGeometry = new THREE.SphereGeometry(5000, 32, 32)
    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2() }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vWorldPosition;
        
        void main() {
          vec3 direction = normalize(vWorldPosition);
          float elevation = direction.y;
          
          // Sky gradient from horizon to zenith
          vec3 skyColor = mix(
            vec3(0.5, 0.7, 1.0),  // Horizon color (light blue)
            vec3(0.1, 0.3, 0.8),  // Zenith color (deep blue)
            elevation * 0.5 + 0.5
          );
          
          // Add some clouds
          float cloudNoise = sin(direction.x * 10.0 + time * 0.1) * 
                           cos(direction.z * 8.0 + time * 0.05) * 0.3;
          skyColor += vec3(cloudNoise * 0.2);
          
          gl_FragColor = vec4(skyColor, 1.0);
        }
      `,
      side: THREE.BackSide
    })
    
    this.skybox = new THREE.Mesh(skyGeometry, skyMaterial)
    this.scene.add(this.skybox)
  }

  public loadMap(gameMap: GameMap): void {
    // Clear existing terrain
    if (this.terrainMesh) {
      this.scene.remove(this.terrainMesh)
    }
    
    // Create terrain based on map
    this.createTerrain(gameMap)
    
    // Update lighting based on map settings
    if (gameMap.ambientLight) {
      const color = new THREE.Color(gameMap.ambientLight.color)
      this.ambientLight.color = color
      this.ambientLight.intensity = gameMap.ambientLight.intensity
    }
    
    // Add map-specific elements (NPCs, decorations, etc.)
    this.addMapElements(gameMap)
  }

  private createTerrain(gameMap: GameMap): void {
    const width = gameMap.bounds.maxX - gameMap.bounds.minX
    const height = gameMap.bounds.maxZ - gameMap.bounds.minZ
    
    // Create terrain geometry
    const terrainGeometry = new THREE.PlaneGeometry(width, height, 64, 64)
    
    // Add some height variation
    const positionAttribute = terrainGeometry.getAttribute('position')
    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i)
      const z = positionAttribute.getY(i)
      
      // Simple noise for terrain height
      const height = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 20 +
                    Math.sin(x * 0.005) * Math.cos(z * 0.005) * 50
      
      positionAttribute.setZ(i, height)
    }
    
    terrainGeometry.computeVertexNormals()
    
    // Create terrain material
    const terrainMaterial = new THREE.MeshLambertMaterial({
      color: 0x4a5d23, // Grass green
      transparent: true,
      opacity: 0.8
    })
    
    this.terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial)
    this.terrainMesh.rotation.x = -Math.PI / 2
    this.terrainMesh.position.y = gameMap.bounds.minY
    this.terrainMesh.receiveShadow = this.config.shadows
    
    this.scene.add(this.terrainMesh)
  }

  private addMapElements(gameMap: GameMap): void {
    // Add NPCs as simple colored cubes for now
    gameMap.npcs.forEach(npc => {
      const npcGeometry = new THREE.BoxGeometry(20, 40, 20)
      const npcMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 })
      const npcMesh = new THREE.Mesh(npcGeometry, npcMaterial)
      
      npcMesh.position.set(npc.position.x, npc.position.y + 20, npc.position.z)
      npcMesh.castShadow = this.config.shadows
      
      this.scene.add(npcMesh)
    })
    
    // Add teleporters
    gameMap.teleporters.forEach(teleporter => {
      const teleporterGeometry = new THREE.CylinderGeometry(30, 30, 10, 16)
      const teleporterMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x9966ff,
        transparent: true,
        opacity: 0.7
      })
      const teleporterMesh = new THREE.Mesh(teleporterGeometry, teleporterMaterial)
      
      teleporterMesh.position.set(teleporter.position.x, teleporter.position.y + 5, teleporter.position.z)
      
      this.scene.add(teleporterMesh)
    })
  }

  public addPlayer(player: Player): void {
    if (this.playerMeshes.has(player.id)) return
    
    const playerGroup = this.createPlayerMesh(player)
    this.playerMeshes.set(player.id, playerGroup)
    this.scene.add(playerGroup)
  }

  public updatePlayer(player: Player): void {
    const playerMesh = this.playerMeshes.get(player.id)
    if (!playerMesh) return
    
    // Update position
    playerMesh.position.set(player.position.x, player.position.y, player.position.z)
    playerMesh.rotation.y = player.rotation
    
    // Update appearance based on equipment, health, etc.
    this.updatePlayerAppearance(playerMesh, player)
  }

  public removePlayer(playerId: string): void {
    const playerMesh = this.playerMeshes.get(playerId)
    if (playerMesh) {
      this.scene.remove(playerMesh)
      this.playerMeshes.delete(playerId)
    }
  }

  public addMonster(monster: Monster): void {
    if (this.monsterMeshes.has(monster.id)) return
    
    const monsterGroup = this.createMonsterMesh(monster)
    this.monsterMeshes.set(monster.id, monsterGroup)
    this.scene.add(monsterGroup)
  }

  public updateMonster(monster: Monster): void {
    const monsterMesh = this.monsterMeshes.get(monster.id)
    if (!monsterMesh) return
    
    monsterMesh.position.set(monster.position.x, monster.position.y, monster.position.z)
    monsterMesh.rotation.y = monster.rotation
    
    // Show health bar above monster
    this.updateMonsterHealthBar(monsterMesh, monster)
  }

  public removeMonster(monsterId: string): void {
    const monsterMesh = this.monsterMeshes.get(monsterId)
    if (monsterMesh) {
      this.scene.remove(monsterMesh)
      this.monsterMeshes.delete(monsterId)
    }
  }

  private createPlayerMesh(player: Player): THREE.Group {
    const playerGroup = new THREE.Group()
    
    // Main character body (simplified)
    const bodyGeometry = new THREE.CapsuleGeometry(15, 40, 4, 8)
    const bodyMaterial = new THREE.MeshLambertMaterial({ 
      color: this.getPlayerColor(player.class) 
    })
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial)
    bodyMesh.castShadow = this.config.shadows
    bodyMesh.position.y = 20
    
    playerGroup.add(bodyMesh)
    
    // Add name tag
    this.addNameTag(playerGroup, player.name, 0x00ff00)
    
    return playerGroup
  }

  private createMonsterMesh(monster: Monster): THREE.Group {
    const monsterGroup = new THREE.Group()
    
    // Monster body (different shapes based on type)
    const size = monster.level * 2 + 10
    const bodyGeometry = new THREE.SphereGeometry(size, 8, 6)
    const bodyMaterial = new THREE.MeshLambertMaterial({ 
      color: this.getMonsterColor(monster.templateId) 
    })
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial)
    bodyMesh.castShadow = this.config.shadows
    bodyMesh.position.y = size
    
    monsterGroup.add(bodyMesh)
    
    // Add name tag
    this.addNameTag(monsterGroup, `${monster.name} (Lv.${monster.level})`, 0xff0000)
    
    return monsterGroup
  }

  private addNameTag(parent: THREE.Group, text: string, color: number): void {
    // Create a simple text sprite (in real implementation, would use proper text rendering)
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.width = 256
    canvas.height = 64
    
    context.fillStyle = `#${color.toString(16).padStart(6, '0')}`
    context.font = '24px Arial'
    context.textAlign = 'center'
    context.fillText(text, 128, 32)
    
    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.SpriteMaterial({ map: texture })
    const sprite = new THREE.Sprite(material)
    sprite.scale.set(100, 25, 1)
    sprite.position.y = 80
    
    parent.add(sprite)
  }

  private getPlayerColor(playerClass: string): number {
    const colors: { [key: string]: number } = {
      vagrant: 0x8B4513,
      mercenary: 0xFF0000,
      assist: 0x00FF00,
      magician: 0x0000FF
    }
    return colors[playerClass] || 0x888888
  }

  private getMonsterColor(templateId: string): number {
    const colors: { [key: string]: number } = {
      small_fry: 0xFFFF00,
      mushpang: 0xFF8800,
      burudeng: 0x8800FF
    }
    return colors[templateId] || 0x666666
  }

  private updatePlayerAppearance(mesh: THREE.Group, player: Player): void {
    // Update based on health, status effects, equipment, etc.
    const mainBody = mesh.children[0] as THREE.Mesh
    const material = mainBody.material as THREE.MeshLambertMaterial
    
    if (player.isDead) {
      material.opacity = 0.5
      material.transparent = true
    } else {
      material.opacity = 1.0
      material.transparent = false
    }
  }

  private updateMonsterHealthBar(mesh: THREE.Group, monster: Monster): void {
    // Simple health bar visualization
    const healthPercentage = monster.stats.hp / monster.stats.maxHp
    
    // Find or create health bar
    let healthBar = mesh.getObjectByName('healthBar') as THREE.Mesh
    if (!healthBar) {
      const barGeometry = new THREE.PlaneGeometry(40, 4)
      const barMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
      healthBar = new THREE.Mesh(barGeometry, barMaterial)
      healthBar.name = 'healthBar'
      healthBar.position.y = 60
      mesh.add(healthBar)
    }
    
    healthBar.scale.x = healthPercentage
    
    // Change color based on health
    const material = healthBar.material as THREE.MeshBasicMaterial
    if (healthPercentage > 0.6) {
      material.color.setHex(0x00ff00) // Green
    } else if (healthPercentage > 0.3) {
      material.color.setHex(0xffff00) // Yellow
    } else {
      material.color.setHex(0xff0000) // Red
    }
  }

  public updateCameraPosition(target: Vector3): void {
    this.cameraTarget.set(target.x, target.y, target.z)
    
    // Calculate camera position based on target
    const cameraX = target.x + Math.sin(Date.now() * 0.0005) * 50
    const cameraY = target.y + this.cameraHeight
    const cameraZ = target.z + this.cameraDistance
    
    this.camera.position.set(cameraX, cameraY, cameraZ)
    this.camera.lookAt(this.cameraTarget)
  }

  private handleResize(container: HTMLElement): void {
    const width = container.clientWidth
    const height = container.clientHeight
    
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    
    this.renderer.setSize(width, height)
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate())
    
    // Update time-based effects
    const time = Date.now() * 0.001
    
    // Animate particles
    if (this.particles) {
      this.particles.rotation.y = time * 0.05
    }
    
    // Animate skybox
    if (this.skybox) {
      const material = this.skybox.material as THREE.ShaderMaterial
      if (material.uniforms && material.uniforms.time) {
        material.uniforms.time.value = time
      }
    }
    
    this.render()
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera)
  }

  public dispose(): void {
    // Clean up resources
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose()
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose())
        } else {
          object.material.dispose()
        }
      }
    })
    
    this.renderer.dispose()
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer
  }

  public getScene(): THREE.Scene {
    return this.scene
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera
  }
}

export default GameRenderer