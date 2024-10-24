import * as THREE from 'three';

class SoundHandler {
  listener: THREE.AudioListener;
  audioLoader: THREE.AudioLoader;
  crackle: AudioBuffer[];
  boom: AudioBuffer[];
  boomCounter: number;

  constructor() {
    this.listener = new THREE.AudioListener();
    this.audioLoader = new THREE.AudioLoader();
    this.crackle = [];
    this.boom = [];
    this.boomCounter = 0;
    this.Init();
  }

  Init(): void {
    const self = this;

    this.audioLoader.load('sounds/boom.mp3', function(buffer: AudioBuffer) {
      self.boom.push(buffer);
    });

    this.audioLoader.load('sounds/crackle.mp3', function(buffer: AudioBuffer) {
      self.crackle.push(buffer);
    });
  }

  PlayCrackle(volume: number): void {
    const buffer = this.crackle[0];
    this.Play(buffer, volume);
  }

  PlayBoom(volume: number): void {
    this.boomCounter++;
    if (this.boomCounter % 2 === 0) {
      const buffer = this.boom[0];
      this.Play(buffer, volume);
    }
  }

  Play(buffer: AudioBuffer, volume: number): void {
    const sound = new THREE.Audio(this.listener);
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(volume);
    sound.play();
  }
}

export { SoundHandler };