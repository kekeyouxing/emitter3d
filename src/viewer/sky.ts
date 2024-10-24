import * as THREE from 'three';
import { StarrySkyShader } from './aux/StarrySkyShader';

let skyDomeRadius: number = 500.01;
let sphereMaterial: THREE.ShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    skyRadius: { value: skyDomeRadius },
    env_c1: { value: new THREE.Color('#0d1a2f') },
    env_c2: { value: new THREE.Color('#0f8682') },
    noiseOffset: { value: new THREE.Vector3(100.01, 100.01, 100.01) },
    starSize: { value: 0.01 },
    starDensity: { value: 0.09 },
    clusterStrength: { value: 0.2 },
    clusterSize: { value: 0.2 },
  },
  vertexShader: StarrySkyShader.vertexShader,
  fragmentShader: StarrySkyShader.fragmentShader,
  side: THREE.DoubleSide,
});

let sphereGeometry: THREE.SphereGeometry = new THREE.SphereGeometry(skyDomeRadius, 20, 20);
let skyDome: THREE.Mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

export { skyDome };