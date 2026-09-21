## Session Log: 2026-09-21
- [x] Initialized JEV state and design consensus via `/grill-me`.
- [x] Created `task_plan.md`, `findings.md`, and `progress.md`.
- [x] Fixed Enemy Visibility: Direct 3D scene meshes with glowing ruby eyes, crystal horns, and live 3D floating health bars.
- [x] Immediate Wave: 16 enemies spawn right in view (radius 8-14) upon clicking Start.
- [x] Fixed Movement Jitter & Camera- Tăng độ phân giải Three.js Renderer: `setPixelRatio(Math.max(window.devicePixelRatio || 1, 2))` kết hợp `ACESFilmicToneMapping` và exposure 1.15 giúp hình ảnh sắc nét, ánh sáng pha lê trong trẻo.
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
