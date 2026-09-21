// Main Game Controller & Three.js Engine Orchestration
import * as THREE from 'three';
import { sound } from './audio.js';
import { createFloorTexture, createFloorNormalTexture, createFloorRoughnessTexture, createGlowDotTexture } from './textures.js';
import { SpatialGrid } from './spatialGrid.js';
import { Player } from './player.js';
import { EnemyManager } from './enemies.js';
import { WeaponSystem } from './weapons.js';
import { CollectibleManager } from './collectibles.js';
import { UpgradeDeck } from './cards.js';

class GameApp {
  constructor() {
    this.state = 'START';
    this.gameTime = 0;
    this.keys = {};
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.mouseWorldPos = new THREE.Vector3();
    this.camLookTarget = new THREE.Vector3(0, 1, 0);

    this._initDOM();
    this._initThree();
    this._initEvents();
  }

  _initDOM() {
    this.uiStartScreen = document.getElementById('start-screen');
    this.uiBtnStart = document.getElementById('btn-start');
    this.uiHud = document.getElementById('game-hud');
    this.uiHpBar = document.getElementById('hp-fill');
    this.uiHpText = document.getElementById('hp-text');
    this.uiExpBar = document.getElementById('exp-fill');
    this.uiLevelText = document.getElementById('level-badge');
    this.uiTimer = document.getElementById('survival-timer');
    this.uiKills = document.getElementById('kill-count');
    this.uiDashIndicator = document.getElementById('dash-indicator');
    this.uiLevelUpModal = document.getElementById('levelup-modal');
    this.uiCardContainer = document.getElementById('card-container');
    this.uiGameOverModal = document.getElementById('gameover-modal');
    this.uiBtnRestart = document.getElementById('btn-restart');
    this.uiBtnMute = document.getElementById('btn-mute');
    this.uiRadar = document.getElementById('radar-canvas');
    if (this.uiRadar) {
      this.radarCtx = this.uiRadar.getContext('2d');
    }
  }

  _initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x070a12);
    this.scene.fog = new THREE.FogExp2(0x070a12, 0.012);

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 300);
    this.cameraOffset = new THREE.Vector3(0, 26, 23); // Spacious, comfortable tactical overview
    this.camera.position.copy(this.cameraOffset);
    this.camLookTarget.set(0, 1, 0);
    this.camera.lookAt(this.camLookTarget);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // Capped at 1.5 for ultra-sharp visuals without fillrate bottleneck lag
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    document.getElementById('canvas-container').appendChild(this.renderer.domElement);

    // Ethereal Lighting
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.75);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xf8fafc, 1.4);
    sunLight.position.set(25, 45, 25);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    const d = 28;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0004;
    this.scene.add(sunLight);
    this.sunLight = sunLight;

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.5);
    fillLight.position.set(-20, 20, -20);
    this.scene.add(fillLight);

    // Procedural Floor with Normal & Roughness maps for rich specular reflections
    const floorTexture = createFloorTexture(2048);
    const floorNormal = createFloorNormalTexture(1024);
    const floorRoughness = createFloorRoughnessTexture(1024);

    const floorGeo = new THREE.PlaneGeometry(240, 240, 1, 1);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      normalMap: floorNormal,
      normalScale: new THREE.Vector2(0.65, 0.65),
      roughnessMap: floorRoughness,
      roughness: 0.35,
      metalness: 0.25
    });
    this.floorMesh = new THREE.Mesh(floorGeo, floorMat);
    this.floorMesh.receiveShadow = true;
    this.scene.add(this.floorMesh);

    // Ethereal Outer Crystal Monolith Pillars (Boundary landmarks)
    this._initSanctuaryMonoliths();

    // Floating Atmospheric Starlight Motes (Drifting particles)
    this._initAtmosphereMotes();

    // Systems
    this.spatialGrid = new SpatialGrid(5.0);
    this.collectibles = new CollectibleManager(this.scene);
    this.weapons = new WeaponSystem(this.scene, this.spatialGrid);
    this.enemies = new EnemyManager(this.scene, this.spatialGrid);
    this.player = new Player(this.scene);
    this.upgradeDeck = new UpgradeDeck();

    this.lastFrameTime = performance.now();
    window.gameApp = this;
  }

  _initEvents() {
    window.addEventListener('resize', () => this._onResize());

    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (this.state === 'START' && (e.code === 'Space' || e.code === 'Enter')) {
        this.startGame();
      } else if (this.state === 'PLAYING') {
        if (e.code === 'Space') {
          this.player.triggerDash((x, z, radius, dmg) => {
            this.weapons.createShockwave(x, z, radius, dmg);
          });
        }
      } else if (this.state === 'LEVEL_UP') {
        const cards = this.uiCardContainer.querySelectorAll('.upgrade-tablet');
        if ((e.code === 'Digit1' || e.code === 'Numpad1') && cards[0]) cards[0].click();
        if ((e.code === 'Digit2' || e.code === 'Numpad2') && cards[1]) cards[1].click();
        if ((e.code === 'Digit3' || e.code === 'Numpad3') && cards[2]) cards[2].click();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      this._updateMouseWorld();
    });

    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (this.state === 'PLAYING') {
        this.player.triggerDash((x, z, radius, dmg) => {
          this.weapons.createShockwave(x, z, radius, dmg);
        });
      }
    });

    this.uiBtnStart.addEventListener('click', () => this.startGame());
    this.uiBtnRestart.addEventListener('click', () => this.restartGame());

    this.uiBtnMute.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      const svg = document.getElementById('svg-volume');
      if (svg) {
        svg.style.opacity = isMuted ? '0.35' : '1.0';
      }
    });
  }

  _initSanctuaryMonoliths() {
    this.monolithGroup = new THREE.Group();
    this.scene.add(this.monolithGroup);

    // Ethereal crystal obelisk geometry
    const pillarGeo = new THREE.CylinderGeometry(0.8, 1.8, 14, 6);
    const capGeo = new THREE.ConeGeometry(1.2, 3.5, 6);

    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      emissive: 0x0f172a,
      roughness: 0.25,
      metalness: 0.4,
      flatShading: true
    });

    const crystalCapMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.2,
      roughness: 0.1,
      metalness: 0.5,
      flatShading: true
    });

    // Place 16 monolithic pillars along the sacred sanctuary perimeter (radius 88-92)
    const pillarCount = 16;
    for (let i = 0; i < pillarCount; i++) {
      const angle = (i / pillarCount) * Math.PI * 2;
      const dist = 90;
      const px = Math.cos(angle) * dist;
      const pz = Math.sin(angle) * dist;

      const pGroup = new THREE.Group();
      pGroup.position.set(px, 0, pz);

      const pillarMesh = new THREE.Mesh(pillarGeo, pillarMat);
      pillarMesh.position.y = 7;
      pillarMesh.castShadow = true;
      pillarMesh.receiveShadow = true;
      pGroup.add(pillarMesh);

      const capMesh = new THREE.Mesh(capGeo, crystalCapMat);
      capMesh.position.y = 15.5;
      capMesh.castShadow = true;
      pGroup.add(capMesh);

      this.monolithGroup.add(pGroup);
    }
  }

  _initAtmosphereMotes() {
    // 250 floating stardust motes that drift around the sanctuary
    const moteCount = 280;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(moteCount * 3);
    const scales = new Float32Array(moteCount);
    const speeds = new Float32Array(moteCount);

    for (let i = 0; i < moteCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 160;
      positions[i * 3 + 1] = 0.5 + Math.random() * 8.5; // Hovering between 0.5 and 9m
      positions[i * 3 + 2] = (Math.random() - 0.5) * 160;

      scales[i] = 0.5 + Math.random() * 1.5;
      speeds[i] = 0.2 + Math.random() * 0.8;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const moteTexture = createGlowDotTexture(128);
    const material = new THREE.PointsMaterial({
      size: 1.4,
      map: moteTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0x93c5fd
    });

    this.motePoints = new THREE.Points(geometry, material);
    this.moteSpeeds = speeds;
    this.scene.add(this.motePoints);
  }

  _updateAtmosphereMotes(dt, time) {
    if (!this.motePoints) return;
    const posAttr = this.motePoints.geometry.attributes.position;
    const array = posAttr.array;
    const count = array.length / 3;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      // Gentle horizontal drift + vertical wave
      array[idx] += Math.sin(time * 0.5 + i) * dt * 0.8;
      array[idx + 1] += Math.cos(time * 0.8 + i) * dt * 0.4;
      array[idx + 2] += Math.cos(time * 0.5 + i) * dt * 0.8;

      // Wrap around bounds relative to player
      const dx = array[idx] - this.player.x;
      const dz = array[idx + 2] - this.player.z;
      if (dx > 80) array[idx] -= 160;
      if (dx < -80) array[idx] += 160;
      if (dz > 80) array[idx + 2] -= 160;
      if (dz < -80) array[idx + 2] += 160;

      if (array[idx + 1] < 0.4) array[idx + 1] = 8.5;
      if (array[idx + 1] > 9.0) array[idx + 1] = 0.5;
    }
    posAttr.needsUpdate = true;
  }

  _onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  _updateMouseWorld() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const target = new THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(this.groundPlane, target)) {
      this.mouseWorldPos.copy(target);
    }
  }

  startGame() {
    sound.init();
    this.state = 'PLAYING';
    this.gameTime = 0;
    this.uiStartScreen.classList.add('hidden');
    this.uiHud.classList.remove('hidden');
    this.lastFrameTime = performance.now();

    // Spawn 16 enemies in plain view right around player
    this.enemies.spawnInitialWave(this.player.x, this.player.z);
  }

  restartGame() {
    window.location.reload();
  }

  showLevelUpModal() {
    this.state = 'LEVEL_UP';
    sound.playLevelUp();
    this.uiLevelUpModal.classList.remove('hidden');
    this.uiCardContainer.innerHTML = '';

    const cards = this.upgradeDeck.drawOptions(3);
    cards.forEach((card, idx) => {
      const currentLvl = this.upgradeDeck.getLevel(card.id);
      const nextLvl = currentLvl + 1;
      const isSynergyActive = card.synergyWith && this.upgradeDeck.getLevel(card.synergyWith) > 0;

      // Build level pips HTML
      let pipsHTML = '';
      for (let p = 1; p <= card.maxLevel; p++) {
        const stateClass = p <= currentLvl ? 'pip-filled' : (p === nextLvl ? 'pip-next' : 'pip-empty');
        pipsHTML += `<span class="level-pip ${stateClass}"></span>`;
      }

      const cardEl = document.createElement('div');
      cardEl.className = `upgrade-tablet rarity-${card.rarity}`;

      cardEl.innerHTML = `
        <div class="tablet-top">
          <span class="tablet-key">[${idx + 1}]</span>
          <span class="tablet-rarity">${card.rarityText}</span>
        </div>

        <div class="tablet-icon-box">
          ${card.iconSvg}
        </div>

        <h3 class="tablet-title">${card.title}</h3>
        
        <div class="tablet-level-tag">Cấp ${nextLvl}/${card.maxLevel}</div>

        <div class="tablet-headline">${card.headline}</div>

        <div class="tablet-detail">${card.detail}</div>

        ${card.synergyBonus && isSynergyActive ? `
          <div class="tablet-combo-tag">
            ⚡ ${card.synergyBonus}
          </div>
        ` : ''}

        <div class="tablet-cta-btn">CHỌN [${idx + 1}]</div>
      `;

      cardEl.addEventListener('click', () => {
        this.upgradeDeck.upgradeCard(card.id, this.player, this.weapons);
        this.closeLevelUpModal();
      });

      this.uiCardContainer.appendChild(cardEl);
    });
  }

  closeLevelUpModal() {
    this.uiLevelUpModal.classList.add('hidden');
    this.state = 'PLAYING';
  }

  triggerGameOver() {
    this.state = 'GAME_OVER';
    sound.playGameOver();
    document.getElementById('go-time').textContent = this._formatTime(this.gameTime);
    document.getElementById('go-kills').textContent = this.player.totalKills;
    document.getElementById('go-level').textContent = this.player.level;
    this.uiGameOverModal.classList.remove('hidden');
  }

  _formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  _updateHUD() {
    // Health Bar
    const hpPct = Math.max(0, Math.min(100, (this.player.hp / this.player.maxHp) * 100));
    this.uiHpBar.style.width = `${hpPct}%`;
    this.uiHpText.textContent = `${Math.ceil(this.player.hp)} / ${this.player.maxHp}`;

    // EXP Bar
    const expPct = Math.min(100, (this.player.exp / this.player.expToNext) * 100);
    this.uiExpBar.style.width = `${expPct}%`;
    this.uiLevelText.textContent = `LVL ${this.player.level}`;

    // Clock & Kills
    this.uiTimer.textContent = this._formatTime(this.gameTime);
    this.uiKills.textContent = `${this.player.totalKills} QUÁI`;

    // Dash status
    if (this.player.dashCooldown > 0) {
      this.uiDashIndicator.style.opacity = '0.35';
      this.uiDashIndicator.textContent = `DASH (${this.player.dashCooldown.toFixed(1)}s)`;
    } else {
      this.uiDashIndicator.style.opacity = '1.0';
      this.uiDashIndicator.textContent = 'DASH [SPACE]';
    }

    // Radar Minimap
    if (this.radarCtx && this.uiRadar) {
      const ctx = this.radarCtx;
      const w = this.uiRadar.width;
      const h = this.uiRadar.height;
      ctx.clearRect(0, 0, w, h);

      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(8, 12, 20, 0.85)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const scale = 1.6;

      // Gems
      ctx.fillStyle = '#38bdf8';
      for (let i = 0; i < this.collectibles.gems.length; i++) {
        const g = this.collectibles.gems[i];
        const rx = w / 2 + (g.x - this.player.x) * scale;
        const ry = h / 2 + (g.z - this.player.z) * scale;
        if (rx >= 0 && rx <= w && ry >= 0 && ry <= h) {
          ctx.fillRect(rx - 1, ry - 1, 2, 2);
        }
      }

      // Enemies
      ctx.fillStyle = '#ef4444';
      for (let i = 0; i < this.enemies.enemies.length; i++) {
        const e = this.enemies.enemies[i];
        if (!e.isAlive) continue;
        const rx = w / 2 + (e.x - this.player.x) * scale;
        const ry = h / 2 + (e.z - this.player.z) * scale;
        if (rx >= 0 && rx <= w && ry >= 0 && ry <= h) {
          ctx.beginPath();
          ctx.arc(rx, ry, e.type === 'golem' ? 3 : 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Player center dot
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  run() {
    requestAnimationFrame(() => this.run());

    const now = performance.now();
    const rawDt = (now - this.lastFrameTime) * 0.001;
    this.lastFrameTime = now;
    const dt = Math.min(Math.max(rawDt, 0.001), 0.08);

    if (this.state === 'PLAYING') {
      this.gameTime += dt;

      // 1. Input & Player update
      this.player.handleInput(this.keys);
      this.player.update(dt);

      if (this.player.hp <= 0) {
        this.triggerGameOver();
      }

      // Check level up queue!
      if (this.player.pendingLevelUps > 0) {
        this.player.pendingLevelUps--;
        this.showLevelUpModal();
      }

      // 2. Silky smooth, frame-rate independent camera tracking with ZERO angular jitter
      const t = 1.0 - Math.exp(-12 * dt);
      const targetCamPos = this.player.group.position.clone().add(this.cameraOffset);
      this.camera.position.lerp(targetCamPos, t);
      this.camLookTarget.lerp(new THREE.Vector3(this.player.x, 1.0, this.player.z), t);
      this.camera.lookAt(this.camLookTarget);

      this.sunLight.position.set(this.player.x + 25, 45, this.player.z + 25);
      this.sunLight.target = this.player.group;

      // 3. Enemies Update
      this.enemies.updateSpawning(dt, this.gameTime, this.player.x, this.player.z);
      this.enemies.update(dt, this.player, this.camera, (killedEnemy) => {
        this.player.totalKills++;
        this.collectibles.spawnGem(killedEnemy.x, killedEnemy.z, killedEnemy.expValue);
        this.collectibles.spawnShatter(killedEnemy.x, killedEnemy.y, killedEnemy.z, killedEnemy.defaultColor.getHex(), 10);
      });

      // 4. Weapons Update
      this.weapons.update(
        dt,
        this.player,
        this.enemies,
        (killedEnemy) => {
          this.player.totalKills++;
          this.collectibles.spawnGem(killedEnemy.x, killedEnemy.z, killedEnemy.expValue);
          this.collectibles.spawnShatter(killedEnemy.x, killedEnemy.y, killedEnemy.z, killedEnemy.defaultColor.getHex(), 10);
        },
        (dmgX, dmgY, dmgZ, dmgAmount) => {
          this.collectibles.spawnDamageNumber(dmgX, dmgY, dmgZ, dmgAmount);
        },
        this.collectibles
      );

      // 5. Collectibles & Particles
      this.collectibles.update(dt, this.player, this.camera);

      // 6. Atmospheric Starlight Motes
      this._updateAtmosphereMotes(dt, this.gameTime);

      // 7. HUD
      this._updateHUD();
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new GameApp();
  app.run();
});
