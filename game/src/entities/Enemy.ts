import Phaser from 'phaser';
import { ENEMY_DEFS, type EnemyDefinition, type EnemyFamily } from '../data/enemies';

export class Enemy {
  public readonly sprite: Phaser.GameObjects.Rectangle;
  public readonly body: Phaser.Physics.Arcade.Body;
  public readonly definition: EnemyDefinition;

  public health: number;
  public readonly baseHealth: number;
  public readonly xpReward: number;
  public attackCooldown = 0;

  private hitFlashTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, family: EnemyFamily) {
    const definition = ENEMY_DEFS[family];
    this.definition = definition;
    this.baseHealth = definition.health;
    this.health = definition.health;
    this.xpReward = definition.xpReward;

    this.sprite = scene.add.rectangle(x, y, definition.size, definition.size, definition.color);
    this.sprite.setStrokeStyle(2, 0xffffff, 0.7);
    this.sprite.setDepth(10);

    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);
    this.body.setDrag(800);
    this.body.setSize(definition.size * 0.9, definition.size * 0.9);
  }

  public update(playerX: number, playerY: number, deltaMs: number): void {
    const dx = playerX - this.sprite.x;
    const dy = playerY - this.sprite.y;
    const distance = Math.hypot(dx, dy) || 1;
    const speed = this.definition.speed;

    this.attackCooldown = Math.max(0, this.attackCooldown - deltaMs);

    const velocityX = (dx / distance) * speed;
    const velocityY = (dy / distance) * speed;

    if (distance > 8) {
      this.body.setVelocity(velocityX, velocityY);
    } else {
      this.body.setVelocity(0, 0);
    }

    this.sprite.rotation = Math.atan2(dy, dx);

    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer = Math.max(0, this.hitFlashTimer - deltaMs);
      this.sprite.setFillStyle(this.definition.color, this.hitFlashTimer > 0 ? 1 : 0.9);
    }
  }

  public applyDamage(amount: number): boolean {
    this.health -= amount;
    this.hitFlashTimer = 120;
    this.sprite.setFillStyle(0xffffff, 0.9);

    return this.health <= 0;
  }
}
