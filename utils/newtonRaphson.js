import { ref } from "vue";
import Complex from "complex.js";
import { matrix, inv, lusolve, re } from "mathjs";
const baseVoltage = 115; // кВ
const basePower = 100; // МВА
const baseImpedance = Math.pow(baseVoltage, 2) / basePower; //// 132.25 Ом
const baseAdmittance = 1 / baseImpedance; //0.007558718861209964 1/Ом

let result = [];

const nodes = ref([
  {
    voltageKV: 110.0,
    voltageAngle: 0.0,
    activePowerMW: 0.0,
    reactivePowerMVAR: 0.0,
  },
  {
    voltageKV: 110.0,
    voltageAngle: -5.0,
    activePowerMW: 20.0,
    reactivePowerMVAR: 10.0,
  },
  {
    voltageKV: 110.0,
    voltageAngle: 0.0,
    activePowerMW: 0.0,
    reactivePowerMVAR: 0.0,
  },
  {
    voltageKV: 10.0,
    voltageAngle: 0.0,
    activePowerMW: 5.0,
    reactivePowerMVAR: 4.0,
  },
  {
    voltageKV: 10.0,
    voltageAngle: 0.0,
    activePowerMW: 7.0,
    reactivePowerMVAR: 10.0,
  },
  // другие узлы
]);

const Y = [
  [Complex({ re: 264.5, im: -529 }), Complex({ re: -264.5, im: 529 })],
  [Complex({ re: -264.5, im: 529 }), Complex({ re: 264.5, im: -529 })],
];

const jacobianMatrix = (Y, V, P, Q) => {
  const n = V.length;
  const J = Array(2 * n)
    .fill()
    .map(() => Array(2 * n).fill(0));

  for (let i = 0; i < n; i++) {
    const vi = V[i];
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        const yij = new Complex(Y[i][j]);
        const vj = V[j];
        const deltaTheta = vi.arg() - vj.arg();
        const magYij = yij.abs();
        const thetaij = yij.arg();

        J[i][j] = -magYij * vj.abs() * Math.sin(thetaij - deltaTheta);
        J[i][j + n] = magYij * Math.cos(thetaij - deltaTheta);
        J[i + n][j] = magYij * vj.abs() * Math.cos(thetaij - deltaTheta);
        J[i + n][j + n] = magYij * Math.sin(thetaij - deltaTheta);
      } else {
        let sum1 = 0;
        let sum2 = 0;
        for (let k = 0; k < n; k++) {
          if (k !== i) {
            const yik = new Complex(Y[i][k]);
            const vk = V[k];
            const deltaTheta = vi.arg() - vk.arg();
            const magYik = yik.abs();
            const thetaik = yik.arg();

            sum1 += magYik * vk.abs() * Math.sin(thetaik - deltaTheta);
            sum2 += magYik * vk.abs() * Math.cos(thetaik - deltaTheta);
          }
        }
        J[i][i] = sum1;
        J[i][i + n] = -sum2;
        J[i + n][i] = sum2;
        J[i + n][i + n] = sum1;
      }
    }
  }
  return J;
};

const solveLinearEquation = (A, b) => {
  const mathA = matrix(
    A.map((row) => row.map((value) => new Complex(value, 0)))
  );
  const mathB = matrix(b.map((value) => new Complex(value, 0)));
  const solution = lusolve(mathA, mathB);
  return solution.toArray().map((row) => row[0].re);
};

const newtonRaphson = (nodes, Y) => {
  const n = nodes.value.length;
  console.log("n", n);
  const tolerance = 1e-1;
  const maxIterations = 100;

  let V = nodes.value.map((node) => {
    const voltage = parseFloat(node.voltageKV) / baseVoltage;
    const angleRad = (parseFloat(node.voltageAngle) * Math.PI) / 180;
    const real = voltage * Math.cos(angleRad);
    const imag = voltage * Math.sin(angleRad);
    return new Complex(real, imag);
  });
  //до сюда работает

  let converged = false;

  for (let iter = 0; iter < maxIterations; iter++) {
    const P = Array(n).fill(0);
    // console.log("P", P);
    const Q = Array(n).fill(0);
    // console.log("Q", Q);
    // console.log("///");

    // Calculate P and Q
    for (let i = 0; i < n; i++) {
      let sumP = new Complex(0, 0);
      let sumQ = new Complex(0, 0);
      for (let j = 0; j < n; j++) {
        console.log(i, j);
        if (i !== j) {
          const yij = Y[i][j];
          const vj = V[j];
          const vi = V[i];
          const thetaij = yij.arg();
          const magYij = yij.abs();
          const magVj = vj.abs();
          const deltaTheta = vi.arg() - vj.arg();
          //   console.log("yij", yij);
          //   console.log("vj", vj);
          //   console.log("vi", vi);
          //   console.log("thetaij", thetaij);
          //   console.log("magYij", magYij);
          //   console.log("magVj", magVj);
          //   console.log("deltaTheta", deltaTheta);

          sumP = sumP.add(magYij * magVj * Math.cos(thetaij - deltaTheta));
          sumQ = sumQ.add(magYij * magVj * Math.sin(thetaij - deltaTheta));
          console.log("SUM", sumP, sumQ);
        }
      }
      const vi = V[i];
      P[i] = vi.abs() * sumP.re;
      Q[i] = vi.abs() * sumQ.im;
    }

    // Log P and Q
    // console.log(`Iteration ${iter + 1}`);
    // console.log("P:", P);
    // console.log("Q:", Q);

    // Calculate deltaP and deltaQ
    const deltaP = nodes.value.map(
      (node, i) => parseFloat(node.activePowerMW) / basePower - P[i]
    );
    const deltaQ = nodes.value.map(
      (node, i) => parseFloat(node.reactivePowerMVAR) / basePower - Q[i]
    );

    // console.log("deltaP:", deltaP);
    // console.log("deltaQ:", deltaQ);

    // Check convergence
    if (
      deltaP.every((val) => Math.abs(val) < tolerance) &&
      deltaQ.every((val) => Math.abs(val) < tolerance)
    ) {
      converged = true;
      break;
    }

    // Calculate Jacobian matrix and update V
    const J = jacobianMatrix(Y, V, P, Q);
    const deltaThetaV = solveLinearEquation(J, deltaP.concat(deltaQ));

    for (let i = 0; i < n; i++) {
      const deltaTheta = deltaThetaV[i];
      const deltaV = deltaThetaV[i + n];
      V[i] = new Complex(
        V[i].re + deltaV * Math.cos(V[i].arg() + deltaTheta),
        V[i].im + deltaV * Math.sin(V[i].arg() + deltaTheta)
      );
    }
  }

  if (converged) {
    result.value = V.map((v, i) => ({
      voltage: v.abs(),
      angle: (v.arg() * 180) / Math.PI,
      error: Math.max(...deltaP.map(Math.abs), ...deltaQ.map(Math.abs)),
    }));
  } else {
    result.value = [{ error: "Did not converge" }];
  }

  return result.value; // Return results for further debugging
};

newtonRaphson(nodes, Y);
console.log("result", result.value);
