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
    <button @click="calculate">Расчет методом простой итерации</button>
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
import { matrix, inv, lusolve, re } from "mathjs";
import CustomTable from "./CustomTable.vue";
import StaticTable from "./StaticTable.vue";
import createMatrixY from "~/utils/createMatrixY";
import invertMatrix from "~/utils/invertMatrix";

export default {
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
      const U = this.networkParams.nodes.map(
        (node) => new Complex(Number(node[3]))
      ); // Напряжение в узлах

      const NU = this.networkParams.nodes.length; // Количество узлов
      let U_new = new Array(NU).fill(new Complex(0, 0)); // Обновленное значение проводимости

      const S = this.networkParams.nodes.map(
        (node) => new Complex(Number(node[5]), Number(node[6]))
      ); // Полное значение мощности

      const Kt = this.networkParams.branches.map(
        (branch) => new Complex(Number(branch[5]))
      ); // Коэффициенты трансформации

      U_new[0] = U[0]; // Начальное значение

      const err = 0.02; // Критерий сходимости(погрешность расчета)
      const limit_iter = 50; // Лимит итераций

      let W = new Array(NU).fill(new Complex(0, 0));
      let DU = new Array(NU).fill(new Complex(0, 0));

      let DW = this.deepCopyMatrix(this.conductivityMatrix);
      // const DWOBR = this.createZeroComplexMatrix(NU, NU);

      //МЕТОД НЬЮТОНА
      let U1Y = new Complex(0, 0);
      for (let i = 0; i < NU; ++i) {
        U1Y = U1Y.add(this.conductivityMatrix[0][i]);
      }
      U1Y = U[0].mul(U1Y);

      //начало итерационного процесса
      let iter = 0;
      let eps = new Array(NU).fill(0);
      let eps_marker;

      do {
        // формирование матрицы небалансов токов
        W = new Array(NU).fill(new Complex(0, 0)); // Сброс W в каждой итерации
        for (let i = 1; i < NU; ++i) {
          for (let j = 0; j < NU; ++j) {
            W[i] = W[i].add(this.conductivityMatrix[i][j].mul(U[j]));
          }
          W[i] = W[i].sub(S[i].div(U[i]));
          W[i] = W[i].sub(U1Y);
        }

        // формирование матрицы Якоби
        DW = this.deepCopyMatrix(this.conductivityMatrix); // Обновляем DW в каждой итерации
        for (let i = 1; i < NU; ++i) {
          DW[i][i] = DW[i][i].add(S[i].div(U[i].sqrt()));
        }

        //обращение матрицы Якоби
        const DWOBR = invertMatrix(DW);
        console.log({ DWOBR });

        // определяем небаланс напряжений
        DU = DWOBR.map((row, i) => {
          return row.reduce(
            (sum, value, j) => sum.add(value.mul(W[j])),
            new Complex(0, 0)
          );
        });

        U_new.forEach((_, i) => {
          U_new[i] = U[i].sub(DU[i]);
        });

        // проверка погрешности и лимита итераций
        eps_marker = 0;
        for (let i = 1; i < NU; ++i) {
          eps[i] = DU[i].abs();
          if (eps[i] > err) {
            eps_marker = 1;
          }
        }

        if (eps_marker == 1) {
          for (let i = 0; i < NU; ++i) {
            U[i] = U_new[i];
          }
        }

        ++iter;
      } while (eps_marker !== 0 && iter < limit_iter); // ПОБИТОВОЕ ИСКЛЮЧАЮЩЕЕ "ИЛИ"

      console.log(U);

      this.results = U_new.map((u, i) => ({
        index: i,
        value: u.toString(),
        epsilon: eps[i].toFixed(6),
      }));
      this.iterations = iter;
      console.log(this.results);
      console.log(this.iterations);
    },
    deepCopyMatrix(matrix) {
      return matrix.map((row) =>
        row.map((complex) => new Complex(complex.re, complex.im))
      );
    },
    createZeroComplexMatrix(rows, cols) {
      // Создаем массив заданной размерности
      const matrix = new Array(rows);
      for (let i = 0; i < rows; i++) {
        matrix[i] = new Array(cols);
        for (let j = 0; j < cols; j++) {
          // Заполняем нулевыми комплексными числами
          matrix[i][j] = new Complex(0, 0);
        }
      }
      return matrix;
    },
  },
  setup() {
    const nodes = ref([
      // другие узлы
    ]);

    const branches = ref([
      { from: 1, to: 2, resistanceOhms: 0.1, reactanceOhms: 0.2, ratio: 1.0 },
      // другие ветви
    ]);

    // return { calculate, result };
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
