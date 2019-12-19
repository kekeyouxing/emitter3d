import { h, FunctionalComponent, createContext } from 'preact';
import { useContext, useState, useCallback } from 'preact/hooks';

export interface Store {
  readonly state: ApplicationState;
  update(updater: Updater<ApplicationState>): void;
}

const Context = createContext(undefined as unknown as Store);

export const RunStore: FunctionalComponent<{ initialState: ApplicationState }> = props => {
  const [state, setState] = useState(props.initialState);
  const update = useCallback((updater: Updater<ApplicationState>) => {
    setState(s => ({
      ...s,
      ...updater instanceof Function ? updater(s) : updater
    }));
  }, [setState]);

  return (
    <Context.Provider value={{ state, update }}>
      {props.children}
    </Context.Provider>
  );
};

export const useStore: () => Store = () => useContext(Context);

type Updater<S> = Partial<S> | ((s: S) => Partial<S>);

export type ApplicationState = CoreState & EditorState & RendererState & PrismState & ParticleState;

export function initialApplicationState(): ApplicationState {
  return {
    ...initialCoreState,
    ...initialEditorState,
    ...initialRendererState,
    ...initialPrismState,
    ...initialParticleState,
    ...presetStates['unified'],
  };
}

export type CoreState = {
  isPaused: boolean;
  showStats: boolean;
  stepsPerSecond: number;
  stepsPerUpdate: number;
  cameraRevolve: boolean;
};

export type EditorState = {
  editingItem: string;
  editingCode: string;
  editorNotification: string;
  editorCompilation: ['required', number] | ['cancelRequired'] | ['none'];
  generatorGeneration: number;
  generatorStrength: number;
  generateAutomatically: boolean;
  explorer: ExplorerState;
};

export type ExplorerState = {
  path: string;
  items: string[];
  writable: boolean;
}[];

export type RendererState = {
  antialias: boolean;
  bloomEffect: boolean;
  bloomStrength: number;
  bloomThreshold: number;
  bloomRadius: number;
};

export type Transition = {
  init: number;
  center: number;
  exponent: number;
};

export type PrismState = {
  prism: boolean;
  prismSaturation: number;
  prismLightness: number;
  prismSnapshotOffset: number;
  prismTrailLength: number;
  prismTrailStep: number;
  prismTrailAttenuation: Transition;
};

export type ParticleState = {
  particle: boolean;
  particleSaturation: number;
  particleLightness: number;
  particleSizeAttenuation: boolean;
  particleCoreRadius: number;
  particleCoreSharpness: number;
  particleShellRadius: number;
  particleShellLightness: number;
  particleSnapshotOffset: number;
  particleTrailLength: number;
  particleTrailAttenuation: Transition;
  particleTrailDiffusionScale: number;
  particleTrailDiffusionTransition: Transition;
};

export function serializeState(state: ApplicationState): string {
  function structurallyEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; ++i) {
        if (!structurallyEqual(a[i], b[i])) return false;
      }
      return true;
    }
    if (typeof a == 'object' && typeof b == 'object') {
      // We assume that a and b have same props since these are part of ApplicationState.
      for (const key in a) {
        if (!structurallyEqual(a[key], b[key])) return false;
      }
      return true;
    }
    return false;
  }

  const data = { ...state };

  // Drop unnecessary props
  delete data.isPaused;
  delete data.showStats;
  delete data.cameraRevolve;
  delete data.editorNotification;
  delete data.editorCompilation;
  delete data.generatorGeneration;
  delete data.explorer;

  if (data.generateAutomatically) {
    delete data.editingItem;
    delete data.editingCode;
  }

  // Drop props which have the default value
  const initialState = initialApplicationState();
  for (const key in initialState) {
    if (structurallyEqual((initialState as any)[key], (data as any)[key])) {
      delete (data as any)[key];
    }
  }

  const json = JSON.stringify(data);
  return btoa(unescape(encodeURIComponent(json)));
}

export function deserializeState(data: string): Partial<ApplicationState> {
  const json = decodeURIComponent(escape(atob(data)));
  const state: ApplicationState = JSON.parse(json);

  if (state.generateAutomatically === false) state.editorCompilation = ['required', 0];

  return state;
}

export function compileTransition({ init, center: l, exponent }: Transition): (x: number) => number {
  const tail = 1 - init;
  const r = 1 - l;
  const p = Math.exp(exponent);
  const x1 = l * tail;
  const x2 = r * tail;
  const initx = init + x1;
  return n =>
    n < init
      ? 1 - (1 - (n / init)) ** p
      : n < initx
        ? l * (1 - ((n - init) / x1) ** p) + r
        : n < 1
          ? r * ((1 - (n - initx) / x2) ** p)
          : 0;
}

export const initialCoreState: CoreState = {
  isPaused: false,
  showStats: false,
  stepsPerSecond: 60,
  stepsPerUpdate: 1,
  cameraRevolve: true,
};

export const initialEditorState: EditorState = {
  editingItem: '',
  editingCode: '',
  editorNotification: '',
  editorCompilation: ['none'],
  generatorGeneration: 0,
  generatorStrength: 300,
  generateAutomatically: true,
  explorer: [],
};

export const initialRendererState: RendererState = {
  antialias: false,
  bloomEffect: false,
  bloomStrength: 0,
  bloomThreshold: 0,
  bloomRadius: 0,
};

export const initialPrismState: PrismState = {
  prism: false,
  prismSaturation: 0.3,
  prismLightness: 0.8,
  prismSnapshotOffset: 0,
  prismTrailLength: 40,
  prismTrailStep: 2,
  prismTrailAttenuation: { init: 0.6, center: 1, exponent: -1 },
};

export const initialParticleState: ParticleState = {
  particle: false,
  particleSaturation: 0.8,
  particleLightness: 0.7,
  particleSizeAttenuation: true,
  particleCoreRadius: 1.7,
  particleCoreSharpness: 0,
  particleShellRadius: 0.8,
  particleShellLightness: 0.85,
  particleSnapshotOffset: 0,
  particleTrailLength: 32,
  particleTrailAttenuation: { init: 0, center: 0, exponent: 1 },
  particleTrailDiffusionScale: 6,
  particleTrailDiffusionTransition: { init: 0, center: 0, exponent: -1 },
};

export type PresetName = 'unified' | 'neon' | 'prism';

export const presetNames: PresetName[] = ['unified', 'neon', 'prism'];

export const presetStates: { [P in PresetName]: Partial<ApplicationState> } = {
  unified: {
    antialias: true,
    bloomEffect: true,
    bloomStrength: 0.6,
    bloomThreshold: 0.5,
    bloomRadius: 1,
    prism: true,
    prismSaturation: 0.5,
    prismLightness: 0.6,
    prismSnapshotOffset: 0,
    prismTrailLength: 24,
    prismTrailStep: 1,
    prismTrailAttenuation: { init: 0.3, center: 1, exponent: -2 },
    particle: true,
    particleSaturation: 0.7,
    particleLightness: 0.6,
    particleSizeAttenuation: true,
    particleCoreRadius: 0.4,
    particleCoreSharpness: 3,
    particleShellRadius: 7,
    particleShellLightness: 0.08,
    particleSnapshotOffset: 10,
    particleTrailLength: 45,
    particleTrailAttenuation: { init: 0.3, center: 1, exponent: 0.5 },
    particleTrailDiffusionScale: 15,
    particleTrailDiffusionTransition: { init: 0, center: 0, exponent: -2 },
    stepsPerUpdate: 1,
  },
  neon: {
    stepsPerUpdate: 2,
    antialias: false,
    bloomEffect: false,
    prism: false,
    particle: true,
    particleSaturation: 0.9,
    particleLightness: 0.75,
    particleSizeAttenuation: true,
    particleCoreRadius: 0.4,
    particleCoreSharpness: 3,
    particleShellRadius: 6.6,
    particleShellLightness: 0.07,
    particleSnapshotOffset: 0,
    particleTrailLength: 80,
    particleTrailAttenuation: { init: 0.1, center: 1, exponent: 1 },
    particleTrailDiffusionScale: 10,
    particleTrailDiffusionTransition: { init: 0.5, center: 1, exponent: 1.5 },
  },
  prism: {
    stepsPerUpdate: 1,
    antialias: true,
    bloomEffect: true,
    bloomStrength: 1,
    bloomThreshold: 0,
    bloomRadius: 1,
    prism: true,
    prismSaturation: 0.9,
    prismLightness: 0.7,
    prismSnapshotOffset: 0,
    prismTrailLength: 24,
    prismTrailStep: 1,
    prismTrailAttenuation: { init: 0, center: 1, exponent: -2 },
    particle: false,
  },
};