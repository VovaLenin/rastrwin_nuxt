<template>
  <div>
    <h3>Network Calculation using Newton's Method</h3>
    <CustomTable
      :headers="nodesHeaders"
      title="Параметры узлов"
      id="nodes"
      ref="nodesTable"
      @save-data="changeValues"
    />
    <CustomTable
      :headers="branchesHeaders"
      title="Параметры ветвей"
      id="branches"
      ref="branchesTable"
      @save-data="changeValues"
    />
    <StaticTable
      :headers="['Header 1', 'Header 2', 'Header 3']"
      :data="[
        ['Row 1, Cell 1', 'Row 1, Cell 2', 'Row 1, Cell 3'],
        ['Row 2, Cell 1', 'Row 2, Cell 2', 'Row 2, Cell 3'],
      ]"
      title="Example Table"
      ref="childComponentRef"
    />
    <button @click="saveData">Сохранить данные</button>
  </div>
</template>

<script>
import { ref } from "vue";
import Complex from "complex.js";
import { matrix, inv, lusolve, re } from "mathjs";
import CustomTable from "./CustomTable.vue";
import StaticTable from "./StaticTable.vue";

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
      networkParams: {},
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
  },
  setup() {
    const nodes = ref([
      // другие узлы
    ]);

    const branches = ref([
      { from: 1, to: 2, resistanceOhms: 0.1, reactanceOhms: 0.2, ratio: 1.0 },
      // другие ветви
    ]);

    const calculate = () => {};
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
