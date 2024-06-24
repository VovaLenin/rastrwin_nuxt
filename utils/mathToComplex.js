import Complex from "complex.js";
// Функция для преобразования матрицы из math.js в complex.js
export default function mathToComplex(matrix) {
  return matrix.map((row) => row.map((cell) => new Complex(cell.re, cell.im)));
}
