<template>
  <div class="table-container" :id="id">
    <h3 class="table-title">{{ title }}</h3>
    <table>
      <thead>
        <tr>
          <th v-for="(header, index) in headers" :key="index + header">
            {{ header }}
          </th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in tableData" :key="rowIndex">
          <td v-for="(cell, cellIndex) in row" :key="cellIndex">
            <input
              @input="saveData"
              v-model="tableData[rowIndex][cellIndex]"
              type="text"
            />
          </td>
          <td>
            <button @click="removeRow(rowIndex)" class="remove-button">
              ✕
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <button @click="addRow">Add</button>
    <!-- <button @click="saveData">Save Data</button> -->
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
    id: {
      type: String,
      required: true,
      default: () => "",
    },
    initialData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      tableData: [],
      savedData: [],
    };
  },
  watch: {
    initialData: {
      immediate: true,
      handler(newData) {
        this.tableData = newData.map((row) => [...row]);
      },
    },
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
      this.$emit("saveData", { data: this.savedData, id: this.id });
    },
    createEmptyArray(length) {
      return Array.from({ length }, () => "");
    },
  },
  mounted() {
    // this.tableData = [[...this.createEmptyArray(this.headers.length)]];
    // console.log(this.tableData);
    this.tableData = this.initialData.length
      ? this.initialData.map((row) => [...row])
      : [[...this.createEmptyArray(this.headers.length)]];
    // console.log("TABLE DATA", this.tableData);
  },
};
</script>

<style scoped>
.table-container {
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  width: 100%;
}

table {
  border-collapse: collapse;
  margin: 20px 0;
  width: 100%;
}

th,
td {
  border: 1px solid #ddd;
  padding: 0;
}

input {
  width: 100%;
  height: 35px;
  border: none;
  box-sizing: border-box;
}

button {
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
  padding: 5px;
}

.actions {
  text-align: center;
}

.remove-button {
  color: red;
  font-weight: 800;
}
</style>
