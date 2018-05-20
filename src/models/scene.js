// import set from 'lodash/fp/set';
import Lens from '../Scene/Graphics/core/Lens';

const scene = {
  state: {
    lenses: [
      new Lens({
        type: Lens.TYPE.BICONVEX,
        pos: [-0.5, 0.0],
        height: 0.375,
        width: 0.15,
        leftRadius: 0.75,
        rightRadius: 0.75,
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
