// import set from 'lodash/fp/set';
import Lens from '../Scene/Graphics/core/Lens';
import Prism from '../Scene/Graphics/core/Prism';
// import LightSource from '../Scene/Graphics/core/LightSource';

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

const scene = {
  state: {
    lightSource: {
      startPos: [-0.4418886198547215, -0.18644067796610164],
      endPos: [0.03995157384987892, -0.22276029055690083],
      spreadType: 3,
      emitterPower: 0.03,
      spatialSpread: 0,
      angularSpread: 0.46289622421393606,
      angularSpreadDegrees: 26.522,
      spatialSpreadSliderEnabled: true,
      angularSpreadSliderEnabled: true,
    },
    settings: {
      maxPathLength: 11,
      maxSampleCount: 10000,
      scale: 1,
    },
    lenses: [],
    prisms: [],
  },
  reducers: {
    addLens(state, lens) {
      return { ...state, lenses: [...state.lenses, lens] };
    },
    addPrism(state, prism) {
      return { ...state, prisms: [...state.prisms, prism] };
    },
    removeLens(state, lens) {
      return { ...state, lenses: state.lenses.filter(lense => lense.id !== lens.id) };
    },
    removeSelectedLens(state) {
      const lens = state.lenses.find(l => l.selected === true);
      const prism = state.prisms.find(l => l.selected === true);
      if (lens) {
        return { ...state, lenses: state.lenses.filter(lense => lense.id !== lens.id) };
      } else if (prism) {
        return { ...state, prisms: state.prisms.filter(p => p.id !== prism.id) };
      }
      return state;
    },
    selectLens(state, lens) {
      const id = lens ? lens.id : '';
      return {
        ...state,
        lenses: state.lenses.map(l => new Lens({ ...l, selected: l.id === id })),
        prisms: state.prisms.map(l => new Prism({ ...l, selected: l.id === id })),
      };
    },
    deselect(state) {
      return {
        ...state,
        lenses: state.lenses.map(l => new Lens({ ...l, selected: false })),
        prisms: state.prisms.map(l => new Prism({ ...l, selected: false })),
      };
    },
    moveLens(state, pos) {
      return {
        ...state,
        lenses: state.lenses.map((l) => {
          if (l.isSelected()) {
            const newPos = [pos[0] + l.pos[0], pos[1] + l.pos[1]];
            return new Lens({ ...l, pos: newPos });
          }
          return l;
        }),
        prisms: state.prisms.map((l) => {
          if (l.isSelected()) {
            const newPos = [pos[0] + l.pos[0], pos[1] + l.pos[1]];
            return new Prism({ ...l, pos: newPos });
          }
          return l;
        }),
      };
    },
    selectScene(state, sceneToSelect) {
      const lenses = sceneToSelect.lenses.map(lense => new Lens(lense));
      const prisms = sceneToSelect.prisms.map(prism => new Prism(prism));
      return { ...state, lenses: lenses || [], prisms: prisms || [] };
    },
    updateSettings(state, settings) {
      return { ...state, settings };
    },
    updateLightSource(state, lightSource) {
      return { ...state, lightSource: { ...state.lightSource, ...lightSource } };
    },
    moveLightSource(state, startPos, endPos) {
      return { ...state, lightSource: { ...state.lightSource, startPos, endPos } };
    },
  },
  effects: {
    async loadScene(sceneFile, state) {
      const sceneText = await readFile(sceneFile);
      try {
        const importedScene = JSON.parse(sceneText);
        this.selectScene(importedScene);
        return importedScene;
      } catch (error) {
        console.err(error);
        return state;
      }
    },
  },
};

export default scene;
