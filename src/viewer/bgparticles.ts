import THREE = require('three');

function createCylinderParticles(particleCount: number) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount); // Add sizes array
  const shift = [];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = Math.random() * 500 - 300; // x
    positions[i * 3 + 1] = Math.random() * 500 - 300; // y
    positions[i * 3 + 2] = Math.random() * 500 - 300; // z

    sizes[i] = 10 * Math.random() + 20;
    shift.push(
      Math.random() * Math.PI * 5,
      Math.random() * Math.PI * 2 * 5,
      (Math.random() * 0.9 + 0.1) * Math.PI * 0.1 * 5,
      Math.random() * 0.9 + 0.1 * 5,
    );
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('sizes', new THREE.BufferAttribute(sizes, 1)); // Add size attribute
  geometry.setAttribute('shift', new THREE.Float32BufferAttribute(shift, 4));
  return geometry;
}

const count = 5000;
const cylinderGeometry = createCylinderParticles(count);
export { cylinderGeometry };