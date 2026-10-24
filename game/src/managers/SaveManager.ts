export interface SaveData {
  saveVersion: number;
  highScore: number;
  bestLevel: number;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
}

const STORAGE_KEY = 'pipinhas-game-save';

export class SaveManager {
  private static readonly defaultState: SaveData = {
    saveVersion: 1,
    highScore: 0,
    bestLevel: 1,
    masterVolume: 0.8,
    musicVolume: 0.8,
    sfxVolume: 0.8,
  };

  public load(): SaveData {
    const rawValue = localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return { ...SaveManager.defaultState };
    }

    try {
      const parsed = JSON.parse(rawValue) as Partial<SaveData>;
      return {
        ...SaveManager.defaultState,
        ...parsed,
      };
    } catch {
      return { ...SaveManager.defaultState };
    }
  }

  public save(data: Partial<SaveData>): void {
    const current = this.load();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...data }));
  }
}
