import { useEffect, useCallback, useRef } from 'preact/hooks';
import { useAnimationFrame } from './hooks';
import { useStore, compileTransition } from './effects/store';
import { useStats } from './effects/stats';
import { useExplorer } from './effects/explorer';
import { useSimulator } from './effects/simulator';
import { useViewer } from './effects/viewer';
import { copyParticle } from '../bridge';

export function useSystem(): void {
  // 加载数据库
  useExplorerInitialization();
  useCompileRequestHandler();
  useViewerOptionApplier();
  useAnimationFrame(useSystemUpdater());
}

function useExplorerInitialization(): void {
  const store = useStore();
  const explorer = useExplorer();

  const update = store.update;

  useEffect(() => {
    (async () => {
      const storages = explorer.explore();
      const state = await Promise.all(
        storages.map(async storage => {
          const items = await explorer.items(storage.path);
          return { ...storage, items };
        }),
      );
      update({ explorer: state });
    })();
  }, []);
}

function useCompileRequestHandler(): void {
  const store = useStore();
  const simulator = useSimulator();
  const compileTimeout = useRef(0);

  const update = store.update;

  const { editingCode, editorCompilation } = store.state;

  const commit = useCallback(
    (code: string) => {
      code = 'hue 10\n' +
        'speed 0\n' +
        '\n' +
        '120 emit 1 8 1 {\n' +
        '  rotate [-150 .. -30] 0 0\n' +
        '  speed 1\n' +
        '  88 ease-in speed 0.2\n' +
        '  60 nop\n' +
        '  30 opacity 0\n' +
        '  fireworks 50 {\n' +
        '    opacity 0.7\n' +
        '    180 ease-out fireworksExplode 40\n' +
        '  }\n' +
        '  bloomVoice {}\n' +
        '}\n' +
        'text 0 50 0 {\n' +
        '  200 ease-out translate 50 0 0\n' +
        '  crackleVoice {}\n' +
        '  250 textExplode 40\n' +
        '}\n' +
        '\n' +
        '240 nop\n' +
        'emit 4 1 1 {\n' +
        '  translate 0 0 [-40..40]\n' +
        '  rotate [-90] 0 0\n' +
        '  [40..200] nop\n' +
        '  speed 2\n' +
        '  120 ease-out speed 0\n' +
        '  32 emit 4 32 1 {\n' +
        '  opacity 0.7\n' +
        '  speed 1.5\n' +
        '  rotate <> <> <>\n' +
        '  120 ease-out speed 0\n' +
        '  }\n' +
        '}\n' +
        '420 nop\n' +
        '240 emit 1 10 1 {\n' +
        '  rotate 0 [] 0\n' +
        '  {\n' +
        '    speed 0.5\n' +
        '    240 nop\n' +
        '    |\n' +
        '    10 ease-out rotate 21 60 129\n' +
        '  }\n' +
        '  32 emit 4 32 1 {\n' +
        '  opacity 0.7\n' +
        '  speed 1.5\n' +
        '  rotate <> <> <>\n' +
        '  120 ease-out speed 0\n' +
        '  }\n' +
        '}\n' +
        'text 0 100 0 {\n' +
        '  200 ease-out translate 50 0 0\n' +
        '}';
      const { message } = simulator.compilePattern(code, true);
      update({ editorNotification: message });
    },
    [update, simulator],
  );

  useEffect(() => {
    switch (editorCompilation[0]) {
      case 'none':
        break;
      case 'required':
        const defer = editorCompilation[1];
        update({ editorCompilation: ['none'], editorNotification: '...' });
        clearTimeout(compileTimeout.current);
        compileTimeout.current = window.setTimeout(commit.bind(null, editingCode), defer);
        break;
      case 'cancelRequired':
        update({ editorCompilation: ['none'] });
        clearTimeout(compileTimeout.current);
        break;
    }
  }, [update, editingCode, editorCompilation]);
}

function useViewerOptionApplier(): void {
  const store = useStore();
  const viewer = useViewer();

  const { fieldOfView, antialias, bloomEffect, bloomStrength, bloomThreshold, bloomRadius } =
    store.state;

  useEffect(() => {
    const updateMatrix = viewer.camera.fov != fieldOfView;
    viewer.camera.fov = fieldOfView;
    if (updateMatrix) viewer.camera.updateProjectionMatrix();
    viewer.renderer.antialias = antialias;
    viewer.renderer.bloom = bloomEffect;
    viewer.renderer.bloomStrength = bloomStrength;
    viewer.renderer.bloomThreshold = bloomThreshold;
    viewer.renderer.bloomRadius = bloomRadius;
  }, [fieldOfView, antialias, bloomEffect, bloomStrength, bloomThreshold, bloomRadius]);

  const { showGrid } = store.state;

  useEffect(() => {
    // viewer.scene.grid.visible = showGrid;
  }, [showGrid]);

  const {
    prism,
    prismSaturation,
    prismLightness,
    prismSnapshotOffset,
    prismHueOffset,
    prismHueTransition,
    prismTrailLength,
    prismTrailStep,
    prismTrailAttenuation,
  } = store.state;

  useEffect(() => {
    viewer.scene.prismOptions.saturation = prismSaturation;
    viewer.scene.prismOptions.lightness = prismLightness;
    viewer.scene.prismOptions.snapshotOffset = prismSnapshotOffset;
    viewer.scene.prismOptions.hueOffset = prismHueOffset;
    viewer.scene.prismOptions.hueTransition = prismHueTransition;
    viewer.scene.prismOptions.trailLength = prismTrailLength;
    viewer.scene.prismOptions.trailStep = prismTrailStep;
    viewer.scene.prismOptions.trailAttenuation = compileTransition(prismTrailAttenuation);
    viewer.scene.stateNeedsUpdate = true;
  }, [
    prism,
    prismSaturation,
    prismLightness,
    prismSnapshotOffset,
    prismHueOffset,
    prismHueTransition,
    prismTrailLength,
    prismTrailStep,
    prismTrailAttenuation,
  ]);

  const {
    particle,
    particleSaturation,
    particleLightness,
    particleDof,
    particleDofFocus,
    particleDofAperture,
    particleSizeAttenuation,
    particleSizeTransition,
    particleCoreRadius,
    particleCoreSharpness,
    particleShellRadius,
    particleShellLightness,
    particleSnapshotOffset,
    particleHueOffset,
    particleHueTransition,
    particleTrailLength,
    particleTrailAttenuation,
    particleTrailDiffusionScale,
    particleTrailDiffusionTransition,
    particleTrailDiffusionFineness,
    particleTrailDiffusionShakiness,
  } = store.state;

  useEffect(() => {
    viewer.scene.particles.visible = particle;
    viewer.scene.particleOptions.saturation = particleSaturation;
    viewer.scene.particleOptions.lightness = particleLightness;
    viewer.scene.particleOptions.sizeTransition = compileTransition(particleSizeTransition);
    viewer.scene.particles.mat.changeOptions(
      particleDof,
      particleDofFocus,
      particleDofAperture,
      particleSizeAttenuation,
      Math.exp(particleTrailDiffusionFineness - 5),
      particleCoreRadius,
      particleCoreSharpness,
      particleShellRadius,
      particleShellLightness,
    );
    viewer.scene.particleOptions.snapshotOffset = particleSnapshotOffset;
    viewer.scene.particleOptions.hueOffset = particleHueOffset;
    viewer.scene.particleOptions.hueTransition = particleHueTransition;
    viewer.scene.particleOptions.trailLength = particleTrailLength;
    viewer.scene.particleOptions.trailAttenuation = compileTransition(particleTrailAttenuation);
    viewer.scene.particleOptions.trailDiffusionScale = particleTrailDiffusionScale;
    viewer.scene.particleOptions.trailDiffusionTransition = compileTransition(
      particleTrailDiffusionTransition,
    );
    viewer.scene.particleOptions.trailDiffusionShakiness = Math.exp(
      particleTrailDiffusionShakiness - 5,
    );
    viewer.scene.stateNeedsUpdate = true;
  }, [
    particle,
    particleSaturation,
    particleLightness,
    particleDof,
    particleDofFocus,
    particleDofAperture,
    particleSizeAttenuation,
    particleSizeTransition,
    particleCoreRadius,
    particleCoreSharpness,
    particleShellRadius,
    particleShellLightness,
    particleSnapshotOffset,
    particleHueOffset,
    particleHueTransition,
    particleTrailLength,
    particleTrailAttenuation,
    particleTrailDiffusionScale,
    particleTrailDiffusionTransition,
    particleTrailDiffusionFineness,
    particleTrailDiffusionShakiness,
  ]);
}

function useSystemUpdater(): (deltaTime: number) => void {
  const store = useStore();
  const simulator = useSimulator();
  const viewer = useViewer();
  const stats = useStats();
  const codeGenerate = useCodeGenerate(false);
  const totalSteps = useRef(0);
  const floorOffset = useRef(0);

  const {
    stepsPerSecond,
    stepsPerUpdate,
    isPaused,
    cameraRevolve,
    floorTransition,
    generateAutomatically,
  } = store.state;

  return useCallback(
    (deltaTime: number) => {
      stats.begin();
      // if (cameraRevolve) viewer.camera.targetPosition.x += 0.05;
      if (!isPaused) {
        totalSteps.current += deltaTime * stepsPerSecond;
        while (totalSteps.current > stepsPerUpdate) {
          simulator.update(stepsPerUpdate);
          viewer.scene.history.putSnapshot(simulator.particles, copyParticle);
          totalSteps.current -= stepsPerUpdate;
        }
        viewer.scene.stateNeedsUpdate = true;

        if (simulator.closed) {
          if (generateAutomatically) codeGenerate();
          simulator.emitRootParticle(0, floorOffset.current, 0);
        }
      }
      viewer.update();
      stats.end();
    },
    [
      simulator,
      viewer,
      stats,
      codeGenerate,
      stepsPerSecond,
      stepsPerUpdate,
      isPaused,
      cameraRevolve,
      floorTransition,
      generateAutomatically,
    ],
  );
}

export function useCodeSave(): () => void {
  const store = useStore();
  const explorer = useExplorer();

  const update = store.update;
  const { editingItem, editingCode } = store.state;

  return useCallback(async () => {
    const firstWritableStorage = explorer.explore().find(storage => storage.writable);
    if (!firstWritableStorage) return;
    await explorer.write(firstWritableStorage.path, editingItem, editingCode);
    const items = await explorer.items(firstWritableStorage.path);
    update(state => ({
      ...state,
      explorer: state.explorer.map(storage =>
        storage.path == firstWritableStorage.path ? { ...storage, items } : storage,
      ),
    }));
  }, [update, editingItem, editingCode, explorer]);
}

export function useCodeDelete(): (path: string, item: string) => void {
  const store = useStore();
  const explorer = useExplorer();

  const update = store.update;

  return useCallback(
    async (path: string, item: string) => {
      await explorer.delete(path, item);
      update(state => ({
        ...state,
        explorer: state.explorer.map(storage =>
          storage.path == path
            ? { ...storage, items: storage.items.filter(i => i != item) }
            : storage,
        ),
      }));
    },
    [update, explorer],
  );
}

export function useCodeLoad(): (path: string, item: string) => void {
  const store = useStore();
  const explorer = useExplorer();

  const update = store.update;

  return useCallback(
    async (path: string, item: string) => {
      const code = await explorer.read(path, item);
      update({
        editingItem: item,
        editingCode: code,
        editorCompilation: ['required', 0],
        generateAutomatically: false,
      });
    },
    [update, explorer],
  );
}

export function useCodeGenerate(clear: boolean): () => void {
  const store = useStore();
  const explorer = useExplorer();
  const simulator = useSimulator();

  const update = store.update;
  const { generatorGeneration, generatorStrength } = store.state;

  return useCallback(async () => {
    const { code } = simulator.generatePattern(generatorStrength, clear);
    const generation = generatorGeneration + 1;
    const item = `Generation ${generation}`;
    update(state => ({
      ...state,
      editingItem: item,
      editingCode: code,
      editorCompilation: ['cancelRequired'],
      explorer: state.explorer.map(storage =>
        storage.path == 'history' ? { ...storage, items: storage.items.concat([item]) } : storage,
      ),
      generatorGeneration: generation,
    }));
    await explorer.write('history', item, code);
  }, [update, clear, explorer, simulator, generatorGeneration, generatorStrength]);
}
