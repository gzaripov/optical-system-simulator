// import set from 'lodash/fp/set';
import Lens from '../Scene/Graphics/core/Lens';

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
    settings: {
      maxPathLength: 12,
      maxSampleCount: 100000,
    },
    lenses: [
      new Lens({
        type: Lens.TYPE.BICONVEX,
        pos: [0.0, 0.5],
        height: 0.247,
        width: 0.5,
        leftDiameter: 0.75,
        rightDiameter: 0.75,
      }),
      new Lens({
        pos: [0.46731234866828086, -0.24213075060532685],
        type: 0,
        height: 0.376,
        width: 0.302,
        leftDiameter: 0.75,
        rightDiameter: 0.75,
      }),
    ],
  },
  reducers: {
    addLens(state, lens) {
      return { ...state, lenses: [...state.lenses, lens] };
    },
    removeLens(state, id) {
      return { ...state, lenses: state.lenses.filter(lense => lense.id === id) };
    },
    selectLens(state, lens) {
      const id = lens ? lens.id : '';
      return {
        ...state,
        lenses: state.lenses.map(l => new Lens({ ...l, selected: l.id === id })),
      };
    },
    deselect(state) {
      return {
        ...state,
        lenses: state.lenses.map(l => new Lens({ ...l, selected: false })),
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
      };
    },
    selectScene(state, sceneToSelect) {
      const lenses = sceneToSelect.lenses.map(lense => new Lens(lense));
      return { ...state, lenses: lenses || state.lenses };
    },
    updateSettings(state, settings) {
      return { ...state, settings };
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
