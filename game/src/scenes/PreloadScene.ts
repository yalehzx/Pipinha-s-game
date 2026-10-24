import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    this.load.on('complete', () => {
      this.scene.start('MainMenuScene');
    });

    this.load.image('placeholder-player', '/assets/placeholder-player.png');
    this.load.image('placeholder-enemy', '/assets/placeholder-enemy.png');
    this.load.image('placeholder-projectile', '/assets/placeholder-projectile.png');
  }

  create(): void {
    // intentionally left blank; progression starts from the complete event above
  }
}
