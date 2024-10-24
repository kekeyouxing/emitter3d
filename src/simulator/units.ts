import { Easing } from './aux/easing';
import {
  Unit,
  EasingUnit,
  NopUnit,
  CloseUnit,
  UnitConstructor,
  SetSpeedUnit,
  AddSpeedUnit,
  MultiplySpeedUnit,
  SetOpacityUnit,
  AddOpacityUnit,
  MultiplyOpacityUnit,
  SetHueUnit,
  AddHueUnit,
  TranslateUnit,
  RotateUnit,
  EmitUnit,
  LoopUnit,
  RepeatUnit,
  FlairUnit,
  FireworksUnit,
  FireworksExplodeUnit,
  TextUnit,
  TextExplodeUnit,
  BlockUnit,
  EachChoiceUnit,
  EachRangeUnit,
  EachAngleUnit,
  RandomChoiceUnit,
  RandomRangeUnit,
  RandomAngleUnit, CharacterUnit, BloomVoiceUnit, CrackleVoiceUnit,
} from './dsl-compiler';
import * as dsl from './dsl';

export const units = new Map<string, Unit>();

export function initializeUnits(): void {
  units.set('linear', new EasingUnit(Easing.linear));
  units.set('ease-in', new EasingUnit(Easing.easeIn));
  units.set('ease-out', new EasingUnit(Easing.easeOut));
  units.set('ease-in-out', new EasingUnit(Easing.easeInOut));

  units.set('nop', new NopUnit());
  units.set('close', new CloseUnit());
  units.set('speed', new UnitConstructor(SetSpeedUnit));
  units.set('speed+', new UnitConstructor(AddSpeedUnit));
  units.set('speed*', new UnitConstructor(MultiplySpeedUnit));
  units.set('opacity', new UnitConstructor(SetOpacityUnit));
  units.set('opacity+', new UnitConstructor(AddOpacityUnit));
  units.set('opacity*', new UnitConstructor(MultiplyOpacityUnit));
  units.set('hue', new UnitConstructor(SetHueUnit));
  units.set('hue+', new UnitConstructor(AddHueUnit));
  units.set('translate', new UnitConstructor(TranslateUnit));
  units.set('rotate', new UnitConstructor(RotateUnit));
  units.set('emit', new UnitConstructor(EmitUnit));
  units.set('loop', new UnitConstructor(LoopUnit));
  units.set('repeat', new UnitConstructor(RepeatUnit));
  units.set('flair', new UnitConstructor(FlairUnit));
  units.set('fireworks', new UnitConstructor(FireworksUnit));
  units.set('fireworksExplode', new UnitConstructor(FireworksExplodeUnit));
  units.set('text', new UnitConstructor(TextUnit));
  units.set('textExplode', new UnitConstructor(TextExplodeUnit));
  units.set('character', new UnitConstructor(CharacterUnit));
  units.set('bloomVoice', new UnitConstructor(BloomVoiceUnit));
  units.set('crackleVoice', new UnitConstructor(CrackleVoiceUnit));
  units.set(dsl.Symbol.block.value, new UnitConstructor(BlockUnit));

  units.set(dsl.Symbol.eachChoice.value, new UnitConstructor(EachChoiceUnit));
  units.set(dsl.Symbol.eachRange.value, new UnitConstructor(EachRangeUnit));
  units.set(dsl.Symbol.eachAngle.value, new EachAngleUnit());
  units.set(dsl.Symbol.randomChoice.value, new UnitConstructor(RandomChoiceUnit));
  units.set(dsl.Symbol.randomRange.value, new UnitConstructor(RandomRangeUnit));
  units.set(dsl.Symbol.randomAngle.value, new RandomAngleUnit());
}