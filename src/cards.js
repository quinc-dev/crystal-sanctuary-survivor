// Clean, Modern 3-Column Roguelite Upgrade Deck with Tangible 3D Evolutions
import * as THREE from 'three';

export const UPGRADE_CARDS = [
  // ==========================================
  // 1. NHÁNH VỆ TINH LĂNG KÍNH THÁI DƯƠNG
  // ==========================================
  {
    id: 'orbit_count',
    title: 'Lăng Kính Vệ Tinh',
    archetypeLabel: 'LĂNG KÍNH THÁI DƯƠNG',
    rarity: 'rare',
    rarityText: 'HIẾM',
    maxLevel: 4,
    headline: '+1 Vệ Tinh Pha Lê (Tạo Mạng Laser)',
    detail: 'Thêm 1 khối vệ tinh kim cương xoay quanh, đan chéo các tia laser đa giác bảo hộ.',
    synergyBonus: 'Combo với [Lăng Kính Tím]: Tăng diện tích quét hủy diệt.',
    synergyWith: 'orbit_damage',
    iconSvg: `
      <svg viewBox="0 0 48 48" fill="none" class="clean-icon">
        <circle cx="24" cy="24" r="18" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3 3"/>
        <polygon points="24 4 28 8 24 12 20 8" fill="#38bdf8"/>
        <polygon points="44 24 40 28 36 24 40 20" fill="#38bdf8"/>
        <polygon points="24 44 20 40 24 36 28 40" fill="#38bdf8"/>
        <polygon points="4 24 8 20 12 24 8 28" fill="#38bdf8"/>
        <circle cx="24" cy="24" r="3.5" fill="#ffffff"/>
      </svg>
    `,
    apply(player, weapons) {
      weapons.orbitalCount += 1;
      weapons.rebuildOrbitals();
    }
  },
  {
    id: 'orbit_damage',
    title: 'Lăng Kính Tím Arcane',
    archetypeLabel: 'LĂNG KÍNH THÁI DƯƠNG',
    rarity: 'epic',
    rarityText: 'SỬ THI',
    maxLevel: 3,
    headline: '+50% Sát Thương & Hóa Laser Tím 3D',
    detail: 'Chuyển toàn bộ chùm tia laser sang năng lượng điện tím 3D với lực cắt cực lớn.',
    synergyBonus: 'Combo với [Lăng Kính]: Thiêu rụi quái vật ngay khi chạm lồng.',
    synergyWith: 'orbit_count',
    iconSvg: `
      <svg viewBox="0 0 48 48" fill="none" class="clean-icon">
        <polygon points="24 6 40 18 40 34 24 44 8 34 8 18" stroke="#c084fc" stroke-width="2" fill="#c084fc" fill-opacity="0.25"/>
        <line x1="24" y1="6" x2="24" y2="44" stroke="#e879f9" stroke-width="2"/>
        <circle cx="24" cy="24" r="5" fill="#ffffff"/>
      </svg>
    `,
    apply(player, weapons) {
      weapons.orbitalDamage *= 1.5;
      weapons.setSuperchargedLaser();
    }
  },
  {
    id: 'orbit_speed',
    title: 'Quỹ Đạo Siêu Tốc',
    archetypeLabel: 'LĂNG KÍNH THÁI DƯƠNG',
    rarity: 'common',
    rarityText: 'THƯỜNG',
    maxLevel: 3,
    headline: '+35% Tốc Độ Quay & Bán Kính Rộng',
    detail: 'Tăng tốc độ xoay tròn của các lăng kính, cắt trúng quái vật liên tục hơn.',
    synergyBonus: null,
    synergyWith: null,
    iconSvg: `
      <svg viewBox="0 0 48 48" fill="none" class="clean-icon">
        <path d="M24 8 A16 16 0 1 1 8 24" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>
        <polyline points="28 4 24 8 28 12" stroke="#38bdf8" stroke-width="2"/>
        <circle cx="24" cy="24" r="4" fill="#94a3b8"/>
      </svg>
    `,
    apply(player, weapons) {
      weapons.orbitalSpeed *= 1.35;
      weapons.orbitalRadius *= 1.12;
    }
  },

  // ==========================================
  // 2. NHÁNH ĐẠI THƯƠNG TINH THỂ XUYÊN KHÔNG
  // ==========================================
  {
    id: 'bolt_multi',
    title: 'Thương Xoay Đa Sắc',
    archetypeLabel: 'ĐẠI THƯƠNG XUYÊN KHÔNG',
    rarity: 'rare',
    rarityText: 'HIẾM',
    maxLevel: 4,
    headline: '+1 Đại Thương Bắn Tự Động',
    detail: 'Bắn thêm 1 ngọn thương pha lê xoay tít mang hào quang đa sắc vào quái gần nhất.',
    synergyBonus: 'Combo với [Thương Xuyên Phá]: Quét tan đàn quái dày đặc.',
    synergyWith: 'bolt_pierce',
    iconSvg: `
      <svg viewBox="0 0 48 48" fill="none" class="clean-icon">
        <line x1="24" y1="42" x2="24" y2="8" stroke="#38bdf8" stroke-width="2.5"/>
        <line x1="24" y1="42" x2="10" y2="14" stroke="#f43f5e" stroke-width="2.5"/>
        <line x1="24" y1="42" x2="38" y2="14" stroke="#c084fc" stroke-width="2.5"/>
        <circle cx="24" cy="42" r="4" fill="#ffffff"/>
      </svg>
    `,
    apply(player, weapons) {
      weapons.boltCount += 1;
    }
  },
  {
    id: 'bolt_pierce',
    title: 'Mũi Thương Kích Thấu',
    archetypeLabel: 'ĐẠI THƯƠNG XUYÊN KHÔNG',
    rarity: 'rare',
    rarityText: 'HIẾM',
    maxLevel: 3,
    headline: 'Thương Khổng Lồ 3D (Xuyên +2 Quái)',
    detail: 'Mũi thương phóng to gấp đôi gắn vành xoắn ốc helix, xuyên thủng thêm 2 kẻ địch.',
    synergyBonus: 'Combo với [Thương Đa Sắc]: Hủy diệt theo đường thẳng.',
    synergyWith: 'bolt_multi',
    iconSvg: `
      <svg viewBox="0 0 48 48" fill="none" class="clean-icon">
        <line x1="10" y1="38" x2="36" y2="12" stroke="#38bdf8" stroke-width="3"/>
        <polygon points="42 8 32 12 36 18" fill="#38bdf8"/>
        <line x1="8" y1="40" x2="16" y2="32" stroke="#7dd3fc" stroke-width="3"/>
      </svg>
    `,
    apply(player, weapons) {
      weapons.boltPierce += 2;
    }
  },
  {
    id: 'bolt_rate',
    title: 'Khí Vận Tốc Xả',
    archetypeLabel: 'ĐẠI THƯƠNG XUYÊN KHÔNG',
    rarity: 'common',
    rarityText: 'THƯỜNG',
    maxLevel: 3,
    headline: '+32% Tốc Độ Phóng Thương',
    detail: 'Rút ngắn thời gian ngưng nghỉ giữa các đợt khai hỏa đại thương tinh thể.',
    synergyBonus: null,
    synergyWith: null,
    iconSvg: `
      <svg viewBox="0 0 48 48" fill="none" class="clean-icon">
        <path d="M16 12 L32 12 L24 24 L32 36 L16 36 L22 24 Z" stroke="#38bdf8" stroke-width="2" fill="#38bdf8" fill-opacity="0.2"/>
        <circle cx="24" cy="24" r="3" fill="#ffffff"/>
      </svg>
    `,
    apply(player, weapons) {
      weapons.boltCooldownMax = Math.max(0.18, weapons.boltCooldownMax * 0.7);
    }
  },

  // ==========================================
  // 3. NHÁNH VŨ KHÍ MỚI: BĂNG LONG TRẢM (Glacial Spires)
  // ==========================================
  {
    id: 'glacial_spire',
    title: 'Băng Trụ Trảm Long',
    archetypeLabel: 'BÃO BĂNG GAI 3D',
    rarity: 'epic',
    rarityText: 'SỬ THI',
    maxLevel: 3,
    headline: 'Triệu Hồi Gai Băng 3D Phun Từ Đất',
    detail: 'Mọc liên hoàn 5 chông băng khổng lồ đâm xuyên bầy quái với sát thương 65 diện rộng.',
    synergyBonus: 'Vũ khí địa tầng 3D gây chấn động toàn thánh địa.',
    synergyWith: null,
    iconSvg: `
      <svg viewBox="0 0 48 48" fill="none" class="clean-icon">
        <polygon points="24 4 18 36 30 36" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1.5"/>
        <polygon points="12 16 8 38 18 38" fill="#bae6fd" stroke="#0284c7" stroke-width="1.2"/>
        <polygon points="36 16 30 38 40 38" fill="#bae6fd" stroke="#0284c7" stroke-width="1.2"/>
        <line x1="4" y1="40" x2="44" y2="40" stroke="#7dd3fc" stroke-width="2"/>
      </svg>
    `,
    apply(player, weapons, level) {
      weapons.unlockGlacialSpire();
      if (level > 1) {
        weapons.glacialDamage *= 1.4;
        weapons.glacialCooldownMax = Math.max(1.2, weapons.glacialCooldownMax * 0.8);
      }
    }
  },

  // ==========================================
  // 4. NHÁNH KINETIC DASH & ĐỊA CHẤN HƯ KHÔNG
  // ==========================================
  {
    id: 'shockwave_aoe',
    title: 'Địa Chấn Hồng Thủy',
    archetypeLabel: 'XUNG KÍCH & VẾT NỨT',
    rarity: 'rare',
    rarityText: 'HIẾM',
    maxLevel: 3,
    headline: '+50% Bán Kính & Để Lại Vết Nứt Sàn',
    detail: 'Mỗi cú lướt Space tạo ra sóng địa chấn khổng lồ và để lại khe nứt cổ ngữ đốt quái.',
    synergyBonus: 'Combo với [Lướt Hư Không]: Đốt cháy mặt đất liên tục.',
    synergyWith: 'dash_cooldown',
    iconSvg: `
      <svg viewBox="0 0 48 48" fill="none" class="clean-icon">
        <circle cx="24" cy="24" r="8" stroke="#f59e0b" stroke-width="2"/>
        <circle cx="24" cy="24" r="16" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="4 3"/>
        <circle cx="24" cy="24" r="3" fill="#ffffff"/>
      </svg>
    `,
    apply(player, weapons) {
      player.shockwaveRadius *= 1.5;
    }
  },
  {
    id: 'dash_cooldown',
    title: 'Lướt Hư Không Phân Thân',
    archetypeLabel: 'XUNG KÍCH & VẾT NỨT',
    rarity: 'common',
    rarityText: 'THƯỜNG',
    maxLevel: 3,
    headline: 'Giảm 35% Hồi Dash & Hiện Ảo Ảnh 3D',
    detail: 'Lướt né đòn thường xuyên hơn, để lại ảo ảnh phân thân pha lê thu hút quái.',
    synergyBonus: 'Combo với [Địa Chấn]: Tăng tần suất nổ diện rộng.',
    synergyWith: 'shockwave_aoe',
    iconSvg: `
      <svg viewBox="0 0 48 48" fill="none" class="clean-icon">
        <polyline points="10 24 20 14 30 24 20 34" stroke="#94a3b8" stroke-width="2" stroke-dasharray="3 3"/>
        <polyline points="18 24 28 14 38 24 28 34" stroke="#38bdf8" stroke-width="2.5"/>
      </svg>
    `,
    apply(player, weapons) {
      player.dashCooldownMax = Math.max(0.65, player.dashCooldownMax * 0.65);
    }
  },

  // ==========================================
  // 5. TIẾN HÓA THỂ XÁC & CỔ NGỮ (Trực Quan Three.js)
  // ==========================================
  {
    id: 'max_hp',
    title: 'Khiên Cổ Ngữ Aegis',
    archetypeLabel: 'TIẾN HÓA BẢO HỘ',
    rarity: 'rare',
    rarityText: 'HIẾM',
    maxLevel: 3,
    headline: '+60 Máu & 3 Tấm Khiên Bay Xoay Quanh',
    detail: 'Mở 3 tấm khiên lục giác 3D xoay vòng quanh người và hồi phục ngay 60 Máu.',
    synergyBonus: null,
    synergyWith: null,
    iconSvg: `
      <svg viewBox="0 0 48 48" fill="none" class="clean-icon">
        <polygon points="24 6 40 14 40 34 24 42 8 34 8 14" stroke="#3b82f6" stroke-width="2" fill="#3b82f6" fill-opacity="0.2"/>
        <circle cx="24" cy="24" r="4" fill="#ffffff"/>
      </svg>
    `,
    apply(player, weapons) {
      player.maxHp += 60;
      player.heal(60);
      player.activateAegisVisual();
    }
  },
  {
    id: 'move_speed',
    title: 'Đôi Cánh Phong Linh',
    archetypeLabel: 'TIẾN HÓA BẢO HỘ',
    rarity: 'common',
    rarityText: 'THƯỜNG',
    maxLevel: 3,
    headline: '+25% Tốc Độ & Mọc Đôi Cánh 3D Vỗ Sóng',
    detail: 'Mọc đôi cánh lông vũ pha lê 3D sau lưng vỗ nhịp liên hồi, tăng tốc độ di chuyển.',
    synergyBonus: null,
    synergyWith: null,
    iconSvg: `
      <svg viewBox="0 0 48 48" fill="none" class="clean-icon">
        <path d="M22 30 C18 22, 8 18, 4 8 C12 12, 16 18, 20 24" stroke="#38bdf8" stroke-width="2" fill="#38bdf8" fill-opacity="0.25"/>
        <path d="M26 30 C30 22, 40 18, 44 8 C36 12, 32 18, 28 24" stroke="#38bdf8" stroke-width="2" fill="#38bdf8" fill-opacity="0.25"/>
        <circle cx="24" cy="30" r="3" fill="#ffffff"/>
      </svg>
    `,
    apply(player, weapons) {
      player.speed *= 1.25;
      player.activateWingsVisual();
    }
  },
  {
    id: 'magnet_pull',
    title: 'Ma Trận Hút Trọng Trường',
    archetypeLabel: 'TIẾN HÓA BẢO HỘ',
    rarity: 'common',
    rarityText: 'THƯỜNG',
    maxLevel: 3,
    headline: '+80% Tầm Hút & Hiện Trận Đồ Dưới Chân',
    detail: 'Kích hoạt vòng tròn ma trận cổ ngữ đôi dưới đất, tự động gom ngọc kinh nghiệm từ xa.',
    synergyBonus: null,
    synergyWith: null,
    iconSvg: `
      <svg viewBox="0 0 48 48" fill="none" class="clean-icon">
        <circle cx="24" cy="24" r="16" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="5 3"/>
        <polygon points="24 16 28 22 20 22" fill="#38bdf8"/>
        <polygon points="24 32 20 26 28 26" fill="#38bdf8"/>
        <circle cx="24" cy="24" r="3" fill="#ffffff"/>
      </svg>
    `,
    apply(player, weapons) {
      player.pickupRadius *= 1.8;
      player.activateGravAuraVisual();
    }
  },

  // ==========================================
  // 6. TIẾN HÓA HUYỀN THOẠI TỐI THƯỢNG
  // ==========================================
  {
    id: 'legendary_singularity',
    title: 'Vương Miện Thái Dương',
    archetypeLabel: 'TIẾN HÓA HUYỀN THOẠI',
    rarity: 'legendary',
    rarityText: 'HUYỀN THOẠI',
    maxLevel: 1,
    headline: 'Đội Vương Miện Vàng & 5 Ngọc Bay (+2 Vệ Tinh, +1 Thương)',
    detail: 'Đội vương miện hoàng kim 3D với 5 viên ngọc bay quanh, tăng cùng lúc 2 Vệ Tinh, 1 Thương và hồi đầy 100% Máu!',
    synergyBonus: 'Đỉnh cao tiến hóa tối thượng của thánh địa.',
    synergyWith: null,
    iconSvg: `
      <svg viewBox="0 0 48 48" fill="none" class="clean-icon">
        <path d="M10 32 L14 16 L20 24 L24 10 L28 24 L34 16 L38 32 Z" stroke="#fbbf24" stroke-width="2" fill="#fbbf24" fill-opacity="0.3"/>
        <line x1="8" y1="36" x2="40" y2="36" stroke="#f59e0b" stroke-width="2"/>
        <circle cx="24" cy="10" r="2.5" fill="#ffffff"/>
      </svg>
    `,
    apply(player, weapons) {
      weapons.orbitalCount += 2;
      weapons.rebuildOrbitals();
      weapons.boltCount += 1;
      player.heal(player.maxHp);
      player.activateCrownVisual();
    }
  }
];

export class UpgradeDeck {
  constructor() {
    this.levels = new Map();
    UPGRADE_CARDS.forEach(c => this.levels.set(c.id, 0));
  }

  getLevel(cardId) {
    return this.levels.get(cardId) || 0;
  }

  upgradeCard(cardId, player, weapons) {
    const card = UPGRADE_CARDS.find(c => c.id === cardId);
    if (!card) return;
    const current = this.getLevel(cardId);
    const nextLevel = current + 1;
    this.levels.set(cardId, nextLevel);
    card.apply(player, weapons, nextLevel);
  }

  drawOptions(count = 3) {
    const available = UPGRADE_CARDS.filter(c => this.getLevel(c.id) < c.maxLevel);
    if (available.length === 0) return [];

    const possessedIds = new Set();
    for (const [id, lvl] of this.levels.entries()) {
      if (lvl > 0) possessedIds.add(id);
    }

    const pool = [...available];
    const chosen = [];

    while (chosen.length < count && pool.length > 0) {
      const weights = pool.map(c => {
        let weight = 1.0;
        if (c.synergyWith && possessedIds.has(c.synergyWith)) weight += 1.6;
        if (c.rarity === 'legendary') weight *= 0.3;
        else if (c.rarity === 'epic') weight *= 0.75;
        return weight;
      });

      const totalWeight = weights.reduce((acc, w) => acc + w, 0);
      let rand = Math.random() * totalWeight;
      let selectedIdx = 0;

      for (let i = 0; i < pool.length; i++) {
        rand -= weights[i];
        if (rand <= 0) {
          selectedIdx = i;
          break;
        }
      }

      chosen.push(pool[selectedIdx]);
      pool.splice(selectedIdx, 1);
    }

    return chosen;
  }
}
