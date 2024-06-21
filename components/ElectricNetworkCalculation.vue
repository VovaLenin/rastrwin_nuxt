<template>
  <div>
    <h3>Network Calculation using Newton's Method</h3>
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
    <StaticTable
      :data="conductivityMatrix"
      title="Conductivity Matrix"
      ref="conductivityMatrix"
    />
    <StaticTable
      :data="impedanceMatrix"
      title="Impedance Matrix"
      ref="impedanceMatrix"
    />
    <button @click="saveData">Сохранить данные</button>
    <button @click="loadData">Загрузить данные</button>
    <button @click="createConductivityMatrix">
      Создать матрицу проводимостей
    </button>
    <button @click="createImpedanceMatrix">Создать матрицу импедансов</button>
    <button @click="calculateGaussSeidel">Расчет методом Зейделя</button>
    <button @click="calculate">Расчет методом Ньютона</button>
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
import { matrix, inv } from "mathjs"; // Не забудьте импортировать или определить invertMatrix
import CustomTable from "./CustomTable.vue";
import StaticTable from "./StaticTable.vue";
import createMatrixY from "~/utils/createMatrixY";
import invertMatrix from "~/utils/invertMatrix";

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
      console.log(this.networkParams);
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
    createConductivityMatrix() {
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
            W[i] = W[i].add(this.conductivityMatrix[i][j].mul(U[j])); //ПЕРЕПРОВЕРИТЬ
          }
          W[i] = W[i].sub(S[i].div(U[i])); //ПЕРЕПРОВЕРИТЬ
          W[i] = W[i].sub(U1Y);
        }

        // Формирование матрицы Якоби
        // DW = this.deepCopyMatrix(this.conductivityMatrix);
        for (let i = 1; i < NU; ++i) {
          DW[i][i] = DW[i][i].add(S[i].div(U[i].pow(2))); //ПЕРЕПРОВЕРИТЬ
        }

        // Обращение матрицы Якоби
        const DWOBR = invertMatrix(DW);

        // Определяем небаланс напряжений
        DU = DWOBR.map((row, i) => {
          return row.reduce(
            (sum, value, j) => sum.add(value.mul(W[j])),
            new Complex(0, 0)
          );
        }); //ОБРАТИТЬ ВНИМАНИЕ, ПЕРЕПРОВЕРИТЬ

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
      return matrix.map((row) =>
        row.map((complex) => new Complex(complex.re, complex.im))
      );
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
