<template>
  <div class="static-table">
    <h3>{{ title }}</h3>
    <table>
      <thead v-if="headers">
        <tr>
          <th v-for="(header, index) in headers" :key="index">{{ header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in tableData" :key="rowIndex">
          <td v-for="(cell, cellIndex) in row" :key="cellIndex">
            {{ formatComplexNumber(cell) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "StaticTable",
  props: {
    tableData: {
      type: Array,
      required: true,
    },
    headers: {
      type: Array,
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
  },
  mounted() {
    console.log(this.tableData.length);
  },
};
</script>

<style scoped>
.static-table {
  margin: 0 auto;
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
</style>
