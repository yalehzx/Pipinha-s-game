import Phaser from 'phaser';
import type { UpgradeDefinition } from '../data/upgrades';
import { getWeaponById, type WeaponId } from '../data/weapons';

export interface PlayerControls {
  W: Phaser.Input.Keyboard.Key;
  A: Phaser.Input.Keyboard.Key;
  S: Phaser.Input.Keyboard.Key;
  D: Phaser.Input.Keyboard.Key;
  Shift: Phaser.Input.Keyboard.Key;
  Space: Phaser.Input.Keyboard.Key;
}

export class Player {
  public readonly sprite: Phaser.GameObjects.Rectangle;
  public readonly barrel: Phaser.GameObjects.Rectangle;
  public readonly body: Phaser.Physics.Arcade.Body;

  public maxHealth = 100;
  public health = this.maxHealth;
  public currentWeaponId: WeaponId = 'pistol';
  public damageMultiplier = 1;
  public moveSpeedMultiplier = 1;
  public projectileSpeedMultiplier = 1;
  public fireRateMultiplier = 1;
  public projectileRangeMultiplier = 1;
  public dashCooldownMultiplier = 1;
  public extraShots = 0;
  public critChance = 0;
  public critDamageMultiplier = 1;
  public pierce = 0;

  private readonly controls: PlayerControls;
  private dashTimer = 0;
  private dashCooldown = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    controls: PlayerControls,
  ) {
    this.controls = controls;

    this.sprite = scene.add.rectangle(x, y, 30, 30, 0x7ad7ff);
    this.barrel = scene.add.rectangle(x + 18, y, 18, 6, 0xffd166);
    this.sprite.setDepth(20);
    this.barrel.setDepth(21);

    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);
    this.body.setMaxVelocity(260);
    this.body.setDrag(1000);
    this.body.setSize(26, 26);
  }

  public update(pointer: Phaser.Input.Pointer, deltaMs: number): void {
    const moveX = (this.controls.D.isDown ? 1 : 0) - (this.controls.A.isDown ? 1 : 0);
    const moveY = (this.controls.S.isDown ? 1 : 0) - (this.controls.W.isDown ? 1 : 0);

    if (this.dashTimer > 0) {
      this.dashTimer -= deltaMs;
    }

    if (this.dashCooldown > 0) {
      this.dashCooldown -= deltaMs;
    }

    const dashTriggered =
      Phaser.Input.Keyboard.JustDown(this.controls.Shift) ||
      Phaser.Input.Keyboard.JustDown(this.controls.Space);

    if (dashTriggered && this.dashCooldown <= 0) {
      const dashStrength = 520;
      const angle = this.getAimAngle(pointer);
      const dashVectorX = Math.cos(angle) * dashStrength;
      const dashVectorY = Math.sin(angle) * dashStrength;
      this.body.setVelocity(dashVectorX, dashVectorY);
      this.dashTimer = 120;
      this.dashCooldown = 650 * this.dashCooldownMultiplier;
    }

    if (this.dashTimer > 0) {
      const angle = this.getAimAngle(pointer);
      this.sprite.rotation = angle;
      this.barrel.rotation = angle;
      this.barrel.x = this.sprite.x + Math.cos(angle) * 18;
      this.barrel.y = this.sprite.y + Math.sin(angle) * 18;
      return;
    }

    const speed = 200 * this.moveSpeedMultiplier;
    const magnitude = Math.hypot(moveX, moveY) || 1;
    const velocityX = (moveX / magnitude) * speed;
    const velocityY = (moveY / magnitude) * speed;

    if (moveX !== 0 || moveY !== 0) {
      this.body.setVelocity(velocityX, velocityY);
    } else {
      this.body.setVelocity(0, 0);
    }

    const angle = this.getAimAngle(pointer);
    this.sprite.rotation = angle;
    this.barrel.rotation = angle;
    this.barrel.x = this.sprite.x + Math.cos(angle) * 18;
    this.barrel.y = this.sprite.y + Math.sin(angle) * 18;
  }

  public setWeapon(weaponId: WeaponId): void {
    this.currentWeaponId = weaponId;
  }

  public getCurrentWeapon() {
    return getWeaponById(this.currentWeaponId);
  }

  public applyUpgrade(upgrade: UpgradeDefinition): void {
    switch (upgrade.type) {
      case 'damage':
        this.damageMultiplier *= 1 + upgrade.value;
        break;
      case 'moveSpeed':
        this.moveSpeedMultiplier *= 1 + upgrade.value;
        break;
      case 'projectileSpeed':
        this.projectileSpeedMultiplier *= 1 + upgrade.value;
        break;
      case 'fireRate':
        this.fireRateMultiplier *= 1 - upgrade.value;
        break;
      case 'extraShot':
        this.extraShots += Math.round(upgrade.value);
        break;
      case 'maxHealth':
        this.maxHealth = Math.round(this.maxHealth * (1 + upgrade.value));
        this.health = Math.min(this.maxHealth, this.health + Math.round(this.maxHealth * upgrade.value));
        break;
      case 'heal':
        this.health = Math.min(this.maxHealth, this.health + upgrade.value);
        break;
      case 'critChance':
        this.critChance += upgrade.value;
        break;
      case 'critDamage':
        this.critDamageMultiplier *= 1 + upgrade.value;
        break;
      case 'pierce':
        this.pierce += Math.round(upgrade.value);
        break;
      case 'dashCooldown':
        this.dashCooldownMultiplier *= 1 - upgrade.value;
        break;
      case 'range':
        this.projectileRangeMultiplier *= 1 + upgrade.value;
        break;
      default:
        break;
    }
  }

  public getAimAngle(pointer: Phaser.Input.Pointer): number {
    return Phaser.Math.Angle.Between(
      this.sprite.x,
      this.sprite.y,
      pointer.worldX,
      pointer.worldY,
    );
  }

  public getBarrelPosition(): { x: number; y: number } {
    return {
      x: this.barrel.x,
      y: this.barrel.y,
    };
  }
}
