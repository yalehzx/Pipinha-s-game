export type UpgradeRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export type UpgradeType =
  | 'damage'
  | 'moveSpeed'
  | 'projectileSpeed'
  | 'fireRate'
  | 'extraShot'
  | 'maxHealth'
  | 'heal'
  | 'critChance'
  | 'critDamage'
  | 'pierce'
  | 'bounce'
  | 'explosion'
  | 'dashCooldown'
  | 'range';

export interface UpgradeDefinition {
  id: string;
  name: string;
  type: UpgradeType;
  rarity: UpgradeRarity;
  value: number;
  description: string;
}

export const UPGRADE_DEFS: UpgradeDefinition[] = [
  { id: 'dmg-10', name: '+10% dano', type: 'damage', rarity: 'Common', value: 0.1, description: 'Aumenta o dano em 10%.' },
  { id: 'move-15', name: '+15% velocidade', type: 'moveSpeed', rarity: 'Common', value: 0.15, description: 'Aumenta a velocidade de movimento em 15%.' },
  { id: 'proj-20', name: '+20% velocidade dos projéteis', type: 'projectileSpeed', rarity: 'Uncommon', value: 0.2, description: 'Os projéteis voam mais rápido.' },
  { id: 'fire-10', name: '+10% cadência', type: 'fireRate', rarity: 'Common', value: 0.1, description: 'Aumenta a cadência de tiro.' },
  { id: 'shot-1', name: '+1 projétil', type: 'extraShot', rarity: 'Rare', value: 1, description: 'Dispara mais um projétil por tiro.' },
  { id: 'hp-10', name: '+10% vida máxima', type: 'maxHealth', rarity: 'Uncommon', value: 0.1, description: 'Aumenta a vida máxima em 10%.' },
  { id: 'heal', name: 'Recuperar vida', type: 'heal', rarity: 'Rare', value: 30, description: 'Recupera 30 de vida imediatamente.' },
  { id: 'crit-5', name: '+5% chance crítica', type: 'critChance', rarity: 'Uncommon', value: 0.05, description: 'Aumenta a chance de crítico em 5%.' },
  { id: 'critdmg-25', name: '+25% dano crítico', type: 'critDamage', rarity: 'Epic', value: 0.25, description: 'Amplifica o dano crítico em 25%.' },
  { id: 'pierce-1', name: 'Projéteis atravessam +1 inimigo', type: 'pierce', rarity: 'Epic', value: 1, description: 'Cada projétil atravessa mais um inimigo.' },
  { id: 'bounce', name: 'Projéteis ricocheteiam', type: 'bounce', rarity: 'Legendary', value: 1, description: 'Projéteis ricocheteiam em colisões.' },
  { id: 'explosion', name: 'Pequena explosão ao derrotar inimigos', type: 'explosion', rarity: 'Epic', value: 1, description: 'Inimigos derrotados geram uma explosão pequena.' },
  { id: 'dash-cooldown', name: 'Dash com cooldown menor', type: 'dashCooldown', rarity: 'Rare', value: 0.15, description: 'Reduz o cooldown do dash em 15%.' },
  { id: 'range-15', name: 'Aumentar alcance', type: 'range', rarity: 'Uncommon', value: 0.15, description: 'Aumenta o alcance dos projéteis em 15%.' },
];

export const RARITY_COLORS: Record<UpgradeRarity, number> = {
  Common: 0x9aa4b2,
  Uncommon: 0x5cc8ff,
  Rare: 0x8e7dff,
  Epic: 0xff8c42,
  Legendary: 0xffd166,
};

export const getRandomUpgradePool = (count: number): UpgradeDefinition[] => {
  const shuffled = [...UPGRADE_DEFS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
