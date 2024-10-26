import * as THREE from 'three';

class SoundHandler {
  listener: THREE.AudioListener;
  audioLoader: THREE.AudioLoader;
  crackle: AudioBuffer[];
  boom: AudioBuffer[];
  background: AudioBuffer[];

  constructor() {
    this.listener = new THREE.AudioListener();
    this.audioLoader = new THREE.AudioLoader();
    this.crackle = [];
    this.boom = [];
    this.background = [];
    this.Init();
  }

  //
  Init(): void {
    const self = this;

    this.audioLoader.load('sounds/heaven.mp3', function(buffer: AudioBuffer) {
      self.background.push(buffer);
    });
  }

  PlayBackground(volume: number): void {
    const buffer = this.background[0];
    this.Play(buffer, volume, true);
  }

  Play(buffer: AudioBuffer, volume: number, loop: boolean = false): void {
    const sound = new THREE.Audio(this.listener);
    sound.setBuffer(buffer);
    sound.setLoop(loop);
    sound.setVolume(volume);
    sound.play();
  }
}

export { SoundHandler };