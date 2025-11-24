<template>
  <SidebarLayout>
    <template #header>
      <h3 class="text-xl font-semibold">Student Manager</h3>
    </template>

    <template #body>
      <div class="container-fluid py-4" :class="{ 'bg-dark text-light': darkMode }">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h3 class="mb-0 text-primary">
              <i class="bi bi-people-fill me-2"></i> Student Manager
            </h3>
            <small class="text-muted">Manage · Export · Sync</small>
          </div>

          <div class="d-flex flex-wrap gap-2">
            <button @click="darkMode = !darkMode" class="btn btn-outline-secondary">
              <i :class="darkMode ? 'bi bi-sun' : 'bi bi-moon'"></i>
            </button>
            <button @click="toggleView" class="btn btn-outline-primary">
              <i :class="viewMode === 'table' ? 'bi bi-grid' : 'bi bi-table'"></i>
            </button>
            <button @click="scrollToAdd" class="btn btn-success">
              <i class="bi bi-plus-circle me-1"></i> Add Student
            </button>
          </div>
        </div>

        <!-- Stats -->
        <div class="row text-center mb-4">
          <div class="col-6 col-md-3 mb-3" v-for="s in stats" :key="s.label">
            <div class="card shadow-sm h-100">
              <div class="card-body">
                <h6 class="text-muted">{{ s.label }}</h6>
                <h4 class="fw-bold">{{ s.value }}</h4>
              </div>
            </div>
          </div>
        </div>

        <!-- Search + Export -->
        <div class="row align-items-center mb-3 gy-2">
          <div class="col-md-6">
            <input v-model="search" placeholder="Search by name, email, or room" class="form-control" />
          </div>
          <div class="col-md-6 text-md-end d-flex d-md-block justify-content-center gap-2">
            <button class="btn btn-outline-success" @click="exportCSV">
              <i class="bi bi-file-earmark-spreadsheet"></i>
            </button>
            <button class="btn btn-outline-danger" @click="exportPDF">
              <i class="bi bi-filetype-pdf"></i>
            </button>
            <button class="btn btn-outline-primary" @click="syncGoogleSheet">
              <i class="bi bi-cloud-upload"></i>
            </button>
          </div>
        </div>

        <!-- TABLE VIEW -->
        <div v-if="viewMode === 'table'">
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-primary">
                <tr>
                  <th>Photo</th>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Room</th>
                  <th>Phone</th>
                  <th>Parent Phone</th>
                  <th>Aadhar</th>
                  <th>Joining Date</th>
                  <th>DOB</th>
                  <th>Advance</th>
                  <th>Timestamp</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in filteredStudents" :key="s.id">
                  <td>
                    <img
                      :src="fixPhoto(s.photoUrl)"
                      width="50"
                      height="50"
                      class="rounded-circle object-fit-cover"
                      @error="e => e.target.src = placeholder"
                    />
                  </td>
                  <td>
                    <button class="btn btn-primary btn-sm" @click="viewDetails(s)">
                      {{ s.id }}
                    </button>
                  </td>
                  <td>{{ s.name }}</td>
                  <td>{{ s.email }}</td>
                  <td>{{ getLatestRoom(s.room) }}</td>
                  <td>{{ s.personPhone || '-' }}</td>
                  <td>{{ s.parentPhone || '-' }}</td>
                  <td>{{ s.adharNumber || '-' }}</td>
                  <td>{{ formatDate(s.dateofjoining) }}</td>
                  <td>{{ formatDate(s.dob) }}</td>
                  <td>{{ s.Advance || 0 }}</td>
                  <td>{{ formatDate(s.timestamp) }}</td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary me-1" @click="openEditModal(s)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(s.id)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- CARD VIEW -->
        <div v-else class="row g-3">
          <div v-for="s in filteredStudents" :key="s.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
            <div class="card h-100 shadow-sm">
              <img
                :src="fixPhoto(s.photoUrl)"
                class="card-img-top"
                height="160"
                style="object-fit: cover"
                @error="e => e.target.src = placeholder"
              />
              <div class="card-body">
                <h5 class="card-title mb-1">{{ s.name }}</h5>
                <small class="text-muted d-block mb-2">{{ s.email }}</small>
                <p><strong>Room:</strong> {{ getLatestRoom(s.room) }}</p>
                <p><strong>Phone:</strong> {{ s.personPhone || '-' }}</p>
                <p><strong>Parent:</strong> {{ s.parentPhone || '-' }}</p>
                <p><strong>Joined:</strong> {{ formatDate(s.dateofjoining) }}</p>
              </div>
              <div class="card-footer d-flex justify-content-between">
                <button class="btn btn-sm btn-outline-primary" @click="openEditModal(s)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(s.id)">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <p v-if="!filteredStudents.length" class="text-center mt-5">No students found.</p>

        <!-- ADD/EDIT FORM -->
        <div ref="addForm" class="card mt-5 shadow-sm">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">{{ form.id ? "Edit Student" : "Add Student" }}</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="saveStudent">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Full Name</label>
                  <input v-model="form.name" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email</label>
                  <input v-model="form.email" type="email" class="form-control" required />
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
                  <label class="form-label">Aadhar Number</label>
                  <input v-model="form.adharNumber" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Advance Paid</label>
                  <input v-model="form.Advance" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Joining Date</label>
                  <input v-model="form.dateofjoining" type="date" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Date of Birth</label>
                  <input v-model="form.dob" type="date" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Room Number</label>
                  <input v-model="newRoom.roomNumber" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Room Type</label>
                  <select v-model="newRoom.roomType" class="form-select">
                    <option value="">Select Room Type</option>
                    <option>Single</option>
                    <option>3 sharing</option>
                    <option>4 sharing</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Photo</label>
                  <input type="file" @change="handleImage" class="form-control" accept="image/*" />
                </div>
              </div>

              <div class="mt-4 text-end">
                <button type="submit" class="btn btn-success">{{ form.id ? "Update" : "Add Student" }}</button>
                <button type="button" class="btn btn-outline-secondary ms-2" @click="resetForm">Clear</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Loader -->
        <div
          v-if="loading"
          class="position-fixed top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex align-items-center justify-content-center"
          style="z-index: 9999"
        >
          <div class="spinner-border text-primary" role="status"></div>
        </div>

        <!-- Custom Toast Notification (Replaces alert()) -->
        <div
          v-if="toast.message"
          :class="['fixed bottom-4 right-4 p-4 rounded-lg shadow-xl text-white z-50 transition-opacity duration-300', toast.type === 'error' ? 'bg-red-600' : 'bg-green-600']"
        >
          {{ toast.message }}
        </div>

        <!-- Custom Confirmation Modal (Replaces confirm()) -->
        <div 
          v-if="showDeleteModal" 
          class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        >
          <div class="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm">
            <h3 class="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p class="mb-6">Are you sure you want to delete this student record? This action cannot be undone.</p>
            <div class="flex justify-end space-x-3">
              <button @click="showDeleteModal = false" class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
              <button @click="deleteStudent(deleteId)" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </SidebarLayout>
</template>

<script>
// We need axios for the API calls
import axios from "axios";
// We need the registered global component (SidebarLayout) for the template, 
// but we don't need to import it here because it's registered globally.

export default {
  name: "ViewStudent",
  data() {
    return {
      apiUrl: import.meta.env.VITE_API_URL,
      students: [],
      
      form: {
        id: "",
        name: "",
        email: "",
        personPhone: "",
        parentPhone: "",
        adharNumber: "",
        Advance: "",
        dateofjoining: "",
        dob: "",
        room: "",
        photoUrl: "",
        imageData: "",
        timestamp: "",
      },
      newRoom: { roomNumber: "", roomType: "" },
      search: "",
      loading: false,
      darkMode: false,
      viewMode: "table",
      placeholder: "https://placehold.co/150x150/cccccc/000000?text=No+Photo",

      // New State for safe UI interaction
      showDeleteModal: false,
      deleteId: null,
      toast: {
        message: "",
        type: "success",
        timeout: null,
      },
    };
  },
  computed: {
    filteredStudents() {
      const q = this.search.toLowerCase();
      return this.students.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          this.getLatestRoom(s.room).toLowerCase().includes(q)
      );
    },
    stats() {
      const recentYear = new Date().getFullYear().toString();
      return [
        { label: "Total", value: this.students.length },
        { label: "Active Rooms", value: new Set(this.students.map((s) => this.getLatestRoom(s.room))).size },
        { label: "With Advance", value: this.students.filter((s) => Number(s.Advance) > 0).length },
        { label: "Recent Joins", value: this.students.filter((s) => String(s.dateofjoining || "").includes(recentYear)).length },
      ];
    },
  },
  mounted() {
    // Note: We need to load jsPDF library dynamically for exportPDF to work
    this.loadPdfLibraries();
    this.fetchStudents();
  },
  methods: {
    // --- Safe UI Helpers ---
    showToast(message, type = 'success') {
      clearTimeout(this.toast.timeout);
      this.toast.message = message;
      this.toast.type = type;
      this.toast.timeout = setTimeout(() => {
        this.toast.message = "";
      }, 3000);
    },
    confirmDelete(id) {
      this.deleteId = id;
      this.showDeleteModal = true;
    },
    // --- Data Handlers ---
    async loadPdfLibraries() {
        // Dynamic loading of jsPDF and Autotable (necessary for exportPDF to function)
        try {
            await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js');
        } catch (e) {
            console.warn("jsPDF or Autotable failed to load. PDF export may not work.", e);
        }
    },
    viewDetails(student) {
      // store data in route meta before navigating
      const route = this.$router.resolve({ name: "ViewStudent" });
      route.route.meta.student = student;
      this.$router.push(route.route);
    },
    formatDate(val) {
      if (!val) return "-";
      const d = new Date(val);
      return isNaN(d.getTime()) ? val : d.toISOString().split("T")[0];
    },
    toggleView() {
      this.viewMode = this.viewMode === "table" ? "card" : "table";
    },
    async fetchStudents() {
      try {
        this.loading = true;
        const { data } = await axios.get(`${this.apiUrl}?action=read`);
        this.students = data || [];
        this.showToast("Students loaded successfully.");
      } catch (e) {
        this.showToast("Failed to fetch students. Is API URL correct?", 'error');
        console.error("Fetch error:", e);
      } finally {
        this.loading = false;
      }
    },
    async saveStudent() {
      const action = this.form.id ? "update" : "create";
      const now = new Date().toISOString();

      // Merge old and new rooms
      let oldRooms = [];
      if (this.form.room) {
        try { oldRooms = JSON.parse(this.form.room); } catch { console.warn("Error parsing existing room data."); }
      }
      if (this.newRoom.roomNumber) {
        // Only push new room if it's different from the latest one
        const latestRoomNumber = this.getLatestRoom(this.form.room);
        if (this.newRoom.roomNumber !== latestRoomNumber) {
            oldRooms.push({ ...this.newRoom, timeStamp: now });
        }
      }
      this.form.room = JSON.stringify(oldRooms);

      try {
        this.loading = true;
        // Use text/plain header to bypass CORS pre-flight for Google Scripts
        await axios.post(this.apiUrl, JSON.stringify({ ...this.form, action }), {
          headers: { "Content-Type": "text/plain" },
        });
        await this.fetchStudents();
        this.resetForm();
        this.showToast(`Student ${action === "create" ? "added" : "updated"} successfully`);
      } catch (e) {
        this.showToast("Save failed. Check API response.", 'error');
        console.error("Save error:", e);
      } finally {
        this.loading = false;
      }
    },
    async deleteStudent(id) {
      this.showDeleteModal = false; // Close modal immediately
      try {
        this.loading = true;
        await axios.post(this.apiUrl, JSON.stringify({ action: "delete", id }), {
          headers: { "Content-Type": "text/plain" },
        });
        await this.fetchStudents();
        this.showToast("Deleted successfully");
      } catch (e) {
        this.showToast("Delete failed. Check API response.", 'error');
        console.error("Delete error:", e);
      } finally {
        this.loading = false;
      }
    },
    openEditModal(s) {
      this.form = { ...s, imageData: "" };
      // Note: $refs may not be available immediately after a change, but typically works here
      this.$nextTick(() => {
        window.scrollTo({ top: this.$refs.addForm.offsetTop, behavior: "smooth" });
      });
    },
    resetForm() {
      this.form = {
        id: "",
        name: "",
        email: "",
        personPhone: "",
        parentPhone: "",
        adharNumber: "",
        Advance: "",
        dateofjoining: "",
        dob: "",
        room: "",
        photoUrl: "",
        imageData: "",
        timestamp: "",
      };
      this.newRoom = { roomNumber: "", roomType: "" };
    },
    handleImage(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => (this.form.imageData = ev.target.result);
      reader.readAsDataURL(file);
    },
    fixPhoto(url) {
      if (!url) return this.placeholder;
      // Convert Google Drive URL to thumbnail URL
      const match = String(url).match(/id=([^&]+)/);
      return match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w200` : url;
    },
    getLatestRoom(json) {
      try {
        const arr = JSON.parse(json || "[]");
        if (arr.length) return arr[arr.length - 1].roomNumber;
      } catch {}
      return "-";
    },
    scrollToAdd() {
      this.$nextTick(() => {
        window.scrollTo({ top: this.$refs.addForm.offsetTop, behavior: "smooth" });
      });
    },
    // --- Export/Sync Logic ---
    exportCSV() {
      const csvData = this.students.map((s) => ({
        ID: s.id,
        Name: s.name,
        Email: s.email,
        Room: this.getLatestRoom(s.room),
        Phone: s.personPhone,
        ParentPhone: s.parentPhone,
        Aadhar: s.adharNumber,
        Advance: s.Advance,
        JoiningDate: this.formatDate(s.dateofjoining),
        DOB: this.formatDate(s.dob),
      }));

      const header = Object.keys(csvData[0]).join(",");
      const rows = csvData.map(obj => Object.values(obj).join(","));
      const csv = "data:text/csv;charset=utf-8," + [header, ...rows].join("\n");
      
      const link = document.createElement("a");
      link.href = encodeURI(csv);
      link.download = "students.csv";
      link.click();
      this.showToast("CSV file generated.");
    },
    exportPDF() {
      if (!window.jspdf || !window.jspdf.jsPDF.prototype.autoTable) {
        this.showToast("PDF library not loaded. Try again in a moment.", 'error');
        return;
      }
      try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text("Student List", 10, 10);
        const rows = this.students.map((s) => [
          s.id,
          s.name,
          s.email,
          this.getLatestRoom(s.room),
          s.personPhone,
        ]);
        doc.autoTable({ head: [["ID", "Name", "Email", "Room", "Phone"]], body: rows, startY: 20 });
        doc.save("students.pdf");
        this.showToast("PDF file generated.");
      } catch (e) {
        console.error(e);
        this.showToast("PDF export failed.", 'error');
      }
    },
    async syncGoogleSheet() {
      const endpoint = import.meta.env.VITE_GOOGLE_SHEETS_URL;
      if (!endpoint) return this.showToast("VITE_GOOGLE_SHEETS_URL is not set.", 'error');

      try {
        this.loading = true;

        const payload = {
          action: "create",
          students: this.students
        };

        // Use text/plain to skip CORS preflight
        await axios.post(endpoint, JSON.stringify(payload), {
          headers: { "Content-Type": "text/plain" }
        });

        this.showToast("Synced to Google Sheet successfully!");
      } catch (err) {
        console.error("Sync error:", err);
        this.showToast("Sync failed. Check console for details.", 'error');
      } finally {
        this.loading = false;
      }
    }
  },
};
</script>

<style scoped>
/* Scoped styles specific to the student management dashboard (using Bootstrap style conventions) */
.card-img-top {
  border-bottom: 1px solid #ddd;
}
@media (max-width: 576px) {
  .table {
    font-size: 0.85rem;
  }
}
</style>