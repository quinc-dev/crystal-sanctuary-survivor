# Crystal Sanctuary: Arcane Survivor 3D

> Roguelite 3D Horde Survivor xây dựng bằng Three.js (v0.186.0) thuần túy không dùng asset tải về (100% Procedural 3D Meshes, Shaders, Canvas Textures, và Procedural Web Audio API).

## 🎮 Tính năng nổi bật

- **Đồ họa Procedural 3D Sắc Nét**:
  - Render Three.js độ phân giải cao với `ACESFilmicToneMapping` và đổ bóng mềm `PCFSoftShadowMap`.
  - Góc quay Tactical Camera thoáng đãng, mượt mà không rung giật (damped lerp).
  - Không tải bất kỳ ảnh texture hay mô hình 3D từ ngoài: 100% sinh bằng code (Thánh địa mandala cổ ngữ, tinh thể, quái vật mắt đỏ).
- **Hệ thống Tri-Synergy Combat**:
  - **Lưới Vệ Tinh (Orbital Resonance)**: Khối tinh thể xoay quanh tạo mạng laser đa giác tự động cắt quét đàn quái.
  - **Pháo Ma Thuật (Prismatic Bolts)**: Bắn các tia đạn nguyên tố đa sắc (Băng Lam, Hỏa Đỏ, Sấm Tím, Thái Dương), tiến hóa thành Đại Thương 3D xuyên phá.
  - **Địa Chấn Xung Kích (Kinetic Shockwave)**: Phím Space lướt Dash để lại phân thân ảo ảnh 3D và bộc phát sóng chấn động diện rộng.
- **Tiến hóa Ngoại hình 3D Nhân vật (Tangible 3D Evolutions)**:
  - Khi nâng cấp: Hiện Lồng Khiên Lục Giác 3D, Mọc Đôi Cánh Phong Linh vỗ nhịp 3D, Vòng Ma Trận Hút Ngọc xoay dưới chân, Đội Vương Miện Thái Dương Vàng Rực 3D.
- **Bảng Nâng Cấp 3 Cột Hiện Đại**:
  - Giao diện 3 cột trực quan, ngắn gọn, đọc hiểu trong 1 giây.
  - Hệ thống cộng dồn cấp độ (Stackable Levels) và hiệu ứng kết hợp (Synergy Links).
  - Hỗ trợ chọn bằng chuột hoặc phím tắt `[1]`, `[2]`, `[3]`.
- **Âm thanh Procedural Web Audio**:
  - Tiếng bắn tia ma thuật, tiếng nổ xung kích, tiếng lướt gió dash, tiếng quái vật tan vỡ và tiếng lên cấp đều được tổng hợp thời gian thực từ dao động sóng âm.

## 🕹️ Điều khiển

- **WASD / Phím Mũi Tên**: Di chuyển nhân vật.
- **Spacebar / Chuột Phải**: Lướt Dash né đòn & kích nổ sóng địa chấn.
- **Phím [1], [2], [3]**: Chọn nhanh thẻ nâng cấp khi lên cấp.
- **Tự động tấn công (Auto-Attack)**: Nhân vật tự động nhắm bắn và duy trì lưới laser.

## 🚀 Cài đặt & Chạy cục bộ

```bash
# Cài đặt dependencies
npm install

# Chạy server phát triển
npm run dev

# Build production
npm run build
```

## 📦 Công nghệ sử dụng

- **Three.js** `^0.186.0`
- **Vite** `^5.4.10`
- **HTML5 Web Audio API**
- **Vanilla CSS & Google Fonts** (`Chakra Petch`, `Be Vietnam Pro`)
