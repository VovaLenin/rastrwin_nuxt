<template>
  <div class="container">
    <div class="title-container">
      <h3 style="text-align: center">
        Network Calculation using Newton's Method
      </h3>
      <div class="button-container">
        <button @click="saveData">Сохранить данные</button>
        <button @click="loadData">Загрузить данные</button>
      </div>
    </div>

    <CustomTable
      :headers="nodesHeaders"
      title="Параметры узлов"
      id="nodes"
      ref="nodesTable"
      @save-data="changeValues"
      :initial-data="networkParams.nodes"
    />
    <CustomTable
      :headers="branchesHeaders"
      title="Параметры ветвей"
      id="branches"
      ref="branchesTable"
      @save-data="changeValues"
      :initial-data="networkParams.branches"
    />
    <button @click="checkNetworkConnectivity">Связность сети</button>
    <label style="background-color: red">{{ networkConnectivityResult }}</label>
    <div class="button-container">
      <button
        @click="createConductivityMatrix"
        v-if="networkParams.branches.length && networkParams.nodes.length"
      >
        Создать матрицу проводимостей
      </button>
      <button @click="createImpedanceMatrix" v-if="conductivityMatrix.length">
        Создать матрицу импедансов
      </button>
    </div>
    <StaticTable
      :tableData="conductivityMatrix"
      title="Conductivity Matrix"
      ref="conductivityMatrix"
      v-if="conductivityMatrix.length"
    />
    <StaticTable
      :tableData="impedanceMatrix"
      title="Impedance Matrix"
      ref="impedanceMatrix"
      v-if="impedanceMatrix.length"
    />
    <div class="button-container">
      <button @click="calculateGaussSeidel">Расчет методом Зейделя</button>
      <button @click="calculate">Расчет методом Ньютона</button>
      <button @click="calculateSimpleIteration">
        Расчет методом простой итерации
      </button>
    </div>
    <div v-if="results.length">
      <h4>Результаты расчета</h4>
      <table>
        <thead>
          <tr>
            <th>№</th>
            <th>U_new</th>
            <th>Epsilon</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="result in results" :key="result.index">
            <td>{{ result.index }}</td>
            <td>{{ result.value }}</td>
            <td>{{ result.epsilon }}</td>
          </tr>
        </tbody>
      </table>
      <p>Количество итераций: {{ iterations }}</p>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import Complex from "complex.js";
import CustomTable from "./CustomTable.vue";
import StaticTable from "./StaticTable.vue";
import createMatrixY from "~/utils/createMatrixY";
import invertMatrix from "~/utils/invertMatrix";
import invertJacobian from "~/utils/invertJacobian";

export default {
  components: {
    CustomTable,
    StaticTable,
  },
  data() {
    return {
      nodesHeaders: [
        "№",
        "Название",
        "Тип",
        "U, кВ",
        "dU, гр",
        "P, Мвт",
        "Q, МВар",
        "Yd, мкСм",
        "Ym, мкСм",
      ],
      branchesHeaders: [
        "Название",
        "Узел начала",
        "Узел конца",
        "R, Om",
        "X, Ом",
        "Kt",
      ],
      networkParams: {
        branches: [],
        nodes: [],
      },
      conductivityMatrix: [],
      impedanceMatrix: [],
      results: [],
      iterations: 0,
      networkConnectivityResult: "",
    };
  },
  methods: {
    saveData() {
      const branchesTable = this.$refs.branchesTable;
      const nodesTable = this.$refs.nodesTable;

      if (branchesTable && nodesTable) {
        branchesTable.saveData();
        nodesTable.saveData();
      }
    },
    changeValues({ id, data }) {
      this.networkParams[id] = data;
      // console.log(this.networkParams);
    },
    loadData() {
      this.networkParams = {
        branches: [
          ["Линия 1", "1", "2", "40", "35", "1"],
          ["Линия 2", "1", "3", "40", "35", "1"],
          ["Линия 3", "2", "3", "40", "35", "1"],
          ["Трансформатор 1", "2", "4", "15", "20", "11"],
          ["Трансформатор 2", "3", "5", "15", "20", "11"],
        ],
        nodes: [
          ["1", "", "", "110", "", "0", "0", "0", "-460"],
          ["2", "", "", "110", "", "0", "0", "0", "-360"],
          ["3", "", "", "110", "", "0", "0", "0", "-360"],
          ["4", "", "", "10", "", "5", "4", "0", "0"],
          ["5", "", "", "10", "", "7", "10", "0", "0"],
        ],
      };
    },
    checkNetworkConnectivity() {
      const NU = this.networkParams.nodes.length;
      const NV = this.networkParams.branches.length;
      let Uzli = new Array(NU);
      for (let i = 0; i < NU; ++i) {
        Uzli[i] = parseInt(this.networkParams.nodes[i][0]);
      }

      let NN = new Array(NV);
      let NK = new Array(NV);
      for (let i = 0; i < NV; ++i) {
        NN[i] = parseInt(this.networkParams.branches[i][1]);
        NK[i] = parseInt(this.networkParams.branches[i][2]);
      }

      let k = NN[0];
      let kp = -1;

      for (let i = 0; i < NV; ++i) {
        if (NN[i] === k) {
          kp = NK[i];
        }

        if (NK[i] === k) {
          kp = NN[i];
        }

        let m = 0;
        for (let l = 0; l < NU; ++l) {
          if (kp === Uzli[l]) {
            m = 1;
          }
        }

        if (m !== 0) {
          for (let j = 0; j < NV; ++j) {
            if (NN[j] === kp) {
              NN[j] = k;
            }
            if (NK[j] === kp) {
              NK[j] = k;
            }
          }
          for (let d = 0; d < NU; ++d) {
            if (Uzli[d] === kp) {
              Uzli[d] = k;
            }
          }
        }
      }

      let priznak = 0;
      for (let i = 0; i < NV; ++i) {
        if (NN[i] !== k) {
          priznak = 1;
        }
        if (NK[i] !== k) {
          priznak = 1;
        }
      }

      for (let i = 0; i < NU; ++i) {
        if (Uzli[i] !== k) {
          priznak = 2;
        }
      }

      if (priznak === 0) {
        this.networkConnectivityResult = "Сеть связна";
      } else if (priznak === 1) {
        this.networkConnectivityResult =
          "Сеть несвязна. В сети есть висячие ветви";
      } else if (priznak === 2) {
        this.networkConnectivityResult =
          "Сеть несвязна. В сети есть висячие узлы";
      }
    },
    createConductivityMatrix() {
      this.checkNetworkConnectivity();
      if (!this.networkConnectivityResult) {
        return;
      }
      this.conductivityMatrix = createMatrixY(true, this.networkParams);
    },
    createImpedanceMatrix() {
      this.impedanceMatrix = invertMatrix(this.conductivityMatrix);
    },
    calculate() {
      const NU = this.networkParams.nodes.length;
      let U = this.networkParams.nodes.map(
        (node) => new Complex(Number(node[3]), 0)
      );
      let U_new = Array(NU)
        .fill()
        .map(() => new Complex(0, 0));
      let S = this.networkParams.nodes.map(
        (node) => new Complex(Number(node[5]), Number(node[6]))
      );
      let kt = Array(NU)
        .fill()
        .map(() => new Complex(1, 0));
      this.networkParams.branches.forEach((branch) => {
        const NUK = Number(branch[2]) - 1;
        kt[NUK] = new Complex(Number(branch[5]), 0);
      });

      U_new[0] = new Complex(U[0].toString()); // Начальное значение
      const err = 0.02; // Критерий сходимости
      const limit_iter = 50; // Лимит итераций
      let iter = 0;
      let eps = Array(NU).fill(0);
      let eps_marker;

      // МЕТОД НЬЮТОНА
      let W = new Array(NU).fill().map(() => new Complex(0, 0));
      let DU = new Array(NU).fill().map(() => new Complex(0, 0));
      let DW = this.deepCopyMatrix(this.conductivityMatrix);

      let U1Y = new Complex(0, 0);
      for (let i = 0; i < NU; ++i) {
        U1Y = U1Y.add(this.conductivityMatrix[0][i]);
      }
      U1Y = U[0].mul(U1Y);

      // Начало итерационного процесса
      do {
        // Формирование матрицы небалансов токов
        for (let i = 1; i < NU; ++i) {
          W[i] = new Complex(0, 0);
          for (let j = 0; j < NU; ++j) {
            W[i] = this.conductivityMatrix[i][j].mul(U[j]).add(W[i]); //ПЕРЕПРОВЕРИТЬ
          }

          const I = S[i].div(U[i]);
          W[i] = W[i].sub(I); //ПЕРЕПРОВЕРИТЬ
          W[i] = W[i].sub(U1Y);
        }

        // Формирование матрицы Якоби
        // DW = this.deepCopyMatrix(this.conductivityMatrix);
        for (let i = 1; i < NU; ++i) {
          const powU = U[i].mul(U[i]);
          // console.log(powU);
          DW[i][i] = S[i].div(powU).add(DW[i][i]); //ПЕРЕПРОВЕРИТЬ
        }

        // Обращение матрицы Якоби
        DW = invertJacobian(DW);

        // // Определяем небаланс напряжений
        DU = new Array(NU).fill().map(() => new Complex(0, 0));
        for (let i = 1; i < NU; i++) {
          for (let j = 1; j < NU; j++) {
            DU[i] = DW[i][j].mul(W[j]).add(DU[i]);
          }
        }

        for (let i = 0; i < NU; ++i) {
          U_new[i] = U[i].sub(DU[i]);
        }

        // Проверка погрешности и лимита итераций
        eps_marker = 0;
        for (let i = 1; i < NU; ++i) {
          eps[i] = DU[i].abs();
          if (eps[i] > err) {
            eps_marker = 1;
          }
        }

        if (eps_marker == 1) {
          for (let i = 0; i < NU; ++i) {
            U[i] = new Complex(U_new[i].re, U_new[i].im);
          }
        }

        ++iter;
      } while (eps_marker !== 0 && iter < limit_iter);

      this.results = U_new.map((u, i) => ({
        index: i,
        value: u.toString(),
        epsilon: eps[i].toFixed(6),
      }));
      this.iterations = iter;
    },
    calculateSimpleIteration() {
      const NU = this.networkParams.nodes.length;
      let U = this.networkParams.nodes.map(
        (node) => new Complex(Number(node[3]), 0)
      );
      let U_new = Array(NU)
        .fill()
        .map(() => new Complex(0, 0));
      let S = this.networkParams.nodes.map(
        (node) => new Complex(Number(node[5]), Number(node[6]))
      );
      let kt = Array(NU)
        .fill()
        .map(() => new Complex(1, 0));

      // Load branch data
      this.networkParams.branches.forEach((branch) => {
        const NUK = Number(branch[2]) - 1;
        kt[NUK] = new Complex(Number(branch[5]), 0);
      });

      U_new[0] = new Complex(U[0].toString()); // Начальное значение
      const err = 0.02; // Критерий сходимости
      const limit_iter = 50; // Лимит итераций
      let iter = 0;
      let eps = Array(NU).fill(0);
      let eps_marker;

      // Начало итерационного процесса
      do {
        for (let i = 1; i < NU; ++i) {
          let ZP = new Complex(0, 0);
          let U_PR = new Complex(0, 0);
          for (let j = 0; j < NU; ++j) {
            U_PR = U[j].conjugate();
            ZP = ZP.add(this.impedanceMatrix[i][j].mul(S[j]).div(U_PR));
          }
          U_new[i] = U[0].div(kt[i]).sub(ZP);
        }

        eps_marker = 0;
        for (let i = 1; i < NU; ++i) {
          eps[i] = Math.abs(U[i].abs() - U_new[i].abs());
          if (eps[i] > err) {
            eps_marker = 1;
          }
        }

        if (eps_marker === 1) {
          for (let i = 0; i < NU; ++i) {
            U[i] = new Complex(U_new[i].re, U_new[i].im);
          }
        }

        iter++;
      } while (eps_marker !== 0 && iter < limit_iter);

      this.results = U_new.map((u, i) => ({
        index: i,
        value: u.toString(),
        epsilon: eps[i].toFixed(6),
      }));
      this.iterations = iter;
    },
    calculateGaussSeidel() {
      const NU = this.networkParams.nodes.length;
      let U = this.networkParams.nodes.map(
        (node) => new Complex(Number(node[3]), 0)
      );
      let U_new = Array(NU)
        .fill()
        .map(() => new Complex(0, 0));
      let S = this.networkParams.nodes.map(
        (node) => new Complex(Number(node[5]), Number(node[6]))
      );
      let kt = Array(NU)
        .fill()
        .map(() => new Complex(1, 0));

      // Load branch data
      this.networkParams.branches.forEach((branch) => {
        const NUK = Number(branch[2]) - 1;
        kt[NUK] = new Complex(Number(branch[5]), 0);
      });

      U_new[0] = new Complex(U[0].toString()); // Начальное значение
      const err = 0.02; // Критерий сходимости
      const limit_iter = 50; // Лимит итераций
      let iter = 0;
      let eps = Array(NU).fill(0);
      let eps_marker;

      // Начало итерационного процесса
      do {
        for (let i = 1; i < NU; ++i) {
          U_new[i] = U[0].div(kt[i]);
          let ZP = new Complex(0, 0);
          let U_PR = new Complex(0, 0);
          for (let j = 0; j < NU; ++j) {
            if (j < i) {
              U_PR = U_new[j].conjugate();
            } else {
              U_PR = U[j].conjugate();
            }
            ZP = ZP.add(this.impedanceMatrix[i][j].mul(S[j]).div(U_PR));
          }
          U_new[i] = U_new[i].sub(ZP);
        }

        eps_marker = 0;
        for (let i = 1; i < NU; ++i) {
          eps[i] = Math.abs(U[i].abs() - U_new[i].abs());
          if (eps[i] > err) {
            eps_marker = 1;
          }
        }

        if (eps_marker === 1) {
          for (let i = 0; i < NU; ++i) {
            U[i] = new Complex(U_new[i].re, U_new[i].im);
          }
        }

        iter++;
      } while (eps_marker !== 0 && iter < limit_iter);

      this.results = U_new.map((u, i) => ({
        index: i,
        value: u.toString(),
        epsilon: eps[i].toFixed(6),
      }));
      this.iterations = iter;
    },
    deepCopyMatrix(matrix) {
      let copiedMatrix = new Array(matrix.length)
        .fill()
        .map(() => new Array(matrix[0].length));

      for (let i = 0; i < matrix.length; ++i) {
        for (let j = 0; j < matrix[i].length; ++j) {
          if (i === 0 || j === 0) {
            copiedMatrix[i][j] = new Complex(0, 0);
          } else {
            copiedMatrix[i][j] = new Complex(matrix[i][j].re, matrix[i][j].im);
          }
        }
      }
      // console.log(copiedMatrix);

      return copiedMatrix;
    },
    createZeroComplexMatrix(rows, cols) {
      const matrix = new Array(rows);
      for (let i = 0; i < rows; i++) {
        matrix[i] = new Array(cols).fill(new Complex(0, 0));
      }
      return matrix;
    },
  },
  setup() {
    const nodes = ref([]);
    const branches = ref([]);

    return { nodes, branches };
  },
};
</script>

<style scoped lang="scss">
.container {
  margin: 0 auto;
  max-width: 760px;
}

.title-container {
  display: flex;
  justify-content: space-between;
}

.button-container {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: min-content;
  border-radius: 10px;
  overflow: hidden;
  margin-inline: auto;
}

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

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  border-left: 1px solid #0050a6;
  border-right: 1px solid #0050a6;
  white-space: nowrap;
}

button:hover {
  background-color: #0056b3;
}
</style>
