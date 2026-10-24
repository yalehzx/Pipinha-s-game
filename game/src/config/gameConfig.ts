export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const WORLD_WIDTH = 1600;
export const WORLD_HEIGHT = 900;

export const APP_CONFIG = {
  title: 'Pipinha’s Game',
  version: '0.1.0',
  resolution: {
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    zoom: 1,
  },
  backgroundColor: '#0f1220',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { x: 0, y: 0 },
    },
  },
} as const;
