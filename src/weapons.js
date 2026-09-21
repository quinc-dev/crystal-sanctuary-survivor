// Tri-Synergy Weapon System with Dramatic 3D Visual Evolutions
import * as THREE from 'three';
import { sound } from './audio.js';
import { createRingPulseTexture } from './textures.js';

export class WeaponSystem {
  constructor(scene, spatialGrid) {
    this.scene = scene;
    this.grid = spatialGrid;

    // 1. Orbital Resonance Satellites
    this.orbitalCount = 2;
    this.orbitalRadius = 3.6;
    this.orbitalSpeed = 3.0;
    this.orbitalDamage = 22;
    this.orbitalAngle = 0;
    this.orbitalMeshes = [];
    this.laserSegments = null;
    this.isSuperchargedLaser = false;
    this._initOrbitals();

    // 2. Prismatic Auto-Targeting Bolts
    this.boltCooldownMax = 0.55;
    this.boltCooldown = 0.1;
    this.boltCount = 1;
    this.boltDamage = 26;
    this.boltSpeed = 28;
    this.boltPierce = 1;
    this.projectiles = [];
    this._initProjectilesPool();

    // 3. Kinetic Shockwaves
    this.shockwaves = [];
    this.shockwaveTexture = createRingPulseTexture();
    this.shockwaveGeo = new THREE.PlaneGeometry(1, 1);
    this.shockwaveGeo.rotateX(-Math.PI / 2);
  }

  _initOrbitals() {
    this.orbitalGroup = new THREE.Group();
    this.scene.add(this.orbitalGroup);

    // Laser beam connecting orbitals & player
    this.laserMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const lineGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(64 * 3);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.laserSegments = new THREE.LineSegments(lineGeo, this.laserMat);
    this.scene.add(this.laserSegments);

    this.rebuildOrbitals();
  }

  rebuildOrbitals() {
    while (this.orbitalMeshes.length) {
      const m = this.orbitalMeshes.pop();
      this.orbitalGroup.remove(m);
    }

    // Faceted Crystal Shards for Satellites
    const shardGeo = new THREE.OctahedronGeometry(0.5, 0);
    const shardMat = new THREE.MeshStandardMaterial({
      color: this.isSuperchargedLaser ? 0xa855f7 : 0x38bdf8,
      emissive: this.isSuperchargedLaser ? 0x7e22ce : 0x0284c7,
      emissiveIntensity: 1.0,
      roughness: 0.1,
      metalness: 0.3,
      flatShading: true
    });

    for (let i = 0; i < this.orbitalCount; i++) {
      const mesh = new THREE.Mesh(shardGeo, shardMat);
      mesh.castShadow = true;
      this.orbitalGroup.add(mesh);
      this.orbitalMeshes.push(mesh);
    }
  }

  setSuperchargedLaser() {
    this.isSuperchargedLaser = true;
    this.laserMat.color.setHex(0xa855f7);
    this.rebuildOrbitals();
  }

  _initProjectilesPool() {
    this.projectileGroup = new THREE.Group();
    this.scene.add(this.projectileGroup);

    // Standard Dart
    this.standardBoltGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.2, 6);
    this.standardBoltGeo.rotateX(Math.PI / 2);

    // Evolved Heavy Lance (When boltPierce > 1)
    this.heavyLanceGeo = new THREE.ConeGeometry(0.3, 2.0, 6);
    this.heavyLanceGeo.rotateX(Math.PI / 2);

    // Multicolored Bolt Materials
    this.boltColors = [
      new THREE.Color(0x38bdf8), // Frost Cyan
      new THREE.Color(0xf43f5e), // Flame Crimson
      new THREE.Color(0xa855f7), // Arcane Violet
      new THREE.Color(0xfbbf24), // Amber Solar
    ];
  }

  fireBolt(px, py, pz, targetX, targetZ, colorIndex = 0) {
    const dx = targetX - px;
    const dz = targetZ - pz;
    const len = Math.sqrt(dx * dx + dz * dz) || 1;

    const isHeavy = this.boltPierce > 1;
    const geo = isHeavy ? this.heavyLanceGeo : this.standardBoltGeo;
    const col = this.boltColors[colorIndex % this.boltColors.length];

    // Compound projectile: Solid inner beam + Outer luminous translucent halo
    const boltMeshGroup = new THREE.Group();

    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const coreMesh = new THREE.Mesh(geo, coreMat);
    coreMesh.scale.set(0.6, 0.6, 0.9);
    boltMeshGroup.add(coreMesh);

    const haloMat = new THREE.MeshBasicMaterial({
      color: col,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const haloMesh = new THREE.Mesh(geo, haloMat);
    boltMeshGroup.add(haloMesh);

    boltMeshGroup.position.set(px, py, pz);
    boltMeshGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(dx / len, 0, dz / len));
    this.projectileGroup.add(boltMeshGroup);

    this.projectiles.push({
      mesh: boltMeshGroup,
      x: px,
      y: py,
      z: pz,
      vx: (dx / len) * this.boltSpeed,
      vz: (dz / len) * this.boltSpeed,
      life: 2.2,
      damage: this.boltDamage,
      pierceRemaining: this.boltPierce,
      hitEnemies: new Set(),
      trailColor: col
    });

    sound.playBoltFire();
  }

  createShockwave(x, z, maxRadius = 12, damage = 50) {
    const mat = new THREE.MeshBasicMaterial({
      map: this.shockwaveTexture,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(this.shockwaveGeo, mat);
    mesh.position.set(x, 0.08, z);
    this.scene.add(mesh);

    this.shockwaves.push({
      mesh,
      mat,
      x,
      z,
      currentRadius: 1,
      maxRadius,
      damage,
      life: 0,
      duration: 0.45,
      hitEnemies: new Set()
    });
  }

  update(dt, player, enemyManager, onEnemyKilled, onDamageDealt) {
    const time = performance.now() * 0.001;

    // 1. UPDATE ORBITAL SATELLITES & RESONANCE LASERS
    this.orbitalAngle += this.orbitalSpeed * dt;
    const orbitalPositions = [];

    for (let i = 0; i < this.orbitalMeshes.length; i++) {
      const mesh = this.orbitalMeshes[i];
      const angle = this.orbitalAngle + (i * Math.PI * 2) / this.orbitalMeshes.length;
      const ox = player.x + Math.cos(angle) * this.orbitalRadius;
      const oz = player.z + Math.sin(angle) * this.orbitalRadius;
      const oy = player.y + Math.sin(time * 5 + i) * 0.2;

      mesh.position.set(ox, oy, oz);
      mesh.rotation.x += dt * 4;
      mesh.rotation.y += dt * 5;
      orbitalPositions.push(new THREE.Vector3(ox, oy, oz));

      // Damage enemies touching this orbital
      const hits = this.grid.queryRadius(ox, oz, 1.4);
      for (let h = 0; h < hits.length; h++) {
        const e = hits[h];
        if (!e.lastOrbitalHit || time - e.lastOrbitalHit > 0.15) {
          e.lastOrbitalHit = time;
          const dmg = Math.round(this.orbitalDamage);
          enemyManager.damageEnemy(e, dmg, 4, ox, oz, onEnemyKilled);
          if (onDamageDealt) onDamageDealt(e.x, e.y, e.z, dmg);
        }
      }
    }

    // Connect laser segments
    const linePositions = this.laserSegments.geometry.attributes.position.array;
    let lineIdx = 0;
    for (let i = 0; i < orbitalPositions.length; i++) {
      const p1 = orbitalPositions[i];
      const p2 = orbitalPositions[(i + 1) % orbitalPositions.length];

      // Laser from player to satellite
      linePositions[lineIdx++] = player.x;
      linePositions[lineIdx++] = player.y;
      linePositions[lineIdx++] = player.z;
      linePositions[lineIdx++] = p1.x;
      linePositions[lineIdx++] = p1.y;
      linePositions[lineIdx++] = p1.z;

      // Laser between satellite neighbors (forming a sacred laser web!)
      linePositions[lineIdx++] = p1.x;
      linePositions[lineIdx++] = p1.y;
      linePositions[lineIdx++] = p1.z;
      linePositions[lineIdx++] = p2.x;
      linePositions[lineIdx++] = p2.y;
      linePositions[lineIdx++] = p2.z;
    }
    this.laserSegments.geometry.attributes.position.needsUpdate = true;
    this.laserSegments.geometry.setDrawRange(0, lineIdx / 3);

    // 2. PRISMATIC BOLTS WITH MULTI-COLOR ELEMENTS
    this.boltCooldown -= dt;
    if (this.boltCooldown <= 0) {
      const targets = this.grid.queryRadius(player.x, player.z, 32);
      if (targets.length > 0) {
        targets.sort((a, b) => {
          const d1 = (a.x - player.x) ** 2 + (a.z - player.z) ** 2;
          const d2 = (b.x - player.x) ** 2 + (b.z - player.z) ** 2;
          return d1 - d2;
        });

        const shots = Math.min(this.boltCount, targets.length);
        for (let s = 0; s < shots; s++) {
          const target = targets[s];
          this.fireBolt(player.x, player.y, player.z, target.x, target.z, s);
        }
      } else {
        // Fire volley in facing direction
        for (let s = 0; s < this.boltCount; s++) {
          const spreadAngle = (s - (this.boltCount - 1) / 2) * 0.18;
          const cos = Math.cos(spreadAngle);
          const sin = Math.sin(spreadAngle);
          const fdx = player.facingDir.x * cos - player.facingDir.z * sin;
          const fdz = player.facingDir.x * sin + player.facingDir.z * cos;
          this.fireBolt(player.x, player.y, player.z, player.x + fdx * 20, player.z + fdz * 20, s);
        }
      }
      this.boltCooldown = this.boltCooldownMax;
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.z += p.vz * dt;
      p.mesh.position.set(p.x, p.y, p.z);
      p.mesh.rotation.z += dt * 12; // corkscrew rotation

      const hits = this.grid.queryRadius(p.x, p.z, 1.4);
      for (let h = 0; h < hits.length; h++) {
        const e = hits[h];
        if (!p.hitEnemies.has(e)) {
          p.hitEnemies.add(e);
          enemyManager.damageEnemy(e, p.damage, 8, p.x, p.z, onEnemyKilled);
          if (onDamageDealt) onDamageDealt(e.x, e.y, e.z, p.damage);
          p.pierceRemaining--;
          if (p.pierceRemaining <= 0) break;
        }
      }

      if (p.life <= 0 || p.pierceRemaining <= 0) {
        this.projectileGroup.remove(p.mesh);
        p.mesh.traverse(child => {
          if (child.material) child.material.dispose();
        });
        this.projectiles.splice(i, 1);
      }
    }

    // 3. KINETIC SHOCKWAVES
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.life += dt;
      const progress = sw.life / sw.duration;
      sw.currentRadius = 1 + progress * (sw.maxRadius - 1);

      sw.mesh.scale.set(sw.currentRadius * 2, sw.currentRadius * 2, 1);
      sw.mat.opacity = Math.max(0, (1 - progress) * 0.95);

      const swept = this.grid.queryRadius(sw.x, sw.z, sw.currentRadius);
      for (let k = 0; k < swept.length; k++) {
        const e = swept[k];
        if (!sw.hitEnemies.has(e)) {
          sw.hitEnemies.add(e);
          enemyManager.damageEnemy(e, sw.damage, 20, sw.x, sw.z, onEnemyKilled);
          if (onDamageDealt) onDamageDealt(e.x, e.y, e.z, sw.damage);
        }
      }

      if (progress >= 1) {
        this.scene.remove(sw.mesh);
        sw.mat.dispose();
        this.shockwaves.splice(i, 1);
      }
    }
  }
}
