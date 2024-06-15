<template>
  <div>
    <h3 class="title">{{ title }}</h3>
    <table class="table table-bordered table-sm w-auto m-auto">
      <tbody>
        <tr v-for="(row, rowIndex) in matrix" :key="rowIndex">
          <td v-for="(cell, cellIndex) in row" :key="cellIndex">
            {{ cell.toString() }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
  matrix: Array,
  title: String,
});
</script>

<style scoped lang="scss">
.title {
  margin-bottom: 10px;
  font-size: 24px;
  color: black;
}
</style>
