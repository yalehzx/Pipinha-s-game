import Phaser from 'phaser';

export class Boss {
  public readonly sprite: Phaser.GameObjects.Rectangle;
  public readonly body: Phaser.Physics.Arcade.Body;

  public maxHealth = 420;
  public health = this.maxHealth;
  public phase = 1;

  private readonly scene: Phaser.Scene;
  private warningTime = 0;
  private warningRadius = 0;
  private warningCircle: Phaser.GameObjects.Arc | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.sprite = scene.add.rectangle(x, y, 52, 52, 0xff4d6d);
    this.sprite.setStrokeStyle(4, 0xffd166, 1);
    this.sprite.setDepth(15);

    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);
    this.body.setSize(48, 48);
  }

  public update(playerX: number, playerY: number, deltaMs: number): void {
    const dx = playerX - this.sprite.x;
    const dy = playerY - this.sprite.y;
    const distance = Math.hypot(dx, dy) || 1;

    const speed = this.phase === 1 ? 48 : 64;
    const velocityX = (dx / distance) * speed;
    const velocityY = (dy / distance) * speed;

    if (this.health < this.maxHealth * 0.5) {
      this.phase = 2;
    }

    this.body.setVelocity(velocityX, velocityY);
    this.sprite.rotation = Math.atan2(dy, dx);

    const flash = this.health < this.maxHealth * 0.5 ? 0.4 : 0.8;
    this.sprite.setFillStyle(0xff4d6d, flash);

    this.warningTime = Math.max(0, this.warningTime - deltaMs);
    if (this.warningTime <= 0) {
      this.startWarning();
      this.warningTime = this.phase === 1 ? 1800 : 1200;
    }

    if (this.warningCircle) {
      const pulse = Math.sin(this.scene.time.now / 120) * 0.15 + 1;
      this.warningCircle.setRadius(this.warningRadius * pulse);
      this.warningCircle.setAlpha(0.18 + (this.warningRadius / 140) * 0.12);
      this.warningCircle.setPosition(this.sprite.x, this.sprite.y);
    }
  }

  public startWarning(): void {
    if (this.warningCircle) {
      this.warningCircle.destroy();
    }

    this.warningRadius = this.phase === 1 ? 72 : 110;
    this.warningCircle = this.scene.add.circle(this.sprite.x, this.sprite.y, this.warningRadius, 0xffd166, 0.18);
    this.warningCircle.setDepth(14);
  }

  public getWarningRadius(): number {
    return this.warningRadius;
  }

  public hasWarning(): boolean {
    return this.warningCircle !== null;
  }

  public consumeWarning(): void {
    if (this.warningCircle) {
      this.warningCircle.destroy();
      this.warningCircle = null;
    }
  }

  public applyDamage(amount: number): boolean {
    this.health -= amount;
    return this.health <= 0;
  }
}
