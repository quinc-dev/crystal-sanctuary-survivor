// Player Entity with Dynamic Visual Evolution Upgrades (Shields, Wings, Halo, Auras)
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

    // Capabilities
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
    // 1. Faceted Octahedron Crystal Core
    const coreGeo = new THREE.OctahedronGeometry(1.0, 0);
    this.coreMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.15,
      metalness: 0.3,
      flatShading: true
    });
    this.coreMesh = new THREE.Mesh(coreGeo, this.coreMat);
    this.coreMesh.castShadow = true;
    this.group.add(this.coreMesh);

    // 2. Wireframe Nucleus
    const nucGeo = new THREE.IcosahedronGeometry(0.48, 1);
    const nucMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    this.nucleusMesh = new THREE.Mesh(nucGeo, nucMat);
    this.group.add(this.nucleusMesh);

    // 3. Torus Orbit Rings
    const ringGeo = new THREE.TorusGeometry(1.45, 0.04, 8, 36);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.85 });
    this.ring1 = new THREE.Mesh(ringGeo, ringMat);
    this.ring1.rotation.x = Math.PI / 2.6;
    this.group.add(this.ring1);

    this.ring2 = new THREE.Mesh(ringGeo.clone(), ringMat);
    this.ring2.rotation.x = -Math.PI / 2.6;
    this.ring2.scale.set(0.85, 0.85, 0.85);
    this.group.add(this.ring2);

    // 4. Point light aura
    this.coreLight = new THREE.PointLight(0x38bdf8, 2.5, 10, 1.8);
    this.coreLight.position.set(0, 0.5, 0);
    this.group.add(this.coreLight);

    // 5. VISUAL EVOLUTION 1: Rotating Hexagonal Aegis Barrier (Shield)
    const shieldGeo = new THREE.CylinderGeometry(1.9, 1.9, 0.4, 6, 1, true);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
      side: THREE.DoubleSide
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.visible = false;
    this.group.add(this.shieldMesh);

    // 6. VISUAL EVOLUTION 2: Ethereal Wind Wings
    this.wingsGroup = new THREE.Group();
    const wingGeo = new THREE.BufferGeometry();
    // 3D crystalline feather vertices
    const wingVerts = new Float32Array([
      0, 0, 0,   1.4, 1.2, -0.4,   0.5, -0.6, -0.2,
      0, 0, 0,   2.2, 1.8, -0.6,   1.4, 1.2, -0.4,
      0, 0, 0,  -1.4, 1.2, -0.4,  -0.5, -0.6, -0.2,
      0, 0, 0,  -2.2, 1.8, -0.6,  -1.4, 1.2, -0.4,
    ]);
    wingGeo.setAttribute('position', new THREE.BufferAttribute(wingVerts, 3));
    wingGeo.computeVertexNormals();
    const wingMat = new THREE.MeshBasicMaterial({
      color: 0xa5f3fc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75
    });
    this.wingMesh = new THREE.Mesh(wingGeo, wingMat);
    this.wingsGroup.add(this.wingMesh);
    this.wingsGroup.position.set(0, 0.2, -0.3);
    this.wingsGroup.visible = false;
    this.group.add(this.wingsGroup);

    // 7. VISUAL EVOLUTION 3: Gravitational Magnet Suction Ring on Ground
    const auraGeo = new THREE.RingGeometry(2.5, 2.7, 32);
    auraGeo.rotateX(-Math.PI / 2);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    this.auraMesh = new THREE.Mesh(auraGeo, auraMat);
    this.auraMesh.position.set(0, -1.15, 0);
    this.auraMesh.visible = false;
    this.group.add(this.auraMesh);

    // 8. VISUAL EVOLUTION 4: Celestial Imperial Sun Crown
    const crownGeo = new THREE.TorusGeometry(0.8, 0.06, 8, 16);
    crownGeo.rotateX(Math.PI / 2);
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 1.0,
      roughness: 0.1,
      metalness: 0.8
    });
    this.crownMesh = new THREE.Mesh(crownGeo, crownMat);
    this.crownMesh.position.set(0, 1.5, 0);
    this.crownMesh.visible = false;
    this.group.add(this.crownMesh);
  }

  // Visual Evolution Activation Methods
  activateAegisVisual() {
    this.hasAegisShield = true;
    this.shieldMesh.visible = true;
    this.coreMat.color.setHex(0x60a5fa);
  }

  activateWingsVisual() {
    this.hasWindWings = true;
    this.wingsGroup.visible = true;
  }

  activateGravAuraVisual() {
    this.hasGravAura = true;
    this.auraMesh.visible = true;
  }

  activateCrownVisual() {
    this.hasLegendaryCrown = true;
    this.crownMesh.visible = true;
    this.coreMesh.scale.set(1.3, 1.3, 1.3);
    this.coreLight.color.setHex(0xfbbf24);
    this.coreLight.intensity = 4.0;
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
    this.invulnTimer = this.dashDuration + 0.1;

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
      opacity: 0.65,
      wireframe: true
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.copy(this.coreMesh.rotation);
    this.phantomGroup.add(mesh);

    this.phantomClones.push({
      mesh,
      mat,
      life: 0.35,
      maxLife: 0.35
    });
  }

  takeDamage(amount) {
    if (this.invulnTimer > 0 || this.isDashing) return 0;
    const actualDamage = Math.max(1, amount - this.defense);
    this.hp -= actualDamage;
    this.invulnTimer = 0.4;
    sound.playHit();

    this.coreMesh.material.color.setHex(0xef4444);
    setTimeout(() => {
      this.coreMesh.material.color.setHex(this.hasLegendaryCrown ? 0xfbbf24 : 0x38bdf8);
    }, 120);

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

    // Rotations & Visual animations
    this.coreMesh.rotation.y += dt * 1.5;
    this.nucleusMesh.rotation.y -= dt * 2.5;
    this.ring1.rotation.z += dt * 1.8;
    this.ring2.rotation.z -= dt * 2.2;

    // Wing flapping
    if (this.hasWindWings) {
      this.wingMesh.rotation.y = Math.sin(time * 8) * 0.35;
    }

    // Shield barrier slow counter-rotation
    if (this.hasAegisShield) {
      this.shieldMesh.rotation.y -= dt * 0.8;
    }

    // Suction aura ring spin
    if (this.hasGravAura) {
      this.auraMesh.rotation.z += dt * 1.2;
    }

    // Legendary crown bobbing
    if (this.hasLegendaryCrown) {
      this.crownMesh.rotation.y += dt * 2.0;
      this.crownMesh.position.y = 1.5 + Math.sin(time * 4) * 0.1;
    }

    // Update Phantom After-Images
    for (let i = this.phantomClones.length - 1; i >= 0; i--) {
      const pc = this.phantomClones[i];
      pc.life -= dt;
      pc.mat.opacity = Math.max(0, (pc.life / pc.maxLife) * 0.65);
      pc.mesh.scale.multiplyScalar(1.02);

      if (pc.life <= 0) {
        this.phantomGroup.remove(pc.mesh);
        pc.mat.dispose();
        pc.mesh.geometry.dispose();
        this.phantomClones.splice(i, 1);
      }
    }

    if (this.invulnTimer > 0) {
      this.coreMesh.visible = Math.floor(performance.now() / 60) % 2 === 0;
    } else {
      this.coreMesh.visible = true;
    }
  }
}
