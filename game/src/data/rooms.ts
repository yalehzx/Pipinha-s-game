export type RoomType = 'combat' | 'reward' | 'shop' | 'elite' | 'rest' | 'event' | 'boss';

export interface RoomDefinition {
  id: string;
  type: RoomType;
  label: string;
  enemyBias: string[];
  enemyCount: number;
  eliteChance: number;
}

export const ROOM_DEFS: RoomDefinition[] = [
  { id: 'room-1', type: 'combat', label: 'Sala de combate', enemyBias: ['melee', 'fast'], enemyCount: 5, eliteChance: 0 },
  { id: 'room-2', type: 'reward', label: 'Sala de recompensa', enemyBias: ['melee'], enemyCount: 3, eliteChance: 0 },
  { id: 'room-3', type: 'shop', label: 'Loja de relíquias', enemyBias: ['ranged'], enemyCount: 2, eliteChance: 0 },
  { id: 'room-4', type: 'elite', label: 'Elite', enemyBias: ['elite', 'tank'], enemyCount: 2, eliteChance: 1 },
  { id: 'room-5', type: 'rest', label: 'Descanso', enemyBias: ['fast'], enemyCount: 1, eliteChance: 0 },
  { id: 'room-6', type: 'event', label: 'Evento', enemyBias: ['ranged', 'melee'], enemyCount: 4, eliteChance: 0.2 },
  { id: 'room-7', type: 'boss', label: 'Boss', enemyBias: ['elite', 'tank'], enemyCount: 1, eliteChance: 1 },
];
