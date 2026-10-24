import Phaser from 'phaser';

export class EffectManager {
  private readonly scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public shake(intensity = 8, duration = 180): void {
    this.scene.cameras.main.shake(duration, intensity / 100);
  }

  public spawnImpact(x: number, y: number, color: number, count = 10): void {
    for (let index = 0; index < count; index += 1) {
      const particle = this.scene.add.circle(x, y, Phaser.Math.Between(2, 5), color, 0.9);
      particle.setDepth(40);

      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.FloatBetween(35, 140);

      this.scene.tweens.add({
        targets: particle,
        x: particle.x + Math.cos(angle) * speed,
        y: particle.y + Math.sin(angle) * speed,
        alpha: { from: 1, to: 0 },
        scale: { from: 1, to: 0.15 },
        duration: Phaser.Math.Between(180, 420),
        onComplete: () => particle.destroy(),
      });
    }
  }

  public spawnDamageText(x: number, y: number, value: number, color = '#ffffff'): void {
    const label = this.scene.add.text(x, y, `${Math.round(value)}`, {
      color,
      fontSize: '16px',
      fontFamily: 'Trebuchet MS',
      fontStyle: 'bold',
      stroke: '#101820',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(60);

    this.scene.tweens.add({
      targets: label,
      y: y - 26,
      alpha: { from: 1, to: 0 },
      duration: 500,
      onComplete: () => label.destroy(),
    });
  }

  public spawnMuzzleFlash(x: number, y: number, color: number): void {
    const flash = this.scene.add.rectangle(x, y, 24, 10, color, 0.95);
    flash.setDepth(25);
    flash.setRotation(Phaser.Math.FloatBetween(-0.4, 0.4));

    this.scene.tweens.add({
      targets: flash,
      scaleX: 1.8,
      scaleY: 1.35,
      alpha: { from: 1, to: 0 },
      duration: 90,
      onComplete: () => flash.destroy(),
    });
  }
}
