import Phaser from 'phaser';
import { AudioManager } from '../managers/AudioManager';
import { SaveManager } from '../managers/SaveManager';

export class MainMenuScene extends Phaser.Scene {
  private audio = AudioManager.getInstance();
  private readonly saveManager = new SaveManager();

  constructor() {
    super('MainMenuScene');
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x0b1021, 0.9);

    const title = this.add.text(width / 2, height / 2 - 140, 'PIPINHA\'S GAME', {
      fontFamily: 'Trebuchet MS',
      fontSize: '48px',
      color: '#f6f1ff',
      stroke: '#1d1f36',
      strokeThickness: 6,
    });
    title.setOrigin(0.5);

    const saveState = this.saveManager.load();
    this.add.text(width / 2, height / 2 - 90, `Melhor pontuação: ${saveState.highScore} | Melhor nível: ${saveState.bestLevel}`, {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#ffd166',
    }).setOrigin(0.5);

    const playButton = this.add.text(width / 2, height / 2, 'JOGAR', {
      fontFamily: 'Trebuchet MS',
      fontSize: '28px',
      color: '#dfe9ff',
      backgroundColor: '#1e2a4a',
      padding: { x: 18, y: 10 },
    });
    playButton.setOrigin(0.5);
    playButton.setInteractive({ useHandCursor: true });
    playButton.on('pointerover', () => {
      playButton.setStyle({ color: '#ffd166' });
    });
    playButton.on('pointerout', () => {
      playButton.setStyle({ color: '#dfe9ff' });
    });
    playButton.on('pointerdown', () => {
      this.audio.playUiClick();
      this.scene.start('GameScene');
    });

    const continueButton = this.add.text(width / 2, height / 2 + 70, 'CONTINUAR', {
      fontFamily: 'Trebuchet MS',
      fontSize: '22px',
      color: '#dfe9ff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    continueButton.on('pointerdown', () => {
      this.audio.playUiClick();
      this.scene.start('GameScene');
    });

    const settingsButton = this.add.text(width / 2, height / 2 + 120, 'CONFIGURAÇÕES', {
      fontFamily: 'Trebuchet MS',
      fontSize: '22px',
      color: '#dfe9ff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    settingsButton.on('pointerdown', () => {
      this.audio.playUiClick();
      this.scene.start('SettingsScene');
    });

    const creditsButton = this.add.text(width / 2, height / 2 + 170, 'CRÉDITOS', {
      fontFamily: 'Trebuchet MS',
      fontSize: '22px',
      color: '#dfe9ff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    creditsButton.on('pointerdown', () => {
      this.audio.playUiClick();
      this.add.text(width / 2, height / 2 + 220, 'Jogo feito em Phaser + TypeScript', {
        fontFamily: 'Trebuchet MS',
        fontSize: '18px',
        color: '#ffd166',
      }).setOrigin(0.5);
    });
  }
}
