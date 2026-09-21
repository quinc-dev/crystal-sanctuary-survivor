// Clean, Ultra-Readable Roguelite Upgrade Deck with Tangible 3D Evolutions
import * as THREE from 'three';

export const UPGRADE_CARDS = [
  // 1. VỆ TINH LASER
  {
    id: 'orbit_count',
    title: 'Vệ Tinh Tinh Thể',
    archetypeLabel: 'LƯỚI VỆ TINH',
    rarity: 'rare',
    rarityText: 'HIẾM',
    maxLevel: 4,
    headline: '+1 Vệ Tinh Xoay Quanh',
    detail: 'Thêm 1 khối tinh thể 3D quay quanh nhân vật, dệt tia laser đa giác cắt quét quái.',
    synergyBonus: 'Combo với [Lăng Kính Tím]: Tăng diện tích quét laser.',
    synergyWith: 'orbit_damage',
    iconSvg: `
      <svg viewBox="0 0 48 48" fill="none" class="clean-icon">
        <circle cx="24" cy="24" r="18" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3 3"/>
        <circle cx="24" cy="6" r="4" fill="#38bdf8"/>
        <circle cx="42" cy="24" r="4" fill="#38bdf8"/>
        <circle cx="24" cy="42" r="4" fill="#38bdf8"/>
        <circle cx="6" cy="24" r="4" fill="#38bdf8"/>
        <circle cx="24" cy="24" r="3" fill="#ffffff"/>
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
    archetypeLabel: 'LƯỚI VỆ TINH',
    rarity: 'epic',
    rarityText: 'SỬ THI',
    maxLevel: 3,
    headline: '+45% Sát Thương & Hóa Laser Tím',
    detail: 'Chuyển toàn bộ chùm tia laser sang năng lượng điện tím 3D với sát thương cực đại.',
    synergyBonus: 'Combo với [Vệ Tinh]: Hủy diệt đàn quái áp sát.',
    synergyWith: 'orbit_count',
    iconSvg: `
      <svg viewBox="0 0 48 48" fill="none" class="clean-icon">
        <polygon points="24 6 40 18 40 34 24 44 8 34 8 18" stroke="#c084fc" stroke-width="2" fill="#c084fc" fill-opacity="0.2"/>
        <line x1="24" y1="6" x2="24" y2="44" stroke="#e879f9" stroke-width="1.5"/>
        <circle cx="24" cy="24" r="5" fill="#ffffff"/>
      </svg>
    `,
    apply(player, weapons) {
      weapons.orbitalDamage *= 1.45;
      weapons.setSuperchargedLaser();
    }
  },
  {
    id: 'orbit_speed',
    title: 'Quỹ Đạo Siêu Tốc',
    archetypeLabel: 'LƯỚI VỆ TINH',
    rarity: 'common',
    rarityText: 'THƯỜNG',
    maxLevel: 3,
    headline: '+35% Tốc Độ Quay Laser',
    detail: 'Tăng tốc độ xoay tròn của các vệ tinh, chém trúng quái vật liên tục hơn.',
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

  // 2. PHÁO MA THUẬT
  {
    id: 'bolt_multi',
    title: 'Tia Ma Thuật Đa Sắc',
    archetypeLabel: 'PHÁO MA THUẬT',
    rarity: 'rare',
    rarityText: 'HIẾM',
    maxLevel: 4,
    headline: '+1 Tia Bắn Tự Động',
    detail: 'Bắn thêm 1 luồng đạn nguyên tố đa sắc (Băng Lam, Hỏa Đỏ, Sấm Tím) vào quái gần nhất.',
    synergyBonus: 'Combo với [Thương Xuyên Phá]: Quét sạch nhiều hàng quái.',
    synergyWith: 'bolt_pierce',
    iconSvg: `
      <svg viewBox="0 0 48 48" fill="none" class="clean-icon">
        <line x1="24" y1="40" x2="24" y2="8" stroke="#38bdf8" stroke-width="2.5"/>
        <line x1="24" y1="40" x2="10" y2="14" stroke="#f43f5e" stroke-width="2.5"/>
        <line x1="24" y1="40" x2="38" y2="14" stroke="#c084fc" stroke-width="2.5"/>
        <circle cx="24" cy="40" r="4" fill="#ffffff"/>
      </svg>
    `,
    apply(player, weapons) {
      weapons.boltCount += 1;
    }
  },
  {
    id: 'bolt_pierce',
    title: 'Thương Tinh Thể Xuyên Phá',
    archetypeLabel: 'PHÁO MA THUẬT',
    rarity: 'rare',
    rarityText: 'HIẾM',
    maxLevel: 3,
    headline: 'Đạn Hóa Đại Thương 3D (Xuyên +2 Quái)',
    detail: 'Biến đạn ma thuật thành ngọn thương pha lê lớn xoay tròn, xuyên thủng thêm 2 quái.',
    synergyBonus: 'Combo với [Tia Đa Sắc]: Xuyên phá cực mạnh.',
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
    title: 'Hồi Hỏa Thần Tốc',
    archetypeLabel: 'PHÁO MA THUẬT',
    rarity: 'common',
    rarityText: 'THƯỜNG',
    maxLevel: 3,
    headline: '+30% Tốc Độ Xả Đạn',
    detail: 'Giảm mạnh thời gian hồi giữa các loạt bắn ma thuật.',
    synergyBonus: null,
    synergyWith: null,
    iconSvg: `
      <svg viewBox="0 0 48 48" fill="none" class="clean-icon">
        <path d="M16 12 L32 12 L24 24 L32 36 L16 36 L22 24 Z" stroke="#38bdf8" stroke-width="2" fill="#38bdf8" fill-opacity="0.2"/>
        <circle cx="24" cy="24" r="3" fill="#ffffff"/>
      </svg>
    `,
    apply(player, weapons) {
      weapons.boltCooldownMax = Math.max(0.18, weapons.boltCooldownMax * 0.72);
    }
  },

  // 3. XUNG KÍCH DASH
  {
    id: 'shockwave_aoe',
    title: 'Địa Chấn Hồng Thủy',
    archetypeLabel: 'XUNG KÍCH DASH',
    rarity: 'rare',
    rarityText: 'HIẾM',
    maxLevel: 3,
    headline: '+50% Bán Kính Nổ Sóng Dash',
    detail: 'Mỗi cú lướt Space tạo ra vòng sóng xung kích khổng lồ đẩy lùi toàn bộ quái quanh mình.',
    synergyBonus: 'Combo với [Bộ Lướt]: Kích nổ liên tục.',
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
    title: 'Bộ Lướt Hư Không',
    archetypeLabel: 'XUNG KÍCH DASH',
    rarity: 'common',
    rarityText: 'THƯỜNG',
    maxLevel: 3,
    headline: 'Giảm 35% Hồi Dash & Hiện Ảo Ảnh 3D',
    detail: 'Lướt né đòn thường xuyên hơn và để lại ảo ảnh phân thân pha lê.',
    synergyBonus: 'Combo với [Địa Chấn]: Tăng tần suất nổ.',
    synergyWith: 'shockwave_aoe',
    iconSvg: `
      <svg viewBox="0 0 48 48" fill="none" class="clean-icon">
        <polyline points="10 24 20 14 30 24 20 34" stroke="#94a3b8" stroke-width="2" stroke-dasharray="3 3"/>
        <polyline points="18 24 28 14 38 24 28 34" stroke="#38bdf8" stroke-width="2.5"/>
      </svg>
    `,
    apply(player, weapons) {
      player.dashCooldownMax = Math.max(0.7, player.dashCooldownMax * 0.65);
    }
  },

  // 4. SINH TỒN & TIỆN ÍCH
  {
    id: 'max_hp',
    title: 'Khiên Băng Pha Lê',
    archetypeLabel: 'SINH TỒN THÁNH ĐỊA',
    rarity: 'rare',
    rarityText: 'HIẾM',
    maxLevel: 3,
    headline: '+60 Máu Tối Đa & Hiện Lồng Khiên 3D',
    detail: 'Bọc một lồng khiên lục giác 3D quanh người và hồi phục 60 Máu ngay tức khắc.',
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
    archetypeLabel: 'SINH TỒN THÁNH ĐỊA',
    rarity: 'common',
    rarityText: 'THƯỜNG',
    maxLevel: 3,
    headline: '+25% Tốc Độ & Mọc Cánh 3D',
    detail: 'Mọc đôi cánh pha lê vỗ nhịp 3D sau lưng, giúp di chuyển né đòn linh hoạt.',
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
    archetypeLabel: 'SINH TỒN THÁNH ĐỊA',
    rarity: 'common',
    rarityText: 'THƯỜNG',
    maxLevel: 3,
    headline: '+80% Phạm Vi Hút Ngọc (Hiện Vòng Trận)',
    detail: 'Kích hoạt vòng ma trận cổ ngữ dưới đất, tự động hút ngọc kinh nghiệm ở rất xa.',
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

  // 5. TIẾN HÓA HUYỀN THOẠI
  {
    id: 'legendary_singularity',
    title: 'Vương Miện Thái Dương',
    archetypeLabel: 'TIẾN HÓA HUYỀN THOẠI',
    rarity: 'legendary',
    rarityText: 'HUYỀN THOẠI',
    maxLevel: 1,
    headline: 'Đội Vương Miện Vàng 3D (+2 Vệ Tinh, +1 Tia)',
    detail: 'Đội vương miện hoàng kim trên đầu, tăng đồng loạt 2 Vệ Tinh, 1 Tia Bắn và hồi 100% Máu!',
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
        if (c.synergyWith && possessedIds.has(c.synergyWith)) weight += 1.5;
        if (c.rarity === 'legendary') weight *= 0.3;
        else if (c.rarity === 'epic') weight *= 0.7;
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
