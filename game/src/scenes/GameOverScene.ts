import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, 700, 420, 0x0a0d17, 0.9);

    this.add.text(width / 2, height / 2 - 140, 'GAME OVER', {
      fontFamily: 'Trebuchet MS',
      fontSize: '40px',
      color: '#ff6b6b',
    }).setOrigin(0.5);

    const elapsedMs = this.registry.get('survivalMs') ?? 0;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
    const seconds = String(elapsedSeconds % 60).padStart(2, '0');

    this.add.text(width / 2, height / 2 - 40, `Tempo sobrevivido: ${minutes}:${seconds}`, {
      fontFamily: 'Trebuchet MS',
      fontSize: '20px',
      color: '#f7f7ff',
    }).setOrigin(0.5);

    const killCount = this.registry.get('kills') ?? 0;
    this.add.text(width / 2, height / 2 + 10, `Inimigos derrotados: ${killCount}`, {
      fontFamily: 'Trebuchet MS',
      fontSize: '20px',
      color: '#f7f7ff',
    }).setOrigin(0.5);

    const damageCount = this.registry.get('damageDealt') ?? 0;
    this.add.text(width / 2, height / 2 + 60, `Dano causado: ${Math.round(damageCount)}`, {
      fontFamily: 'Trebuchet MS',
      fontSize: '20px',
      color: '#f7f7ff',
    }).setOrigin(0.5);

    const retryButton = this.add.text(width / 2 - 110, height / 2 + 120, 'TENTAR NOVAMENTE', {
      fontFamily: 'Trebuchet MS',
      fontSize: '20px',
      color: '#dfe9ff',
    }).setInteractive({ useHandCursor: true });

    const menuButton = this.add.text(width / 2 + 120, height / 2 + 120, 'MENU PRINCIPAL', {
      fontFamily: 'Trebuchet MS',
      fontSize: '20px',
      color: '#dfe9ff',
    }).setInteractive({ useHandCursor: true });

    retryButton.on('pointerdown', () => this.scene.start('GameScene'));
    menuButton.on('pointerdown', () => this.scene.start('MainMenuScene'));
  }
}
