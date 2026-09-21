// High-Visibility 3D Enemy Swarm System (Direct Scene Meshes with Full Visibility & Health Bars)
import * as THREE from 'three';
import { sound } from './audio.js';

export class EnemyManager {
  constructor(scene, spatialGrid) {
    this.scene = scene;
    this.grid = spatialGrid;

    // Active enemies list
    this.enemies = [];
    this.spawnTimer = 0;
    this.spawnInterval = 0.8;
    this.difficultyTier = 1;

    // Container group
    this.enemyGroup = new THREE.Group();
    this.scene.add(this.enemyGroup);

    // Shared Geometries & Materials for maximum performance & visual pop
    this._initAssets();
  }

  _initAssets() {
    // 1. Crawler Assets (Faceted glowing emerald beetle with sharp horn and ruby eyes)
    this.crawlerBodyGeo = new THREE.ConeGeometry(0.9, 1.4, 5);
    this.crawlerBodyGeo.rotateX(Math.PI / 2);
    this.crawlerHornGeo = new THREE.ConeGeometry(0.25, 0.7, 4);
    this.crawlerHornGeo.rotateX(-Math.PI / 4);

    this.crawlerMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x064e3b,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.4,
      flatShading: true
    });

    this.eyeMat = new THREE.MeshBasicMaterial({ color: 0xff2222 });
    this.eyeGeo = new THREE.SphereGeometry(0.14, 6, 6);

    // 2. Spore Assets (Floating Amethyst Octahedron with twin orbiting crystals)
    this.sporeBodyGeo = new THREE.OctahedronGeometry(1.0, 0);
    this.sporeMat = new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      emissive: 0x6b21a8,
      emissiveIntensity: 1.0,
      roughness: 0.15,
      metalness: 0.3,
      flatShading: true
    });

    // 3. Golem Assets (Colossal Amber Titan)
    this.golemBodyGeo = new THREE.DodecahedronGeometry(1.8, 0);
    this.golemShoulderGeo = new THREE.OctahedronGeometry(0.8, 0);
    this.golemMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0x78350f,
      emissiveIntensity: 0.8,
      roughness: 0.3,
      metalness: 0.2,
      flatShading: true
    });

    // Health Bar Billboard Sprite Material
    this.hpBarMat = new THREE.MeshBasicMaterial({ color: 0xef4444, depthTest: false });
    this.hpBarBgMat = new THREE.MeshBasicMaterial({ color: 0x1e293b, depthTest: false });
    this.hpBarGeo = new THREE.PlaneGeometry(1.2, 0.15);
  }

  // Create full 3D compound mesh for an enemy
  _createEnemyMesh(type) {
    const group = new THREE.Group();

    if (type === 'crawler') {
      // Main Body
      const body = new THREE.Mesh(this.crawlerBodyGeo, this.crawlerMat);
      body.castShadow = true;
      group.add(body);

      // Horn
      const horn = new THREE.Mesh(this.crawlerHornGeo, this.crawlerMat);
      horn.position.set(0, 0.4, 0.7);
      group.add(horn);

      // Glowing Eyes
      const eyeL = new THREE.Mesh(this.eyeGeo, this.eyeMat);
      eyeL.position.set(0.3, 0.2, 0.75);
      group.add(eyeL);

      const eyeR = new THREE.Mesh(this.eyeGeo, this.eyeMat);
      eyeR.position.set(-0.3, 0.2, 0.75);
      group.add(eyeR);

    } else if (type === 'spore') {
      const body = new THREE.Mesh(this.sporeBodyGeo, this.sporeMat);
      body.castShadow = true;
      group.add(body);

      // Orbiting halo shards
      const shardGeo = new THREE.TetrahedronGeometry(0.25, 0);
      const shard1 = new THREE.Mesh(shardGeo, this.eyeMat);
      shard1.position.set(1.4, 0, 0);
      group.add(shard1);
      group.shard1 = shard1;

      const shard2 = new THREE.Mesh(shardGeo, this.eyeMat);
      shard2.position.set(-1.4, 0, 0);
      group.add(shard2);
      group.shard2 = shard2;

    } else {
      // Golem
      const body = new THREE.Mesh(this.golemBodyGeo, this.golemMat);
      body.castShadow = true;
      group.add(body);

      const leftShoulder = new THREE.Mesh(this.golemShoulderGeo, this.golemMat);
      leftShoulder.position.set(1.6, 0.8, 0);
      group.add(leftShoulder);

      const rightShoulder = new THREE.Mesh(this.golemShoulderGeo, this.golemMat);
      rightShoulder.position.set(-1.6, 0.8, 0);
      group.add(rightShoulder);
    }

    // Health bar above enemy head
    const hpBg = new THREE.Mesh(this.hpBarGeo, this.hpBarBgMat);
    hpBg.position.set(0, type === 'golem' ? 2.6 : 1.6, 0);
    hpBg.renderOrder = 999;
    group.add(hpBg);

    const hpFill = new THREE.Mesh(this.hpBarGeo, this.hpBarMat);
    hpFill.position.set(0, type === 'golem' ? 2.6 : 1.6, 0.01);
    hpFill.renderOrder = 1000;
    group.add(hpFill);
    group.hpFill = hpFill;

    return group;
  }

  // SPAWN INITIAL WAVE WITH TACTICAL BREATHING ROOM (Radius 14 to 20)
  spawnInitialWave(playerX, playerZ) {
    this.clearAll();

    // 10 Crawlers spaced out comfortably around player
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const dist = 14 + Math.random() * 6; // Comfortable breathing distance
      const sx = playerX + Math.cos(angle) * dist;
      const sz = playerZ + Math.sin(angle) * dist;
      this.spawnEnemy('crawler', sx, sz);
    }
  }

  clearAll() {
    while (this.enemies.length) {
      const e = this.enemies.pop();
      this.enemyGroup.remove(e.group);
    }
    this.grid.clear();
  }

  spawnEnemy(type, x, z) {
    if (this.enemies.length >= 120) return; // Smooth 60fps limit

    let hp, speed, radius, damage, expValue, defaultColor;

    if (type === 'crawler') {
      defaultColor = new THREE.Color(0x10b981);
      hp = 12 + (this.difficultyTier - 1) * 2.5;
      speed = 3.8 + Math.random() * 0.8; // Pleasant dodging speed
      radius = 0.9;
      damage = 6;
      expValue = 1;
    } else if (type === 'spore') {
      defaultColor = new THREE.Color(0xc084fc);
      hp = 30 + (this.difficultyTier - 1) * 5;
      speed = 2.8;
      radius = 1.1;
      damage = 12;
      expValue = 3;
    } else {
      defaultColor = new THREE.Color(0xf59e0b);
      hp = 130 + (this.difficultyTier - 1) * 20;
      speed = 1.6;
      radius = 1.8;
      damage = 22;
      expValue = 10;
    }

    const group = this._createEnemyMesh(type);
    group.position.set(x, type === 'golem' ? 1.6 : (type === 'spore' ? 1.3 : 0.6), z);
    this.enemyGroup.add(group);

    const enemy = {
      type,
      group,
      x,
      y: group.position.y,
      z,
      hp,
      maxHp: hp,
      speed,
      radius,
      damage,
      expValue,
      defaultColor,
      flashTimer: 0,
      vx: 0,
      vz: 0,
      currentAngle: 0,
      waveOffset: Math.random() * Math.PI * 2,
      isAlive: true
    };

    this.enemies.push(enemy);
  }

  updateSpawning(dt, gameTime, playerX, playerZ) {
    this.spawnTimer += dt;
    this.difficultyTier = 1 + Math.floor(gameTime / 25);
    // Relaxed spawn interval: starts at 1.4s, scales comfortably
    this.spawnInterval = Math.max(0.45, 1.4 - (gameTime / 180) * 0.65);

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;

      // Spawn in small, rhythmic packs (2 to 4 enemies)
      const count = 2 + Math.floor(Math.random() * (1 + this.difficultyTier * 0.5));
      const baseAngle = Math.random() * Math.PI * 2;

      for (let i = 0; i < count; i++) {
        const angle = baseAngle + (Math.random() - 0.5) * 0.8;
        const dist = 18 + Math.random() * 8; // 18 to 26 units
        const sx = playerX + Math.cos(angle) * dist;
        const sz = playerZ + Math.sin(angle) * dist;

        const roll = Math.random();
        if (gameTime > 60 && roll < 0.15) {
          this.spawnEnemy('golem', sx, sz);
        } else if (gameTime > 25 && roll < 0.4) {
          this.spawnEnemy('spore', sx, sz);
        } else {
          this.spawnEnemy('crawler', sx, sz);
        }
      }
    }
  }

  damageEnemy(enemy, amount, knockbackPower = 0, sourceX = 0, sourceZ = 0, onEnemyKilled = null) {
    if (!enemy.isAlive) return;

    enemy.hp -= amount;
    enemy.flashTimer = 0.14;

    // Knockback
    if (knockbackPower > 0) {
      const dx = enemy.x - sourceX;
      const dz = enemy.z - sourceZ;
      const len = Math.sqrt(dx * dx + dz * dz) || 1;
      const resistance = enemy.type === 'golem' ? 0.35 : (enemy.type === 'spore' ? 0.65 : 1.0);
      enemy.vx += (dx / len) * knockbackPower * resistance;
      enemy.vz += (dz / len) * knockbackPower * resistance;
    }

    if (enemy.hp <= 0) {
      enemy.isAlive = false;
      sound.playEnemyShatter();
      if (onEnemyKilled) {
        onEnemyKilled(enemy);
      }
    }
  }

  update(dt, player, camera, onEnemyKilled) {
    const time = performance.now() * 0.003;

    // PASS 1: Clean up dead enemies & populate spatial grid with current positions
    this.grid.clear();
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (!e.isAlive) {
        this.enemyGroup.remove(e.group);
        this.enemies.splice(i, 1);
        continue;
      }
      this.grid.insert(e);
    }

    // PASS 2: Smooth velocity integration & separation
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];

      // Direction vector toward player
      const dx = player.x - e.x;
      const dz = player.z - e.z;
      const dist = Math.sqrt(dx * dx + dz * dz) || 0.001;

      // Smooth flocking separation with distance decay
      let sepX = 0;
      let sepZ = 0;
      const queryRadius = e.radius * 2.2;
      const neighbors = this.grid.queryRadius(e.x, e.z, queryRadius);

      if (neighbors.length > 1) {
        for (let n = 0; n < neighbors.length; n++) {
          const other = neighbors[n];
          if (other !== e) {
            const ndx = e.x - other.x;
            const ndz = e.z - other.z;
            const nDistSq = ndx * ndx + ndz * ndz;
            const minDist = (e.radius + other.radius);

            if (nDistSq < minDist * minDist && nDistSq > 0.0001) {
              const nDist = Math.sqrt(nDistSq);
              // Normalized overlap: 1 when completely touching, 0 at boundary
              const overlap = (minDist - nDist) / minDist;
              const pushForce = overlap * 4.0;
              sepX += (ndx / nDist) * pushForce;
              sepZ += (ndz / nDist) * pushForce;
            }
          }
        }
      }

      // Base heading towards player
      let dirX = dx / dist;
      let dirZ = dz / dist;

      // Spore wavy motion
      if (e.type === 'spore') {
        const perpX = -dirZ;
        const perpZ = dirX;
        const wave = Math.sin(time * 3 + e.waveOffset) * 0.5;
        dirX += perpX * wave;
        dirZ += perpZ * wave;
        const len = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1;
        dirX /= len;
        dirZ /= len;
      }

      // Calculate desired velocity (chase + gentle separation)
      const targetVx = dirX * e.speed + sepX;
      const targetVz = dirZ * e.speed + sepZ;

      // Smooth velocity transitions (inertia damping)
      const smoothRate = 1.0 - Math.exp(-14 * dt);
      e.vx += (targetVx - e.vx) * smoothRate;
      e.vz += (targetVz - e.vz) * smoothRate;

      // Apply displacement
      e.x += e.vx * dt;
      e.z += e.vz * dt;

      // Attack player check
      if (dist < player.pickupRadius * 0.25 + e.radius) {
        player.takeDamage(e.damage);
      }

      // Smooth rotational turning (angular lerp with shortest angle difference)
      const targetAngle = Math.atan2(e.vx, e.vz);
      let angleDiff = targetAngle - e.currentAngle;
      // Wrap difference to [-PI, PI] to avoid 360-degree snap spins
      angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
      e.currentAngle += angleDiff * Math.min(1.0, 10 * dt);
      e.group.rotation.set(0, e.currentAngle, 0);

      // Procedural vertical bobbing
      if (e.type === 'crawler') {
        e.y = 0.6 + Math.abs(Math.sin(time * 10 + e.waveOffset)) * 0.14;
      } else if (e.type === 'spore') {
        e.y = 1.3 + Math.sin(time * 3 + e.waveOffset) * 0.22;
        if (e.group.shard1) e.group.shard1.rotation.y += dt * 5;
        if (e.group.shard2) e.group.shard2.rotation.y += dt * 5;
      } else {
        e.y = 1.6 + Math.abs(Math.sin(time * 4)) * 0.16;
      }

      e.group.position.set(e.x, e.y, e.z);

      // Health bar fill update
      if (e.group.hpFill) {
        const pct = Math.max(0, Math.min(1, e.hp / e.maxHp));
        e.group.hpFill.scale.set(pct, 1, 1);
        e.group.hpFill.position.x = -(1 - pct) * 0.6;
      }

      // Damage Flash
      if (e.flashTimer > 0) {
        e.flashTimer -= dt;
        e.group.children[0].material.color.setHex(0xffffff);
      } else {
        e.group.children[0].material.color.copy(e.defaultColor);
      }
    }
  }
}
