import type { UpgradeDefinition } from '../data/upgrades';

export class ProgressionManager {
  public xp = 0;
  public level = 1;
  public xpToNext = 40;
  public kills = 0;
  public chosenUpgrades: string[] = [];

  public gainXp(amount: number): number {
    this.xp += amount;

    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level += 1;
      this.xpToNext = Math.round(this.xpToNext * 1.25);
      return this.level;
    }

    return this.level;
  }

  public applyUpgrade(upgrade: UpgradeDefinition): void {
    this.chosenUpgrades.push(upgrade.id);
  }
}
