// import set from 'lodash/fp/set';
import Lens from '../Scene/Graphics/core/Lens';

const scene = {
  state: {
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
        id: 'jhk75biq',
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
  },
};

export default scene;
