function compareArrays(arr1, arr2) {
  return arr1.length === arr2.length && arr1.every((e, i) => e === arr2[i]);
}

export { compareArrays };
