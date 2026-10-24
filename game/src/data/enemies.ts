export type EnemyFamily = 'melee' | 'ranged' | 'tank' | 'fast' | 'elite';

export interface EnemyDefinition {
  id: EnemyFamily;
  label: string;
  family: EnemyFamily;
  health: number;
  speed: number;
  damage: number;
  size: number;
  color: number;
  xpReward: number;
}

export const ENEMY_DEFS: Record<EnemyFamily, EnemyDefinition> = {
  melee: {
    id: 'melee',
    label: 'Melee',
    family: 'melee',
    health: 36,
    speed: 75,
    damage: 12,
    size: 24,
    color: 0xff6b6b,
    xpReward: 10,
  },
  ranged: {
    id: 'ranged',
    label: 'Ranged',
    family: 'ranged',
    health: 28,
    speed: 52,
    damage: 10,
    size: 22,
    color: 0xffa94d,
    xpReward: 12,
  },
  tank: {
    id: 'tank',
    label: 'Tank',
    family: 'tank',
    health: 120,
    speed: 40,
    damage: 20,
    size: 32,
    color: 0x8d99ff,
    xpReward: 18,
  },
  fast: {
    id: 'fast',
    label: 'Fast',
    family: 'fast',
    health: 20,
    speed: 110,
    damage: 8,
    size: 18,
    color: 0x7ae582,
    xpReward: 9,
  },
  elite: {
    id: 'elite',
    label: 'Elite',
    family: 'elite',
    health: 80,
    speed: 80,
    damage: 18,
    size: 28,
    color: 0xf72585,
    xpReward: 25,
  },
};

export const ENEMY_FAMILIES: EnemyFamily[] = ['melee', 'ranged', 'tank', 'fast', 'elite'];
