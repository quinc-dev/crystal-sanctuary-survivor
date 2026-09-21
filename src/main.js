// Main Game Controller & Three.js Engine Orchestration
import * as THREE from 'three';
import { sound } from './audio.js';
import { createFloorTexture } from './textures.js';
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
    this.renderer.setPixelRatio(Math.max(window.devicePixelRatio || 1, 2)); // Crisp high resolution
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('canvas-container').appendChild(this.renderer.domElement);

    // Ethereal Lighting
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.75);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xf8fafc, 1.4);
    sunLight.position.set(25, 45, 25);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
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

    // Procedural Floor
    const floorTexture = createFloorTexture(2048);
    const floorGeo = new THREE.PlaneGeometry(220, 220, 1, 1);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.35,
      metalness: 0.15
    });
    this.floorMesh = new THREE.Mesh(floorGeo, floorMat);
    this.floorMesh.receiveShadow = true;
    this.scene.add(this.floorMesh);

    // Systems
    this.spatialGrid = new SpatialGrid(5.0);
    this.collectibles = new CollectibleManager(this.scene);
    this.weapons = new WeaponSystem(this.scene, this.spatialGrid);
    this.enemies = new EnemyManager(this.scene, this.spatialGrid);
    this.player = new Player(this.scene);
    this.upgradeDeck = new UpgradeDeck();

    this.clock = new THREE.Clock();
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
    this.clock.start();

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

    const dt = Math.min(this.clock.getDelta(), 0.1);

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
        }
      );

      // 5. Collectibles & Particles
      this.collectibles.update(dt, this.player, this.camera);

      // 6. HUD
      this._updateHUD();
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new GameApp();
  app.run();
});
