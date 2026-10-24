import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/gameConfig';
import { ENEMY_FAMILIES, type EnemyFamily } from '../data/enemies';
import { ROOM_DEFS, type RoomType } from '../data/rooms';
import { getRandomUpgradePool } from '../data/upgrades';
import { WEAPON_DEFS, WEAPON_ORDER, type WeaponId } from '../data/weapons';
import { Boss } from '../entities/Boss';
import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';
import type { PlayerControls } from '../entities/Player';
import { EffectManager } from '../managers/EffectManager';
import { ProgressionManager } from '../managers/ProgressionManager';
import { SaveManager } from '../managers/SaveManager';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private progression!: ProgressionManager;
  private effects!: EffectManager;
  private boss!: Boss | null;
  private roomIndex = 0;
  private projectiles: Phaser.Physics.Arcade.Image[] = [];
  private enemyProjectiles: Phaser.Physics.Arcade.Image[] = [];
  private eliteBursts: Phaser.GameObjects.Arc[] = [];
  private enemies: Enemy[] = [];
  private loot: Phaser.GameObjects.Rectangle[] = [];
  private shotCooldown = 0;
  private spawnCooldown = 0;
  private playerDamageCooldown = 0;
  private isPausedForUpgrade = false;
  private roomLabel!: Phaser.GameObjects.Text;
  private roomRewardItem: Phaser.GameObjects.Rectangle | null = null;
  private totalDamageDealt = 0;
  private survivalMs = 0;
  private readonly saveManager = new SaveManager();

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#131a2d');
    this.cameras.main.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const keyboard = this.input.keyboard;
    if (!keyboard) {
      throw new Error('Keyboard input is not available.');
    }

    const controls: PlayerControls = {
      W: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      Shift: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
      Space: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };

    this.registry.set('kills', 0);
    this.registry.set('damageDealt', 0);
    this.registry.set('survivalMs', 0);
    this.survivalMs = 0;
    this.player = new Player(this, GAME_WIDTH / 2, GAME_HEIGHT / 2, controls);
    this.player.setWeapon('pistol');
    this.progression = new ProgressionManager();
    this.effects = new EffectManager(this);
    this.emitHudState();
    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);
    this.cameras.main.setDeadzone(80, 80);
    this.scene.launch('UIScene');
    this.input.mouse?.disableContextMenu();

    this.roomLabel = this.add.text(20, 20, 'Sala: combate', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#f7f7ff',
      backgroundColor: '#10192f',
      padding: { x: 8, y: 6 },
    }).setScrollFactor(0);
    this.roomLabel.setDepth(90);

    this.loadRoom();
  }

  update(_time: number, delta: number): void {
    if (this.isPausedForUpgrade) {
      return;
    }

    if (this.player.health <= 0) {
      this.registry.set('kills', this.progression.kills);
      this.registry.set('damageDealt', this.totalDamageDealt);
      this.registry.set('survivalMs', this.survivalMs);

      const saveState = this.saveManager.load();
      const score = Math.max(saveState.highScore, this.progression.kills * 18 + Math.round(this.totalDamageDealt / 6));
      this.saveManager.save({
        highScore: score,
        bestLevel: Math.max(saveState.bestLevel, this.progression.level),
      });

      this.scene.pause('GameScene');
      this.scene.launch('GameOverScene');
      return;
    }

    if (this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).isDown) {
      this.scene.pause('GameScene');
      this.scene.launch('PauseScene');
    }

    this.survivalMs += delta;
    this.registry.set('survivalMs', this.survivalMs);

    this.player.update(this.input.activePointer, delta);

    this.shotCooldown = Math.max(0, this.shotCooldown - delta);
    this.spawnCooldown = Math.max(0, this.spawnCooldown - delta);
    this.playerDamageCooldown = Math.max(0, this.playerDamageCooldown - delta);

    if (this.input.activePointer.isDown && this.shotCooldown <= 0) {
      this.shoot();
    }

    if (this.boss) {
      this.updateBoss(delta);
    } else if (this.spawnCooldown <= 0 && this.enemies.length < 8) {
      this.spawnEnemy(this.getRandomEnemyFamily());
      this.spawnCooldown = 1400;
    }

    this.updateProjectiles();
    this.updateLoot();
    this.updateRoomReward();
    this.updateEnemies(delta);
    this.resolvePlayerDamage();
    this.emitHudState();
  }

  private loadRoom(): void {
    const room = ROOM_DEFS[Math.min(this.roomIndex, ROOM_DEFS.length - 1)];
    if (!room) {
      return;
    }

    this.enemies.forEach((enemy) => enemy.sprite.destroy());
    this.enemies = [];
    this.enemyProjectiles.forEach((projectile) => projectile.destroy());
    this.enemyProjectiles = [];

    if (this.roomLabel) {
      this.roomLabel.setText(`Sala: ${room.label}`);
    }

    this.roomRewardItem = null;

    if (room.type === 'reward') {
      this.spawnRewardChest();
      return;
    }

    if (room.type === 'shop') {
      this.showShopScreen();
      return;
    }

    if (room.type === 'rest') {
      const healAmount = 35;
      this.player.health = Math.min(this.player.maxHealth, this.player.health + healAmount);
      this.effects.spawnDamageText(this.player.sprite.x, this.player.sprite.y - 30, healAmount, '#7ae582');
      this.roomIndex += 1;
      this.loadRoom();
      return;
    }

    if (room.type === 'event') {
      for (let index = 0; index < room.enemyCount + 2; index += 1) {
        const family = this.pickEnemyForRoom(room.type, room.enemyBias);
        this.spawnEnemy(family);
      }
    }

    if (room.type === 'boss') {
      this.boss = new Boss(this, GAME_WIDTH / 2, 120);
      return;
    }

    this.boss = null;
    for (let index = 0; index < room.enemyCount; index += 1) {
      const family = this.pickEnemyForRoom(room.type, room.enemyBias);
      this.spawnEnemy(family);
    }
  }

  private pickEnemyForRoom(roomType: RoomType, bias: string[]): EnemyFamily {
    const roll = Phaser.Math.FloatBetween(0, 1);
    if (roomType === 'elite' && roll < 0.7) {
      return 'elite';
    }

    if (roomType === 'boss') {
      return 'tank';
    }

    if (bias.length > 0) {
      return bias[Phaser.Math.Between(0, bias.length - 1)] as EnemyFamily;
    }

    return this.getRandomEnemyFamily();
  }

  private updateBoss(delta: number): void {
    if (!this.boss) {
      return;
    }

    this.boss.update(this.player.sprite.x, this.player.sprite.y, delta);
    const distanceToPlayer = Phaser.Math.Distance.Between(
      this.boss.sprite.x,
      this.boss.sprite.y,
      this.player.sprite.x,
      this.player.sprite.y,
    );

    if (this.boss.hasWarning()) {
      const warningRadius = this.boss.getWarningRadius();
      if (distanceToPlayer <= warningRadius + 12) {
        this.player.health = Math.max(0, this.player.health - (this.boss.phase === 1 ? 12 : 18));
        this.effects.spawnDamageText(this.player.sprite.x, this.player.sprite.y - 24, this.boss.phase === 1 ? 12 : 18, '#ff6b6b');
        this.boss.consumeWarning();
      }
    }

    if (distanceToPlayer < 34) {
      this.player.health = Math.max(0, this.player.health - this.boss.phase * 0.12 * delta);
    }

    if (this.boss.health <= 0) {
      this.boss.sprite.destroy();
      this.boss = null;
      this.roomIndex += 1;
      this.loadRoom();
    }
  }

  private shoot(): void {
    const weapon = WEAPON_DEFS[this.player.currentWeaponId];
    const angle = this.player.getAimAngle(this.input.activePointer);
    const origin = this.player.getBarrelPosition();

    const shotCount = weapon.pelletCount + this.player.extraShots;
    for (let shot = 0; shot < shotCount; shot += 1) {
      const offset = (shotCount > 1 ? (shot - (shotCount - 1) / 2) : 0) * weapon.spread;
      const bulletAngle = angle + offset;
      const projectile = this.physics.add.image(origin.x, origin.y, 'placeholder-projectile');
      projectile.setDepth(15);
      projectile.setCircle(5);
      projectile.setTint(weapon.color);
      const damage = weapon.damage * this.player.damageMultiplier;
      const projectileSpeed = weapon.projectileSpeed * this.player.projectileSpeedMultiplier;
      const range = weapon.range * this.player.projectileRangeMultiplier;
      projectile.setData('damage', damage);
      projectile.setData('range', range);
      projectile.setData('originX', origin.x);
      projectile.setData('originY', origin.y);
      projectile.setVelocity(
        Math.cos(bulletAngle) * projectileSpeed,
        Math.sin(bulletAngle) * projectileSpeed,
      );
      projectile.body.setAllowGravity(false);
      projectile.body.setSize(10, 10);
      this.projectiles.push(projectile);
    }

    this.effects.spawnMuzzleFlash(origin.x, origin.y, weapon.color);
    this.shotCooldown = weapon.fireRate * this.player.fireRateMultiplier;
  }

  private updateProjectiles(): void {
    for (const projectile of [...this.projectiles]) {
      const originX = Number(projectile.getData('originX')) ?? projectile.x;
      const originY = Number(projectile.getData('originY')) ?? projectile.y;
      const range = Number(projectile.getData('range')) ?? 500;
      const travelled = Phaser.Math.Distance.Between(projectile.x, projectile.y, originX, originY);

      if (travelled > range) {
        projectile.destroy();
        this.projectiles = this.projectiles.filter((item) => item !== projectile);
        continue;
      }

      if (this.boss) {
        const bossDistance = Phaser.Math.Distance.Between(
          projectile.x,
          projectile.y,
          this.boss.sprite.x,
          this.boss.sprite.y,
        );

        if (bossDistance <= 30) {
          const projectiledDamage = Number(projectile.getData('damage')) || WEAPON_DEFS.pistol.damage;
          this.totalDamageDealt += projectiledDamage;
          const shouldDie = this.boss.applyDamage(projectiledDamage);
          this.effects.spawnImpact(projectile.x, projectile.y, 0xffd166, 12);
          this.effects.spawnDamageText(this.boss.sprite.x, this.boss.sprite.y - 30, projectiledDamage, '#ffd166');
          this.effects.shake(6, 90);
          projectile.destroy();
          this.projectiles = this.projectiles.filter((item) => item !== projectile);
          if (shouldDie) {
            this.totalDamageDealt += projectiledDamage;
            this.effects.spawnImpact(this.boss.sprite.x, this.boss.sprite.y, 0xffdd8a, 20);
            this.effects.shake(12, 180);
            this.boss = null;
            this.roomIndex += 1;
            this.loadRoom();
          }
          continue;
        }
      }

      for (const enemy of [...this.enemies]) {
        const enemyDistance = Phaser.Math.Distance.Between(
          projectile.x,
          projectile.y,
          enemy.sprite.x,
          enemy.sprite.y,
        );

        const hitRange = (projectile.width + enemy.sprite.width) / 2;
        if (enemyDistance <= hitRange) {
          const projectiledDamage = Number(projectile.getData('damage')) || WEAPON_DEFS.pistol.damage;
          this.totalDamageDealt += projectiledDamage;
          const shouldDie = enemy.applyDamage(projectiledDamage);
          this.effects.spawnImpact(projectile.x, projectile.y, enemy.definition.color, 9);
          this.effects.spawnDamageText(enemy.sprite.x, enemy.sprite.y - 18, projectiledDamage, '#ffd166');
          projectile.destroy();
          this.projectiles = this.projectiles.filter((item) => item !== projectile);

          if (shouldDie) {
            this.totalDamageDealt += projectiledDamage;
            this.effects.spawnImpact(enemy.sprite.x, enemy.sprite.y, enemy.definition.color, 18);
            this.effects.shake(8, 120);
            this.destroyEnemy(enemy);
          }
          break;
        }
      }
    }

    for (const projectile of [...this.enemyProjectiles]) {
      const originX = Number(projectile.getData('originX')) ?? projectile.x;
      const originY = Number(projectile.getData('originY')) ?? projectile.y;
      const range = Number(projectile.getData('range')) ?? 350;
      const travelled = Phaser.Math.Distance.Between(projectile.x, projectile.y, originX, originY);

      if (travelled > range) {
        projectile.destroy();
        this.enemyProjectiles = this.enemyProjectiles.filter((item) => item !== projectile);
        continue;
      }

      const distanceToPlayer = Phaser.Math.Distance.Between(
        projectile.x,
        projectile.y,
        this.player.sprite.x,
        this.player.sprite.y,
      );

      if (distanceToPlayer <= 18) {
        const damage = Number(projectile.getData('damage')) || 8;
        this.player.health = Math.max(0, this.player.health - damage);
        this.effects.spawnDamageText(this.player.sprite.x, this.player.sprite.y - 24, damage, '#ff6b6b');
        projectile.destroy();
        this.enemyProjectiles = this.enemyProjectiles.filter((item) => item !== projectile);
      }
    }
  }

  private updateEnemies(delta: number): void {
    for (const enemy of [...this.enemies]) {
      enemy.update(this.player.sprite.x, this.player.sprite.y, delta);

      if (enemy.sprite.active && enemy.sprite.visible) {
        const distanceToPlayer = Phaser.Math.Distance.Between(
          enemy.sprite.x,
          enemy.sprite.y,
          this.player.sprite.x,
          this.player.sprite.y,
        );

        if (distanceToPlayer < 24) {
          const dealtDamage = enemy.definition.damage * (delta / 1000);
          this.player.health = Math.max(0, this.player.health - dealtDamage);
          if (dealtDamage > 0) {
            this.effects.spawnDamageText(this.player.sprite.x, this.player.sprite.y - 24, dealtDamage, '#ff6b6b');
          }
        }

        if (enemy.definition.family === 'ranged' && distanceToPlayer <= 260 && enemy.attackCooldown <= 0) {
          const projectile = this.physics.add.image(enemy.sprite.x, enemy.sprite.y, 'placeholder-projectile');
          projectile.setDepth(12);
          projectile.setCircle(5);
          projectile.setTint(0xffa94d);
          projectile.setData('damage', enemy.definition.damage * 0.7);
          projectile.setData('originX', enemy.sprite.x);
          projectile.setData('originY', enemy.sprite.y);
          projectile.setData('range', 300);

          const angle = Phaser.Math.Angle.Between(enemy.sprite.x, enemy.sprite.y, this.player.sprite.x, this.player.sprite.y);
          projectile.setVelocity(Math.cos(angle) * 220, Math.sin(angle) * 220);
          this.enemyProjectiles.push(projectile);
          enemy.attackCooldown = 1400;
        }

        if (enemy.definition.family === 'elite' && distanceToPlayer <= 220 && enemy.attackCooldown <= 0) {
          const burst = this.add.circle(enemy.sprite.x, enemy.sprite.y, 18, 0xf72585, 0.2);
          burst.setDepth(11);
          this.eliteBursts.push(burst);

          this.tweens.add({
            targets: burst,
            radius: 82,
            alpha: { from: 0.5, to: 0 },
            duration: 420,
            onComplete: () => {
              const burstRadius = Phaser.Math.Distance.Between(burst.x, burst.y, this.player.sprite.x, this.player.sprite.y);
              if (burstRadius <= 80) {
                const damage = enemy.definition.damage + 10;
                this.player.health = Math.max(0, this.player.health - damage);
                this.effects.spawnDamageText(this.player.sprite.x, this.player.sprite.y - 24, damage, '#ff6b6b');
              }
              burst.destroy();
              this.eliteBursts = this.eliteBursts.filter((item) => item !== burst);
            },
          });

          enemy.attackCooldown = 1800;
        }
      }
    }
  }

  private resolvePlayerDamage(): void {
    if (this.playerDamageCooldown > 0) {
      return;
    }

    if (this.boss) {
      const bossDistance = Phaser.Math.Distance.Between(
        this.boss.sprite.x,
        this.boss.sprite.y,
        this.player.sprite.x,
        this.player.sprite.y,
      );

      if (bossDistance <= 48) {
        this.player.health = Math.max(0, this.player.health - 18);
        this.effects.spawnDamageText(this.player.sprite.x, this.player.sprite.y - 24, 18, '#ff6b6b');
        this.effects.shake(10, 120);
        this.playerDamageCooldown = 700;
        return;
      }
    }

    for (const enemy of this.enemies) {
      const distance = Phaser.Math.Distance.Between(
        enemy.sprite.x,
        enemy.sprite.y,
        this.player.sprite.x,
        this.player.sprite.y,
      );

      if (distance <= enemy.sprite.width * 0.8) {
        this.player.health = Math.max(0, this.player.health - enemy.definition.damage);
        this.effects.spawnDamageText(this.player.sprite.x, this.player.sprite.y - 24, enemy.definition.damage, '#ff6b6b');
        this.effects.shake(7, 90);
        this.playerDamageCooldown = 700;
        break;
      }
    }
  }

  private destroyEnemy(enemy: Enemy): void {
    enemy.sprite.destroy();
    this.enemies = this.enemies.filter((current) => current !== enemy);
    this.tryDropLoot(enemy.sprite.x, enemy.sprite.y);

    const previousLevel = this.progression.level;
    this.progression.kills += 1;
    this.registry.set('kills', this.progression.kills);
    const currentLevel = this.progression.gainXp(enemy.xpReward);
    if (currentLevel > previousLevel) {
      this.showUpgradeScreen();
    }
    this.emitHudState();
  }

  private tryDropLoot(x: number, y: number): void {
    if (Math.random() > 0.18) {
      return;
    }

    const availableWeapons = WEAPON_ORDER.filter((weaponId) => weaponId !== this.player.currentWeaponId);
    const weaponId = availableWeapons[Phaser.Math.Between(0, Math.max(availableWeapons.length - 1, 0))] ?? 'pistol';
    const weapon = WEAPON_DEFS[weaponId];

    const drop = this.add.rectangle(x, y, 18, 18, weapon.color);
    drop.setDepth(12);
    drop.setStrokeStyle(2, 0xffffff, 0.9);
    drop.setData('weaponId', weaponId);
    this.physics.add.existing(drop);
    this.loot.push(drop);
  }

  private updateLoot(): void {
    for (const item of [...this.loot]) {
      const distance = Phaser.Math.Distance.Between(
        item.x,
        item.y,
        this.player.sprite.x,
        this.player.sprite.y,
      );

      if (distance <= 30) {
        const weaponId = item.getData('weaponId') as WeaponId;
        if (weaponId) {
          this.player.setWeapon(weaponId);
        }
        item.destroy();
        this.loot = this.loot.filter((drop) => drop !== item);
      }
    }
  }

  private spawnRewardChest(): void {
    this.roomRewardItem = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 26, 26, 0xffd166);
    this.roomRewardItem.setDepth(12);
    this.roomRewardItem.setStrokeStyle(2, 0xffffff, 0.9);
    this.physics.add.existing(this.roomRewardItem);
    this.roomRewardItem.setData('reward', 'weapon');
  }

  private updateRoomReward(): void {
    if (!this.roomRewardItem) {
      return;
    }

    const distance = Phaser.Math.Distance.Between(
      this.roomRewardItem.x,
      this.roomRewardItem.y,
      this.player.sprite.x,
      this.player.sprite.y,
    );

    if (distance <= 32) {
      const rewardWeapon = WEAPON_ORDER[Phaser.Math.Between(0, WEAPON_ORDER.length - 1)];
      this.player.setWeapon(rewardWeapon);
      this.effects.spawnImpact(this.player.sprite.x, this.player.sprite.y, WEAPON_DEFS[rewardWeapon].color, 18);
      this.roomRewardItem.destroy();
      this.roomRewardItem = null;
      this.roomIndex += 1;
      this.loadRoom();
    }
  }

  private emitHudState(): void {
    this.game.events.emit('hud:update', {
      health: this.player.health,
      maxHealth: this.player.maxHealth,
      weaponName: WEAPON_DEFS[this.player.currentWeaponId].name,
      level: this.progression.level,
      xp: this.progression.xp,
      xpToNext: this.progression.xpToNext,
    });
  }

  private showUpgradeScreen(): void {
    this.showChoiceScreen('UPGRADE');
  }

  private showShopScreen(): void {
    this.showChoiceScreen('RELÍQUIA');
  }

  private showChoiceScreen(titleText: string): void {
    this.isPausedForUpgrade = true;

    const overlays = this.add.container(this.scale.width / 2, this.scale.height / 2);
    const background = this.add.rectangle(0, 0, 700, 380, 0x0b1220, 0.92);
    const title = this.add.text(0, -150, titleText, {
      color: '#f7f7ff',
      fontSize: '30px',
      fontFamily: 'Trebuchet MS',
    }).setOrigin(0.5);

    overlays.add([background, title]);
    const upgrades = getRandomUpgradePool(3);

    upgrades.forEach((upgrade, index) => {
      const option = this.add.container(-190 + index * 190, 20);
      const box = this.add.rectangle(0, 0, 160, 200, 0x1c2a46, 0.9);
      const label = this.add.text(0, -60, upgrade.name, {
        color: '#fff',
        fontSize: '18px',
        fontFamily: 'Trebuchet MS',
        align: 'center',
        wordWrap: { width: 130 },
      }).setOrigin(0.5);
      const rarity = this.add.text(0, 50, upgrade.rarity, {
        color: '#ffd166',
        fontSize: '16px',
        fontFamily: 'Trebuchet MS',
      }).setOrigin(0.5);
      const description = this.add.text(0, 80, upgrade.description, {
        color: '#dfe9ff',
        fontSize: '12px',
        fontFamily: 'Trebuchet MS',
        align: 'center',
        wordWrap: { width: 130 },
      }).setOrigin(0.5);

      box.setInteractive({ useHandCursor: true });
      box.on('pointerdown', () => {
        this.player.applyUpgrade(upgrade);
        this.progression.applyUpgrade(upgrade);
        this.isPausedForUpgrade = false;
        this.emitHudState();
        overlays.destroy(true);

        if (titleText === 'RELÍQUIA') {
          this.roomIndex += 1;
          this.loadRoom();
        }
      });

      option.add([box, label, rarity, description]);
      overlays.add(option);
    });
  }

  private spawnEnemy(family: EnemyFamily): void {
    const pad = 80;
    const side = Phaser.Math.Between(0, 3);
    let x = 0;
    let y = 0;

    switch (side) {
      case 0:
        x = Phaser.Math.Between(-60, GAME_WIDTH + 60);
        y = -pad;
        break;
      case 1:
        x = GAME_WIDTH + pad;
        y = Phaser.Math.Between(-60, GAME_HEIGHT + 60);
        break;
      case 2:
        x = Phaser.Math.Between(-60, GAME_WIDTH + 60);
        y = GAME_HEIGHT + pad;
        break;
      default:
        x = -pad;
        y = Phaser.Math.Between(-60, GAME_HEIGHT + 60);
        break;
    }

    const enemy = new Enemy(this, x, y, family);
    this.enemies.push(enemy);
  }

  private getRandomEnemyFamily(): EnemyFamily {
    return ENEMY_FAMILIES[Phaser.Math.Between(0, ENEMY_FAMILIES.length - 1)];
  }
}
