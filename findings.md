# Research & Technical Findings

## 1. High-Performance Swarm Architecture (Three.js)
- **Rendering**: Single `THREE.InstancedMesh` for each monster archetype (Crawlers, Spores, Golems) with `THREE.DynamicDrawUsage` on `instanceMatrix`.
- **Transformation Updates**: Use a reusable `THREE.Object3D` dummy to set position, rotation, scale, then call `instanceMesh.setMatrixAt(i, dummy.matrix)`. Call `instanceMesh.instanceMatrix.needsUpdate = true` once per frame.
- **Instance Colors**: Use `instanceMesh.setColorAt(i, color)` to flash monsters white or red on damage (`instanceColor.needsUpdate = true`).
- **Spatial Partitioning**: A lightweight 2D spatial hash grid (`cellSize = 4` to `6`) covering the arena. 
  - Each active enemy is registered into `grid.insert(enemy)`.
  - Collision queries for player and projectiles use `grid.queryRadius(x, z, r)`, bringing collision detection from $O(N \times M)$ down to $O(1)$ per projectile.

## 2. Procedural Visuals & Shaders (Zero External Assets)
- **Arena Ground**: Procedural high-resolution canvas texture generating glowing arcane sanctuary runes, concentric sacred geometry circles, and marble grid paving with subtle noise.
- **Crystal Materials**: `THREE.MeshStandardMaterial` or `MeshPhysicalMaterial` with `roughness: 0.15`, `metalness: 0.1`, soft emissive pulses, and smooth faceted geometries (`OctahedronGeometry`, `DodecahedronGeometry`, `IcosahedronGeometry`).
- **Laser / Resonance Web**: `THREE.LineSegments` or glowing cylindrical beam meshes connecting player and orbital crystals when within resonance distance.
- **Particles**: `THREE.InstancedMesh` or Point Cloud for shattered crystals and glowing EXP gems, with velocity decay and gravity.

## 3. Web Audio API Procedural Sound Synthesizer
- **Single Master Context**: Initialized/resumed on first user keydown/click.
- **Sounds Synthesized via Math**:
  - `gemPickup`: High-pitch sine oscillator (1200Hz -> 1800Hz) with sharp exponential decay (0.08s), creating a magical crystal ding.
  - `dashWhoosh`: White noise buffer created procedurally (`Math.random() * 2 - 1`) through a sweepable bandpass/lowpass filter.
  - `shockwave`: Low sine/triangle oscillator (150Hz -> 40Hz) with gain boost for a heavy tactile sub-bass thud.
  - `projectileFire`: Frequency modulated chirp (800Hz -> 300Hz).
  - `levelUp`: 4-note ascending chord arpeggio (C5, E5, G5, C6) with soft reverb simulation.
  - `monsterShatter`: Quick pitch-drop triangle + tiny noise burst.

## 4. UI / UX Design System (Frosted Glassmorphism per Impeccable)
- Card upgrade modal with backdrop blur `backdrop-filter: blur(16px)`, clean typography, subtle border gradients, and rarity badges (Common: Silver, Rare: Sapphire, Epic: Amethyst, Legendary: Amber Gold).
- Responsive HUD: Health bar, smooth animated EXP bar, kill counter, survival stopwatch, and active weapon icon slots.

