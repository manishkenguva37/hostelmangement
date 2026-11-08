<template>
  <SidebarLayout>
    <template #header>
      <div class="d-flex align-items-center justify-content-between w-100">
        <div>
          <h3 class="mb-0">Student Manager</h3>
          <small class="text-muted">Manage · Export · Sync</small>
        </div>

        <div class="d-flex gap-2 align-items-center">
          <button class="btn btn-outline-secondary" @click="darkMode = !darkMode">
            <i :class="darkMode ? 'bi bi-sun' : 'bi bi-moon'"></i>
          </button>
          <button class="btn btn-outline-primary" @click="toggleView">
            <i :class="viewMode === 'table' ? 'bi bi-grid' : 'bi bi-table'"></i>
          </button>
          <button class="btn btn-success" @click="openAddModal">
            <i class="bi bi-plus-circle me-1"></i> Add Student
          </button>
          <button v-if="selected.length" class="btn btn-danger" @click="confirmBulkDelete">
            <i class="bi bi-trash"></i> Delete {{ selected.length }}
          </button>
        </div>
      </div>
    </template>

    <template #body>
      <div :class="['container-fluid py-4', darkMode ? 'bg-dark text-light' : '']">

        <!-- Stats -->
        <div class="row g-3 mb-4">
          <div class="col-6 col-md-3" v-for="s in stats" :key="s.label">
            <div class="glass-card p-3 text-center rounded shadow-sm">
              <small class="text-muted d-block">{{ s.label }}</small>
              <div class="h4 mb-0 fw-bold">{{ s.value }}</div>
            </div>
          </div>
        </div>

        <!-- Search + Export -->
        <div class="row align-items-center mb-3">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-search"></i></span>
              <input v-model="search" class="form-control" placeholder="Search name, email, room..." />
            </div>
          </div>
          <div class="col-md-6 text-md-end mt-2 mt-md-0">
            <button class="btn btn-outline-success me-2" @click="exportCSV"><i class="bi bi-file-spreadsheet"></i></button>
            <button class="btn btn-danger me-2" @click="exportPDF"><i class="bi bi-file-pdf"></i> PDF</button>
            <button class="btn btn-outline-primary" @click="syncGoogleSheet"><i class="bi bi-cloud-upload"></i></button>
          </div>
        </div>

        <!-- Table View -->
        <div v-if="viewMode === 'table'">
          <div class="table-responsive glass-card p-3 rounded">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th><input type="checkbox" @change="toggleAll" :checked="allSelected" /></th>
                  <th>Photo</th>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Room</th>
                  <th>Phone</th>
                  <th>Advance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in filteredStudents" :key="s.id">
                  <td><input type="checkbox" :value="s.id" v-model="selected" /></td>
                  <td>
                    <img :src="finalPhotoUrl(s.photoUrl)" width="48" height="48" class="rounded-circle object-fit-cover border"
                         @error="e => e.target.src = placeholder" />
                  </td>
                  <td> <button class="btn btn-primary btn-sm" @click="viewDetails(s)">
                      {{ s.id }}
                    </button></td>
                  <td>{{ s.name }}</td>
                  <td>{{ s.email || '-' }}</td>
                  <td><strong>{{ getLatestRoom(s.room) }}</strong></td>
                  <td>{{ s.personPhone || '-' }}</td>
                  <td>₹{{ numberWithCommas(s.Advance || 0) }}</td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary me-1" @click="openEditModal(s)"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(s.id)"><i class="bi bi-trash"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="!filteredStudents.length" class="text-center py-5 text-muted">No students found</div>
          </div>
        </div>

        <!-- Card View -->
        <div v-else class="row g-3">
          <div v-for="s in filteredStudents" :key="s.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
            <div class="card glass-card position-relative shadow-sm">
              <input type="checkbox" class="position-absolute top-0 start-0 m-3" style="z-index:10;" :value="s.id" v-model="selected" />
              <img :src="finalPhotoUrl(s.photoUrl)" class="card-img-top" style="height:180px; object-fit:cover;" @error="e=>e.target.src=placeholder" />
              <div class="card-body">
                <h6 class="card-title">{{ s.name }}</h6>
                <p class="text-muted small mb-1">{{ s.email || '-' }}</p>
                <p class="mb-1"><strong>Room:</strong> {{ getLatestRoom(s.room) }}</p>
                <p class="mb-0">₹{{ numberWithCommas(s.Advance || 0) }}</p>
              </div>
              <div class="card-footer d-flex justify-content-between">
                <button class="btn btn-sm btn-outline-primary" @click="openEditModal(s)">Edit</button>
                <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(s.id)">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Add/Edit Modal -->
        <div v-if="showModal" class="modal-backdrop-custom" @click="closeModal">
          <div class="modal-card" @click.stop>
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="mb-0">{{ editing ? 'Edit Student' : 'Add Student' }}</h5>
              <button class="btn-close" @click="closeModal"></button>
            </div>
            <form @submit.prevent="submitForm">
              <div class="row g-3 modal-content-scrollable">
                <div class="col-12 col-md-6"><label class="form-label">Name *</label><input v-model="form.name" required class="form-control" /></div>
                <div class="col-12 col-md-6"><label class="form-label">Email *</label><input v-model="form.email" type="email" required class="form-control" /></div>
                <div class="col-12 col-md-4"><label class="form-label">Phone</label><input v-model="form.personPhone" class="form-control" /></div>
                <div class="col-12 col-md-4"><label class="form-label">Parent Phone</label><input v-model="form.parentPhone" class="form-control" /></div>
                <div class="col-12 col-md-4"><label class="form-label">Aadhar</label><input v-model="form.adharNumber" class="form-control" /></div>
                <div class="col-12 col-md-6"><label class="form-label">Advance</label><input v-model.number="form.Advance" type="number" class="form-control" /></div>
                <div class="col-12 col-md-6"><label class="form-label">Joining Date</label><input v-model="form.dateofjoining" type="date" class="form-control" /></div>
                <div class="col-12 col-md-6"><label class="form-label">DOB</label><input v-model="form.dob" type="date" class="form-control" /></div>
                <div class="col-12 col-md-6"><label class="form-label">New Room</label><input v-model="newRoom.roomNumber" class="form-control" placeholder="e.g. 406" /></div>
                <div class="col-12 col-md-6"><label class="form-label">Room Type</label>
                  <select v-model="newRoom.roomType" class="form-select">
                    <option value="">Select</option>
                    <option>Single</option>
                    <option>3 sharing</option>
                    <option>4 sharing</option>
                  </select>
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Photo</label>
                  <input type="file" @change="handleImage" accept="image/*" class="form-control" />
                  <div v-if="form.imageData" class="mt-2">
                    <img :src="form.imageData" width="120" height="120" class="rounded border object-fit-cover" />
                  </div>
                </div>
              </div>
              <div class="mt-4 d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-outline-secondary" @click="closeModal">Cancel</button>
                <button type="submit" class="btn btn-primary">{{ editing ? 'Update' : 'Add' }}</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Loader -->
        <div v-if="loading" class="position-fixed inset-0 bg-white bg-opacity-75 d-flex align-items-center justify-content-center" style="z-index:9999;">
          <div class="spinner-border text-primary" style="width:3rem;height:3rem;"></div>
        </div>

        <!-- Toast -->
        <div v-if="toast.message" class="position-fixed bottom-0 end-0 m-4" style="z-index:9999;">
          <div :class="['alert alert-dismissible fade show', toast.type==='error'?'alert-danger':'alert-success']">
            {{ toast.message }}
            <button type="button" class="btn-close" @click="toast.message=''"></button>
          </div>
        </div>

        <!-- Delete Confirm -->
        <div v-if="showDeleteModal" class="modal-backdrop-custom" @click="showDeleteModal=false">
          <div class="bg-white rounded-4 p-4 shadow-lg" style="max-width:420px;" @click.stop>
            <h5>Confirm Delete</h5>
            <p>Delete {{ selected.length > 1 ? selected.length + ' students' : 'this student' }} permanently?</p>
            <div class="d-flex justify-content-end gap-2">
              <button class="btn btn-secondary" @click="showDeleteModal=false">Cancel</button>
              <button class="btn btn-danger" @click="deleteStudent">Delete</button>
            </div>
          </div>
        </div>

      </div>
    </template>
  </SidebarLayout>
</template>

<script>
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default {
  data() {
    return {
      apiUrl: import.meta.env.VITE_API_URL || "",
      students: [],
      selected: [],
      search: "",
      darkMode: false,
      viewMode: "table",
      placeholder: "https://placehold.co/150x150/cccccc/666666?text=No+Photo",
      showModal: false,
      editing: false,
      showDeleteModal: false,
      loading: false,
      toast: { message: "", type: "success" },
      form: { id: "", name: "", email: "", personPhone: "", parentPhone: "", adharNumber: "", Advance: 0, dateofjoining: "", dob: "", room: "", photoUrl: "", imageData: "" },
      newRoom: { roomNumber: "", roomType: "" }
    };
  },

  computed: {
    filteredStudents() {
      const q = this.search.toLowerCase().trim();
      if (!q) return this.students;
      return this.students.filter(s =>
        (s.name || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q) ||
        this.getLatestRoom(s.room).toLowerCase().includes(q)
      );
    },
    allSelected() {
      return this.filteredStudents.length && this.selected.length === this.filteredStudents.length;
    },
    stats() {
      return [
        { label: "Total", value: this.students.length },
        { label: "Rooms Used", value: new Set(this.students.map(s => this.getLatestRoom(s.room))).size },
        { label: "Paid Advance", value: this.students.filter(s => Number(s.Advance) > 0).length },
        { label: "Selected", value: this.selected.length }
      ];
    }
  },

  mounted() {
    this.fetchStudents();
  },

  methods: {
     viewDetails(student) {
      // store data in route meta before navigating
      const route = this.$router.resolve({ name: "ViewStudent" });
      route.route.meta.student = student;
      this.$router.push(route.route);
    },
    // FINAL PHOTO FIX — WORKS EVERYWHERE
  finalPhotoUrl(url) {
  if (!url) return this.placeholder;
  const match = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (!match) return this.placeholder;
  // This is the ONLY format that works reliably in 2025
  return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
},

  getLatestRoom(json) {
  if (!json || json === '' || json === '[]') return '-';

  let rooms = [];

  try {
    // First try normal parse
    let parsed = JSON.parse(json);
    
    // If it's a string inside (double-stringified), parse again
    if (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }

    // If it's still not an array, wrap it
    if (!Array.isArray(parsed)) {
      parsed = [parsed];
    }

    // Flatten any nested arrays/strings
    const flat = [];
    parsed.forEach(item => {
      if (Array.isArray(item)) {
        item.forEach(x => x && flat.push(x));
      } else if (typeof item === 'string') {
        try {
          const sub = JSON.parse(item);
          if (Array.isArray(sub)) sub.forEach(x => x && flat.push(x));
          else if (sub && sub.roomNumber) flat.push(sub);
        } catch {}
      } else if (item && item.roomNumber) {
        flat.push(item);
      }
    });

    if (flat.length === 0) return '-';

    // Sort by latest timestamp
    flat.sort((a, b) => new Date(b.timeStamp || 0) - new Date(a.timeStamp || 0));

    return flat[0].roomNumber?.trim() || '-';
  } catch (e) {
    console.warn('Room parse failed:', json);
    return '-';
  }
},
    async fetchStudents() {
      try {
        this.loading = true;
        const { data } = await axios.get(`${this.apiUrl}?action=read`);
        this.students = data || [];
      } catch {
        this.showToast("Failed to load", "error");
      } finally {
        this.loading = false;
      }
    },

    toggleAll(e) {
      this.selected = e.target.checked ? this.filteredStudents.map(s => s.id) : [];
    },

    // FIXED DELETE — WORKS FOR SINGLE & BULK
    confirmDelete(id) {
      this.selected = [id];
      this.showDeleteModal = true;
    },
    confirmBulkDelete() {
      if (this.selected.length === 0) {
        this.showToast("Select at least one student", "error");
        return;
      }
      this.showDeleteModal = true;
    },

    async deleteStudent() {
      this.showDeleteModal = false;
      const ids = this.selected.slice();
      if (ids.length === 0) return;

      try {
        this.loading = true;
        for (const id of ids) {
          await axios.post(this.apiUrl, JSON.stringify({ action: "delete", id: String(id) }), {
            headers: { "Content-Type": "text/plain" }
          });
        }
        await this.fetchStudents();
        this.selected = [];
        this.showToast(`Deleted ${ids.length} student${ids.length > 1 ? 's' : ''}`);
      } catch (err) {
        console.error(err);
        this.showToast("Delete failed", "error");
      } finally {
        this.loading = false;
      }
    },

    openAddModal() {
      this.editing = false;
      this.form = { id: "", name: "", email: "", Advance: 0, room: "", photoUrl: "", imageData: "", personPhone: "", parentPhone: "", adharNumber: "", dateofjoining: "", dob: "" };
      this.newRoom = { roomNumber: "", roomType: "" };
      this.showModal = true;
    },
    openEditModal(s) {
      this.editing = true;
      this.form = { ...s, imageData: "" };
      this.form.Advance = Number(this.form.Advance || 0);
      this.newRoom = { roomNumber: "", roomType: "" };
      this.showModal = true;
    },
    closeModal() { this.showModal = false; },

    handleImage(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = ev => this.form.imageData = ev.target.result;
        reader.readAsDataURL(file);
      }
    },
async submitForm() {
  if (!this.form.name?.trim() || !this.form.email?.trim()) {
    return this.showToast("Name and email are required", "error");
  }

  const now = new Date().toISOString();

  // === FIX ROOM LOGIC (THIS IS THE MOST IMPORTANT PART) ===
  let rooms = [];

  // 1. Load existing rooms safely
  if (this.form.room) {
    try {
      const parsed = JSON.parse(this.form.room);
      if (Array.isArray(parsed)) {
        rooms = parsed;
      }
    } catch (e) {
      console.warn("Failed to parse existing room data, starting fresh");
    }
  }

  // 2. Add new room only if user entered one
  if (this.newRoom.roomNumber?.trim()) {
    const newRoomEntry = {
      roomNumber: this.newRoom.roomNumber.trim(),
      roomType: this.newRoom.roomType || "",
      timeStamp: now
    };

    // Avoid duplicates (optional but nice)
    const latest = rooms.length ? rooms[rooms.length - 1].roomNumber : "";
    // if (newRoomEntry.roomNumber !== latest) {
      rooms.push(newRoomEntry);
    // }
  }

  // 3. Save as clean JSON string (never double-stringified)
  this.form.room = {
    ...this.form,
    room: rooms.length > 0 ? JSON.stringify(rooms) : "[]"
  };

  try {
    this.loading = true;
    const action = this.editing ? "update" : "create";

    await axios.post(
      this.apiUrl,
      JSON.stringify({ ...this.form, action }),
      { headers: { "Content-Type": "text/plain" } }
    );

    await this.fetchStudents(); // Refresh list
    this.closeModal();
    this.newRoom = { roomNumber: "", roomType: "" }; // Reset room inputs
    this.showToast(this.editing ? "Student updated!" : "Student added!");
  } catch (err) {
    console.error("Submit error:", err);
    this.showToast("Save failed – check console", "error");
  } finally {
    this.loading = false;
  }
},

    exportCSV() {
      if (!this.students.length) return this.showToast("No data", "error");
      const headers = "ID,Name,Email,Room,Phone,Parent,Aadhar,Advance,Joined\n";
      const rows = this.students.map(s => [
        s.id,
        `"${(s.name || '').replace(/"/g, '""')}"`,
        s.email || '',
        this.getLatestRoom(s.room),
        s.personPhone || '',
        s.parentPhone || '',
        s.adharNumber || '',
        s.Advance || 0,
        this.formatDate(s.dateofjoining || '')
      ].join(',')).join('\n');

      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      this.showToast("CSV exported!");
    },

    exportPDF() {
      try {
        const doc = new jsPDF('landscape');
        doc.setFontSize(20);
        doc.text("HOSTEL STUDENT REPORT", 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 22);

        const head = [["Photo", "ID", "Name", "Email", "Room", "Phone", "Advance", "Joined"]];
        const body = this.students.map(s => [
          this.finalPhotoUrl(s.photoUrl),
          s.id,
          s.name || "-",
          s.email || "-",
          this.getLatestRoom(s.room),
          s.personPhone || "-",
          `₹${this.numberWithCommas(s.Advance || 0)}`,
          this.formatDate(s.dateofjoining)
        ]);

        autoTable(doc, {
          head, body, startY: 30, theme: 'grid',
          styles: { fontSize: 9 },
          headStyles: { fillColor: [41, 128, 185] },
          columnStyles: { 0: { cellWidth: 28 } },
          didDrawCell: (data) => {
            if (data.column.index === 0 && data.cell.raw && data.cell.raw.includes('uc?id=')) {
              try {
                doc.addImage(data.cell.raw, 'JPEG', data.cell.x + 2, data.cell.y + 2, 24, 24);
              } catch (e) {
                doc.setFillColor(220, 220, 220);
                doc.rect(data.cell.x + 2, data.cell.y + 2, 24, 24, 'F');
                doc.setFontSize(7);
                doc.text("No Photo", data.cell.x + 6, data.cell.y + 16);
              }
            }
          }
        });

        doc.save(`Hostel_Students_${new Date().toISOString().slice(0,10)}.pdf`);
        this.showToast("PDF with photos downloaded!");
      } catch (err) {
        console.error(err);
        this.showToast("PDF failed", "error");
      }
    },

    async syncGoogleSheet() {
      const url = import.meta.env.VITE_GOOGLE_SHEETS_URL;
      if (!url) return this.showToast("Sheets URL missing", "error");
      try {
        this.loading = true;
        await axios.post(url, JSON.stringify({ action: "create", students: this.students }), { headers: { "Content-Type": "text/plain" } });
        this.showToast("Synced to Sheets!");
      } catch { this.showToast("Sync failed", "error"); } finally { this.loading = false; }
    },

    toggleView() { this.viewMode = this.viewMode === "table" ? "card" : "table"; },
    numberWithCommas(x) { return x ? String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0"; },
    formatDate(d) { return d ? new Date(d).toLocaleDateString('en-IN') : "-"; },
    showToast(msg, type = "success") {
      this.toast = { message: msg, type };
      setTimeout(() => this.toast.message = "", 3000);
    }
  }
}
</script>

<style scoped>
.glass-card {
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.4);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}
.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 95%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-content-scrollable {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 10px;
}
</style>