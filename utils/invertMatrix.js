// import roundValues from "./roundValues";
// import Complex from "complex.js";

// export default function invertMatrix(matrix) {
//   const nodes = matrix.length;
//   let YP = [...matrix];
//   const Z = [];
//   const none = new Complex(-1);

//   for (let k = 0; k < nodes; k++) {
//     for (let i = 0; i < nodes; i++) {
//       Z[i] = [];
//       for (let j = 0; j < nodes; j++) {
//         if (i === k && j === k) {
//           Z[i][j] = YP[i][j].inverse();
//         }
//         if (i !== k && j === k) {
//           Z[i][j] = none.mul(YP[i][j].mul(YP[k][k].inverse())); // none * YP[i, j] * YP[k, k].Obr
//         }
//         if (i === k && j !== k) {
//           Z[i][j] = YP[i][j].mul(YP[k][k].inverse()); // YP[i, j] * YP[k, k].Obr
//         }
//         if (i !== k && j !== k) {
//           Z[i][j] = YP[i][j].sub(
//             YP[i][k].mul(YP[k][j].mul(YP[k][k].inverse())) // YP[i, j] - YP[i, k] * YP[k, j] * YP[k, k].Obr
//           );
//         }
//       }
//     }
//     YP = [...Z];
//   }
//   // const Z1 = roundValues(Z, 3);
//   // console.log("Матрица импедансов", Z, matrix);
//   return Z;
// }

import roundValues from "./roundValues";
import Complex from "complex.js";

export default function invertMatrix(matrix) {
  const nodes = matrix.length;
  let YP = matrix.map((row) => row.map((cell) => new Complex(cell))); // глубокое копирование и преобразование к Complex
  let Z = Array.from({ length: nodes }, () =>
    Array(nodes).fill(new Complex(0, 0))
  );
  const none = new Complex(-1, 0);

  for (let k = 0; k < nodes; k++) {
    for (let i = 0; i < nodes; i++) {
      for (let j = 0; j < nodes; j++) {
        if (i === k && j === k) {
          Z[i][j] = YP[i][j].inverse();
        } else if (i !== k && j === k) {
          Z[i][j] = none.mul(YP[i][j].mul(YP[k][k].inverse())); // none * YP[i, j] * YP[k, k].Obr
        } else if (i === k && j !== k) {
          Z[i][j] = YP[i][j].mul(YP[k][k].inverse()); // YP[i, j] * YP[k, k].Obr
        } else if (i !== k && j !== k) {
          Z[i][j] = YP[i][j].sub(
            YP[i][k].mul(YP[k][j].mul(YP[k][k].inverse())) // YP[i, j] - YP[i, k] * YP[k, j] * YP[k, k].Obr
          );
        }
      }
    }
    YP = Z.map((row) => row.map((cell) => new Complex(cell))); // глубокое копирование для следующей итерации
  }

  // const Z1 = roundValues(Z, 3);
  // console.log("Матрица импедансов", Z, matrix);
  return Z;
}
