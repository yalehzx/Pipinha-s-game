import Phaser from 'phaser';
import { AudioManager } from '../managers/AudioManager';
import { SaveManager } from '../managers/SaveManager';

export class SettingsScene extends Phaser.Scene {
  private audio = AudioManager.getInstance();

  constructor() {
    super('SettingsScene');
  }

  create(): void {
    const { width, height } = this.scale;
    this.audio.setVolume(new SaveManager().load().masterVolume);

    this.add.rectangle(width / 2, height / 2, 560, 360, 0x0c1326, 0.92);

    this.add.text(width / 2, height / 2 - 120, 'CONFIGURAÇÕES', {
      fontFamily: 'Trebuchet MS',
      fontSize: '30px',
      color: '#f7f7ff',
    }).setOrigin(0.5);

    const volumeText = this.add.text(width / 2, height / 2 - 40, `VOLUME: ${(this.audio.getVolume() * 100).toFixed(0)}%`, {
      fontFamily: 'Trebuchet MS',
      fontSize: '22px',
      color: '#dfe9ff',
    }).setOrigin(0.5);

    const increaseButton = this.add.text(width / 2, height / 2 + 20, 'AUMENTAR', {
      fontFamily: 'Trebuchet MS',
      fontSize: '22px',
      color: '#dfe9ff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const decreaseButton = this.add.text(width / 2, height / 2 + 70, 'DIMINUIR', {
      fontFamily: 'Trebuchet MS',
      fontSize: '22px',
      color: '#dfe9ff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const muteButton = this.add.text(width / 2, height / 2 + 120, this.audio.isMuted() ? 'DESMUTAR' : 'MUTAR', {
      fontFamily: 'Trebuchet MS',
      fontSize: '22px',
      color: '#dfe9ff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const backButton = this.add.text(width / 2, height / 2 + 170, 'VOLTAR', {
      fontFamily: 'Trebuchet MS',
      fontSize: '22px',
      color: '#dfe9ff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    increaseButton.on('pointerdown', () => {
      this.audio.setVolume(this.audio.getVolume() + 0.1);
      new SaveManager().save({ masterVolume: this.audio.getVolume() });
      this.audio.playUiClick();
      volumeText.setText(`VOLUME: ${(this.audio.getVolume() * 100).toFixed(0)}%`);
    });

    decreaseButton.on('pointerdown', () => {
      this.audio.setVolume(this.audio.getVolume() - 0.1);
      new SaveManager().save({ masterVolume: this.audio.getVolume() });
      this.audio.playUiClick();
      volumeText.setText(`VOLUME: ${(this.audio.getVolume() * 100).toFixed(0)}%`);
    });

    muteButton.on('pointerdown', () => {
      this.audio.toggleMute();
      this.audio.playUiClick();
      muteButton.setText(this.audio.isMuted() ? 'DESMUTAR' : 'MUTAR');
      volumeText.setText(`VOLUME: ${(this.audio.getVolume() * 100).toFixed(0)}%`);
    });

    backButton.on('pointerdown', () => {
      this.audio.playUiClick();
      this.scene.start('MainMenuScene');
    });
  }
}
