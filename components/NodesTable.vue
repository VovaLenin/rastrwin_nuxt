<template>
  <div>
    <h2>Nodes</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Voltage</th>
          <th>Connected</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="node in nodes" :key="node.id">
          <td>{{ node.id }}</td>
          <td>{{ node.name }}</td>
          <td>{{ node.voltage }}</td>
          <td>{{ node.connected }}</td>
        </tr>
      </tbody>
    </table>
    <form @submit.prevent="addNode">
      <input v-model="newNode.name" placeholder="Name" />
      <input v-model="newNode.voltage" placeholder="Voltage" type="number" />
      <input
        v-model="newNode.connected"
        placeholder="Connected"
        type="checkbox"
      />
      <button type="submit">Add Node</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const nodes = ref([]);
const newNode = ref({ name: "", voltage: 0, connected: false });

const fetchNodes = async () => {
  const { data } = await useFetch("/api/nodes");
  nodes.value = data.value;
};

const addNode = async () => {
  await useFetch("/api/nodes", {
    method: "POST",
    body: JSON.stringify(newNode.value),
  });
  newNode.value = { name: "", voltage: 0, connected: false };
  fetchNodes();
};

onMounted(fetchNodes);
</script>

<style>
/* Add your styles here */
</style>
