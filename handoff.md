# Project Handoff: Crystal Sanctuary (Arcane Survivor 3D)

**Date**: 2026-09-21  
**Repository**: `crystal-sanctuary-survivor`  
**Engine & Tech Stack**: Three.js v0.186.0 + Vite 5 + Procedural Web Audio API + Pure Vanilla CSS.

---

## 1. Project Overview & Architecture
Dự án là game Roguelite Horde Survivor 3D chạy trên trình duyệt với phong cách mỹ thuật **Crystal Sanctuary** (Thánh Địa Tinh Thể), không cyberpunk/neon cliché, tuân thủ nguyên tắc không tải asset ngoài:
- Tất cả texture (sàn gạch cổ ngữ mandala, sóng chấn động) sinh bằng Canvas API (`src/textures.js`).
- Tất cả âm thanh (bắn đạn, nổ xung kích, lướt gió, nhặt ngọc, vỡ tinh thể, level up) sinh bằng Web Audio API synthesizer (`src/audio.js`).
- Tất cả mô hình 3D (nhân vật pha lê, quái vật crawler, spore, golem) cấu thành từ Three.js compound geometries (`src/player.js`, `src/enemies.js`).

---

## 2. Directory Structure & Key Modules
```
├── index.html            # Entry HTML, game viewport, RPG HUD, modal nâng cấp 3 cột
├── style.css             # Design system, Chakra Petch & Be Vietnam Pro fonts, responsive styling
├── package.json          # Vite + Three.js v0.186.0 dependencies
├── src/
│   ├── main.js           # Game loop, input orchestration, camera tracking, level up & game over modal
│   ├── player.js         # Lõi tinh thể người chơi, di chuyển, dash, 3D visual evolutions (khiên, cánh, hào quang, vương miện)
│   ├── enemies.js        # Quản lý đàn quái vật, 2-pass spatial grid, smooth collider & angular damping
│   ├── weapons.js        # Tri-Synergy weapons: Orbital laser web, Prismatic elemental bolts, Kinetic shockwaves
│   ├── cards.js          # Hệ thống 12 nâng cấp cộng dồn cấp độ (1-4) & synergy link combo
│   ├── collectibles.js   # Ngọc EXP hút tự động, hạt vỡ tinh thể, damage numbers
│   ├── textures.js       # Procedural canvas textures
│   ├── spatialGrid.js    # 2D Spatial Hash Grid cho va chạm đàn quái
│   └── audio.js          # Procedural Web Audio synthesizer
```

---

## 3. Key Engineering Solutions Solved
1. **Frustum Culling Visibility Bug**:
   - Từng bị lỗi quái vật tàng hình khi dùng `InstancedMesh`. Đã giải quyết triệt để bằng cách chuyển sang Scene Group Meshes trực tiếp với vật liệu phát xạ emissive và thanh máu 3D.
2. **Camera Jitter & Damped Smoothing**:
   - Sử dụng exponential smoothing `1.0 - Math.exp(-12 * dt)` đồng bộ cho cả `camera.position` và `camera.lookAt` để loại bỏ hoàn toàn rung giật góc nghiêng.
3. **Quái Vật Di Chuyển Bị Giật (Collider Ping-Pong Jitter)**:
   - Sử dụng kiến trúc 2-Pass Grid: Pass 1 nạp toàn bộ vị trí vào Grid, Pass 2 tính toán lực đẩy tách đàn theo hàm lún mềm `overlap * 4.0` thay vì lực đẩy tĩnh gây nẩy.
   - Thêm bộ xoay hướng góc ngắn nhất `Math.atan2(Math.sin(diff), Math.cos(diff))` giúp quái đổi hướng mượt mà.
4. **Bảng Nâng Cấp Tinh Giản 3 Cột**:
   - Chuyển từ card ngang sang 3 cột thẳng đứng, loại bỏ viền lồng nhau, nhấn mạnh dòng chỉ số cốt lõi (`Headline Badge`) và tích hợp phím bấm `[1]`, `[2]`, `[3]`.
5. **Nâng cấp Three.js**:
   - Đã nâng cấp lên Three.js `^0.186.0` tương thích hoàn hảo.

---

## 4. Maintenance & Run Instructions
```bash
npm install
npm run dev       # Khởi chạy Vite server tại http://localhost:5173
npm run build     # Biên dịch production bundle vào dist/
```
