<template>
  <div class="memory-panel">
    <h3>🖥 Vue Memory & Performance Panel</h3>
    <table>
      <thead>
        <tr>
          <th>Component</th>
          <th>Mounted</th>
          <th>Slow?</th>
          <th>Intervals</th>
          <th>Timeouts</th>
          <th>Listeners</th>
          <th>Rerenders</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in components" :key="c.id">
          <td>{{ c.name }}</td>
          <td>{{ c.mounted ? "✅" : "❌" }}</td>
          <td :style="{ color: c.slow ? 'orange' : 'green' }">
            {{ c.slow ? '⚠' : '✓' }}
          </td>
          <td>{{ c.intervals }}</td>
          <td>{{ c.timeouts }}</td>
          <td>{{ c.listeners }}</td>
          <td :style="{ color: c.rerenders > 5 ? 'red' : 'white' }">{{ c.rerenders || 0 }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "MemoryPanel",
  data() {
    return {
      components: []
    };
  },
  mounted() {
    window.addEventListener("memory-panel-update", (e) => {
      this.components = e.detail;
    });
  }
};
</script>

<style scoped>
.memory-panel {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 400px;
  max-height: 50%;
  overflow-y: auto;
  background: #1e1e1e;
  color: #fff;
  font-family: monospace;
  font-size: 12px;
  border-top-left-radius: 8px;
  border-left: 2px solid #444;
  border-top: 2px solid #444;
  padding: 8px;
  z-index: 9999;
}
.memory-panel table {
  width: 100%;
  border-collapse: collapse;
}
.memory-panel th,
.memory-panel td {
  padding: 4px 6px;
  border: 1px solid #444;
  text-align: center;
}
.memory-panel th {
  background: #2e2e2e;
}
</style>
