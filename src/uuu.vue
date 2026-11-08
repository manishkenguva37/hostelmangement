<template>
  <SidebarLayout>
    <template #header>
      <div class="d-flex align-items-center justify-content-between w-100">
        <div>
          <h3 class="mb-0">Student Manager</h3>
          <small class="text-muted">Manage · Export · Sync</small>
        </div>

        <div class="d-flex gap-2 align-items-center">
          <button class="btn btn-outline-secondary" @click="darkMode = !darkMode" :title="darkMode ? 'Light' : 'Dark'">
            <i :class="darkMode ? 'bi bi-sun' : 'bi bi-moon'"></i>
          </button>

          <button class="btn btn-outline-primary" @click="toggleView" title="Toggle View">
            <i :class="viewMode === 'table' ? 'bi bi-grid' : 'bi bi-table'"></i>
          </button>

          <button class="btn btn-success" @click="openAddModal">
            <i class="bi bi-plus-circle me-1"></i> Add Student
          </button>
        </div>
      </div>
    </template>

    <template #body>
      <div :class="['container-fluid py-4', darkMode ? 'bg-dark text-light' : '']">
        <!-- STATS -->
        <div class="row g-3 mb-4">
          <div class="col-6 col-md-3" v-for="s in stats" :key="s.label">
            <div class="glass-card p-3 h-100 d-flex flex-column justify-content-center">
              <small class="text-muted">{{ s.label }}</small>
              <div class="h4 mb-0 fw-bold">{{ s.value }}</div>
            </div>
          </div>
        </div>

        <!-- SEARCH + ACTIONS -->
        <div class="row align-items-center mb-3 gy-2">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-white/0"><i class="bi bi-search"></i></span>
              <input v-model="search" class="form-control" placeholder="Search by name, email or room" />
            </div>
          </div>

          <div class="col-md-6 d-flex justify-content-center justify-content-md-end gap-2">
            <button class="btn btn-outline-success" @click="exportCSV" title="Export CSV">
              <i class="bi bi-file-earmark-spreadsheet"></i>
            </button>
            <button class="btn btn-outline-danger" @click="exportPDF" title="Export PDF">
              <i class="bi bi-filetype-pdf"></i>
            </button>
            <button class="btn btn-outline-primary" @click="syncGoogleSheet" title="Sync to Google Sheet">
              <i class="bi bi-cloud-upload"></i>
            </button>
          </div>
        </div>

        <!-- TABLE VIEW -->
        <div v-if="viewMode === 'table'">
          <div class="table-responsive glass-card p-3">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr class="table-light">
                  <th>Photo</th>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Room</th>
                  <th>Phone</th>
                  <th>Parent</th>
                  <th>Aadhar</th>
                  <th>Joined</th>
                  <th>DOB</th>
                  <th>Advance</th>
                  <th>Timestamp</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in filteredStudents" :key="s.id">
                  <td>
                    <img :src="fixPhoto(s.photoUrl)" width="48" height="48" class="rounded-circle object-fit-cover border"
                         @error="e => e.target.src = placeholder" />
                  </td>
                  <td>
                    <button class="btn btn-sm btn-primary" @click="viewDetails(s)">{{ s.id }}</button>
                  </td>
                  <td>{{ s.name }}</td>
                  <td>{{ s.email || '-' }}</td>
                  <td>
                    <span class="d-inline-block text-truncate" style="max-width:120px;" :title="roomTooltip(s.room)">
                      {{ getLatestRoom(s.room) }}
                    </span>
                  </td>
                  <td>{{ s.personPhone || '-' }}</td>
                  <td>{{ s.parentPhone || '-' }}</td>
                  <td>{{ s.adharNumber || '-' }}</td>
                  <td>{{ formatDate(s.dateofjoining) }}</td>
                  <td>{{ formatDate(s.dob) }}</td>
                  <td>₹{{ numberWithCommas(s.Advance || 0) }}</td>
                  <td>{{ formatDateTime(s.timestamp) }}</td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary me-1" @click="openEditModal(s)"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(s.id)"><i class="bi bi-trash"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-if="!filteredStudents.length" class="text-center py-4 text-muted">No students found.</div>
          </div>
        </div>

        <!-- CARD VIEW -->
        <div v-else class="row g-3">
          <div v-for="s in filteredStudents" :key="s.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
            <div class="card glass-card h-100 shadow-sm">
              <img :src="fixPhoto(s.photoUrl)" class="card-img-top" style="height:160px; object-fit:cover" @error="e=>e.target.src=placeholder" />
              <div class="card-body">
                <h5 class="card-title mb-1">{{ s.name }}</h5>
                <p class="text-muted mb-1">{{ s.email || '-' }}</p>
                <p class="mb-1"><strong>Room:</strong> {{ getLatestRoom(s.room) }}</p>
                <p class="mb-1"><strong>Phone:</strong> {{ s.personPhone || '-' }}</p>
                <p class="mb-0"><small class="text-muted">Joined: {{ formatDate(s.dateofjoining) }}</small></p>
              </div>
              <div class="card-footer d-flex justify-content-between">
                <button class="btn btn-sm btn-outline-primary" @click="openEditModal(s)"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(s.id)"><i class="bi bi-trash"></i></button>
              </div>
            </div>
          </div>
        </div>

        <!-- Add / Edit Modal (glass) -->
        <div v-if="showModal" class="modal-backdrop-custom" @click="closeModal">
          <div class="modal-card" @click.stop>
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="mb-0">{{ editing ? 'Edit Student' : 'Add Student' }}</h5>
              <button class="btn-close" @click="closeModal"></button>
            </div>

            <form @submit.prevent="submitForm">
              <div class="row g-3 modal-content-scrollable">
                <div class="col-md-6">
                  <label class="form-label">Full name</label>
                  <input v-model="form.name" required class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email</label>
                  <input v-model="form.email" type="email" required class="form-control" />
                </div>

                <div class="col-md-4">
                  <label class="form-label">Phone</label>
                  <input v-model="form.personPhone" class="form-control" />
                </div>

                <div class="col-md-4">
                  <label class="form-label">Parent Phone</label>
                  <input v-model="form.parentPhone" class="form-control" />
                </div>

                <div class="col-md-4">
                  <label class="form-label">Aadhar</label>
                  <input v-model="form.adharNumber" class="form-control" />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Advance</label>
                  <input v-model.number="form.Advance" type="number" min="0" class="form-control" />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Joining Date</label>
                  <input v-model="form.dateofjoining" type="date" class="form-control" />
                </div>

                <div class="col-md-6">
                  <label class="form-label">DOB</label>
                  <input v-model="form.dob" type="date" class="form-control" />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Room Number</label>
                  <input v-model="newRoom.roomNumber" class="form-control" />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Room Type</label>
                  <select v-model="newRoom.roomType" class="form-select">
                    <option value="">Select</option>
                    <option>Single</option>
                    <option>3 sharing</option>
                    <option>4 sharing</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Photo</label>
                  <input type="file" @change="handleImage" accept="image/*" class="form-control" />
                  <div v-if="form.imageData" class="mt-2">
                    <img :src="form.imageData" width="110" height="110" class="rounded border object-fit-cover" />
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
        <div v-if="loading" class="position-fixed inset-0 d-flex align-items-center justify-content-center" style="z-index:12000; background: rgba(255,255,255,0.65);">
          <div class="spinner-border text-primary" role="status"></div>
        </div>

        <!-- Toast -->
        <div v-if="toast.message" class="position-fixed bottom-3 end-3 p-3" style="z-index:13000">
          <div :class="['toast show text-white p-3 rounded shadow', toast.type === 'error' ? 'bg-danger' : 'bg-success']">
            {{ toast.message }}
          </div>
        </div>

        <!-- Delete Confirm -->
        <div v-if="showDeleteModal" class="position-fixed inset-0 d-flex align-items-center justify-content-center" style="z-index:12500; background: rgba(0,0,0,0.45);">
          <div class="bg-white rounded-3 p-4 shadow-lg" style="max-width:420px; width:100%;">
            <h5 class="mb-3">Confirm Deletion</h5>
            <p class="text-muted mb-4">Are you sure you want to delete this student? This action cannot be undone.</p>
            <div class="d-flex justify-content-end gap-2">
              <button class="btn btn-outline-secondary" @click="showDeleteModal=false">Cancel</button>
              <button class="btn btn-danger" @click="deleteStudent(deleteId)">Delete</button>
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
import "jspdf-autotable"; // registers autoTable on jsPDF prototype

export default {
  name: "ViewStudent",
  data() {
    return {
      apiUrl: import.meta.env.VITE_API_URL || "",
      students: [],
      form: {
        id: "",
        name: "",
        email: "",
        personPhone: "",
        parentPhone: "",
        adharNumber: "",
        Advance: 0,
        dateofjoining: "",
        dob: "",
        room: "",
        photoUrl: "",
        imageData: "",
        timestamp: ""
      },
      newRoom: { roomNumber: "", roomType: "" },
      search: "",
      loading: false,
      darkMode: false,
      viewMode: "table",
      placeholder: "https://placehold.co/150x150/cccccc/000000?text=No+Photo",

      // modals + ui
      showModal: false,
      editing: false,
      showDeleteModal: false,
      deleteId: null,
      toast: { message: "", type: "success", timeout: null }
    };
  },

  computed: {
    filteredStudents() {
      const q = (this.search || "").trim().toLowerCase();
      if (!q) return this.students;
      return this.students.filter(s =>
        (s.name || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q) ||
        this.getLatestRoom(s.room).toLowerCase().includes(q)
      );
    },
    stats() {
      const year = new Date().getFullYear().toString();
      return [
        { label: "Total", value: this.students.length },
        { label: "Active Rooms", value: new Set(this.students.map(s => this.getLatestRoom(s.room))).size },
        { label: "With Advance", value: this.students.filter(s => Number(s.Advance) > 0).length },
        { label: "Recent Joins", value: this.students.filter(s => String(s.dateofjoining || "").includes(year)).length }
      ];
    }
  },

  mounted() {
    this.fetchStudents();
    window.addEventListener("keydown", this.onEsc);
  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.onEsc);
  },

  methods: {
    onEsc(e) {
      if (e.key === "Escape") {
        if (this.showModal) this.closeModal();
        if (this.showDeleteModal) this.showDeleteModal = false;
      }
    },

    // UI helpers
    showToast(msg, type = "success") {
      clearTimeout(this.toast.timeout);
      this.toast.message = msg;
      this.toast.type = type;
      this.toast.timeout = setTimeout(() => (this.toast.message = ""), 3000);
    },

    numberWithCommas(x) {
      if (x == null || x === "") return "0";
      return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    // Fetch
    async fetchStudents() {
      try {
        this.loading = true;
        if (!this.apiUrl) {
          this.students = [];
          this.showToast("No API URL set — students list empty", "error");
          return;
        }
        const { data } = await axios.get(`${this.apiUrl}?action=read`);
        this.students = data || [];
        this.showToast("Students loaded");
      } catch (err) {
        console.error("fetchStudents:", err);
        this.showToast("Failed to fetch students", "error");
      } finally {
        this.loading = false;
      }
    },

    // Add / Edit modal flows
    openAddModal() {
      this.editing = false;
      this.form = {
        id: "",
        name: "",
        email: "",
        personPhone: "",
        parentPhone: "",
        adharNumber: "",
        Advance: 0,
        dateofjoining: "",
        dob: "",
        room: "",
        photoUrl: "",
        imageData: "",
        timestamp: ""
      };
      this.newRoom = { roomNumber: "", roomType: "" };
      this.showModal = true;
      this.$nextTick(() => this.lockBody(true));
    },
    openEditModal(s) {
      this.editing = true;
      this.form = { ...s, imageData: "" };
      this.form.Advance = Number(this.form.Advance || 0);
      this.newRoom = { roomNumber: "", roomType: "" };
      this.showModal = true;
      this.$nextTick(() => {
        this.lockBody(true);
        const el = document.querySelector(".modal-card");
        if (el) el.scrollTop = 0;
      });
    },
    closeModal() {
      this.showModal = false;
      this.lockBody(false);
      this.newRoom = { roomNumber: "", roomType: "" };
    },

    // lock background scroll while modal open
    lockBody(lock) {
      if (lock) document.documentElement.style.overflow = "hidden";
      else document.documentElement.style.overflow = "";
    },

    handleImage(e) {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = ev => (this.form.imageData = ev.target.result);
      reader.readAsDataURL(f);
    },

    async submitForm() {
      if (!this.form.name || !this.form.email) {
        return this.showToast("Name and email are required", "error");
      }
      const action = this.editing ? "update" : "create";
      const now = new Date().toISOString();

      // merge rooms robustly
      let oldRooms = [];
      if (this.form.room) {
        try { oldRooms = JSON.parse(this.form.room); } catch {}
      }
      if (this.newRoom.roomNumber) {
        const latest = this.getLatestRoom(this.form.room);
        if (this.newRoom.roomNumber !== latest) {
          oldRooms.push({ ...this.newRoom, timeStamp: now });
        }
      }
      this.form.room = JSON.stringify(oldRooms);

      try {
        this.loading = true;
        const payload = { ...this.form, action };
        await axios.post(this.apiUrl || "/", JSON.stringify(payload), { headers: { "Content-Type": "text/plain" }});
        await this.fetchStudents();
        this.closeModal();
        this.showToast(this.editing ? "Updated student" : "Added student");
      } catch (err) {
        console.error("submitForm error", err);
        this.showToast("Save failed", "error");
      } finally {
        this.loading = false;
      }
    },

    // Delete
    confirmDelete(id) {
      this.deleteId = id;
      this.showDeleteModal = true;
    },
    async deleteStudent(id) {
      this.showDeleteModal = false;
      try {
        this.loading = true;
        await axios.post(this.apiUrl || "/", JSON.stringify({ action: "delete", id }), { headers: { "Content-Type": "text/plain" }});
        await this.fetchStudents();
        this.showToast("Deleted successfully");
      } catch (err) {
        console.error("deleteStudent:", err);
        this.showToast("Delete failed", "error");
      } finally {
        this.loading = false;
      }
    },

    // Exports
    exportCSV() {
      if (!this.students.length) return this.showToast("No students to export", "error");
      const rows = this.students.map(s => [
        s.id, s.name, s.email, this.getLatestRoom(s.room), s.personPhone || "-", s.parentPhone || "-", s.adharNumber || "-", s.Advance || 0
      ]);
      const csv = "data:text/csv;charset=utf-8," + ["ID,Name,Email,Room,Phone,Parent,Aadhar,Advance", ...rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(","))].join("\n");
      const a = document.createElement("a");
      a.href = encodeURI(csv);
      a.download = "students.csv";
      a.click();
      this.showToast("CSV generated");
    },

    exportPDF() {
      try {
        const doc = new jsPDF();
        const rows = this.students.map(s => [s.id, s.name, s.email, this.getLatestRoom(s.room), s.personPhone || "-"]);
        // autoTable is registered by the imported plugin
        doc.autoTable({ head: [["ID","Name","Email","Room","Phone"]], body: rows, startY: 20 });
        doc.save("students.pdf");
        this.showToast("PDF generated");
      } catch (err) {
        console.error("exportPDF", err);
        this.showToast("PDF export failed", "error");
      }
    },

    // Google Sheets sync (text/plain)
    async syncGoogleSheet() {
      const endpoint = import.meta.env.VITE_GOOGLE_SHEETS_URL;
      if (!endpoint) return this.showToast("VITE_GOOGLE_SHEETS_URL is not set", "error");
      try {
        this.loading = true;
        await axios.post(endpoint, JSON.stringify({ action: "create", students: this.students }), { headers: { "Content-Type": "text/plain" }});
        this.showToast("Synced to Google Sheet");
      } catch (err) {
        console.error("syncGoogleSheet:", err);
        this.showToast("Sync failed", "error");
      } finally {
        this.loading = false;
      }
    },

    // Navigation / view helpers
    toggleView() {
      this.viewMode = this.viewMode === "table" ? "card" : "table";
    },

    viewDetails(student) {
      const route = this.$router.resolve({ name: "ViewStudent" });
      route.route.meta.student = student;
      this.$router.push(route.route);
    },

    scrollToAdd() {
      this.$nextTick(() => {
        if (this.$refs.addForm) window.scrollTo({ top: this.$refs.addForm.offsetTop, behavior: "smooth" });
        else this.openAddModal();
      });
    },

    fixPhoto(url) {
      if (!url) return this.placeholder;
      const m = String(url).match(/id=([^&]+)/);
      return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w200` : url;
    },

    // Robust getLatestRoom
    getLatestRoom(json) {
      try {
        if (!json) return "-";
        if (Array.isArray(json)) {
          const last = json[json.length - 1];
          return (last && (last.roomNumber || last.room)) || "-";
        }
        if (typeof json === "object" && json.roomNumber) return json.roomNumber;
        const str = String(json).trim();
        if (str.startsWith("[")) {
          const parsedTop = JSON.parse(str);
          const flat = [];
          parsedTop.forEach(item => {
            if (!item) return;
            if (typeof item === "string") {
              const t = item.trim();
              if (t.startsWith("[")) {
                try {
                  const inner = JSON.parse(t);
                  if (Array.isArray(inner)) inner.forEach(x => x && flat.push(x));
                } catch {}
              } else if (t.startsWith("{")) {
                try { const o = JSON.parse(t); if (o && o.roomNumber) flat.push(o); } catch {}
              }
            } else if (typeof item === "object") {
              if (item.roomNumber) flat.push(item);
            }
          });
          if (flat.length) {
            const last = flat[flat.length - 1];
            return last.roomNumber || last.room || "-";
          }
        }
        if (str.startsWith("{")) {
          const obj = JSON.parse(str);
          if (obj.roomNumber) return obj.roomNumber;
        }
      } catch (err) {
        console.warn("getLatestRoom parse error", err);
      }
      return "-";
    },

    roomTooltip(json) {
      try {
        if (!json) return "";
        let arr = [];
        if (Array.isArray(json)) arr = json;
        else if (typeof json === "string" && json.trim().startsWith("[")) arr = JSON.parse(json);
        else if (typeof json === "object") arr = [json];
        const flat = [];
        arr.forEach(item => {
          if (!item) return;
          if (typeof item === "string") {
            try {
              const parsed = JSON.parse(item);
              if (Array.isArray(parsed)) parsed.forEach(x => x && flat.push(x));
              else if (parsed && parsed.roomNumber) flat.push(parsed);
            } catch {}
          } else if (typeof item === "object" && item.roomNumber) flat.push(item);
        });
        return flat.map(r => `${r.roomNumber} • ${r.roomType || '-'} • ${this.formatDateTime(r.timeStamp || r.timestamp || r.time || '')}`).join("\n");
      } catch {
        return "";
      }
    },

    formatDate(v) {
      if (!v) return "-";
      const d = new Date(v);
      if (isNaN(d)) return v;
      return d.toLocaleDateString("en-IN");
    },

    formatDateTime(v) {
      if (!v) return "-";
      const d = new Date(v);
      if (isNaN(d)) return v;
      return d.toLocaleString("en-IN");
    }
  }
};
</script>

<style scoped>
/* ===== Glass card base ===== */
.glass-card {
  background: rgba(255,255,255,0.70);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.65);
  border-radius: 12px;
}

/* modal backdrop custom */
.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 12000;
  padding: 16px;
}

/* modal card - scrollable content */
.modal-card {
  width: 100%;
  max-width: 900px;
  background: rgba(255,255,255,0.95);
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 20px 60px rgba(10,10,10,0.14);
  border: 1px solid rgba(0,0,0,0.06);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

/* make modal body scrollable without moving header/footer */
.modal-content-scrollable {
  overflow-y: auto;
  padding-right: 6px;
  max-height: calc(85vh - 120px); /* header + footer space */
}

/* small image object-fit fallback */
.object-fit-cover { object-fit: cover; }

/* responsive tweaks */
@media (max-width: 576px) {
  .glass-card { padding: 12px; border-radius: 12px; }
  .modal-card { padding: 14px; border-radius: 10px; max-width: 100%; }
}

/* toast position */
.toast.show { opacity: 1; }

/* translucent table header in glass context */
.table thead tr.table-light > * {
  background: rgba(255,255,255,0.85);
}
</style>
