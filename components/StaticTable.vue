<template>
  <div>
    <h3>{{ title }}</h3>
    <table>
      <thead v-if="headers">
        <tr>
          <th v-for="(header, index) in headers" :key="index">{{ header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in data" :key="rowIndex">
          <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "StaticTable",
  props: {
    data: {
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
