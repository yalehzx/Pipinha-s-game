import Phaser from 'phaser';

export class PauseScene extends Phaser.Scene {
  private resumeButton!: Phaser.GameObjects.Text;
  private restartButton!: Phaser.GameObjects.Text;
  private menuButton!: Phaser.GameObjects.Text;

  constructor() {
    super('PauseScene');
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, 500, 340, 0x0c1326, 0.9);

    this.add.text(width / 2, height / 2 - 120, 'PAUSADO', {
      fontFamily: 'Trebuchet MS',
      fontSize: '32px',
      color: '#f7f7ff',
    }).setOrigin(0.5);

    this.resumeButton = this.add.text(width / 2, height / 2 - 40, 'CONTINUAR', {
      fontFamily: 'Trebuchet MS',
      fontSize: '24px',
      color: '#dfe9ff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.restartButton = this.add.text(width / 2, height / 2 + 20, 'REINICIAR', {
      fontFamily: 'Trebuchet MS',
      fontSize: '24px',
      color: '#dfe9ff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.menuButton = this.add.text(width / 2, height / 2 + 80, 'MENU PRINCIPAL', {
      fontFamily: 'Trebuchet MS',
      fontSize: '24px',
      color: '#dfe9ff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.resumeButton.on('pointerdown', () => this.scene.resume('GameScene'));
    this.resumeButton.on('pointerdown', () => this.scene.stop('PauseScene'));
    this.restartButton.on('pointerdown', () => this.scene.start('GameScene'));
    this.menuButton.on('pointerdown', () => this.scene.start('MainMenuScene'));

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.resume('GameScene');
      this.scene.stop('PauseScene');
    });
  }
}
