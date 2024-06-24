export function isEmptyValuesArray(arr) {
  return arr.every(
    (item) => item === null || item === undefined || item === ""
  );
}
