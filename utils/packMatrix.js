//РАБОТАЕТ

import { Complex, matrix, inv, lusolve } from "mathjs";

// Функция упаковки матрицы в CSR формат
export default function packMatrix(mat) {
  const values = [];
  const indices = [];
  const indptr = [0];

  for (let i = 0; i < mat.length; i++) {
    const row = mat[i];
    for (let j = 0; j < row.length; j++) {
      const value = row[j];
      if (!value.equals(new Complex(0, 0))) {
        values.push(value);
        indices.push(j);
      }
    }
    indptr.push(values.length);
  }

  return { values, indices, indptr };
}

// Функция распаковки матрицы из CSR формата
function unpackMatrix({ values, indices, indptr }, rows, cols) {
  const mat = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => new Complex(0, 0))
  );

  for (let i = 0; i < rows; i++) {
    for (let idx = indptr[i]; idx < indptr[i + 1]; idx++) {
      const j = indices[idx];
      mat[i][j] = values[idx];
    }
  }

  return mat;
}

// Функция нахождения обратной матрицы методом Гаусса-Жордана
function invertMatrix(mat) {
  const mathMatrix = matrix(
    mat.map((row) => row.map((value) => new Complex(value.re, value.im)))
  );
  const invMatrix = inv(mathMatrix);
  return invMatrix
    .toArray()
    .map((row) => row.map((value) => new Complex(value.re, value.im)));
}

// Функция решения системы линейных уравнений Ax = b
function solveLinearEquation(A, b) {
  const mathA = matrix(
    A.map((row) => row.map((value) => new Complex(value.re, value.im)))
  );
  const mathB = matrix(b.map((value) => new Complex(value.re, value.im)));
  const solution = lusolve(mathA, mathB);
  return solution.toArray().map((row) => new Complex(row[0].re, row[0].im));
}

// Пример использования
const matrixY = [
  [new Complex(1, 1), new Complex(0, 0), new Complex(2, 3)],
  [new Complex(0, 0), new Complex(4, 5), new Complex(0, 0)],
  [new Complex(2, 3), new Complex(0, 0), new Complex(6, 7)],
];

// Упаковка матрицы
const packedMatrix = packMatrix(matrixY);

// Распаковка матрицы
const unpackedMatrix = unpackMatrix(packedMatrix, 3, 3);

// Нахождение обратной матрицы
const inverseMatrix = invertMatrix(unpackedMatrix);

// Решение системы линейных уравнений Ax = b
const vectorB = [new Complex(1, 0), new Complex(2, 0), new Complex(3, 0)];
const solution = solveLinearEquation(unpackedMatrix, vectorB);

console.log("Original Matrix:", matrixY);
console.log("Packed Matrix:", packedMatrix);
console.log("Unpacked Matrix:", unpackedMatrix);
console.log("Inverse Matrix:", inverseMatrix);
console.log("Solution:", solution);
