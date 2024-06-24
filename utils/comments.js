// (function () {
//   console.log("U1Y", U1Y);
// })();

//ПРОВЕРКА W
// (function () {
//   console.log(
//     `Итерация ${iter} [${i}] W=${W[i].re.toFixed(4)} ${W[
//       i
//     ].im.toFixed(4)}`
//   );
//   console.log("!");
// })();

//ИТОГОВАЯ ПРОВЕРКА W
// (function () {
//   console.log(
//     `ИТОГОВЫЙ ИТОГ W=${W.map((i) => {
//       return `\n${i.re.toFixed(3)} ${i.im.toFixed(3)}`;
//     })}`
//   );
//   console.log("!!!!!!!!!!!!!!!");
// })();
// (function () {
//   console.log("ВЭ", W);
// })();

//ПРОВЕРКА DU
// DU.forEach((row, i) => {
//   console.log(`i=${i} DU=${DU[i].toString()}`);
// });

// [
//   ["1", "", "", "230", "", "0", "0", "0", "0"],
//   ["2", "", "", "115", "", "-100", "-41.2", "0", "0"],
//   ["3", "", "", "110", "", "40", "20", "0", "0"],
//   ["4", "", "", "220", "", "10", "-30", "0", "0"],
//   ["5", "", "", "110", "", "80", "40", "0", "0"],
//   ["6", "", "", "230", "", "100", "60", "0", "0"],
// ],
//   [
//     ["Линия 1-6", "1", "6", "14.4", "51.6", "1"],
//     ["Линия 6-4", "6", "4", "12.0", "43", "1"],
//     ["Линия 4-3", "4", "3", "5.26", "10", "0.5"],
//     ["Трансформатор 3-2", "3", "2", "37.35", "60", "1"],
//     ["Линия 6-5", "6", "5", "11.44", "27.6", "0.478"],
//     ["Трансформатор 5-2", "5", "2", "14.94", "24", "1"],
//     ["Линия 1-4", "1", "4", "10.8", "38.7", "1"],
//   ];

// import Complex from "complex.js";
import { inv, complex } from "mathjs";
// import complexToMath from "./complexToMath";
// import mathToComplex from "./mathToComplex";

// export default function invertMatrix(matrix) {
// const mathMatrix = complexToMath(matrix);
const mathMatrix = [
  [
    complex(0.012, -0.0421),
    complex(0.0, 0.0),
    complex(0.0, 0.0),
    complex(-0.007, 0.024),
    complex(0.0, 0.0),
    complex(-0.005, 0.018),
  ],
  [
    complex(0.0, 0.0),
    complex(0.026, -0.0421),
    complex(-0.007, 0.012),
    complex(0.0, 0.0),
    complex(-0.019, 0.03),
    complex(0.0, 0.0),
  ],
  [
    complex(0.0, 0.0),
    complex(-0.007, 0.012),
    complex(0.018, -0.0321),
    complex(-0.021, 0.039),
    complex(0.0, 0.0),
    complex(0.0, 0.0),
  ],
  [
    complex(-0.007, 0.024),
    complex(0.0, 0.0),
    complex(-0.021, 0.0391),
    complex(0.054, -0.124),
    complex(0.0, 0.0),
    complex(-0.006, 0.022),
  ],
  [
    complex(0.0, 0.0),
    complex(-0.019, 0.03),
    complex(0.0, 0.0),
    complex(0.0, 0.0),
    complex(0.022, -0.037),
    complex(-0.006, 0.015),
  ],
  [
    complex(-0.005, 0.018),
    complex(0.0, 0.0),
    complex(0.0, 0.0),
    complex(-0.006, 0.0221),
    complex(-0.006, 0.015),
    complex(0.024, -0.07),
  ],
];
const inverseMatrix = inv(mathMatrix);
console.log("inverseMatrix", inverseMatrix);
