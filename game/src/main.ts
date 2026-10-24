import Phaser from 'phaser';
import './style.css';
import { APP_CONFIG } from './config/gameConfig';
import { BootScene } from './scenes/BootScene';
import { GameOverScene } from './scenes/GameOverScene';
import { GameScene } from './scenes/GameScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { PauseScene } from './scenes/PauseScene';
import { PreloadScene } from './scenes/PreloadScene';
import { SettingsScene } from './scenes/SettingsScene';
import { UIScene } from './scenes/UIScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: APP_CONFIG.resolution.width,
  height: APP_CONFIG.resolution.height,
  parent: 'app',
  backgroundColor: APP_CONFIG.backgroundColor,
  physics: APP_CONFIG.physics,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, PreloadScene, MainMenuScene, SettingsScene, GameScene, UIScene, PauseScene, GameOverScene],
};

export const game = new Phaser.Game(config);

window.addEventListener('beforeunload', () => {
  game.destroy(true);
});
