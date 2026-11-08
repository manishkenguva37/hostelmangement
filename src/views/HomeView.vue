<template>
  <div class="test-page">
    <h2>Student Manager (CORS-free)</h2>

    <div class="buttons">
      <button @click="fetchStudents">📖 Read All</button>
      <button @click="createStudent">➕ Create</button>
      <button @click="updateStudent">✏️ Update (ID 1)</button>
      <button @click="deleteStudent">🗑️ Delete (ID 1)</button>
    </div>

    <div v-if="loading">Loading...</div>
    <pre v-if="result">{{ result }}</pre>

    <ul>
      <li v-for="s in students" :key="s.id">
        {{ s.id }} - {{ s.name }} (Room {{ s.room }})
        <img v-if="s.photoUrl" :src="s.photoUrl" width="30" />
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      result: '',
      students: [],
      scriptUrl: '/api'
    };
  },
  methods: {
    async fetchStudents() {
      try {
        this.loading = true;
        const res = await fetch(`${this.scriptUrl}?action=read`);
        const data = await res.json();
        this.students = data;
        this.result = JSON.stringify(data, null, 2);
      } catch (err) {
        this.result = '❌ Error: ' + err.message;
      } finally {
        this.loading = false;
      }
    },

    async createStudent() {
      try {
        this.loading = true;
        const form = new FormData();
        form.append('action', 'create');
        form.append('name', 'New User ' + Date.now());
        form.append('email', 'newuser@test.com');
        form.append('room', '999');

        const res = await fetch(this.scriptUrl, { method: 'POST', body: form });
        const data = await res.json();
        this.result = JSON.stringify(data, null, 2);
        await this.fetchStudents();
      } catch (err) {
        this.result = '❌ Error: ' + err.message;
      } finally {
        this.loading = false;
      }
    },

    async updateStudent() {
      try {
        this.loading = true;
        const form = new FormData();
        form.append('action', 'update');
        form.append('id', '1');
        form.append('name', 'Updated User ' + Date.now());
        form.append('email', 'update@test.com');
        form.append('room', '888');
        form.append('photoUrl', '');

        const res = await fetch(this.scriptUrl, { method: 'POST', body: form });
        const data = await res.json();
        this.result = JSON.stringify(data, null, 2);
        await this.fetchStudents();
      } catch (err) {
        this.result = '❌ Error: ' + err.message;
      } finally {
        this.loading = false;
      }
    },

    async deleteStudent() {
      if (!confirm('Delete student ID 1?')) return;
      try {
        this.loading = true;
        const form = new FormData();
        form.append('action', 'delete');
        form.append('id', '1');

        const res = await fetch(this.scriptUrl, { method: 'POST', body: form });
        const data = await res.json();
        this.result = JSON.stringify(data, null, 2);
        await this.fetchStudents();
      } catch (err) {
        this.result = '❌ Error: ' + err.message;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.test-page { padding: 20px; font-family: monospace; }
button { margin: 5px; padding: 8px 12px; border: none; background: #007bff; color: white; border-radius: 6px; cursor: pointer; }
button:hover { background: #0056b3; }
pre {  padding: 10px; border-radius: 6px; overflow: auto; }
</style>
