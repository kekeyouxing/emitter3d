import * as THREE from 'three';

function createMaterial(gu: any): THREE.PointsMaterial {
  let material = new THREE.PointsMaterial({
    size: 0.125,
    transparent: true,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  material.onBeforeCompile = shader => {
    shader.uniforms.time = gu.time;
    shader.vertexShader = `
      uniform float time;
      attribute float sizes;
      attribute vec4 shift;
      varying vec3 vColor;
      ${shader.vertexShader}
    `.replace(
      `gl_PointSize = size;`,
      `gl_PointSize = size * sizes;`,
    ).replace(
      `#include <color_vertex>`,
      `#include <color_vertex>
        float d = length(abs(position) / vec3(40., 30., 40));
        d = clamp(d, 0., 1.);
        vColor = mix(vec3(255., 255., 255.), vec3(255., 255., 255.), d) / 255.;
      `,
    ).replace(
      `#include <begin_vertex>`,
      `#include <begin_vertex>
        float t = time;
        float moveT = mod(shift.x + shift.z * t, PI2);
        float moveS = mod(shift.y + shift.z * t, PI2);
        transformed += vec3(cos(moveS) * sin(moveT), cos(moveT), sin(moveS) * sin(moveT)) * shift.w;
      `,
    );
    shader.fragmentShader = `
      varying vec3 vColor;
      ${shader.fragmentShader}
    `.replace(
      `#include <clipping_planes_fragment>`,
      `#include <clipping_planes_fragment>
        float d = length(gl_PointCoord.xy - 0.5);
        //if (d > 0.5) discard;
      `,
    ).replace(
      `vec4 diffuseColor = vec4( diffuse, opacity );`,
      `
        float a = length(gl_PointCoord.xy - 0.5);
        vec4 diffuseColor = vec4( vColor, smoothstep(0.5, 0.1, a)/* * 0.5 + 0.5*/ );
        `,
    );
  };
  return material;
}

export { createMaterial };