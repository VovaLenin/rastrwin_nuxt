//РАБОТАЕТ, РАЗНИЦА В 0.2474

// const { ref } = require("vue");
// const Complex = require("complex.js");
import { ref } from "vue";
import Complex from "complex.js";

const nodes = ref([
  {
    voltageKV: 115.0,
    voltageAngle: 0.0,
    activePowerMW: 0.0,
    reactivePowerMVAR: 0.0,
    conductanceMicroS: 0.0,
    susceptanceMicroS: 0.0,
  },
  {
    voltageKV: 115.0,
    voltageAngle: -5.0,
    activePowerMW: 20.0,
    reactivePowerMVAR: 10.0,
    conductanceMicroS: 0.0,
    susceptanceMicroS: 0.0,
  },
]);

const branches = ref([
  { from: 1, to: 2, resistanceOhms: 0.1, reactanceOhms: 0.2, ratio: 1.0 },
]);

const baseVoltage = 115; // кВ
const basePower = 100; // МВА
const baseImpedance = Math.pow(baseVoltage, 2) / basePower; // 132.25 Ом
const baseAdmittance = 1 / baseImpedance; // 0.007558718861209964 1/Ом

const initAdmittanceMatrix = (size) => {
  const matrix = [];
  for (let i = 0; i < size; i++) {
    matrix[i] = [];
    for (let j = 0; j < size; j++) {
      matrix[i][j] = new Complex(0, 0);
    }
  }
  return matrix;
};

const populateAdmittanceMatrix = (Y, nodes, branches) => {
  branches.forEach((branch) => {
    const r = branch.resistanceOhms / baseImpedance; // 0.1 / 132.25 = 0.0007561436672967864
    const x = branch.reactanceOhms / baseImpedance; // 0.2 / 132.25 = 0.0015122873345935729
    const z = new Complex(r, x); // z = 0.000756 + 0.001513i, а точнее z { re: 0.0007561436672967864, im: 0.0015122873345935729 }
    // const y = z.inverse(); // y = 1 / z т.е. y { re: 264.5, im: -529 }

    // Вычисление обратного значения вручную
    const denominator = r * r + x * x; // 0.000756^2 + 0.001513^2 = 0.000002858766227965166
    console.log("denominator", denominator);
    const yRe = r / denominator; // 0.000756 / (0.000756^2 + 0.001513^2)
    const yIm = -x / denominator; // -0.001513 / (0.000756^2 + 0.001513^2)
    const y = new Complex(yRe, yIm);
    console.log("y", y);

    const k = new Complex(branch.ratio, 0);

    const from = branch.from - 1;
    const to = branch.to - 1;

    Y[from][from] = Y[from][from].add(y);
    Y[to][to] = Y[to][to].add(y.mul(k).mul(k));
    Y[from][to] = Y[from][to].sub(y.mul(k));
    Y[to][from] = Y[to][from].sub(y.mul(k));
  });

  nodes.forEach((node, i) => {
    const yNode = new Complex(
      node.conductanceMicroS,
      node.susceptanceMicroS
    ).mul(baseAdmittance);
    Y[i][i] = Y[i][i].add(yNode);
  });
};

// Обновление теста
// test("populateAdmittanceMatrix fills Y matrix correctly", () => {
const Y = initAdmittanceMatrix(nodes.value.length);
populateAdmittanceMatrix(Y, nodes.value, branches.value);
console.log("Y", Y);

//   // Проверка значения y = 264.2526 - 529.1497i
//   const expectedYRe = 264.2526;
//   const expectedYIm = -529.1497;

//   expect(Y[0][0].re).toBeCloseTo(expectedYRe);
//   expect(Y[0][0].im).toBeCloseTo(expectedYIm);
//   expect(Y[1][1].re).toBeCloseTo(expectedYRe);
//   expect(Y[1][1].im).toBeCloseTo(expectedYIm);
//   expect(Y[0][1].re).toBeCloseTo(-expectedYRe);
//   expect(Y[0][1].im).toBeCloseTo(-expectedYIm);
//   expect(Y[1][0].re).toBeCloseTo(-expectedYRe);
//   expect(Y[1][0].im).toBeCloseTo(-expectedYIm);
// });
