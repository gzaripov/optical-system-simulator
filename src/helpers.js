function compareArrays(arr1, arr2) {
  return arr1.length === arr2.length && arr1.every((e, i) => e === arr2[i]);
}

function logCords(...cords) {
  const fCords = cords.map(c => Math.floor(c * 100) / 100.0);
  console.log(...fCords);
}

function normalizeCords(x, y, w, h) {
  const side = Math.min(w, h);
  const mx = x / w * 2 - 1;
  const my = -(y / h * 2 - 1);
  return [mx * (w / side), my * (h / side)];
}

function denormalizeCords(x, y, w, h) {
  const side = Math.min(w, h);
  const nx = x / (w / side);
  const ny = y / (h / side);
  const mx = (nx + 1) * w / 2;
  const my = (-ny + 1) * h / 2;
  return [mx, my];
}

export { compareArrays, logCords, normalizeCords, denormalizeCords };
