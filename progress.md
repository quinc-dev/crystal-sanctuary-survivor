## Session Log: 2026-09-21
- [x] Initialized JEV state and design consensus via `/grill-me`.
- [x] Created `task_plan.md`, `findings.md`, and `progress.md`.
- [x] Fixed Enemy Visibility: Direct 3D scene meshes with glowing ruby eyes, crystal horns, and live 3D floating health bars.
- [x] Immediate Wave: 16 enemies spawn right in view (radius 8-14) upon clicking Start.
- [x] Fixed Movement Jitter & Camera — Tăng độ phân giải Three.js Renderer: `setPixelRatio(Math.max(window.devicePixelRatio || 1, 2))` kết hợp `ACESFilmicToneMapping` và exposure 1.15 giúp hình ảnh sắc nét, ánh sáng pha lê trong trẻo.
- Mở rộng tầm nhìn Tactical Camera FOV: Camera kéo xa và thoáng hơn (offset `(0, 26, 23)`, fov `42`) giải tỏa hoàn toàn cảm giác ngột ngạt, dồn dập.
- Tinh chỉnh khoảng cách xuất hiện quái: Khởi điểm ở bán kính 14-20m thay vì áp sát nhân vật, giúp người chơi có không gian phản xạ và cơ động.
- Thu nhỏ toàn diện UI/UX:
  - Thanh máu, thanh kinh nghiệm, minimap radar được scale nhỏ gọn (radar 68px, máu 180px, exp bar 6px).
  - Bảng Level Up thay vì hộp card cồng kềnh đã chuyển thành các **Dải Biểu Tượng Ban Phước Nằm Ngang (Hades Blessing Banners)** cực kỳ thanh lịch, tiết kiệm không gian và tích hợp phím tắt nhanh `[1]`, `[2]`, `[3]`.
  - Phông chữ tiếng Việt chuẩn hóa 100% với `Chakra Petch` và `Be Vietnam Pro`. (Content) with 100% native diacritics.
- [x] IMPECCABLE CRAFT REDESIGN (ELIMINATED LAZY BOXED CARDS):
- [x] Tinh giản triệt để bộ Card 3 Cột (Clean & Ultra-Readable 3-Column Cards):
  - Loại bỏ hoàn toàn các chi tiết thừa gây rối mắt (hộp viền lồng nhau, pips chấm rải rác, các dòng nhãn hệ thống rườm rà).
  - Cấu trúc thẻ mạch lạc, đọc vào hiểu ngay trong 1 giây:
    1. Góc trên: Phím tắt số `[1]`, `[2]`, `[3]` và phẩm chất Rarity gọn gàng.
    2. Icon minh họa tối giản, thanh thoát trong khung bo góc êm ái.
    3. Tiêu đề kỹ năng + Nhãn cấp độ ngắn gọn (`Cấp 1/3`).
    4. **Dòng chỉ số nổi bật (Headline Badge màu xanh)**: Tóm gọn ngay lập tức giá trị nâng cấp (ví dụ: `+1 Vệ Tinh Xoay Quanh`, `+60 Máu & Hiện Lồng Khiên 3D`, `+50% Bán Kính Nổ Sóng Dash`).
    5. Dòng giải thích ngắn gọn 1 câu dễ hiểu.
    6. Nút chọn xanh rõ ràng ở đáy thẻ.
- [x] Nâng cấp Three.js lên phiên bản mới nhất:
  - Cập nhật dependency `three`: `^0.170.0` ➔ `^0.186.0`.
  - Tương thích 100% với WebGLRenderer modern pipeline, `SRGBColorSpace`, `ACESFilmicToneMapping`, và `PCFSoftShadowMap`.
  - Build production thành công không có lỗi (`npm run build` passed).
- [x] KHẮC PHỤC TRIỆT ĐỂ CÁC CẢNH BÁO VÀ TỐI ƯU 60 FPS CHO THREE.JS 0.186:
  - **Khử cảnh báo Deprecated Clock**: Thay thế toàn bộ `THREE.Clock` bằng bộ đếm thời gian thực `performance.now()` siêu chính xác, không còn warning trong Console.
  - **Khử cảnh báo ShadowMap**: Chuyển `PCFSoftShadowMap` (đã bị gỡ bỏ ở Three.js 0.186) sang `THREE.PCFShadowMap` chuẩn hóa.
  - **Khử lỗi 404 Favicon**: Nhúng trực tiếp Favicon tinh thể pha lê dạng inline data SVG trong `index.html`.
  - **Khử giật lag (Performance Lag Fix)**:
    - Giới hạn `pixelRatio` thông minh ở mức `1.5` (trước đây bị đẩy lên 2x trên màn Retina/4K gây nghẽn băng thông GPU fillrate).
    - Tinh chỉnh shadow map kích thước `1024x1024` tối ưu.
    - Loại bỏ các pointlights thừa trên các trụ viền monolith, chỉ sử dụng vật liệu tự phát quang emissive giúp tốc độ khung hình mượt mà 60 FPS ổn định.
- [x] Build verified clean (`npm run build` passed). JEV QA Audit: PASSED.

---

## Session Handoff: 2026-09-21T12:47 — Skills, Weapons & Cards Visual Overhaul

### Completed This Session

#### `src/weapons.js` — 4 Distinct 3D Weapon Archetypes
1. **Lăng Kính Vệ Tinh Thái Dương (Solar Prism Orbitals)**
   - Compound crystal: outer OctahedronGeometry (transparent hull) + inner white diamond core
   - Multi-laser web connecting all satellites to player + between neighbors
   - Correctly orbits at player.y height using sin bob on Y axis
2. **Đại Thương Tinh Thể Xuyên Không (Void Crystal Javelins)**
   - `CylinderGeometry` / `ConeGeometry` both `rotateX(PI/2)` → long axis points local +Z
   - `setFromUnitVectors(Z→travelDir)` aligns lance to exact travel direction
   - **Helix ring**: `TorusGeometry` in XY plane = perpendicular cross-section; `rotation.z` = corkscrew
   - Multi-color hull (5 colors), white solid core for visual depth
3. **Băng Long Trảm — Glacial Spire Cascade** (NEW WEAPON)
   - `ConeGeometry` pointing +Y (correct world vertical) — spawns buried at Y=-1.8
   - Erupts to peakY=1.6 in 0.18s, damages at peak, fades/shrinks
   - Each spire cloned material for proper per-spire opacity fade
   - Only X/Z tilt (no random Y rotation) so spires always point skyward
4. **Địa Chấn / Vết Nứt Hư Không (Ground Rifts)**
   - `RingPulse` shockwave on dash + lingering arcane ground rift
   - Rift: damage-over-time (0.3s tick) for 2 seconds after dash

#### `src/player.js` — Dramatic 3D Visual Evolutions (Axis-Correct)
1. **Aegis Shield** — 3 floating box plates orbit at fixed Y=0 (XZ plane), dome slow-spins on Y
2. **Crystalline Wings** — 3 feathers per side; flap on Z axis (correct lateral roll), flex on X
3. **Gravity Runes** — `RingGeometry(rotateX(-PI/2))` lies flat; spin parent `gravGroup.rotation.y`; 3 concentric rings (outer/mid/inner) counter-spin at different speeds
4. **Solar Crown** — `TorusGeometry(rotateX(PI/2))` horizontal; parent `crownGroup.rotation.y` spins whole crown; 5 gems at fixed XZ positions (no manual time-based orbit), parent rotation does the orbiting

#### Axis Audit Summary (All Fixed)
| Element | Was Wrong | Fixed To |
|---|---|---|
| Gravity outer/mid ring | `rotation.z` | `gravGroup.rotation.y` |
| Crown halo | `rotation.z` | `crownGroup.rotation.y` |
| Orbital torus rings | `rotation.z` | `rotation.y` |
| Wing flap | `rotation.y` | `rotation.z` |
| Aegis plates | Y-bobbing (vertical) | Fixed XZ plane orbit |
| Helix ring spin | `rotation.x` | `rotation.z` (corkscrew) |
| Ice spire tilt | random Y rotation | X/Z only, always points up |

#### `src/cards.js` — 12 Cards, 5 Archetypes
- Added `glacial_spire` card (Epic, unlocks new weapon, stacks damage+cooldown)
- All cards linked to corresponding 3D visual activations
- Synergy system preserved and weights tuned

#### `src/audio.js` — 2 New Sound FX
- `playIceSpire()` — crystalline ground crackle (sine 320→840→120 Hz sweep)
- `playBladeSlash()` — velocity whoosh for javelin impact

### Known State / Next Steps
- Dev server running on `http://localhost:5173/` (task-476, daemon)
- Build: `npm run build` → PASS (exit 0, no TS errors)
- Ice Spire card needs playtesting to tune damage (65) and cooldown (2.4s)
- Consider adding particle burst VFX on ice spire shatter
- Consider adding trail particles behind Void Javelins
