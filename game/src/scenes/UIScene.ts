import Phaser from 'phaser';

interface HudState {
  health: number;
  maxHealth: number;
  weaponName: string;
  level: number;
  xp: number;
  xpToNext: number;
}

export class UIScene extends Phaser.Scene {
  private healthLabel!: Phaser.GameObjects.Text;
  private weaponLabel!: Phaser.GameObjects.Text;
  private levelLabel!: Phaser.GameObjects.Text;

  constructor() {
    super('UIScene');
  }

  create(): void {
    const panel = this.add.rectangle(150, 72, 280, 110, 0x10192f, 0.7);
    panel.setScrollFactor(0);

    this.healthLabel = this.add.text(30, 26, 'Vida: 100 / 100', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#f5f5f5',
    });
    this.healthLabel.setScrollFactor(0);

    this.weaponLabel = this.add.text(30, 54, 'Arma: Pistola', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#dfe9ff',
    });
    this.weaponLabel.setScrollFactor(0);

    this.levelLabel = this.add.text(30, 82, 'Nível: 1 | XP: 0 / 40', {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#ffd166',
    });
    this.levelLabel.setScrollFactor(0);

    this.game.events.on('hud:update', this.handleHudUpdate, this);
  }

  private handleHudUpdate(data: HudState): void {
    this.healthLabel.setText(`Vida: ${Math.max(0, Math.ceil(data.health))} / ${Math.ceil(data.maxHealth)}`);
    this.weaponLabel.setText(`Arma: ${data.weaponName}`);
    this.levelLabel.setText(`Nível: ${data.level} | XP: ${Math.floor(data.xp)} / ${Math.floor(data.xpToNext)}`);
  }

  shutdown(): void {
    this.game.events.off('hud:update', this.handleHudUpdate, this);
  }
}
