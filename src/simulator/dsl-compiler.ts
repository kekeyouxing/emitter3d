import { Easing } from './aux/easing';
import { Behavior } from './particle';
import * as behavior from './particle-behavior';
import * as dsl from './dsl';
import { units, initializeUnits } from './units';

export class CompileError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export type Gen<T> = (index: [number, number]) => T;

export class Compiler {

  constructor() {
    initializeUnits();
  }

  compileProgram(program: dsl.AST[]): Gen<Behavior> {
    if (program.length == 1) return this.compile(program[0]);
    return this.compile(new dsl.List([dsl.Symbol.block, new dsl.List(program)]));
  }

  compile(expr: dsl.AST): Gen<Behavior> {
    return this.getUnit(expr).behavior(this);
  }

  getUnit(expr: dsl.AST): Unit {
    return expr.visit({
      number: v => new NumberUnit(v.value),
      symbol: v => {
        const unit = units.get(v.value);
        if (!unit) {
          // throw new CompileError(`Unknown identifier "${v.value}"`);
          return new StringUnit(v.value);
        }
        return unit;
      },
      list: v => {
        if (v.elements.length == 0) return new NilUnit();
        return this.getUnit(v.elements[0]).withArguments(v.elements.slice(1));
      },
    });
  }
}

export abstract class Unit {
  withArguments(args: dsl.AST[]): Unit {
    throw new CompileError(`${this.constructor.name} takes no arguments`);
  }

  number(env: Compiler): Gen<number> {
    throw new CompileError(`Expected number but got ${this.constructor.name}`);
  }

  easing(env: Compiler): Gen<Easing> {
    throw new CompileError(`Expected easing but got ${this.constructor.name}`);
  }

  behavior(env: Compiler): Gen<Behavior> {
    throw new CompileError(`Expected behavior but got ${this.constructor.name}`);
  }

  string(env: Compiler): Gen<string> {
    throw new CompileError(`Expected string but got ${this.constructor.name}`);
  }
}

export class UnitConstructor extends Unit {
  constructor(private c: { new(args: dsl.AST[]): Unit }) {
    super();
  }

  withArguments(args: dsl.AST[]): Unit {
    return new this.c(args);
  }
}

type TakeArgs = {
  number(): Gen<number>;
  easing(): Gen<Easing>;
  behavior(): Gen<Behavior>;
  string(): Gen<string>;
};

abstract class ConstructedUnit extends Unit {
  constructor(protected args: dsl.AST[]) {
    super();
  }

  protected takeArgs(env: Compiler, length: number): TakeArgs {
    if (this.args.length != length) {
      throw new CompileError(
        `${this.constructor.name} takes ${length} arguments but got ${this.args.length}`,
      );
    }
    let i = 0;
    return {
      easing: () => env.getUnit(this.args[i++]).easing(env),
      number: () => env.getUnit(this.args[i++]).number(env),
      behavior: () => env.getUnit(this.args[i++]).behavior(env),
      string: () => env.getUnit(this.args[i++]).string(env),
    };
  }
}

class NilUnit extends Unit {
}

class NumberUnit extends Unit {
  constructor(private value: number) {
    super();
  }

  withArguments(args: dsl.AST[]): Unit {
    return new PutLifespanUnit(this, args);
  }

  number(env: Compiler): Gen<number> {
    const value = this.value;
    return _ => value;
  }
}

class StringUnit extends Unit {
  constructor(private value: string) {
    super();
  }

  withArguments(args: dsl.AST[]): Unit {
    return new PutLifespanUnit(this, args);
  }

  string(env: Compiler): Gen<string> {
    const value = this.value;
    return _ => value;
  }
}

export class EasingUnit extends Unit {
  constructor(private value: Easing) {
    super();
  }

  withArguments(args: dsl.AST[]): Unit {
    return new PutEasingUnit(this, args);
  }

  easing(env: Compiler): Gen<Easing> {
    const value = this.value;
    return _ => value;
  }
}

class PutLifespanUnit extends ConstructedUnit {
  constructor(private unit: Unit, args: dsl.AST[]) {
    super(args);
  }

  behavior(env: Compiler): Gen<Behavior> {
    const bodyUnit = env.getUnit(this.args.length == 1 ? this.args[0] : new dsl.List(this.args));
    const behaviorGen = bodyUnit.behavior(env);
    const lifespanGen = this.unit.number(env);

    return index => {
      const behavior = behaviorGen(index);
      behavior.lifespan = lifespanGen(index);
      return behavior;
    };
  }
}

class PutEasingUnit extends ConstructedUnit {
  constructor(private unit: Unit, args: dsl.AST[]) {
    super(args);
  }

  behavior(env: Compiler): Gen<Behavior> {
    const bodyUnit = env.getUnit(this.args.length == 1 ? this.args[0] : new dsl.List(this.args));
    const behaviorGen = bodyUnit.behavior(env);
    const easingGen = this.unit.easing(env);

    return index => {
      const behavior = behaviorGen(index);
      behavior.easing = easingGen(index);
      return behavior;
    };
  }
}

export class NopUnit extends Unit {
  behavior(env: Compiler): Gen<Behavior> {
    return _ => new behavior.NopBehavior();
  }
}

export class CloseUnit extends Unit {
  behavior(env: Compiler): Gen<Behavior> {
    return _ => new behavior.SwitchBehavior(p => (p.closed = true));
  }
}

export class SetSpeedUnit extends ConstructedUnit {
  behavior(env: Compiler): Gen<Behavior> {
    const speedGen = this.takeArgs(env, 1).number();
    return index =>
      new behavior.SetBehavior(
        speedGen(index),
        p => p.speed,
        (p, v) => (p.speed = v),
      );
  }
}

export class AddSpeedUnit extends ConstructedUnit {
  behavior(env: Compiler): Gen<Behavior> {
    const speedGen = this.takeArgs(env, 1).number();
    return index => new behavior.AddBehavior(speedGen(index), (p, v) => (p.speed += v));
  }
}

export class MultiplySpeedUnit extends ConstructedUnit {
  behavior(env: Compiler): Gen<Behavior> {
    const speedGen = this.takeArgs(env, 1).number();
    return index => new behavior.MultiplyBehavior(speedGen(index), (p, s) => (p.speed *= s));
  }
}

export class SetOpacityUnit extends ConstructedUnit {
  behavior(env: Compiler): Gen<Behavior> {
    const opacityGen = this.takeArgs(env, 1).number();
    return index =>
      new behavior.SetBehavior(
        opacityGen(index),
        p => p.opacity,
        (p, v) => (p.opacity = v),
      );
  }
}

export class AddOpacityUnit extends ConstructedUnit {
  behavior(env: Compiler): Gen<Behavior> {
    const opacityGen = this.takeArgs(env, 1).number();
    return index => new behavior.AddBehavior(opacityGen(index), (p, v) => (p.opacity += v));
  }
}

export class MultiplyOpacityUnit extends ConstructedUnit {
  behavior(env: Compiler): Gen<Behavior> {
    const opacityGen = this.takeArgs(env, 1).number();
    return index => new behavior.MultiplyBehavior(opacityGen(index), (p, s) => (p.opacity *= s));
  }
}

export class SetHueUnit extends ConstructedUnit {
  behavior(env: Compiler): Gen<Behavior> {
    const hueGen = this.takeArgs(env, 1).number();
    return index =>
      new behavior.SetBehavior(
        hueGen(index),
        p => p.hue,
        (p, v) => (p.hue = v),
      );
  }
}

export class AddHueUnit extends ConstructedUnit {
  behavior(env: Compiler): Gen<Behavior> {
    const hueGen = this.takeArgs(env, 1).number();
    return index => new behavior.AddBehavior(hueGen(index), (p, v) => (p.hue += v));
  }
}

export class TranslateUnit extends ConstructedUnit {
  behavior(env: Compiler): Gen<Behavior> {
    const args = this.takeArgs(env, 3);
    const xGen = args.number();
    const yGen = args.number();
    const zGen = args.number();
    return index => new behavior.TranslateBehavior(xGen(index), yGen(index), zGen(index));
  }
}

export class TextExplodeUnit extends ConstructedUnit {
  behavior(env: Compiler): Gen<Behavior> {
    return index => new behavior.TextExplodeBehavior();
  }
}

export class FireworksExplodeUnit extends ConstructedUnit {
  behavior(env: Compiler): Gen<Behavior> {
    return index => new behavior.FireworksExplodeBehavior();
  }
}

export class RotateUnit extends ConstructedUnit {
  behavior(env: Compiler): Gen<Behavior> {
    const args = this.takeArgs(env, 3);
    const xdegGen = args.number();
    const ydegGen = args.number();
    const zdegGen = args.number();
    return index => new behavior.RotateBehavior(xdegGen(index), ydegGen(index), zdegGen(index));
  }
}

export class LoopUnit extends ConstructedUnit {
  behavior(env: Compiler): Gen<Behavior> {
    const patternGen = this.takeArgs(env, 1).behavior();
    return index => new behavior.LoopBehavior(patternGen(index));
  }
}

export class RepeatUnit extends ConstructedUnit {
  behavior(env: Compiler): Gen<Behavior> {
    const args = this.takeArgs(env, 2);
    const limitGen = args.number();
    const patternGen = args.behavior();
    return index => new behavior.RepeatBehavior(patternGen(index), limitGen(index));
  }
}

export class EmitUnit extends ConstructedUnit {
  behavior(env: Compiler): Gen<Behavior> {
    const args = this.takeArgs(env, 4);
    const countGen = args.number();
    const timesGen = args.number();
    const parallelGen = args.number();
    const childPattern = args.behavior();
    return index => {
      const count = countGen(index);
      const times = timesGen(index);
      const parallel = parallelGen(index);
      const max = count * times * parallel;
      return new behavior.EmitBehavior(count, times, parallel, i => childPattern([i, max]));
    };
  }
}

export class FlairUnit extends ConstructedUnit {
  behavior(env: Compiler): Gen<Behavior> {
    const args = this.takeArgs(env, 2);
    const countGen = args.number();
    const childPattern = args.behavior();
    return index => {
      const count = countGen(index);
      return new behavior.FlairBehavior(count, childPattern([0, 1]));
    };
  }
}

export class FireworksUnit extends ConstructedUnit {
  behavior(env: Compiler): Gen<Behavior> {
    const args = this.takeArgs(env, 2);
    const countGen = args.number();
    const childPattern = args.behavior();
    return index => {
      const count = countGen(index);
      return new behavior.FireworksBehavior(count, childPattern([0, 1]));
    };
  }
}

export class CharacterUnit extends ConstructedUnit {
  behavior(env: Compiler): Gen<Behavior> {
    const args = this.takeArgs(env, 2);
    const stringGen = args.string();
    const childPattern = args.behavior();
    return index => {
      const s = stringGen(index);
      return new behavior.characterBehavior(s, childPattern([0, 1]));
    };
  }
}

export class TextUnit extends ConstructedUnit {
  behavior(env: Compiler): Gen<Behavior> {
    const args = this.takeArgs(env, 4);
    const xGen = args.number();
    const yGen = args.number();
    const zGen = args.number();
    const childPattern = args.behavior();
    return index => {
      const x = xGen(index);
      const y = yGen(index);
      const z = zGen(index);
      return new behavior.TextBehavior(x, y, z, childPattern([0, 1]));
    };
  }
}

export class BlockUnit extends ConstructedUnit {
  behavior(env: Compiler): Gen<Behavior> {
    const behaviorGens = this.args.map(arg => {
      if (!(arg instanceof dsl.List)) {
        throw new CompileError(`Each arguments of ${dsl.Symbol.block.value} must be list`);
      }

      return arg.elements.map(e => env.getUnit(e).behavior(env));
    });

    return index => {
      const behaviors = behaviorGens.map(
        gens => new behavior.SequentialBehavior(gens.map(gen => gen(index))),
      );
      return new behavior.ParallelBehavior(behaviors);
    };
  }
}

abstract class ChoiceUnit extends ConstructedUnit {
  abstract choiceGen(size: number): Gen<number>;

  protected getUnit(env: Compiler, expr: dsl.AST): Unit {
    return env.getUnit(expr);
  }

  private gen<T>(env: Compiler, f: (d: Unit) => Gen<T>): Gen<T> {
    if (this.args.length == 0) {
      throw new CompileError(`${this.constructor.name} takes at least one argumnet`);
    }

    const gens = this.args.map(arg => f(this.getUnit(env, arg)));
    const choiceGen = this.choiceGen(gens.length);
    return index => gens[choiceGen(index)](index);
  }

  withArguments(args: dsl.AST[]): Unit {
    return new ChoiceUnitWithArguments(this.args, this, args);
  }

  number(env: Compiler): Gen<number> {
    return this.gen(env, unit => unit.number(env));
  }

  easing(env: Compiler): Gen<Easing> {
    return this.gen(env, unit => unit.easing(env));
  }

  behavior(env: Compiler): Gen<Behavior> {
    return this.gen(env, unit => unit.behavior(env));
  }
}

class ChoiceUnitWithArguments extends ChoiceUnit {
  constructor(args: dsl.AST[], private body: ChoiceUnit, private unitArgs: dsl.AST[]) {
    super(args);
  }

  choiceGen(size: number): Gen<number> {
    return this.body.choiceGen(size);
  }

  protected getUnit(env: Compiler, expr: dsl.AST): Unit {
    return super.getUnit(env, expr).withArguments(this.unitArgs);
  }
}

abstract class RangeUnit extends ConstructedUnit {
  abstract rangeGen(): Gen<number>;

  withArguments(args: dsl.AST[]): Unit {
    return new PutLifespanUnit(this, args);
  }

  number(env: Compiler): Gen<number> {
    const args = this.takeArgs(env, 2);
    const minGen = args.number();
    const maxGen = args.number();
    const rangeGen = this.rangeGen();
    return index => {
      const min = minGen(index);
      const max = maxGen(index);
      const r = rangeGen(index);
      return min * (1 - r) + max * r;
    };
  }
}

export class EachChoiceUnit extends ChoiceUnit {
  choiceGen(size: number): Gen<number> {
    return ([a, _]) => a % size;
  }
}

export class EachRangeUnit extends RangeUnit {
  rangeGen(): Gen<number> {
    return ([a, b]) => (b <= 1 ? 0.5 : a / (b - 1));
  }
}

export class EachAngleUnit extends Unit {
  number(env: Compiler): Gen<number> {
    return ([a, b]) => (360 * a) / b + (b == 2 ? 90 : 0);
  }
}

export class RandomChoiceUnit extends ChoiceUnit {
  choiceGen(size: number): Gen<number> {
    return _ => Math.floor(Math.random() * size);
  }
}

export class RandomRangeUnit extends RangeUnit {
  rangeGen(): Gen<number> {
    return _ => Math.random();
  }
}

export class RandomAngleUnit extends Unit {
  number(env: Compiler): Gen<number> {
    return _ => Math.random() * 360;
  }
}
