<template>
  <div class="test-page">
    <h2>Student Manager</h2>

    <div class="controls">
      <input v-model="search" placeholder="Search by name / room / email" />
      <button @click="fetchStudents">Refresh</button>
      <button @click="exportXLSX">Export XLSX</button>
      <button @click="exportPDF">Export PDF</button>
    </div>

    <div class="create">
      <h3>Create new student</h3>
      <input v-model="form.name" placeholder="Name" />
      <input v-model="form.email" placeholder="Email" />
      <input v-model="form.room" placeholder="Room" />
      <input type="file" @change="onFileChange" accept="image/*" />
      <button @click="createStudent">Create</button>
      <div v-if="previewUrl">Preview: <img :src="previewUrl" width="80" /></div>
    </div>

    <div v-if="loading">Loading...</div>
    <div v-if="result" class="result"><pre>{{ result }}</pre></div>

    <table v-if="filteredStudents.length" class="table">
      <thead>
        <tr>
          <th @click="sortBy('id')">ID</th>
          <th @click="sortBy('name')">Name</th>
          <th @click="sortBy('email')">Email</th>
          <th @click="sortBy('room')">Room</th>
          <th>Photo</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in paginated" :key="s.id">
          <td>{{ s.id }}</td>
          <td>{{ s.name }}</td>
          <td>{{ s.email }}</td>
          <td>{{ s.room }}</td>
          <td>
            <img v-if="s.photoUrl" :src="s.photoUrl" width="60" />
          </td>
          <td>
            <button @click="startEdit(s)">Edit</button>
            <button @click="deleteStudent(s.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="filteredStudents.length" class="pager">
      <button :disabled="page===1" @click="page--">Prev</button>
      Page {{ page }} / {{ totalPages }}
      <button :disabled="page===totalPages" @click="page++">Next</button>
    </div>

    <!-- Edit modal-ish -->
    <div v-if="editing" class="edit">
      <h3>Edit ID {{ editForm.id }}</h3>
      <input v-model="editForm.name" />
      <input v-model="editForm.email" />
      <input v-model="editForm.room" />
      <input type="file" @change="onEditFileChange" accept="image/*" />
      <div v-if="editPreview"><img :src="editPreview" width="80" /></div>
      <button @click="confirmUpdate">Save</button>
      <button @click="cancelEdit">Cancel</button>
    </div>
  </div>
</template>

<script>
// NOTE: For XLSX and PDF export we use SheetJS and jsPDF via CDN in index.html or include via npm
// If using CDN, ensure these globals exist: XLSX, jspdf
export default {
  data() {
    return {
      scriptUrl: '/api', // use /api for dev proxy OR direct /exec url if allowed in production
      // if your proxy isn't set, replace with full exec URL:
      // scriptUrl: 'https://script.google.com/macros/s/xxxx/exec'
      loading: false,
      result: '',
      students: [],
      search: '',
      sortKey: 'id',
      sortAsc: true,
      page: 1,
      perPage: 8,
      form: { name: '', email: '', room: '' },
      fileDataUrl: '', // base64 data for create
      previewUrl: '',
      editing: false,
      editForm: {},
      editFileDataUrl: '',
      editPreview: '',
      // Admin key for mutating ops
      apiKey: 'REPLACE_WITH_ADMIN_API_KEY' // keep same as Apps Script ADMIN_API_KEY
    };
  },
  computed: {
    filteredStudents() {
      const q = this.search && this.search.toLowerCase();
      let list = this.students.slice();
      if (q) {
        list = list.filter(s =>
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.email && s.email.toLowerCase().includes(q)) ||
          (s.room && s.room.toLowerCase().includes(q))
        );
      }
      list.sort((a,b) => {
        const k = this.sortKey;
        if (a[k] === b[k]) return 0;
        if (this.sortAsc) return (a[k] > b[k]) ? 1 : -1;
        return (a[k] < b[k]) ? 1 : -1;
      });
      return list;
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.filteredStudents.length / this.perPage));
    },
    paginated() {
      const start = (this.page - 1) * this.perPage;
      return this.filteredStudents.slice(start, start + this.perPage);
    }
  },
  mounted() {
    this.fetchStudents();
  },
  methods: {
    sortBy(key) {
      if (this.sortKey === key) this.sortAsc = !this.sortAsc;
      else { this.sortKey = key; this.sortAsc = true; }
    },

    async fetchStudents() {
      this.loading = true;
      this.result = '';
      try {
        const res = await fetch(`${this.scriptUrl}?action=read`);
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          this.students = Array.isArray(data) ? data : [];
        } catch (err) {
          this.result = 'Error parsing response: ' + text;
        }
      } catch (err) {
        this.result = 'Fetch error: ' + err.message;
      } finally {
        this.loading = false;
      }
    },

    onFileChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        this.fileDataUrl = ev.target.result; // data:<mime>;base64,...
        this.previewUrl = this.fileDataUrl;
      };
      reader.readAsDataURL(file);
    },

    onEditFileChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        this.editFileDataUrl = ev.target.result;
        this.editPreview = this.editFileDataUrl;
      };
      reader.readAsDataURL(file);
    },

    async createStudent() {
      if (!this.form.name) { alert('Enter name'); return; }
      this.loading = true;
      this.result = '';
      try {
        const form = new FormData();
        form.append('action','create');
        form.append('name', this.form.name);
        form.append('email', this.form.email);
        form.append('room', this.form.room);
        if (this.fileDataUrl) form.append('imageData', this.fileDataUrl);
        form.append('apiKey', this.apiKey);

        const res = await fetch(this.scriptUrl, { method: 'POST', body: form });
        const text = await res.text();
        this.result = text;
        await this.fetchStudents();
        this.form = { name:'', email:'', room:'' };
        this.fileDataUrl = ''; this.previewUrl = '';
      } catch (err) {
        this.result = 'Create error: ' + err.message;
      } finally { this.loading = false; }
    },

    startEdit(s) {
      this.editing = true;
      this.editForm = Object.assign({}, s);
      this.editFileDataUrl = '';
      this.editPreview = s.photoUrl || '';
    },

    cancelEdit() {
      this.editing = false; this.editForm = {}; this.editPreview = '';
    },

    async confirmUpdate() {
      if (!this.editForm.id) return;
      this.loading = true;
      try {
        const form = new FormData();
        form.append('action','update');
        form.append('id', this.editForm.id);
        form.append('name', this.editForm.name);
        form.append('email', this.editForm.email);
        form.append('room', this.editForm.room);
        // if a new image chosen, overwrite
        if (this.editFileDataUrl) form.append('imageData', this.editFileDataUrl);
        form.append('apiKey', this.apiKey);

        const res = await fetch(this.scriptUrl, { method: 'POST', body: form });
        const text = await res.text();
        this.result = text;
        this.cancelEdit();
        await this.fetchStudents();
      } catch (err) {
        this.result = 'Update error: ' + err.message;
      } finally { this.loading = false; }
    },

    async deleteStudent(id) {
      if (!confirm('Delete id ' + id + '?')) return;
      this.loading = true;
      try {
        const form = new FormData();
        form.append('action','delete');
        form.append('id', id);
        form.append('apiKey', this.apiKey);

        const res = await fetch(this.scriptUrl, { method: 'POST', body: form });
        const text = await res.text();
        this.result = text;
        await this.fetchStudents();
      } catch (err) {
        this.result = 'Delete error: ' + err.message;
      } finally { this.loading = false; }
    },

    // ===== Exports =====
    exportXLSX() {
      const data = this.students.map(s => ({
        id: s.id, name: s.name, email: s.email, room: s.room, photoUrl: s.photoUrl, timestamp: s.timestamp
      }));
      // Use SheetJS (XLSX) if available
      if (typeof XLSX !== 'undefined') {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Students');
        XLSX.writeFile(wb, `students_${Date.now()}.xlsx`);
      } else {
        alert('XLSX library (SheetJS) not loaded. Add via CDN or npm.');
      }
    },

    exportPDF() {
      // Use jsPDF
      if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
        alert('jsPDF not loaded. Add via CDN or npm.');
        return;
      }
      const jsPDFLib = window.jspdf ? window.jspdf.jsPDF : (window.jsPDF || jspdf);
      const doc = new jsPDFLib();
      doc.setFontSize(12);
      let y = 10;
      doc.text('Students', 10, y); y += 6;
      const rows = this.students.map(s => [String(s.id), s.name, s.email, s.room]);
      doc.autoTable && doc.autoTable({ startY: y, head: [['ID','Name','Email','Room']], body: rows });
      // If autoTable not available, fallback to simple listing
      if (!doc.autoTable) {
        y += 8;
        rows.forEach(r => {
          doc.text(r.join(' | '), 10, y);
          y += 6;
          if (y > 280) { doc.addPage(); y = 10; }
        });
      }
      doc.save(`students_${Date.now()}.pdf`);
    }
  }
};
</script>

<style scoped>
.test-page { padding: 20px; font-family: sans-serif; max-width: 1100px; margin: 0 auto; }
.controls { display:flex; gap:8px; align-items:center; margin-bottom:12px; }
.create { margin: 12px 0; border: 1px solid #ddd; padding: 12px; border-radius: 6px; }
.table { width:100%; border-collapse: collapse; margin-top:12px; }
.table th, .table td { border: 1px solid #ddd; padding: 6px; text-align:left; }
.table th { cursor: pointer; background:#f8f8f8; }
.pager { margin-top:8px; }
.result { margin-top:12px; background:#f8f9fa; padding:8px; border-radius:6px; }
</style>
