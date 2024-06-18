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
      const NU = this.networkParams.nodes.length;
      let U = new Array(NU).fill(new Complex(1, 0));
      let U_new = new Array(NU).fill(new Complex(1, 0));
      let S = this.networkParams.nodes.map(
        (node) => new Complex(Number(node[5]), Number(node[6]))
      );
      let Y = matrix(
        this.conductivityMatrix.map((row) =>
          row.map((c) => new Complex(c[0], c[1]))
        )
      );
      let err = 0.001; // Критерий сходимости
      let limit_iter = 100; // Лимит итераций
      let iter = 0;
      let eps = new Array(NU).fill(0);
      let eps_marker;

      do {
        let W = new Array(NU).fill(new Complex(0, 0));
        for (let i = 1; i < NU; ++i) {
          for (let j = 0; j < NU; ++j) {
            W[i] = W[i].add(Y.get([i, j]).mul(U[j]));
          }
          W[i] = W[i].sub(S[i].div(U[i]));
        }

        let DW = matrix(Y.toArray().map((row) => row.slice()));
        for (let i = 1; i < NU; ++i) {
          DW.subset(
            matrix.index(i, i),
            DW.get([i, i]).add(S[i].div(U[i].mul(U[i])))
          );
        }

        let DW_inv = inv(DW);
        let DU = multiply(DW_inv, matrix(W));

        DU = DU.toArray().map((c) => new Complex(c[0], c[1]));

        U_new = U.map((u, i) => u.sub(DU[i]));

        eps_marker = 0;
        for (let i = 1; i < NU; ++i) {
          eps[i] = abs(DU[i]);
          if (eps[i] > err) {
            eps_marker = 1;
          }
        }

        if (eps_marker === 1) {
          U = U_new.slice();
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
