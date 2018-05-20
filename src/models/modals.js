const modals = {
  state: {
    modals: {
      addLens: false,
    },
  },
  reducers: {
    toggleModal(state, payload) {
      return {
        ...state,
        modals: {
          ...state.modals,
          addLens: payload.addLens,
        },
      };
    },
  },
};

export default modals;
