// Collectibles, Shattered Crystal VFX & Throttled Floating Damage Numbers
import * as THREE from 'three';

export class CollectibleManager {
  constructor(scene) {
    this.scene = scene;
    this.gems = [];
    this.particles = [];
    this.floatingTexts = [];

    // Gem Geometries
    this.gemGeo = new THREE.OctahedronGeometry(0.42, 0);

    this.cyanMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.9,
      roughness: 0.1,
      metalness: 0.3
    });
    this.purpleMat = new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      emissive: 0x7e22ce,
      emissiveIntensity: 0.9,
      roughness: 0.1,
      metalness: 0.3
    });
    this.goldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xb45309,
      emissiveIntensity: 0.9,
      roughness: 0.1,
      metalness: 0.3
    });

    this.gemGroup = new THREE.Group();
    this.scene.add(this.gemGroup);

    this.particleGeo = new THREE.TetrahedronGeometry(0.18, 0);
    this.particleGroup = new THREE.Group();
    this.scene.add(this.particleGroup);

    // Reusable shared materials mapped by colorHex
    this.particleMaterials = new Map();

    this.fctContainer = document.getElementById('floating-text-container');
    this.lastTextSpawnTime = 0;
  }

  spawnGem(x, z, value = 1) {
    let mat = this.cyanMat;
    if (value >= 10) mat = this.goldMat;
    else if (value >= 3) mat = this.purpleMat;

    const mesh = new THREE.Mesh(this.gemGeo, mat);
    mesh.position.set(x, 0.55, z);
    this.gemGroup.add(mesh);

    this.gems.push({
      mesh,
      x,
      y: 0.55,
      z,
      value,
      vx: 0,
      vz: 0,
      bobOffset: Math.random() * Math.PI * 2,
      isAttracted: false
    });
  }

  spawnShatter(x, y, z, colorHex = 0x66ccff, count = 6) {
    if (this.particles.length >= 45) return; // Hard budget cap
    let mat = this.particleMaterials.get(colorHex);
    if (!mat) {
      mat = new THREE.MeshBasicMaterial({ color: colorHex });
      this.particleMaterials.set(colorHex, mat);
    }
    const spawnCount = Math.min(count, 45 - this.particles.length);
    for (let i = 0; i < spawnCount; i++) {
      const mesh = new THREE.Mesh(this.particleGeo, mat);
      mesh.position.set(x, y, z);
      this.particleGroup.add(mesh);

      const angle = Math.random() * Math.PI * 2;
      const speed = 3.5 + Math.random() * 5;
      this.particles.push({
        mesh,
        x,
        y,
        z,
        vx: Math.cos(angle) * speed,
        vy: 2.2 + Math.random() * 3.5,
        vz: Math.sin(angle) * speed,
        life: 0.45 + Math.random() * 0.25,
        maxLife: 0.7
      });
    }
  }

  // Throttled Floating Damage Numbers to prevent browser reflow lag
  spawnDamageNumber(worldX, worldY, worldZ, amount) {
    if (!this.fctContainer) return;
    const now = performance.now();
    if (now - this.lastTextSpawnTime < 60) return; // limit to at most 16 texts/sec
    this.lastTextSpawnTime = now;

    // Remove oldest if exceeding 12 active numbers
    if (this.floatingTexts.length >= 12) {
      const oldest = this.floatingTexts.shift();
      if (oldest.el && oldest.el.parentNode) oldest.el.parentNode.removeChild(oldest.el);
    }

    const el = document.createElement('div');
    el.className = 'fct-number';
    el.textContent = `-${Math.round(amount)}`;
    this.fctContainer.appendChild(el);

    this.floatingTexts.push({
      el,
      x: worldX,
      y: worldY + 1.2,
      z: worldZ,
      life: 0.65,
      maxLife: 0.65,
      rise: 0
    });
  }

  update(dt, player, camera) {
    const time = performance.now() * 0.003;

    // 1. UPDATE EXP GEMS
    for (let i = this.gems.length - 1; i >= 0; i--) {
      const g = this.gems[i];
      const dx = player.x - g.x;
      const dz = player.z - g.z;
      const distSq = dx * dx + dz * dz;
      const pickupRadiusSq = player.pickupRadius * player.pickupRadius;

      if (distSq < pickupRadiusSq || g.isAttracted) {
        g.isAttracted = true;
        const dist = Math.sqrt(distSq) || 0.1;
        const pullSpeed = 24 + (1 / dist) * 16;
        g.x += (dx / dist) * pullSpeed * dt;
        g.z += (dz / dist) * pullSpeed * dt;

        // Collected
        if (dist < 1.3) {
          player.gainExp(g.value);
          this.gemGroup.remove(g.mesh);
          this.gems.splice(i, 1);
          continue;
        }
      }

      g.mesh.position.set(g.x, 0.55 + Math.sin(time * 4 + g.bobOffset) * 0.15, g.z);
      g.mesh.rotation.y += dt * 3.5;
      g.mesh.rotation.x += dt * 2.5;
    }

    // 2. UPDATE PARTICLES
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.vy -= 12 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;

      if (p.y < 0.08) {
        p.y = 0.08;
        p.vy *= -0.3;
      }

      const scale = Math.max(0, p.life / p.maxLife);
      p.mesh.scale.set(scale, scale, scale);
      p.mesh.position.set(p.x, p.y, p.z);

      if (p.life <= 0) {
        this.particleGroup.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }

    // 3. UPDATE FLOATING COMBAT NUMBERS
    if (this.fctContainer && camera) {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      const pos = new THREE.Vector3();

      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.life -= dt;
        ft.rise += dt * 1.6;

        pos.set(ft.x, ft.y + ft.rise, ft.z);
        pos.project(camera);

        const screenX = (pos.x * halfW) + halfW;
        const screenY = -(pos.y * halfH) + halfH;

        ft.el.style.left = `${screenX}px`;
        ft.el.style.top = `${screenY}px`;
        ft.el.style.opacity = `${Math.max(0, ft.life / ft.maxLife)}`;

        if (ft.life <= 0) {
          if (ft.el.parentNode) ft.el.parentNode.removeChild(ft.el);
          this.floatingTexts.splice(i, 1);
        }
      }
    }
  }
}
