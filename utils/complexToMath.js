import { complex } from "mathjs";
// Функция для преобразования матрицы из complex.js в math.js
export default function complexToMath(matrix) {
  return matrix.map((row) => row.map((cell) => complex(cell.re, cell.im)));
}
