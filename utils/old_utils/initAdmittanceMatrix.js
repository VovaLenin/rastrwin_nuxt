//РАБОТАЕТ

import Complex from "complex.js";
const initAdmittanceMatrix = (size) => {
  const matrix = [];
  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) {
      row.push(new Complex(0, 0));
    }
    matrix.push(row);
  }
  console.log("MATRIX: ", matrix);
  return matrix;
};
initAdmittanceMatrix(2);
