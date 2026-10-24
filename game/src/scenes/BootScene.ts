import Phaser from 'phaser';
import { AudioManager } from '../managers/AudioManager';
import { SaveManager } from '../managers/SaveManager';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.load.image('logo', '/assets/logo.png');
  }

  create(): void {
    const save = new SaveManager().load();
    AudioManager.getInstance().setVolume(save.masterVolume);
    this.scene.start('PreloadScene');
  }
}
