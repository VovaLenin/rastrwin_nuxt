<template>
  <div>
    <h3>Network Calculation using Newton's Method</h3>
    <button @click="calculate">Calculate</button>
    <div v-if="Y.length">{{ Y }}</div>
    <!-- <div v-if="result.length">
      <h4>Calculation Results:</h4>
      <table>
        <thead>
          <tr>
            <th>Node</th>
            <th>Voltage (pu)</th>
            <th>Angle (degrees)</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(res, index) in result" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ res.voltage.toFixed(4) }}</td>
            <td>{{ res.angle.toFixed(4) }}</td>
            <td>{{ res.error.toFixed(4) }}</td>
          </tr>
        </tbody>
      </table>
    </div> -->
  </div>
</template>

<script>
import { ref } from "vue";
import Complex from "complex.js";
import { matrix, inv, lusolve, re } from "mathjs";

export default {
  setup() {
    const nodes = ref([
      {
        voltageKV: 115.0,
        voltageAngle: 0.0,
        activePowerMW: 0.0,
        reactivePowerMVAR: 0.0,
      },
      {
        voltageKV: 115.0,
        voltageAngle: -5.0,
        activePowerMW: 20.0,
        reactivePowerMVAR: 10.0,
      },
      // другие узлы
    ]);

    const branches = ref([
      { from: 1, to: 2, resistanceOhms: 0.1, reactanceOhms: 0.2, ratio: 1.0 },
      // другие ветви
    ]);

    const baseVoltage = 115; // кВ
    const basePower = 100; // МВА
    const baseImpedance = Math.pow(baseVoltage, 2) / basePower; //// 132.25 Ом
    const baseAdmittance = 1 / baseImpedance; //0.007558718861209964 1/Ом

    const result = ref([]);

    const calculate = () => {
      const Y = initAdmittanceMatrix(nodes.value.length);
      populateAdmittanceMatrix(Y, nodes.value, branches.value);
      newtonRaphson(nodes.value, Y);
    };

    //Функция initAdmittanceMatrix создаёт и инициализирует матрицу проводимости (адмиттанс) размером size x size, заполняя её комплексными числами, равными нулю
    const initAdmittanceMatrix = (size) => {
      const matrix = [];
      for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
          row.push(new Complex(0, 0));
        }
        console.log(row);
        matrix.push(row);
      }
      return matrix;
    };
    //Функция populateAdmittanceMatrix обновляет матрицу адмиттанса (проводимости) Y на основе информации об узлах и ветвях
    const populateAdmittanceMatrix = (Y, nodes, branches) => {
      branches.forEach((branch) => {
        const r = branch.resistanceOhms / baseImpedance;
        const x = branch.reactanceOhms / baseImpedance;
        const z = new Complex(r, x);
        const y = z.inverse();
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

    //Функция newtonRaphson использует метод Ньютона-Рапсона для решения уравнений и нахождения стационарных значений в системе, определяемой узлами и матрицей проводимости
    const newtonRaphson = (nodes, Y) => {
      const n = nodes.length;
      const tolerance = 1e-6;
      const maxIterations = 100;

      let V = nodes.map((node) => {
        const voltage = parseFloat(node.voltageKV) / baseVoltage;
        const angleRad = (parseFloat(node.voltageAngle) * Math.PI) / 180;
        return Complex.fromPolar(voltage, angleRad);
      });

      let converged = false;

      for (let iter = 0; iter < maxIterations; iter++) {
        const P = Array(n).fill(0);
        const Q = Array(n).fill(0);

        for (let i = 0; i < n; i++) {
          let sumP = new Complex(0, 0);
          let sumQ = new Complex(0, 0);
          for (let j = 0; j < n; j++) {
            if (i !== j) {
              const yij = Y[i][j];
              const vj = V[j];
              const vi = V[i];
              const thetaij = yij.arg();
              const magYij = yij.abs();
              const magVj = vj.abs();
              const deltaTheta = vi.arg() - vj.arg();

              sumP = sumP.add(magYij * magVj * Math.cos(thetaij - deltaTheta));
              sumQ = sumQ.add(magYij * magVj * Math.sin(thetaij - deltaTheta));
            }
          }
          const vi = V[i];
          P[i] = vi.abs() * sumP.re;
          Q[i] = vi.abs() * sumQ.im;
        }

        const deltaP = nodes.map(
          (node, i) => parseFloat(node.activePowerMW) / basePower - P[i]
        );
        const deltaQ = nodes.map(
          (node, i) => parseFloat(node.reactivePowerMVAR) / basePower - Q[i]
        );

        if (
          deltaP.every((val) => Math.abs(val) < tolerance) &&
          deltaQ.every((val) => Math.abs(val) < tolerance)
        ) {
          converged = true;
          break;
        }

        const J = jacobianMatrix(Y, V, P, Q);
        const deltaThetaV = solveLinearEquation(J, deltaP.concat(deltaQ));

        for (let i = 0; i < n; i++) {
          const deltaTheta = deltaThetaV[i];
          const deltaV = deltaThetaV[i + n];
          V[i] = Complex.fromPolar(
            V[i].abs() + deltaV,
            V[i].arg() + deltaTheta
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
    };

    const jacobianMatrix = (Y, V, P, Q) => {
      const n = V.length;
      const J = Array(2 * n)
        .fill()
        .map(() => Array(2 * n).fill(0));

      for (let i = 0; i < n; i++) {
        const vi = V[i];
        for (let j = 0; j < n; j++) {
          if (i !== j) {
            const yij = Y[i][j];
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
                const yik = Y[i][k];
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
        A.map((row) => row.map((value) => new Complex(value.re, value.im)))
      );
      const mathB = matrix(b.map((value) => new Complex(value, 0)));
      const solution = lusolve(mathA, mathB);
      return solution.toArray().map((row) => row[0].re);
    };

    return { calculate, result };
  },
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
}

th {
  background-color: #f2f2f2;
  text-align: left;
}
</style>
