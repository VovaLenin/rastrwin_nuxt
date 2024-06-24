import roundValues from "./roundValues";
import Complex from "complex.js";

export default function invertMatrix(matrix) {
  const nodes = matrix.length;
  let YP = [...matrix];
  const Z = [];
  const none = new Complex(-1);

  for (let k = 0; k < nodes; k++) {
    for (let i = 0; i < nodes; i++) {
      Z[i] = [];
      for (let j = 0; j < nodes; j++) {
        if (i === k && j === k) {
          Z[i][j] = YP[i][j].inverse();
        }
        if (i !== k && j === k) {
          Z[i][j] = none.mul(YP[i][j].mul(YP[k][k].inverse())); // none * YP[i, j] * YP[k, k].Obr
        }
        if (i === k && j !== k) {
          Z[i][j] = YP[i][j].mul(YP[k][k].inverse()); // YP[i, j] * YP[k, k].Obr
        }
        if (i !== k && j !== k) {
          Z[i][j] = YP[i][j].sub(
            YP[i][k].mul(YP[k][j].mul(YP[k][k].inverse())) // YP[i, j] - YP[i, k] * YP[k, j] * YP[k, k].Obr
          );
        }
      }
    }
    YP = [...Z];
  }
  // const Z1 = roundValues(Z, 3);
  // console.log("Матрица импедансов", Z, matrix);
  return Z;
}

// // import roundValues from "./roundValues";
// // import Complex from "complex.js";

// // export default function invertMatrix(matrix) {
// //   const nodes = matrix.length;
// //   let YP = matrix.map((row) => row.map((cell) => new Complex(cell))); // глубокое копирование и преобразование к Complex
// //   let Z = Array.from({ length: nodes }, () =>
// //     Array(nodes).fill(new Complex(0, 0))
// //   );
// //   const none = new Complex(-1, 0);

// //   for (let k = 0; k < nodes; k++) {
// //     for (let i = 0; i < nodes; i++) {
// //       for (let j = 0; j < nodes; j++) {
// //         if (i === k && j === k) {
// //           Z[i][j] = YP[i][j].inverse();
// //         } else if (i !== k && j === k) {
// //           Z[i][j] = none.mul(YP[i][j].mul(YP[k][k].inverse())); // none * YP[i, j] * YP[k, k].Obr
// //         } else if (i === k && j !== k) {
// //           Z[i][j] = YP[i][j].mul(YP[k][k].inverse()); // YP[i, j] * YP[k, k].Obr
// //         } else if (i !== k && j !== k) {
// //           Z[i][j] = YP[i][j].sub(
// //             YP[i][k].mul(YP[k][j].mul(YP[k][k].inverse())) // YP[i, j] - YP[i, k] * YP[k, j] * YP[k, k].Obr
// //           );
// //         }
// //       }
// //     }
// //     YP = Z.map((row) => row.map((cell) => new Complex(cell))); // глубокое копирование для следующей итерации
// //   }

// //   // const Z1 = roundValues(Z, 3);
// //   // console.log("Матрица импедансов", Z, matrix);
// //   return Z;
// // }

// // // Подключение библиотеки complex.js
// // import Complex from "complex.js";

// // // Функция для вычисления детерминанта матрицы
// // function determinant(matrix) {
// //   const n = matrix.length;

// //   if (n === 1) {
// //     return matrix[0][0];
// //   }

// //   if (n === 2) {
// //     return matrix[0][0].mul(matrix[1][1]).sub(matrix[0][1].mul(matrix[1][0]));
// //   }

// //   let det = new Complex(0, 0);
// //   for (let i = 0; i < n; i++) {
// //     const subMatrix = matrix
// //       .slice(1)
// //       .map((row) => row.filter((_, j) => j !== i));
// //     const sign = new Complex(i % 2 === 0 ? 1 : -1, 0);
// //     det = det.add(sign.mul(matrix[0][i]).mul(determinant(subMatrix)));
// //   }
// //   return det;
// // }

// // // Функция для получения минора (подматрицы) без строки и столбца
// // function minor(matrix, row, col) {
// //   return matrix
// //     .filter((_, i) => i !== row)
// //     .map((row) => row.filter((_, j) => j !== col));
// // }

// // // Функция для вычисления матрицы кофакторов
// // function cofactors(matrix) {
// //   const n = matrix.length;
// //   const result = Array.from({ length: n }, () => Array(n).fill(null));

// //   for (let i = 0; i < n; i++) {
// //     for (let j = 0; j < n; j++) {
// //       const subMatrix = minor(matrix, i, j);
// //       const sign = (i + j) % 2 === 0 ? new Complex(1, 0) : new Complex(-1, 0);
// //       result[i][j] = sign.mul(determinant(subMatrix));
// //     }
// //   }
// //   return result;
// // }

// // // Функция для транспонирования матрицы
// // function transpose(matrix) {
// //   const n = matrix.length;
// //   const result = Array.from({ length: n }, () => Array(n).fill(null));

// //   for (let i = 0; i < n; i++) {
// //     for (let j = 0; j < n; j++) {
// //       result[j][i] = matrix[i][j];
// //     }
// //   }
// //   return result;
// // }

// // // Функция для деления матрицы на скалярное значение
// // function divideByScalar(matrix, scalar) {
// //   const n = matrix.length;
// //   return matrix.map((row) => row.map((value) => value.div(scalar)));
// // }

// // // Основная функция для инверсии матрицы
// // export default function invertMatrix(matrix) {
// //   const det = determinant(matrix);

// //   if (det.equals(new Complex(0, 0))) {
// //     throw new Error(
// //       "Матрица является вырожденной и не может быть инвертирована."
// //     );
// //   }

// //   const cofactorsMatrix = cofactors(matrix);
// //   const adjugateMatrix = transpose(cofactorsMatrix);
// //   const inverseMatrix = divideByScalar(adjugateMatrix, det);

// //   return inverseMatrix;
// // }

// import Complex from "complex.js";
// import { inv } from "mathjs";
// import complexToMath from "./complexToMath";
// import mathToComplex from "./mathToComplex";

// // export default function invertMatrix(matrix) {
// // const mathMatrix = complexToMath(matrix);
// const mathMatrix = [
//   [
//     math.complex(0.012, -0.0421),
//     math.complex(0.0, 0.0),
//     math.complex(0.0, 0.0),
//     math.complex(-0.007, 0.024),
//     math.complex(0.0, 0.0),
//     math.complex(-0.005, 0.018),
//   ],
//   [
//     math.complex(0.0, 0.0),
//     math.complex(0.026, -0.0421),
//     math.complex(-0.007, 0.012),
//     math.complex(0.0, 0.0),
//     math.complex(-0.019, 0.03),
//     math.complex(0.0, 0.0),
//   ],
//   [
//     math.complex(0.0, 0.0),
//     math.complex(-0.007, 0.012),
//     math.complex(0.018, -0.0321),
//     math.complex(-0.021, 0.039),
//     math.complex(0.0, 0.0),
//     math.complex(0.0, 0.0),
//   ],
//   [
//     math.complex(-0.007, 0.024),
//     math.complex(0.0, 0.0),
//     math.complex(-0.021, 0.0391),
//     math.complex(0.054, -0.124),
//     math.complex(0.0, 0.0),
//     math.complex(-0.006, 0.022),
//   ],
//   [
//     math.complex(0.0, 0.0),
//     math.complex(-0.019, 0.03),
//     math.complex(0.0, 0.0),
//     math.complex(0.0, 0.0),
//     math.complex(0.022, -0.037),
//     math.complex(-0.006, 0.015),
//   ],
//   [
//     math.complex(-0.005, 0.018),
//     math.complex(0.0, 0.0),
//     math.complex(0.0, 0.0),
//     math.complex(-0.006, 0.0221),
//     math.complex(-0.006, 0.015),
//     math.complex(0.024, -0.07),
//   ],
// ];
// const inverseMatrix = inv(mathMatrix);
// console.log("inverseMatrix", inverseMatrix);
// // const complexMatrix = mathToComplex(inverseMatrix);
// // return complexMatrix;
// // }
