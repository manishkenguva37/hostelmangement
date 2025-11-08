<template>
  <div class="container py-4">
    <pre>{{ JSON.stringify(students, null, 2) }}</pre>
    <!-- Top bar -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-0 text-primary"><i class="bi bi-people-fill me-2"></i>Student Manager</h3>
        <small class="text-muted">Search · Sort · Filter · Export · Room history</small>
      </div>

      <div class="d-flex gap-2 align-items-center">
        <input v-model="searchQuery" class="form-control form-control-sm" placeholder="Search name / email / room / phone" style="min-width:260px;" />

        <select v-model="selectedRoom" class="form-select form-select-sm w-auto">
          <option value="">All Rooms</option>
          <option v-for="room in roomOptions" :key="room">{{ room }}</option>
        </select>

        <div class="btn-group">
          <button class="btn btn-outline-secondary btn-sm" @click="fetchStudents"><i class="bi bi-arrow-clockwise"></i></button>
          <button class="btn btn-success btn-sm" @click="exportExcel"><i class="bi bi-file-earmark-spreadsheet"></i> Excel</button>
          <button class="btn btn-secondary btn-sm" @click="exportCSV"><i class="bi bi-file-earmark-code"></i> CSV</button>
          <button class="btn btn-danger btn-sm" @click="exportPDF"><i class="bi bi-file-earmark-pdf"></i> PDF</button>
          <button class="btn btn-warning btn-sm" @click="syncGoogleSheet"><i class="bi bi-cloud-arrow-up"></i> Sheets</button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-90" style="z-index:9999;">
      <div class="spinner-border text-primary" style="width:3rem;height:3rem;" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>

    <!-- Add / Edit Card -->
    <div class="card shadow-sm mb-4">
      <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0"><i class="bi bi-person-plus-fill me-2"></i>{{ form.id ? 'Edit Student' : 'Add New Student' }}</h5>
        <div>
          <button class="btn btn-outline-light btn-sm me-2" @click="resetForm">Clear</button>
        </div>
      </div>

      <div class="card-body">
        <form @submit.prevent="saveStudent">
          <div class="row g-3">
            <div class="col-md-6"><input v-model="form.name" type="text" class="form-control" placeholder="Full Name" required></div>
            <div class="col-md-6"><input v-model="form.email" type="email" class="form-control" placeholder="Email" required></div>
            <div class="col-md-3"><input v-model="form.personPhone" type="text" class="form-control" placeholder="Phone"></div>
            <div class="col-md-3"><input v-model="form.adharNumber" type="text" class="form-control" placeholder="Aadhar"></div>
            <div class="col-md-3"><input v-model="form.Advance" type="text" class="form-control" placeholder="Advance Paid"></div>
            <div class="col-md-3"><input v-model="form.dateofjoining" type="date" class="form-control"></div>
            <div class="col-md-3"><input v-model="form.dob" type="date" class="form-control"></div>
          </div>

          <!-- Room controls -->
          <div class="row g-3 mt-3 border-top pt-3 align-items-end">
            <div class="col-md-4">
              <label class="form-label small mb-1">Room Number</label>
              <input v-model="newRoom.roomNumber" type="text" class="form-control" placeholder="Room Number (e.g. 500)">
            </div>
            <div class="col-md-4">
              <label class="form-label small mb-1">Room Type</label>
              <select v-model="newRoom.roomType" class="form-select">
                <option value="">(none)</option>
                <option value="3 sharing">3 Sharing</option>
                <option value="4 sharing">4 Sharing</option>
                <option value="Single">Single</option>
              </select>
            </div>
            <div class="col-md-4">
              <button type="button" class="btn btn-outline-primary w-100" @click="addRoomEntry">
                <i class="bi bi-plus-circle"></i> Add Room (for create/edit preview)
              </button>
            </div>
          </div>

          <!-- Room preview/history for the form -->
          <div class="mt-3" v-if="roomHistory && roomHistory.length">
            <h6><i class="bi bi-clock-history"></i> Room History (preview)</h6>
            <div class="table-responsive">
              <table class="table table-sm table-bordered mb-0">
                <thead class="table-light"><tr><th>Room</th><th>Type</th><th>Updated</th></tr></thead>
                <tbody>
                  <tr v-for="(r, i) in roomHistory" :key="i">
                    <td>{{ r.roomNumber }}</td>
                    <td>{{ r.roomType || '-' }}</td>
                    <td><small>{{ r.timeStamp }}</small></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Photo -->
          <div class="mt-3">
            <label class="form-label small mb-1">Photo (optional)</label>
            <input type="file" @change="handleImage" class="form-control" accept="image/*">
            <small class="text-muted">Max 2 MB • Optional</small>
          </div>

          <div class="mt-4">
            <button type="submit" class="btn btn-success me-2">
              <i class="bi bi-check-circle me-1"></i>{{ form.id ? 'Update' : 'Add Student' }}
            </button>
            <button v-if="form.id" type="button" class="btn btn-outline-primary" @click="addRoomEntryToExisting">Add Room to History & Save</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Students Table -->
    <div class="card shadow-sm">
      <div class="card-header bg-light d-flex justify-content-between align-items-center">
        <h5 class="mb-0">All Students <small class="text-muted">({{ filteredStudents.length }})</small></h5>

        <div class="d-flex align-items-center gap-2">
          <small class="text-muted me-1">Sort:</small>
          <div class="btn-group btn-group-sm" role="group">
            <button :class="['btn', sortKey==='name' ? 'btn-primary' : 'btn-outline-primary']" @click="changeSort('name')">Name</button>
            <button :class="['btn', sortKey==='room' ? 'btn-primary' : 'btn-outline-primary']" @click="changeSort('room')">Latest Room</button>
            <button :class="['btn', sortKey==='dateofjoining' ? 'btn-primary' : 'btn-outline-primary']" @click="changeSort('dateofjoining')">Join Date</button>
          </div>
        </div>
      </div>

      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle">
            <thead class="table-primary text-center d-none d-md-table-header-group">
              <tr>
                <th class="text-start">Photo</th>
                <th>Name</th>
                <th>Email</th>
                <th>Latest Room</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="s in filteredStudents" :key="s.id" class="border-bottom">
                <!-- Mobile condensed -->
                <td class="d-md-none p-3">
                  <div class="d-flex align-items-center gap-3">
                    <img :src="fixPhoto(s.photoUrl)" class="rounded-circle border" width="50" height="50" @error="e=>e.target.src=placeholder">
                    <div class="flex-grow-1">
                      <strong>{{ s.name }}</strong><br><small class="text-muted">{{ s.email }}</small>
                    </div>
                  </div>

                  <div class="mt-2 small text-muted">
                    <div><strong>Room:</strong> {{ getLatestRoom(s.room) }}</div>
                    <div><strong>Phone:</strong> {{ s.personPhone || '-' }}</div>
                  </div>

                  <div class="mt-3 d-flex gap-1">
                    <button class="btn btn-sm btn-warning flex-fill" @click="openEditModal(s)">Edit</button>
                    <button class="btn btn-sm btn-danger flex-fill" @click="deleteStudent(s.id)">Delete</button>
                  </div>
                </td>

                <!-- Desktop row -->
                <td class="text-center d-none d-md-table-cell">
                  <img :src="fixPhoto(s.photoUrl)" class="rounded-circle border" width="45" height="45" @error="e=>e.target.src=placeholder">
                </td>
                <td class="d-none d-md-table-cell">{{ s.name }}<div><small class="text-muted">{{ s.email }}</small></div></td>
                <td class="d-none d-md-table-cell text-center fw-bold">{{ getLatestRoom(s.room) }}</td>
                <td class="d-none d-md-table-cell">{{ s.personPhone || '-' }}</td>
                <td class="d-none d-md-table-cell text-center">
                  <button class="btn btn-sm btn-outline-info me-1" @click="openRoomModal(s)"><i class="bi bi-house-door"></i></button>
                  <button class="btn btn-sm btn-warning me-1" @click="openEditModal(s)"><i class="bi bi-pencil"></i></button>
                  <button class="btn btn-sm btn-danger" @click="deleteStudent(s.id)"><i class="bi bi-trash"></i></button>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="!students.length" class="text-center py-5 text-muted">
            <i class="bi bi-inbox display-1"></i>
            <p class="mt-3">No students yet – add one above!</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal (reuses same form binding) -->
    <div class="modal fade" id="editModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <form @submit.prevent="saveStudent">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title"><i class="bi bi-pencil-square me-2"></i>Edit Student</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <!-- same fields already bound to form -->
              <div class="row g-3">
                <div class="col-md-6"><input v-model="form.name" type="text" class="form-control" placeholder="Full Name" required></div>
                <div class="col-md-6"><input v-model="form.email" type="email" class="form-control" placeholder="Email" required></div>
                <div class="col-md-3"><input v-model="form.personPhone" type="text" class="form-control" placeholder="Phone"></div>
                <div class="col-md-3"><input v-model="form.adharNumber" type="text" class="form-control" placeholder="Aadhar"></div>
                <div class="col-md-3"><input v-model="form.Advance" type="text" class="form-control" placeholder="Advance Paid"></div>
                <div class="col-md-3"><input v-model="form.dateofjoining" type="date" class="form-control"></div>
                <div class="col-md-3"><input v-model="form.dob" type="date" class="form-control"></div>
              </div>

              <!-- room input inside modal -->
              <div class="row g-3 mt-3 border-top pt-3">
                <div class="col-md-4"><input v-model="newRoom.roomNumber" type="text" class="form-control" placeholder="Room Number"></div>
                <div class="col-md-4">
                  <select v-model="newRoom.roomType" class="form-select">
                    <option value="">(none)</option>
                    <option value="3 sharing">3 Sharing</option>
                    <option value="4 sharing">4 Sharing</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <button type="button" class="btn btn-outline-primary w-100" @click="addRoomEntry">
                    <i class="bi bi-plus-circle"></i> Add Room (preview)
                  </button>
                </div>
              </div>

              <!-- room history -->
              <div class="mt-3" v-if="roomHistory.length">
                <h6><i class="bi bi-clock-history"></i> Room History</h6>
                <div class="table-responsive">
                  <table class="table table-sm table-bordered">
                    <thead class="table-light"><tr><th>Room</th><th>Type</th><th>Updated</th></tr></thead>
                    <tbody>
                      <tr v-for="(r,i) in roomHistory" :key="i"><td>{{ r.roomNumber }}</td><td>{{ r.roomType || '-' }}</td><td>{{ r.timeStamp }}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- photo -->
              <div class="mt-3"><input type="file" @change="handleImage" class="form-control" accept="image/*"><small class="text-muted">Leave empty to keep current photo</small></div>

            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-success">Update</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Room Modal (quick change & save) -->
    <div class="modal fade" id="roomModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-info text-white">
            <h5 class="modal-title">Update Room</h5>
            <button class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-2">
              <label class="form-label small mb-1">New Room</label>
              <input v-model="tempRoom.number" class="form-control" placeholder="Room number" />
            </div>
            <div class="mb-2">
              <label class="form-label small mb-1">Room Type</label>
              <select v-model="tempRoom.type" class="form-select">
                <option value="">(none)</option>
                <option>3 sharing</option>
                <option>4 sharing</option>
                <option>Single</option>
              </select>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-success flex-fill" @click="saveRoomFromModal">Save & Add to History</button>
              <button class="btn btn-outline-secondary flex-fill" data-bs-dismiss="modal">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'App',
  data() {
    return {
      apiUrl: import.meta.env.VITE_API_URL,
      students: [],
      loading: false,
      placeholder: 'https://via.placeholder.com/50?text=No+Photo',
      form: {
        id: '', name: '', email: '', room: '', imageData: '',
        personPhone: '', adharNumber: '', dateofjoining: '', Advance: '', dob: ''
      },
      newRoom: { roomNumber: '', roomType: '' },
      roomHistory: [],
      modal: null,
      searchQuery: '',
      selectedRoom: '',
      sortKey: 'name',
      sortAsc: true,

      // for quick room modal
      tempStudent: null,
      tempRoom: { number: '', type: '' }
    };
  },
  computed: {
    roomOptions() {
      const rooms = [];
      this.students.forEach(s => {
        try {
          const arr = JSON.parse(s.room || '[]');
          if (Array.isArray(arr) && arr.length) rooms.push(arr[arr.length - 1].roomNumber);
        } catch (e) {}
      });
      return [...new Set(rooms)];
    },
    filteredStudents() {
      let list = [...this.students];
      const q = (this.searchQuery || '').toLowerCase();

      if (q) {
        list = list.filter(st =>
          (st.name || '').toLowerCase().includes(q) ||
          (st.email || '').toLowerCase().includes(q) ||
          (st.personPhone || '').toLowerCase().includes(q) ||
          this.getLatestRoom(st.room).toLowerCase().includes(q)
        );
      }

      if (this.selectedRoom) {
        list = list.filter(st => this.getLatestRoom(st.room).includes(this.selectedRoom));
      }

      if (this.sortKey) {
        list.sort((a, b) => {
          let A = '', B = '';
          if (this.sortKey === 'room') {
            A = this.getLatestRoom(a.room);
            B = this.getLatestRoom(b.room);
          } else {
            A = (a[this.sortKey] || '').toString();
            B = (b[this.sortKey] || '').toString();
          }
          return this.sortAsc ? A.localeCompare(B) : B.localeCompare(A);
        });
      }

      return list;
    }
  },
  mounted() {
    // bootstrap modal instances
    this.modal = new bootstrap.Modal(document.getElementById('editModal'));
    this.roomModal = new bootstrap.Modal(document.getElementById('roomModal'));
    this.fetchStudents();
  },
  methods: {
    // FETCH — core fetch logic unchanged
    async fetchStudents() {
      try {
        this.loading = true;
        const { data } = await axios.get(`${this.apiUrl}?action=read`);
        this.students = (data || []).map(s => {
          // normalize room to JSON string array when needed
          try {
            JSON.parse(s.room || '[]');
          } catch (e) {
            const now = this.nowStamp();
            s.room = JSON.stringify([{ roomNumber: s.room ? String(s.room) : '', roomType: '', timeStamp: now }]);
          }
          return s;
        });
      } catch (e) {
        console.error(e);
        alert('Failed to load students');
      } finally {
        this.loading = false;
      }
    },

    // open edit and populate form + roomHistory
    openEditModal(student) {
      this.form = { ...student, imageData: '' };
      try {
        const parsed = JSON.parse(this.form.room || '[]');
        this.roomHistory = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        this.roomHistory = [];
      }
      // set newRoom defaults to latest
      const latest = this.roomHistory.length ? this.roomHistory[this.roomHistory.length - 1] : { roomNumber: '', roomType: '' };
      this.newRoom = { roomNumber: latest.roomNumber || '', roomType: latest.roomType || '' };
      this.modal.show();
    },

    // Add room entry (preview) — for create it will set single current; for edit it appends to form.room but does not persist until save
    addRoomEntry() {
      if (!this.newRoom.roomNumber) { alert('Please enter room number'); return; }
      const now = this.nowStamp();

      if (this.form.id) {
        // editing: append to form.room array (preview)
        let rooms = [];
        try { rooms = JSON.parse(this.form.room || '[]'); } catch (e) { rooms = []; }
        if (!Array.isArray(rooms)) rooms = [];
        rooms.push({ roomNumber: this.newRoom.roomNumber.trim(), roomType: this.newRoom.roomType || '', timeStamp: now });
        this.form.room = JSON.stringify(rooms);
        this.roomHistory = rooms;
        this.newRoom = { roomNumber: '', roomType: '' };
      } else {
        // creating: set current room (single entry array)
        const rooms = [{ roomNumber: this.newRoom.roomNumber.trim(), roomType: this.newRoom.roomType || '', timeStamp: now }];
        this.form.room = JSON.stringify(rooms);
        this.roomHistory = rooms;
        this.newRoom = { roomNumber: '', roomType: '' };
      }
    },

    // Add room to history and immediately save (edit mode only)
    addRoomEntryToExisting() {
      if (!this.form.id) { alert('Open student in edit mode to add room to history'); return; }
      this.addRoomEntry();
      // Now persist the updated form to backend
      this.saveStudent();
    },

    // Save create or update
    async saveStudent() {
      const action = this.form.id ? 'update' : 'create';
      const payload = { ...this.form, action };

      try {
        this.loading = true;
        // preserve original Content-Type behavior
        await axios.post(this.apiUrl, JSON.stringify(payload), { headers: { 'Content-Type': 'text/plain' } });

        // optimistic UI: update local student if editing (so changes appear immediately)
        if (this.form.id) {
          const idx = this.students.findIndex(x => x.id === this.form.id);
          if (idx !== -1) {
            // ensure normalized room is a string
            this.students.splice(idx, 1, { ...this.form });
          }
        }

        await this.fetchStudents();
        this.modal?.hide?.();
        this.resetForm();
        alert(`Student ${action === 'create' ? 'added' : 'updated'}`);
      } catch (e) {
        console.error(e);
        alert('Save failed');
      } finally {
        this.loading = false;
      }
    },

    // delete unchanged
    async deleteStudent(id) {
      if (!confirm('Delete this student?')) return;
      try {
        this.loading = true;
        await axios.post(this.apiUrl, JSON.stringify({ action: 'delete', id }), { headers: { 'Content-Type': 'text/plain' } });
        await this.fetchStudents();
        alert('Deleted');
      } catch (e) {
        console.error(e);
        alert('Delete failed');
      } finally {
        this.loading = false;
      }
    },

    resetForm() {
      this.form = { id: '', name: '', email: '', room: '', imageData: '', personPhone: '', adharNumber: '', dateofjoining: '', Advance: '', dob: '' };
      this.newRoom = { roomNumber: '', roomType: '' };
      this.roomHistory = [];
    },

    handleImage(e) {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) { alert('Image too large (max 2 MB)'); return; }
      const reader = new FileReader();
      reader.onload = ev => (this.form.imageData = ev.target.result);
      reader.readAsDataURL(file);
    },

    fixPhoto(url) {
      if (!url) return this.placeholder;
      const m = String(url).match(/id=([^&]+)/);
      return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w100` : (url || this.placeholder);
    },

    // Return latest room as readable string
    getLatestRoom(json) {
      if (!json) return '-';
      try {
        const arr = typeof json === 'string' ? JSON.parse(json) : json;
        if (Array.isArray(arr) && arr.length > 0) {
          const latest = arr[arr.length - 1];
          const rn = latest.roomNumber || '-';
          const rt = latest.roomType ? ` (${latest.roomType})` : '';
          return `${rn}${rt}`;
        }
      } catch (e) {}
      return String(json || '-');
    },

    nowStamp() {
      const d = new Date();
      const yy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mi = String(d.getMinutes()).padStart(2, '0');
      return `${yy}-${mm}-${dd} ${hh}:${mi}`;
    },

    changeSort(key) {
      if (this.sortKey === key) this.sortAsc = !this.sortAsc; else { this.sortKey = key; this.sortAsc = true; }
    },

    // EXPORTS
    exportExcel() {
      try {
        const rows = this.filteredStudents.map(s => {
          let latest = {};
          try { const arr = JSON.parse(s.room || '[]'); latest = Array.isArray(arr) && arr.length ? arr[arr.length - 1] : {}; } catch (e) { latest = { roomNumber: s.room }; }
          return { id: s.id, name: s.name, email: s.email, phone: s.personPhone || '', latestRoom: latest.roomNumber || '', roomType: latest.roomType || '', joined: s.dateofjoining || '', dob: s.dob || '', advance: s.Advance || '' };
        });
        const ws = window.XLSX.utils.json_to_sheet(rows);
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, 'Students');
        window.XLSX.writeFile(wb, `students-${new Date().toISOString().slice(0,10)}.xlsx`);
      } catch (e) {
        console.error(e); alert('Export failed — ensure XLSX CDN is loaded');
      }
    },

    exportCSV() {
      try {
        const rows = this.filteredStudents.map(s => {
          const latest = (() => { try { const arr = JSON.parse(s.room || '[]'); return arr[arr.length - 1] || {}; } catch { return {}; } })();
          return { name: s.name, email: s.email, phone: s.personPhone || '', latestRoom: latest.roomNumber || '', roomType: latest.roomType || '' };
        });
        const header = Object.keys(rows[0] || {}).join(',') + '\n';
        const body = rows.map(r => Object.values(r).map(v => `"${String(v || '')}"`).join(',')).join('\n');
        const blob = new Blob([header + body], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `students-${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
      } catch (e) {
        console.error(e); alert('CSV export failed');
      }
    },

    exportPDF() {
      try {
        const doc = new window.jspdf.jsPDF();
        doc.text('Student List', 14, 10);
        const body = this.filteredStudents.map(s => [s.name, s.email, this.getLatestRoom(s.room), s.personPhone || '-']);
        doc.autoTable({ head: [['Name','Email','Room','Phone']], body, startY: 18 });
        doc.save(`students-${new Date().toISOString().slice(0,10)}.pdf`);
      } catch (e) {
        console.error(e); alert('PDF export failed — ensure jsPDF + AutoTable are loaded');
      }
    },

    // Quick room modal functions
    openRoomModal(student) {
      this.tempStudent = student;
      this.tempRoom = { number: '', type: '' };
      this.roomModal.show();
    },
    async saveRoomFromModal() {
      if (!this.tempRoom.number) { alert('Enter room number'); return; }
      if (!this.tempStudent) return;

      // Build new rooms array for the target student
      let rooms = [];
      try { rooms = JSON.parse(this.tempStudent.room || '[]'); } catch (e) { rooms = []; }
      if (!Array.isArray(rooms)) rooms = [];
      const now = this.nowStamp();
      rooms.push({ roomNumber: this.tempRoom.number.trim(), roomType: this.tempRoom.type || '', timeStamp: now });

      // Update local object so UI updates immediately
      this.tempStudent.room = JSON.stringify(rooms);

      // Persist: call API update for that student (reusing your save flow)
      // Build payload: keep other fields intact
      const payload = { ...this.tempStudent, action: 'update' };

      try {
        this.loading = true;
        await axios.post(this.apiUrl, JSON.stringify(payload), { headers: { 'Content-Type': 'text/plain' } });
        await this.fetchStudents();
        this.roomModal.hide();
        alert('Room updated and saved');
      } catch (e) {
        console.error(e); alert('Failed to save room change');
      } finally { this.loading = false; }
    },

    // Google Sheets sync placeholder — needs Apps Script URL set in env
    async syncGoogleSheet() {
      const endpoint = (import.meta.env.VITE_GOOGLE_SHEETS_URL || '');
      if (!endpoint) { alert('Set VITE_GOOGLE_SHEETS_URL in .env to your Apps Script web app URL'); return; }
      try {
        this.loading = true;
        await axios.post(endpoint, { students: this.filteredStudents });
        alert('Synced to Google Sheet');
      } catch (e) {
        console.error(e); alert('Google Sheets sync failed');
      } finally { this.loading = false; }
    }
  }
};
</script>

<style scoped>
.table-primary th { text-align: center; }
@media (max-width: 767px) {
  .d-md-none { display: block !important; }
  .d-none.d-md-table-cell { display: none !important; }
}
</style>
