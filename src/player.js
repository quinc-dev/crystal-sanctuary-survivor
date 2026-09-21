// Player Entity with Dramatic 3D Visual Evolutions (Living Wings, Orbiting Aegis Runes, Gravitational Chasm, Solar Crown)
import * as THREE from 'three';
import { sound } from './audio.js';

export class Player {
  constructor(scene) {
    this.scene = scene;

    // Core Combat Stats
    this.maxHp = 100;
    this.hp = 100;
    this.speed = 13.5;
    this.pickupRadius = 6.5;
    this.defense = 0;

    // Dash
    this.dashCooldownMax = 2.2;
    this.dashCooldown = 0;
    this.dashDuration = 0.22;
    this.dashTimer = 0;
    this.isDashing = false;
    this.invulnTimer = 0;
    this.flashTimer = 0;

    // Progression
    this.level = 1;
    this.exp = 0;
    this.expToNext = 4;
    this.totalKills = 0;
    this.pendingLevelUps = 0;

    // Visual Evolution Upgrades Flags
    this.hasAegisShield = false;
    this.hasWindWings = false;
    this.hasGravAura = false;
    this.hasLegendaryCrown = false;

    // Dash Shockwave & Rift
    this.hasShockwaveOnDash = true;
    this.shockwaveRadius = 11;
    this.shockwaveDamage = 50;

    // 3D Container
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.x = 0;
    this.y = 1.2;
    this.z = 0;
    this.group.position.set(this.x, this.y, this.z);

    this.velocity = new THREE.Vector3();
    this.moveDir = new THREE.Vector3();
    this.facingDir = new THREE.Vector3(0, 0, 1);

    // Afterimage phantom clones pool for dash
    this.phantomClones = [];
    this.phantomGroup = new THREE.Group();
    this.scene.add(this.phantomGroup);

    this._buildMesh();
  }

  _buildMesh() {
    // 1. Faceted Octahedron Crystal Core with luminous inner depth
    const coreGeo = new THREE.OctahedronGeometry(1.0, 0);
    this.coreMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.85,
      roughness: 0.12,
      metalness: 0.35,
      flatShading: true
    });
    this.coreMesh = new THREE.Mesh(coreGeo, this.coreMat);
    this.coreMesh.castShadow = true;
    this.group.add(this.coreMesh);

    // 2. Wireframe Nucleus
    const nucGeo = new THREE.IcosahedronGeometry(0.5, 1);
    const nucMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    this.nucleusMesh = new THREE.Mesh(nucGeo, nucMat);
    this.group.add(this.nucleusMesh);

    // 3. Torus Orbit Rings — tilted at two angles to make an atomic shell look
    const ringGeo = new THREE.TorusGeometry(1.5, 0.04, 8, 36);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.85 });
    // ring1: tilted 70° from horizontal so spin on Y gives diagonal orbit
    this.ring1 = new THREE.Mesh(ringGeo, ringMat);
    this.ring1.rotation.x = Math.PI / 2.6;  // ~69° tilt
    this.group.add(this.ring1);

    // ring2: tilted opposite way at 85°
    this.ring2 = new THREE.Mesh(ringGeo.clone(), ringMat);
    this.ring2.rotation.x = -Math.PI / 2.6;
    this.ring2.rotation.z = Math.PI / 2;    // offset 90° in Z so they cross perpendicularly
    this.ring2.scale.set(0.85, 0.85, 0.85);
    this.group.add(this.ring2);

    // 4. Point light aura
    this.coreLight = new THREE.PointLight(0x38bdf8, 2.5, 12, 1.8);
    this.coreLight.position.set(0, 0.5, 0);
    this.group.add(this.coreLight);

    // ==========================================
    // 5. VISUAL EVOLUTION 1: AEGIS RUNIC SHIELD
    // Orbiting trio of crystalline shield plates + translucent dome
    // ==========================================
    this.aegisGroup = new THREE.Group();
    const domeGeo = new THREE.IcosahedronGeometry(2.1, 1);
    const domeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    this.aegisDome = new THREE.Mesh(domeGeo, domeMat);
    this.aegisGroup.add(this.aegisDome);

    // 3 Floating diamond shield tablets rotating around
    this.aegisPlates = [];
    const plateGeo = new THREE.BoxGeometry(0.7, 1.1, 0.1);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      emissive: 0x2563eb,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.6,
      flatShading: true
    });
    for (let i = 0; i < 3; i++) {
      const p = new THREE.Mesh(plateGeo, plateMat);
      this.aegisGroup.add(p);
      this.aegisPlates.push(p);
    }
    this.aegisGroup.visible = false;
    this.group.add(this.aegisGroup);

    // ==========================================
    // 6. VISUAL EVOLUTION 2: DUAL CRYSTALLINE WINGS
    // Multi-feathered left and right wings with independent flapping
    // ==========================================
    this.wingsGroup = new THREE.Group();
    this.leftWing = new THREE.Group();
    this.rightWing = new THREE.Group();

    const featherGeo = new THREE.ConeGeometry(0.22, 1.8, 4);
    featherGeo.rotateX(Math.PI / 2);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xa5f3fc,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.8,
      roughness: 0.15,
      metalness: 0.4,
      transparent: true,
      opacity: 0.9
    });

    // 3 primary feathers for each wing
    for (let f = 0; f < 3; f++) {
      const angle = (f - 1) * 0.38;
      const len = 1.0 - f * 0.18;

      const fMeshL = new THREE.Mesh(featherGeo, wingMat);
      fMeshL.scale.set(len, len, len * 1.2);
      fMeshL.position.set(-0.6 - f * 0.5, 0.4 + f * 0.25, -0.4 - f * 0.3);
      fMeshL.rotation.set(-0.3, -angle - 0.4, 0.5 + f * 0.2);
      this.leftWing.add(fMeshL);

      const fMeshR = new THREE.Mesh(featherGeo, wingMat);
      fMeshR.scale.set(len, len, len * 1.2);
      fMeshR.position.set(0.6 + f * 0.5, 0.4 + f * 0.25, -0.4 - f * 0.3);
      fMeshR.rotation.set(-0.3, angle + 0.4, -0.5 - f * 0.2);
      this.rightWing.add(fMeshR);
    }

    this.wingsGroup.add(this.leftWing);
    this.wingsGroup.add(this.rightWing);
    this.wingsGroup.visible = false;
    this.group.add(this.wingsGroup);

    // ==========================================
    // 7. VISUAL EVOLUTION 3: GRAVITATIONAL VORTEX RUNE
    // Triple concentric rotating rune arrays on the ground
    // ==========================================
    this.gravGroup = new THREE.Group();
    this.gravGroup.position.set(0, -1.18, 0);

    // RingGeometry lies in XY plane by default → rotateX(-PI/2) puts it flat on XZ (ground)
    // To spin them, rotate the PARENT gravGroup on Y axis (world vertical)
    const outerRingGeo = new THREE.RingGeometry(2.8, 3.1, 32);
    outerRingGeo.rotateX(-Math.PI / 2);
    const midRingGeo = new THREE.RingGeometry(1.9, 2.1, 24);
    midRingGeo.rotateX(-Math.PI / 2);
    // A thin inner rune circle for extra depth
    const innerRingGeo = new THREE.RingGeometry(1.0, 1.15, 16);
    innerRingGeo.rotateX(-Math.PI / 2);

    const runeMatOuter = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide
    });
    const runeMatMid = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });
    const runeMatInner = new THREE.MeshBasicMaterial({
      color: 0xa5f3fc,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide
    });

    this.gravOuterRing = new THREE.Mesh(outerRingGeo, runeMatOuter);
    this.gravMidRing = new THREE.Mesh(midRingGeo, runeMatMid);
    this.gravInnerRing = new THREE.Mesh(innerRingGeo, runeMatInner);
    this.gravGroup.add(this.gravOuterRing);
    this.gravGroup.add(this.gravMidRing);
    this.gravGroup.add(this.gravInnerRing);

    this.gravGroup.visible = false;
    this.group.add(this.gravGroup);

    // ==========================================
    // 8. VISUAL EVOLUTION 4: CELESTIAL IMPERIAL SUN CROWN
    // Floating golden corona with 5 orbiting celestial gems
    // ==========================================
    this.crownGroup = new THREE.Group();
    this.crownGroup.position.set(0, 1.45, 0);

    // TorusGeometry lies in XY plane → rotateX(PI/2) makes it horizontal (on XZ)
    // Spin via rotation.y on crownHalo or parent crownGroup
    const crownHaloGeo = new THREE.TorusGeometry(0.85, 0.07, 8, 24);
    crownHaloGeo.rotateX(Math.PI / 2);
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 1.1,
      roughness: 0.1,
      metalness: 0.85
    });
    this.crownHalo = new THREE.Mesh(crownHaloGeo, crownMat);
    this.crownGroup.add(this.crownHalo);

    this.crownGems = [];
    const gemGeo = new THREE.OctahedronGeometry(0.2, 0);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.3,
      roughness: 0.1
    });

    for (let i = 0; i < 5; i++) {
      const gem = new THREE.Mesh(gemGeo, gemMat);
      this.crownGroup.add(gem);
      this.crownGems.push(gem);
    }

    this.crownGroup.visible = false;
    this.group.add(this.crownGroup);
  }

  // Visual Evolution Activation Methods
  activateAegisVisual() {
    this.hasAegisShield = true;
    this.aegisGroup.visible = true;
    this.coreMat.color.setHex(0x60a5fa);
  }

  activateWingsVisual() {
    this.hasWindWings = true;
    this.wingsGroup.visible = true;
  }

  activateGravAuraVisual() {
    this.hasGravAura = true;
    this.gravGroup.visible = true;
  }

  activateCrownVisual() {
    this.hasLegendaryCrown = true;
    this.crownGroup.visible = true;
    this.coreMesh.scale.set(1.35, 1.35, 1.35);
    this.coreLight.color.setHex(0xfbbf24);
    this.coreLight.intensity = 4.5;
  }

  handleInput(keys) {
    let dx = 0;
    let dz = 0;

    if (keys['KeyW'] || keys['ArrowUp']) dz -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) dz += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) dx += 1;

    this.moveDir.set(dx, 0, dz);
    if (this.moveDir.lengthSq() > 0.001) {
      this.moveDir.normalize();
      this.facingDir.copy(this.moveDir);
    }
  }

  triggerDash(onShockwave) {
    if (this.dashCooldown > 0 || this.isDashing) return false;

    this.isDashing = true;
    this.dashTimer = this.dashDuration;
    this.dashCooldown = this.dashCooldownMax;
    this.invulnTimer = this.dashDuration + 0.12;

    sound.playDash();

    // Spawn 2 Holographic Phantom After-Image Clones
    this._spawnPhantomClone(this.x, this.y, this.z);

    if (this.hasShockwaveOnDash && onShockwave) {
      onShockwave(this.x, this.z, this.shockwaveRadius, this.shockwaveDamage);
      sound.playShockwave();
    }
    return true;
  }

  _spawnPhantomClone(x, y, z) {
    const geo = new THREE.OctahedronGeometry(1.0, 0);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.7,
      wireframe: true
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.copy(this.coreMesh.rotation);
    this.phantomGroup.add(mesh);

    this.phantomClones.push({
      mesh,
      mat,
      life: 0.38,
      maxLife: 0.38
    });
  }

  takeDamage(amount) {
    if (this.invulnTimer > 0 || this.isDashing) return 0;
    const actualDamage = Math.max(1, amount - this.defense);
    this.hp -= actualDamage;
    this.invulnTimer = 0.4;
    this.flashTimer = 0.14;
    sound.playHit();

    return actualDamage;
  }

  gainExp(amount) {
    this.exp += amount;
    sound.playGemPickup();
    let leveledUp = false;

    while (this.exp >= this.expToNext) {
      this.exp -= this.expToNext;
      this.level++;
      this.expToNext = Math.round(this.expToNext * 1.35 + 4);
      this.pendingLevelUps = (this.pendingLevelUps || 0) + 1;
      leveledUp = true;
    }
    return leveledUp;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  update(dt) {
    if (this.dashCooldown > 0) this.dashCooldown -= dt;
    if (this.invulnTimer > 0) this.invulnTimer -= dt;

    // Movement
    if (this.isDashing) {
      this.dashTimer -= dt;
      this.velocity.copy(this.facingDir).multiplyScalar(this.speed * 2.8);
      if (this.dashTimer <= 0) this.isDashing = false;
    } else {
      if (this.moveDir.lengthSq() > 0) {
        this.velocity.copy(this.moveDir).multiplyScalar(this.speed);
      } else {
        this.velocity.set(0, 0, 0);
      }
    }

    this.x += this.velocity.x * dt;
    this.z += this.velocity.z * dt;

    const distFromCenter = Math.sqrt(this.x * this.x + this.z * this.z);
    if (distFromCenter > 95) {
      const angle = Math.atan2(this.z, this.x);
      this.x = Math.cos(angle) * 95;
      this.z = Math.sin(angle) * 95;
    }

    const time = performance.now() * 0.0025;
    this.y = 1.2 + Math.sin(time * 3) * 0.15;
    this.group.position.set(this.x, this.y, this.z);

    // Core crystal & nucleus spin (Y axis = vertical, correct for a floating gem)
    this.coreMesh.rotation.y += dt * 1.6;
    this.nucleusMesh.rotation.y -= dt * 2.5;

    // Orbit rings: spin on Y axis — ring is tilted so Y-spin creates diagonal orbital motion
    this.ring1.rotation.y += dt * 1.8;
    this.ring2.rotation.y -= dt * 2.2;

    // 1. Dynamic Wing Flapping — wings fan out sideways (X axis) from player body
    //    leftWing sits at -X side, rightWing at +X side
    //    Flap on Z axis (rolls the wing up/down in world space)
    if (this.hasWindWings) {
      const flap = Math.sin(time * 9) * 0.3;
      // Left wing: negative Z rotation opens it upward, positive closes
      this.leftWing.rotation.z = flap + 0.15;
      this.leftWing.rotation.x = Math.sin(time * 4.5) * 0.1;  // subtle forward-back flex
      // Right wing: mirror
      this.rightWing.rotation.z = -flap - 0.15;
      this.rightWing.rotation.x = Math.sin(time * 4.5 + 0.3) * 0.1;
    }

    // 2. Aegis Shield: dome slow-spins on Y (vertical axis)
    //    Plates orbit on XZ plane at fixed Y height (not sine-bobbing to avoid vertical skew)
    if (this.hasAegisShield) {
      this.aegisDome.rotation.y -= dt * 0.55;
      for (let i = 0; i < this.aegisPlates.length; i++) {
        const p = this.aegisPlates[i];
        const angle = time * 2.0 + (i * Math.PI * 2) / 3;
        const rad = 2.2;
        // Orbit on XZ plane at constant Y (player mid-height)
        p.position.set(Math.cos(angle) * rad, 0, Math.sin(angle) * rad);
        // Plate faces outward: rotation.y points the face tangentially
        p.rotation.y = angle + Math.PI / 2;
      }
    }

    // 3. Gravitational Ground Runes: flat rings on XZ → spin parent on Y axis
    //    (ring geometry already rotateX(-PI/2), so world-Y spin = horizontal spin)
    if (this.hasGravAura) {
      this.gravGroup.rotation.y += dt * 1.0;  // outer rotates CW
      // Counter-spin the inner rings relative to parent using local Y
      this.gravMidRing.rotation.y -= dt * 2.8; // mid CCW (net: faster CCW in world)
      this.gravInnerRing.rotation.y += dt * 4.5; // inner even faster CW
    }

    // 4. Crown: halo is horizontal (rotateX(PI/2)) → spin on local Y of crownGroup
    if (this.hasLegendaryCrown) {
      this.crownGroup.rotation.y += dt * 1.5;  // spins whole crown group
      this.crownGroup.position.y = 1.45 + Math.sin(time * 4) * 0.12;

      // Gems orbit in XZ plane at fixed Y offset — angle changes over time
      for (let i = 0; i < this.crownGems.length; i++) {
        const gem = this.crownGems[i];
        const gAngle = (i * Math.PI * 2) / 5; // fixed spread, parent group rotates
        const bob = Math.sin(time * 6 + i * 1.2) * 0.1;
        gem.position.set(Math.cos(gAngle) * 1.15, bob + 0.1, Math.sin(gAngle) * 1.15);
        gem.rotation.y += dt * 3.5; // gems spin on their own Y axis
      }
    }

    // Update Phantom After-Images
    for (let i = this.phantomClones.length - 1; i >= 0; i--) {
      const pc = this.phantomClones[i];
      pc.life -= dt;
      pc.mat.opacity = Math.max(0, (pc.life / pc.maxLife) * 0.7);
      pc.mesh.scale.multiplyScalar(1.025);

      if (pc.life <= 0) {
        this.phantomGroup.remove(pc.mesh);
        pc.mat.dispose();
        pc.mesh.geometry.dispose();
        this.phantomClones.splice(i, 1);
      }
    }

    // Damage Flash with frame-rate independent timer
    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
      this.coreMesh.material.color.setHex(0xff3333);
      this.coreMesh.material.emissive.setHex(0xb91c1c);
    } else {
      const baseCol = this.hasLegendaryCrown ? 0xfbbf24 : (this.hasAegisShield ? 0x60a5fa : 0x38bdf8);
      const emissiveCol = this.hasLegendaryCrown ? 0xd97706 : (this.hasAegisShield ? 0x2563eb : 0x0284c7);
      this.coreMesh.material.color.setHex(baseCol);
      this.coreMesh.material.emissive.setHex(emissiveCol);
    }

    if (this.invulnTimer > 0) {
      this.coreMesh.visible = Math.floor(performance.now() / 60) % 2 === 0;
    } else {
      this.coreMesh.visible = true;
    }
  }
}
