<!-- <template>
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
      components: [],
    };
  },
  mounted() {
    // Listen to global memory updates from AllGlobalMixin
    // window.addEventListener("memory-panel-update", (e) => {
    //   this.components = e.detail;
    // });
    window.addEventListener("memory-panel-update", (e) => {
      const ignoredComponents = ["RouterLink", "transition", "KeepAlive", "Teleport"];
      this.components = e.detail.filter(c => !ignoredComponents.includes(c.name));
    });
  },
};
</script>

<style scoped>
.memory-panel {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 420px;
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
</style> -->

<!-- <template>
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
          <th>Memory Δ</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in components" :key="c.id">
          <td>{{ c.name }}</td>
          <td>{{ c.mounted ? "✅" : "❌" }}</td>
          <td :style="{ color: c.slow ? 'orange' : 'green' }">{{ c.slow ? '⚠' : '✓' }}</td>
          <td>{{ c.intervals }}</td>
          <td>{{ c.timeouts }}</td>
          <td>{{ c.listeners }}</td>
          <td :style="{ color: c.rerenders > 5 ? 'red' : 'white' }">{{ c.rerenders || 0 }}</td>
          <td>{{ c.memoryDiff ? (c.memoryDiff / 1024).toFixed(1) + ' KB' : '-' }}</td>
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
      components: [],
    };
  },
  mounted() {
    window.addEventListener("memory-panel-update", (e) => {
      const ignoredComponents = ["RouterLink", "transition", "KeepAlive", "Teleport","MemoryPanel", "Anonymous"];
      this.components = e.detail.filter(c => !ignoredComponents.includes(c.name));
    });
  }
};
</script>

<style scoped>
.memory-panel {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 460px;
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
</style> -->




<!-- <template>
  <div class="memory-panel">
    <h3>🖥 Vue Memory & Performance Panel</h3>
    <div>Total Memory Δ: {{ totalMemoryDelta }} KB</div>
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
          <th>Memory Δ</th>
          <th>Graph</th>
          <th>Leak?</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in components" :key="c.id">
          <td>{{ c.name }}</td>
          <td>{{ c.mounted ? "✅" : "❌" }}</td>
          <td :style="{ color: c.slow ? 'orange' : 'green' }">{{ c.slow ? '⚠' : '✓' }}</td>
          <td>{{ c.intervals }}</td>
          <td>{{ c.timeouts }}</td>
          <td>{{ c.listeners }}</td>
          <td :style="{ color: c.rerenders > 5 ? 'red' : 'white' }">{{ c.rerenders || 0 }}</td>
          <td>{{ c.memoryDiff ? (c.memoryDiff / 1024).toFixed(1) + ' KB' : '-' }}</td>
          <td>
            <canvas :ref="'graph-'+c.id" width="100" height="20"></canvas>
          </td>
          <td :style="{ color: c.isLeaking ? 'red' : 'white', fontWeight: c.isLeaking ? 'bold' : 'normal' }">
            {{ c.isLeaking ? '⚠ LEAK' : '-' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "MemoryPanel",
  data() {
    return { components: [] };
  },
  computed: {
    totalMemoryDelta() {
      return this.components.reduce((sum, c) => sum + (c.memoryDiff || 0), 0) / 1024;
    }
  },
  mounted() {
    window.addEventListener("memory-panel-update", (e) => {
      const ignored = ["RouterLink", "transition", "KeepAlive", "Teleport", "MemoryPanel", "Anonymous"];
      this.components = e.detail.filter(c => !ignored.includes(c.name));
      this.$nextTick(() => this.drawGraphs());
    });
  },
  methods: {
    drawGraphs() {
      this.components.forEach(c => {
        const canvas = this.$refs['graph-'+c.id];
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        const history = c.memoryHistory || [];
        if (!history.length) return;
        const max = Math.max(...history);
        const min = Math.min(...history);
        ctx.beginPath();
        history.forEach((v, i) => {
          const x = (i / (history.length-1)) * w;
          const y = h - ((v - min)/(max-min||1)) * h;
          i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
        });
        ctx.strokeStyle = '#4caf50';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }
  }
};
</script>

<style scoped>
.memory-panel {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 600px;
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
</style> -->


<!-- <template>
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
          <th>Memory Δ</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in components" :key="c.id">
          <td>{{ c.name }}</td>
          <td>{{ c.mounted ? "✅" : "❌" }}</td>
          <td :style="{ color: c.slow ? 'orange' : 'green' }">{{ c.slow ? '⚠' : '✓' }}</td>
          <td>{{ c.intervals }}</td>
          <td>{{ c.timeouts }}</td>
          <td>{{ c.listeners }}</td>
          <td :style="{ color: c.rerenders > 5 ? 'red' : 'white' }">{{ c.rerenders || 0 }}</td>
          <td>{{ c.memoryDiff ? (c.memoryDiff / 1024).toFixed(1) + ' KB' : '-' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "MemoryPanel",
  data() {
    return { components: [] };
  },
  mounted() {
    window.addEventListener("memory-panel-update", (e) => {
      const ignored = ["RouterLink", "transition", "KeepAlive", "Teleport","MemoryPanel","Anonymous"];
      this.components = e.detail.filter(c => !ignored.includes(c.name));
    });
  }
};
</script>

<style scoped>
.memory-panel {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 460px;
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
</style> -->



<!-- <template>
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
          <th>Memory Δ</th>
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
          <td>{{ c.memoryDiff ? (c.memoryDiff / 1024).toFixed(1) + ' KB' : '-' }}</td>
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
      components: [],
    };
  },
  mounted() {
    // Listen to memory updates from mixin
    window.addEventListener("memory-panel-update", (e) => {
      const ignoredComponents = ["RouterLink", "transition", "KeepAlive", "Teleport"];
      this.components = e.detail.filter(c => !ignoredComponents.includes(c.name));
    });
  },
};
</script>

<style scoped>
.memory-panel {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 460px;
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
</style> -->


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
          <th>Memory Δ</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in components" :key="c.id">
          <td>{{ c.name }}</td>
          <td>{{ c.mounted ? "✅" : "❌" }}</td>
          <td :style="{ color: c.slow ? 'orange' : 'green' }">{{ c.slow ? '⚠' : '✓' }}</td>
          <td>{{ c.intervals }}</td>
          <td>{{ c.timeouts }}</td>
          <td>{{ c.listeners }}</td>
          <td :style="{ color: c.rerenders > 5 ? 'red' : 'white' }">{{ c.rerenders || 0 }}</td>
          <!-- <td>{{ c.memoryDiff ? (c.memoryDiff / 1024).toFixed(1) + ' KB' : '-' }}</td> -->
           <td :style="{ color: c.memoryDiff > 1024*1024 ? 'red' : 'white' }">
  {{ c.memoryDiff ? (c.memoryDiff / 1024).toFixed(1) + ' KB' : '-' }}
</td>
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
      const ignoredComponents = ["RouterLink", "transition", "KeepAlive", "Teleport", "MemoryPanel", "Anonymous"];
      this.components = e.detail.filter(c => !ignoredComponents.includes(c.name));
    });
  }
};
</script>

<style scoped>
.memory-panel {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 460px;
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
