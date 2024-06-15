<template>
  <div>
    <h3 class="table-title">{{ title }}</h3>
    <table>
      <thead>
        <tr>
          <th v-for="(header, index) in headers" :key="index">{{ header }}</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in tableData" :key="rowIndex">
          <td v-for="(cell, cellIndex) in row" :key="cellIndex">
            <input v-model="tableData[rowIndex][cellIndex]" type="text" />
          </td>
          <td>
            <button @click="removeRow(rowIndex)">Remove</button>
          </td>
        </tr>
      </tbody>
    </table>
    <button @click="addRow">Add Row</button>
    <button @click="saveData">Save Data</button>
    <pre>{{ savedData }}</pre>
  </div>
</template>

<script>
export default {
  props: {
    headers: {
      type: Array,
      required: true,
      default: () => [],
    },
    title: {
      type: String,
      required: true,
      default: () => "",
    },
  },
  data() {
    return {
      tableData: [],
      savedData: [],
    };
  },
  methods: {
    addRow() {
      this.tableData.push(new Array(this.headers.length).fill(""));
    },
    removeRow(index) {
      this.tableData.splice(index, 1);
    },
    saveData() {
      this.savedData = this.tableData.map((row) => [...row]);
    },
    createEmptyArray(length) {
      return Array.from({ length }, () => "");
    },
  },
  mounted() {
    this.tableData = [[...this.createEmptyArray(this.headers.length)]];
    console.log(this.tableData);
  },
};
</script>

<style scoped>
table {
  border-collapse: collapse;
  margin: 20px 0;
  width: 100%;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
}

input {
  width: 100%;
  box-sizing: border-box;
}

button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

thead {
  background-color: #f2f2f2;
}

th {
  text-align: left;
}

.actions {
  text-align: center;
}
</style>
