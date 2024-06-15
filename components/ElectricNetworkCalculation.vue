<template>
  <div>
    <h3>Network Calculation using Newton's Method</h3>
    <CustomTable :headers="headers" />
    <button @click="calculate">Calculate</button>
  </div>
</template>

<script>
import { ref } from "vue";
import Complex from "complex.js";
import { matrix, inv, lusolve, re } from "mathjs";
import CustomTable from "./CustomTable.vue";

export default {
  data() {
    return {
      headers: [
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
    };
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
