export type WeaponRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type WeaponId = 'pistol' | 'smg' | 'shotgun' | 'rifle' | 'energy';

export interface WeaponDefinition {
  id: WeaponId;
  name: string;
  rarity: WeaponRarity;
  damage: number;
  fireRate: number;
  projectileSpeed: number;
  spread: number;
  pelletCount: number;
  range: number;
  color: number;
}

export const WEAPON_DEFS: Record<WeaponId, WeaponDefinition> = {
  pistol: {
    id: 'pistol',
    name: 'Pistola',
    rarity: 'Common',
    damage: 15,
    fireRate: 220,
    projectileSpeed: 540,
    spread: 0.04,
    pelletCount: 1,
    range: 540,
    color: 0xf4d35e,
  },
  smg: {
    id: 'smg',
    name: 'Submetralhadora',
    rarity: 'Uncommon',
    damage: 11,
    fireRate: 105,
    projectileSpeed: 620,
    spread: 0.1,
    pelletCount: 1,
    range: 520,
    color: 0x65d6ce,
  },
  shotgun: {
    id: 'shotgun',
    name: 'Escopeta',
    rarity: 'Rare',
    damage: 8,
    fireRate: 480,
    projectileSpeed: 500,
    spread: 0.22,
    pelletCount: 5,
    range: 300,
    color: 0xff8fab,
  },
  rifle: {
    id: 'rifle',
    name: 'Rifle',
    rarity: 'Epic',
    damage: 24,
    fireRate: 330,
    projectileSpeed: 760,
    spread: 0.06,
    pelletCount: 1,
    range: 760,
    color: 0x7aa2ff,
  },
  energy: {
    id: 'energy',
    name: 'Arma Energética',
    rarity: 'Legendary',
    damage: 32,
    fireRate: 200,
    projectileSpeed: 830,
    spread: 0.08,
    pelletCount: 2,
    range: 700,
    color: 0xc084fc,
  },
};

export const WEAPON_ORDER: WeaponId[] = ['pistol', 'smg', 'shotgun', 'rifle', 'energy'];

export const getWeaponById = (weaponId: string): WeaponDefinition => {
  return WEAPON_DEFS[weaponId as WeaponId] ?? WEAPON_DEFS.pistol;
};
