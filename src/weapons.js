// Complete 3D Visual Overhaul: 4 Distinct Tangible Weapon Archetypes
import * as THREE from 'three';
import { sound } from './audio.js';
import { createRingPulseTexture } from './textures.js';

export class WeaponSystem {
  constructor(scene, spatialGrid) {
    this.scene = scene;
    this.grid = spatialGrid;

    // ==========================================
    // 1. WEAPON 1: LĂNG KÍNH VỆ TINH THÁI DƯƠNG (Solar Prism Orbitals)
    // Multi-faceted crystalline polyhedra with rotating laser mirrors
    // ==========================================
    this.orbitalCount = 2;
    this.orbitalRadius = 3.8;
    this.orbitalSpeed = 3.0;
    this.orbitalDamage = 24;
    this.orbitalAngle = 0;
    this.orbitalMeshes = [];
    this.laserSegments = null;
    this.isSuperchargedLaser = false;
    this._initOrbitals();

    // ==========================================
    // 2. WEAPON 2: ĐẠI THƯƠNG TINH THỂ XUYÊN KHÔNG (Void Crystal Javelins)
    // High-speed spinning 3D crystalline spears with corkscrew helix aura
    // ==========================================
    this.boltCooldownMax = 0.52;
    this.boltCooldown = 0.1;
    this.boltCount = 1;
    this.boltDamage = 28;
    this.boltSpeed = 30;
    this.boltPierce = 1;
    this.projectiles = [];
    this._initProjectilesPool();

    // ==========================================
    // 3. WEAPON 3: BĂNG LONG TRẢM / BÃO BĂNG GAI (Glacial Spire Cascade)
    // 3D Ice Crystal Spires bursting from ground under clusters of enemies
    // ==========================================
    this.glacialActive = false;
    this.glacialCooldownMax = 2.4;
    this.glacialCooldown = 1.0;
    this.glacialDamage = 65;
    this.glacialRadius = 4.2;
    this.iceSpires = [];
    this._initGlacialSystem();

    // ==========================================
    // 4. WEAPON 4: ĐỊA CHẤN THẦN TỐC & VẾT NỨT HƯ KHÔNG (Ground Rifts & Shockwaves)
    // Dash shockwave ring + persistent glowing arcane ground rift
    // ==========================================
    this.shockwaves = [];
    this.shockwaveTexture = createRingPulseTexture();
    this.shockwaveGeo = new THREE.PlaneGeometry(1, 1);
    this.shockwaveGeo.rotateX(-Math.PI / 2);

    this.groundRifts = [];
    this._initRiftsSystem();
  }

  // ------------------------------------------
  // 1. ORBITAL SATELLITES WITH 3D CRYSTAL PRISMS
  // ------------------------------------------
  _initOrbitals() {
    this.orbitalGroup = new THREE.Group();
    this.scene.add(this.orbitalGroup);

    // Dynamic laser beam connecting orbitals & player
    this.laserMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending
    });
    const lineGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(128 * 3);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.laserSegments = new THREE.LineSegments(lineGeo, this.laserMat);
    this.scene.add(this.laserSegments);

    this.rebuildOrbitals();
  }

  rebuildOrbitals() {
    while (this.orbitalMeshes.length) {
      const m = this.orbitalMeshes.pop();
      this.orbitalGroup.remove(m);
      m.traverse(child => {
        if (child.material) child.material.dispose();
      });
    }

    // Compound faceted crystal shard with internal diamond core
    const outerGeo = new THREE.OctahedronGeometry(0.55, 0);
    const innerGeo = new THREE.OctahedronGeometry(0.28, 0);

    for (let i = 0; i < this.orbitalCount; i++) {
      const group = new THREE.Group();

      const outerMat = new THREE.MeshStandardMaterial({
        color: this.isSuperchargedLaser ? 0xa855f7 : 0x38bdf8,
        emissive: this.isSuperchargedLaser ? 0x7e22ce : 0x0284c7,
        emissiveIntensity: 1.2,
        roughness: 0.1,
        metalness: 0.4,
        flatShading: true,
        transparent: true,
        opacity: 0.9
      });
      const outerMesh = new THREE.Mesh(outerGeo, outerMat);
      outerMesh.castShadow = true;
      group.add(outerMesh);

      const innerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const innerMesh = new THREE.Mesh(innerGeo, innerMat);
      group.add(innerMesh);

      this.orbitalGroup.add(group);
      this.orbitalMeshes.push(group);
    }
  }

  setSuperchargedLaser() {
    this.isSuperchargedLaser = true;
    this.laserMat.color.setHex(0xa855f7);
    this.rebuildOrbitals();
  }

  // ------------------------------------------
  // 2. VOID CRYSTAL JAVELINS (Spinning 3D Projectiles)
  // ------------------------------------------
  _initProjectilesPool() {
    this.projectileGroup = new THREE.Group();
    this.scene.add(this.projectileGroup);

    // Standard lance: cylinder already rotated X(PI/2) so its long axis points +Z
    this.standardLanceGeo = new THREE.CylinderGeometry(0.12, 0.18, 1.5, 6);
    this.standardLanceGeo.rotateX(Math.PI / 2); // now points toward +Z (travel direction)

    // Heavy Javelin: cone already rotated X(PI/2), tip points +Z
    this.heavyLanceGeo = new THREE.ConeGeometry(0.38, 2.6, 6);
    this.heavyLanceGeo.rotateX(Math.PI / 2); // tip toward +Z = travel direction

    this.boltColors = [
      new THREE.Color(0x38bdf8), // Frost Cyan
      new THREE.Color(0xf43f5e), // Flame Crimson
      new THREE.Color(0xa855f7), // Arcane Violet
      new THREE.Color(0xfbbf24), // Amber Solar
      new THREE.Color(0x10b981), // Emerald Astral
    ];
  }

  fireBolt(px, py, pz, targetX, targetZ, colorIndex = 0) {
    const dx = targetX - px;
    const dz = targetZ - pz;
    const len = Math.sqrt(dx * dx + dz * dz) || 1;

    const isHeavy = this.boltPierce > 1;
    const geo = isHeavy ? this.heavyLanceGeo : this.standardLanceGeo;
    const col = this.boltColors[colorIndex % this.boltColors.length];

    const boltGroup = new THREE.Group();

    // Solid inner core
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const coreMesh = new THREE.Mesh(geo, coreMat);
    coreMesh.scale.set(0.65, 0.65, 0.95);
    boltGroup.add(coreMesh);

    // Outer crystalline energy hull
    const hullMat = new THREE.MeshStandardMaterial({
      color: col,
      emissive: col,
      emissiveIntensity: 1.2,
      roughness: 0.1,
      metalness: 0.5,
      transparent: true,
      opacity: 0.85,
      flatShading: true
    });
    const hullMesh = new THREE.Mesh(geo, hullMat);
    boltGroup.add(hullMesh);

    // Helix ring: TorusGeometry lies in XY plane.
    // After boltGroup quaternion aligns group's +Z to travel dir,
    // the ring's XY plane becomes perpendicular to travel dir (correct cross-section).
    // Spin ring on Z axis = roll = corkscrew around lance axis.
    const ringGeo = new THREE.TorusGeometry(0.38, 0.05, 6, 14);
    const ringMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9 });
    const helixRing = new THREE.Mesh(ringGeo, ringMat);
    // Position ring slightly ahead of center on lance
    helixRing.position.z = 0.3;
    boltGroup.add(helixRing);
    boltGroup.helixRing = helixRing;

    boltGroup.position.set(px, py, pz);
    // Align group's local +Z to travel direction
    boltGroup.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(dx / len, 0, dz / len)
    );
    this.projectileGroup.add(boltGroup);

    this.projectiles.push({
      mesh: boltGroup,
      x: px,
      y: py,
      z: pz,
      vx: (dx / len) * this.boltSpeed,
      vz: (dz / len) * this.boltSpeed,
      life: 2.2,
      damage: this.boltDamage,
      pierceRemaining: this.boltPierce,
      hitEnemies: new Set(),
      trailColor: col,
      trailTimer: 0
    });

    sound.playBoltFire();
  }

  // ------------------------------------------
  // 3. GLACIAL SPIRE CASCADE (3D Ground Ice Spikes)
  // ------------------------------------------
  _initGlacialSystem() {
    this.iceSpireGroup = new THREE.Group();
    this.scene.add(this.iceSpireGroup);

    this.spireGeo = new THREE.ConeGeometry(0.5, 3.2, 5);
    this.spireMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.9,
      roughness: 0.1,
      metalness: 0.2,
      flatShading: true,
      transparent: true,
      opacity: 0.95
    });
  }

  unlockGlacialSpire() {
    this.glacialActive = true;
  }

  triggerGlacialSpireEruption(cx, cz) {
    sound.playIceSpire();

    // Spawn a cluster of 5 sharp 3D ice spires shooting from ground
    for (let s = 0; s < 5; s++) {
      const angle = (s / 5) * Math.PI * 2 + Math.random() * 0.4;
      const dist = s === 0 ? 0 : 0.8 + Math.random() * 1.8;
      const sx = cx + Math.cos(angle) * dist;
      const sz = cz + Math.sin(angle) * dist;

      // ConeGeometry points up Y by default — start buried below ground, erupt upward
      // Only allow small X/Z tilt (no random Y so spires remain upright)
      const spireMesh = new THREE.Mesh(this.spireGeo, this.spireMat.clone());
      const tiltX = (Math.random() - 0.5) * 0.28;
      const tiltZ = (Math.random() - 0.5) * 0.28;
      const scaleXZ = 0.75 + Math.random() * 0.55;
      const scaleY  = 0.85 + Math.random() * 0.65;
      spireMesh.position.set(sx, -1.8, sz);
      spireMesh.rotation.set(tiltX, 0, tiltZ); // no Y rotation: spires point up
      spireMesh.scale.set(scaleXZ, scaleY, scaleXZ);
      this.iceSpireGroup.add(spireMesh);

      this.iceSpires.push({
        mesh: spireMesh,
        x: sx,
        z: sz,
        startY: -1.8,
        peakY: 1.6,
        life: 0,
        maxLife: 1.5,
        hasDamaged: false
      });
    }
  }

  // ------------------------------------------
  // 4. KINETIC SHOCKWAVE & GROUND RIFTS
  // ------------------------------------------
  _initRiftsSystem() {
    this.riftGroup = new THREE.Group();
    this.scene.add(this.riftGroup);

    this.riftPlaneGeo = new THREE.PlaneGeometry(3.5, 3.5);
    this.riftPlaneGeo.rotateX(-Math.PI / 2);
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

    // Create a lingering glowing runic ground rift at dash origin
    this._createGroundRift(x, z, damage * 0.4);
  }

  _createGroundRift(x, z, burnDamage) {
    const mat = new THREE.MeshBasicMaterial({
      map: this.shockwaveTexture,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(this.riftPlaneGeo, mat);
    mesh.position.set(x, 0.04, z);
    this.riftGroup.add(mesh);

    this.groundRifts.push({
      mesh,
      mat,
      x,
      z,
      damage: burnDamage,
      life: 0,
      maxLife: 2.0,
      lastTick: 0
    });
  }

  // ------------------------------------------
  // MAIN UPDATE LOOP FOR ALL WEAPONS
  // ------------------------------------------
  update(dt, player, enemyManager, onEnemyKilled, onDamageDealt, collectibles = null) {
    const time = performance.now() * 0.001;

    // 1. UPDATE ORBITAL SATELLITES & RESONANCE LASERS
    this.orbitalAngle += this.orbitalSpeed * dt;
    const orbitalPositions = [];

    for (let i = 0; i < this.orbitalMeshes.length; i++) {
      const group = this.orbitalMeshes[i];
      const angle = this.orbitalAngle + (i * Math.PI * 2) / this.orbitalMeshes.length;
      const ox = player.x + Math.cos(angle) * this.orbitalRadius;
      const oz = player.z + Math.sin(angle) * this.orbitalRadius;
      const oy = player.y + Math.sin(time * 5 + i) * 0.25;

      group.position.set(ox, oy, oz);
      group.rotation.x += dt * 4;
      group.rotation.y += dt * 5;
      orbitalPositions.push(new THREE.Vector3(ox, oy, oz));

      // Damage enemies touching this orbital
      const hits = this.grid.queryRadius(ox, oz, 1.5);
      for (let h = 0; h < hits.length; h++) {
        const e = hits[h];
        if (!e.lastOrbitalHit || time - e.lastOrbitalHit > 0.14) {
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

      // Laser between satellite neighbors (forming sacred laser polygon)
      linePositions[lineIdx++] = p1.x;
      linePositions[lineIdx++] = p1.y;
      linePositions[lineIdx++] = p1.z;
      linePositions[lineIdx++] = p2.x;
      linePositions[lineIdx++] = p2.y;
      linePositions[lineIdx++] = p2.z;
    }
    this.laserSegments.geometry.attributes.position.needsUpdate = true;
    this.laserSegments.geometry.setDrawRange(0, lineIdx / 3);

    // 2. PRISMATIC BOLTS WITH HELIX SPIN
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
      // Roll (corkscrew) on Z = around lance forward axis — gives spinning spear look
      p.mesh.rotation.z += dt * 14;
      if (p.mesh.helixRing) {
        // Ring is in local XY plane (perpendicular to lance), spin it on local Z = corkscrew
        p.mesh.helixRing.rotation.z += dt * 12;
        p.mesh.helixRing.scale.setScalar(1 + Math.sin(time * 18) * 0.18);
      }

      const hits = this.grid.queryRadius(p.x, p.z, 1.4);
      for (let h = 0; h < hits.length; h++) {
        const e = hits[h];
        if (!p.hitEnemies.has(e)) {
          p.hitEnemies.add(e);
          enemyManager.damageEnemy(e, p.damage, 8, p.x, p.z, onEnemyKilled);
          if (onDamageDealt) onDamageDealt(e.x, e.y, e.z, p.damage);
          if (collectibles) {
            collectibles.spawnShatter(p.x, p.y, p.z, p.trailColor ? p.trailColor.getHex() : 0x38bdf8, 4);
          }
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

    // 3. GLACIAL SPIRE ERUPTIONS (Auto-trigger under densest enemy cluster)
    if (this.glacialActive) {
      this.glacialCooldown -= dt;
      if (this.glacialCooldown <= 0) {
        const nearby = this.grid.queryRadius(player.x, player.z, 24);
        if (nearby.length > 0) {
          // Pick a random prominent target in swarm
          const randEnemy = nearby[Math.floor(Math.random() * nearby.length)];
          this.triggerGlacialSpireEruption(randEnemy.x, randEnemy.z);
        }
        this.glacialCooldown = this.glacialCooldownMax;
      }
    }

    // Update Ice Spires — erupt up on Y axis, shatter/fade at peak
    for (let i = this.iceSpires.length - 1; i >= 0; i--) {
      const spire = this.iceSpires[i];
      spire.life += dt;

      const riseTime = 0.18;
      if (spire.life < riseTime) {
        // Fast upward burst along Y (world vertical)
        const riseProgress = spire.life / riseTime;
        spire.mesh.position.y = spire.startY + riseProgress * (spire.peakY - spire.startY);
      } else {
        spire.mesh.position.y = spire.peakY;
        if (!spire.hasDamaged) {
          spire.hasDamaged = true;
          if (collectibles) {
            collectibles.spawnShatter(spire.x, spire.peakY * 0.8, spire.z, 0xbae6fd, 8);
          }
          const hits = this.grid.queryRadius(spire.x, spire.z, 2.4);
          for (let h = 0; h < hits.length; h++) {
            const e = hits[h];
            enemyManager.damageEnemy(e, this.glacialDamage, 12, spire.x, spire.z, onEnemyKilled);
            if (onDamageDealt) onDamageDealt(e.x, e.y, e.z, this.glacialDamage);
          }
        }
        // Fade and shrink before removal
        const fadeStart = spire.maxLife - 0.35;
        if (spire.life > fadeStart) {
          const fade = Math.max(0, (spire.maxLife - spire.life) / 0.35);
          spire.mesh.scale.setScalar(fade * Math.max(spire.mesh.scale.x, 0.01));
          if (spire.mesh.material) spire.mesh.material.opacity = fade * 0.95;
        }
      }

      if (spire.life >= spire.maxLife) {
        this.iceSpireGroup.remove(spire.mesh);
        if (spire.mesh.material) spire.mesh.material.dispose();
        this.iceSpires.splice(i, 1);
      }
    }

    // 4. KINETIC SHOCKWAVES
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
          enemyManager.damageEnemy(e, sw.damage, 22, sw.x, sw.z, onEnemyKilled);
          if (onDamageDealt) onDamageDealt(e.x, e.y, e.z, sw.damage);
        }
      }

      if (progress >= 1) {
        this.scene.remove(sw.mesh);
        sw.mat.dispose();
        this.shockwaves.splice(i, 1);
      }
    }

    // 5. GROUND RIFTS (Damage-over-time chasm)
    for (let i = this.groundRifts.length - 1; i >= 0; i--) {
      const rift = this.groundRifts[i];
      rift.life += dt;
      rift.mat.opacity = Math.max(0, (1 - rift.life / rift.maxLife) * 0.8);

      if (time - rift.lastTick > 0.3) {
        rift.lastTick = time;
        const burnt = this.grid.queryRadius(rift.x, rift.z, 2.5);
        for (let b = 0; b < burnt.length; b++) {
          const e = burnt[b];
          enemyManager.damageEnemy(e, rift.damage, 2, rift.x, rift.z, onEnemyKilled);
          if (onDamageDealt) onDamageDealt(e.x, e.y, e.z, Math.round(rift.damage));
        }
      }

      if (rift.life >= rift.maxLife) {
        this.riftGroup.remove(rift.mesh);
        rift.mat.dispose();
        this.groundRifts.splice(i, 1);
      }
    }
  }
}
