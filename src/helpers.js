function compareArrays(arr1, arr2) {
  return arr1.length === arr2.length && arr1.every((e, i) => e === arr2[i]);
}

function logCords(...cords) {
  const fCords = cords.map(c => Math.floor(c * 100) / 100.0);
  console.log(...fCords);
}

export { compareArrays, logCords };
