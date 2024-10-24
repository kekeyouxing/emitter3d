import * as math from 'gl-matrix';
import { Easing } from './aux/easing';
import * as dgram from 'node:dgram';

// let Cd = 0.47; // 空气阻力系数 Cd 固定值 球体 Cd = 0.47
// let rho = 1.22; // 空气密度 ρ 固定值 标准大气压下 ρ = 1.22 kg/m^3
// let A = Math.PI / 10000; // 迎风面积 A = πr^2 r = 0.01m
const constantValue = 0.0000900238; // -0.5 * Cd * A * rho
// const gravity = -0.2; // 重力加速度 m/s^2
let dt = 0.0167; // 时间间隔 s
export class Particle {
  readonly id: number;
  readonly position = math.vec3.create();
  readonly rotation = math.quat.create();
  lifeTime = 0;
  speed = 0;
  opacity = 1;
  hue = 0;
  closed = false;
  vx = 0;
  vy = 0;
  vz = 0;
  gravity = -0.2;
  mass = 0.001;
  readonly initPosition = math.vec3.create();

  constructor(readonly behavior: Behavior) {
    this.id = Math.random();
  }

  setProperties(position: math.vec3, rotation: math.quat, speed: number, hue: number, vx: number = 0, vy: number = 0, vz: number = 0,
                gravity: number = -0.2, mass: number = 0.01): void {
    math.vec3.copy(this.position, position);
    math.quat.copy(this.rotation, rotation);
    this.speed = speed;
    this.hue = hue;
    this.vx = vx;
    this.vy = vy;
    this.vz = vz;
    this.gravity = gravity;
    this.mass = mass;
    //    math.vec3.set(Particle.tmpVec, x, y, z);
    //     math.vec3.transformQuat(Particle.tmpVec, Particle.tmpVec, this.rotation);
    //     math.vec3.add(this.position, this.position, Particle.tmpVec);
    math.vec3.copy(this.initPosition, position);
    math.vec3.add(this.initPosition, this.initPosition, [50, 0, 0]);
  }

  clone(behavior: Behavior): Particle {
    const p = new Particle(behavior);
    math.vec3.copy(p.position, this.position);
    math.quat.copy(p.rotation, this.rotation);
    p.speed = this.speed;
    p.hue = this.hue;
    p.vx = 0;
    p.vy = 0;
    p.vz = 0;
    p.gravity = this.gravity;
    p.mass = this.mass;
    return p;
  }

  private static readonly tmpVec = math.vec3.create();

  translate(x: number, y: number, z: number): this {
    math.vec3.set(Particle.tmpVec, x, y, z);
    math.vec3.transformQuat(Particle.tmpVec, Particle.tmpVec, this.rotation);
    math.vec3.add(this.position, this.position, Particle.tmpVec);
    return this;
  }

  private static readonly tmpQuat = math.quat.create();

  rotate(xdeg: number, ydeg: number, zdeg: number): this {
    math.quat.fromEuler(Particle.tmpQuat, xdeg, ydeg, zdeg);
    math.quat.mul(this.rotation, this.rotation, Particle.tmpQuat);
    return this;
  }

  private static readonly explodeTemVec = math.vec3.create();

  private static readonly textTemVec = math.vec3.create();

  // textExplode(endR: number, deltaR: number): this {
  //   if (math.vec3.distance(this.position, this.initPosition) === 0) {
  //     return this;
  //   }
  //   // if initPosition's distance to position is less than 5, then set position to initPosition
  //   if (math.vec3.distance(this.position, this.initPosition) < 5) {
  //     math.vec3.copy(this.position, this.initPosition);
  //     return this;
  //   }
  //   if (endR <= 0.6) {
  //     this.opacity = endR > 0.2 ? 0.8 : this.opacity;
  //     this.explode();
  //     return this;
  //   }
  //
  //   let targetX = this.initPosition[0];
  //   let targetY = this.initPosition[1];
  //   let targetZ = this.initPosition[2];
  //
  //   let currentX = this.position[0];
  //   let currentY = this.position[1];
  //   let currentZ = this.position[2];
  //
  //   let deltaX = (targetX - currentX) * deltaR * 10;
  //   let deltaY = (targetY - currentY) * deltaR * 10;
  //   let deltaZ = (targetZ - currentZ) * deltaR * 10;
  //   math.vec3.set(Particle.textTemVec, deltaX, deltaY, deltaZ);
  //   math.vec3.add(this.position, this.position, Particle.textTemVec);
  //   return this;
  // }

  // textExplode(): this {
  //   return thi
  // }

  explode(): this {
    let Fx = constantValue * this.vx * this.vx * this.vx / Math.abs(this.vx);
    let Fz = constantValue * this.vz * this.vz * this.vz / Math.abs(this.vz);
    let Fy = constantValue * this.vy * this.vy * this.vy / Math.abs(this.vy);

    Fx = isNaN(Fx) ? 0 : Fx;
    Fy = isNaN(Fy) ? 0 : Fy;
    Fz = isNaN(Fz) ? 0 : Fz;

    let ax = Fx / this.mass;
    let ay = this.gravity + (Fy / this.mass);
    let az = Fz / this.mass;

    this.vx += ax * dt;
    this.vy += ay * dt;
    this.vz += az * dt;

    let x = this.vx * dt * 10;
    let y = this.vy * dt * 10;
    let z = this.vz * dt * 10;
    math.vec3.set(Particle.explodeTemVec, x, y, z);
    math.vec3.add(this.position, this.position, Particle.explodeTemVec);
    return this;
  }
}

export abstract class Behavior {
  easing: Easing = Easing.linear;
  lifespan: number = 0;

  // Constraint:
  // * First a caller must pass start = 0 to (re)initialize the behavior.
  // * A caller must not pass arguments that cannot satisfy `start < end`.
  // * A callee must return the remaining execution time if the execution of
  //   the behavior is completed, otherwise callee must return a negative number.
  update(field: Field, particle: Particle, start: number, end: number): number {
    return end - Math.max(this.lifespan, start);
  }
}

export class Field implements Iterable<Particle> {
  private readonly payload: Particle[] = [];
  private count = 0;

  get closed(): boolean {
    for (let i = 0; i < this.count; ++i) {
      if (!this.payload[i].closed) return false;
    }
    return true;
  }

  [Symbol.iterator](): IterableIterator<Particle> {
    return this.payload.slice(0, this.count)[Symbol.iterator]();
  }

  add(particle: Particle): void {
    if (this.count < this.payload.length) {
      this.payload[this.count] = particle;
    } else {
      this.payload.push(particle);
    }
    ++this.count;
  }

  clear(): void {
    this.count = 0;
  }

  update(deltaTime: number): void {
    if (deltaTime <= 0) return;
    for (let i = 0; i < this.count;) {
      const particle = this.payload[i];
      const start = particle.lifeTime;
      particle.lifeTime += deltaTime;
      const dead = particle.behavior.update(this, particle, start, particle.lifeTime) >= 0;
      particle.translate(0, 0, particle.speed * deltaTime);

      if (dead) {
        --this.count;
        this.payload[i] = this.payload[this.count];
      } else {
        ++i;
      }
    }
  }
}
