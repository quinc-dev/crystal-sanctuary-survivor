# Task Plan: Crystal Sanctuary - Three.js Procedural Horde Survivor

## Goals
Build a complete, stunning, standalone Three.js procedural Vampire Survivors-style game with:
1. Zero external assets (all geometries, procedural canvas textures, shaders, particles, and Web Audio API sounds generated via code).
2. Clean, elegant "Ethereal Arcane / Crystal Sanctuary" aesthetic (soft shadows, crystal facets, glowing runes, frosted glassmorphism UI, NO cyberpunk/neon tropes).
3. Tri-synergy gameplay: Orbital Resonance, Prismatic Elemental Bolts, Kinetic Shockwave.
4. Robust 60 FPS performance using InstancedMesh / Batching and spatial grid collision.
5. Interactive card upgrade system with rarity tiers, audio, and polished game feel.

## Phases
- [x] Phase 1: Planning & Web/GitHub Research on Three.js Horde Mechanics <!-- id: 0 -->
- [x] Phase 2: Project Setup (Vite, Three.js, Package.json, HTML shell) <!-- id: 1 -->
- [x] Phase 3: Core Three.js Engine & Procedural Visuals <!-- id: 2 -->
- [x] Phase 4: Entity System & Instanced Swarm Architecture <!-- id: 3 -->
- [x] Phase 5: Weapon & Tri-Synergy Combat System <!-- id: 4 -->
- [x] Phase 6: Full Gaming UI/UX Overhaul & Card Illustrations (Minimap, RPG HUD, Floating Combat Text) <!-- id: 5 -->
- [x] Phase 7: Enemy Visual Overhaul & Instant Visibility (Eye glows, distinct silhouettes, visible spawn radius) <!-- id: 6 -->
- [x] Phase 8: Rigorous Vampire Survivors Balance Formula (DPS, HP scaling, wave curves) <!-- id: 7 -->
- [x] Phase 9: High Resolution, Tactical Camera FOV & Compact Sleek UI/UX (Hades Blessing Banners) <!-- id: 8 -->

## Decisions Log
- Theme: Ethereal Arcane / Crystal Sanctuary.
- Camera: Wide tactical perspective (FOV 42, Offset 0/26/23) removing claustrophobia and overwhelm.
- Renderer: High resolution `setPixelRatio(Math.max(window.devicePixelRatio || 1, 2))` with `ACESFilmicToneMapping`.
- UI/UX: Scaled-down, compact borderless HUD + Sleek Horizontal Blessing Banners with keyboard shortcuts [1, 2, 3].
- Controls: Isometric 3D, WASD/Arrows/Mouse + Spacebar Dash.
- Audio: Pure procedural Web Audio API (zero audio asset files).
