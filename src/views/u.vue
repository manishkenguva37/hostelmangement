<template>
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
          <i class="bi bi-plus-circle me-1"></i> Add
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
              <th>Name</th>
              <th>Email</th>
              <th>Room</th>
              <th>Phone</th>
              <th>Joining Date</th>
              <th>Advance</th>
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
              <td>{{ s.name }}</td>
              <td>{{ s.email }}</td>
              <td>{{ getLatestRoom(s.room) }}</td>
              <td>{{ s.personPhone || '-' }}</td>
              <td>{{ s.dateofjoining }}</td>
              <td>{{ s.Advance || 0 }}</td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-1" @click="openEditModal(s)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="deleteStudent(s.id)">
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
            <p class="mb-1"><strong>Room:</strong> {{ getLatestRoom(s.room) }}</p>
            <p class="mb-1"><strong>Phone:</strong> {{ s.personPhone || '-' }}</p>
            <p class="mb-0"><strong>Joined:</strong> {{ s.dateofjoining }}</p>
          </div>
          <div class="card-footer d-flex justify-content-between">
            <button class="btn btn-sm btn-outline-primary" @click="openEditModal(s)">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" @click="deleteStudent(s.id)">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <p v-if="!filteredStudents.length" class="text-center mt-5">No students found.</p>

    <!-- Add/Edit Form -->
    <div ref="addForm" class="card mt-5 shadow-sm">
      <div class="card-header bg-success text-white">
        <h5 class="mb-0">{{ form.id ? "Edit Student" : "Add Student" }}</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="saveStudent">
          <div class="row g-3">
            <div class="col-md-6"><input v-model="form.name" class="form-control" placeholder="Full Name" required /></div>
            <div class="col-md-6"><input v-model="form.email" type="email" class="form-control" placeholder="Email" required /></div>
            <div class="col-md-4"><input v-model="form.personPhone" class="form-control" placeholder="Phone" /></div>
            <div class="col-md-4"><input v-model="form.adharNumber" class="form-control" placeholder="Aadhar" /></div>
            <div class="col-md-4"><input v-model="form.Advance" class="form-control" placeholder="Advance Paid" /></div>
            <div class="col-md-6"><input v-model="form.dateofjoining" type="date" class="form-control" /></div>
            <div class="col-md-6"><input v-model="form.dob" type="date" class="form-control" /></div>
          </div>

          <div class="row g-3 mt-3">
            <div class="col-md-6"><input v-model="newRoom.roomNumber" class="form-control" placeholder="Room Number" /></div>
            <div class="col-md-6">
              <select v-model="newRoom.roomType" class="form-select">
                <option value="">Select Room Type</option>
                <option>Single</option>
                <option>3 sharing</option>
                <option>4 sharing</option>
              </select>
            </div>
          </div>

          <div class="mt-3">
            <input type="file" @change="handleImage" class="form-control" accept="image/*" />
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
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      apiUrl: import.meta.env.VITE_API_URL,
      students: [],
      form: { id: "", name: "", email: "", personPhone: "", adharNumber: "", Advance: "", dateofjoining: "", dob: "", room: "", imageData: "" },
      newRoom: { roomNumber: "", roomType: "" },
      search: "",
      loading: false,
      darkMode: false,
      viewMode: "table", // "table" or "card"
      placeholder: "https://via.placeholder.com/150?text=No+Photo",
    };
  },
  computed: {
    filteredStudents() {
      const q = this.search.toLowerCase();
      return this.students.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          this.getLatestRoom(s.room).toLowerCase().includes(q)
      );
    },
    stats() {
      return [
        { label: "Total", value: this.students.length },
        { label: "Active Rooms", value: new Set(this.students.map((s) => this.getLatestRoom(s.room))).size },
        { label: "With Advance", value: this.students.filter((s) => s.Advance > 0).length },
        { label: "Recent Joins", value: this.students.filter((s) => s.dateofjoining?.includes("2025")).length },
      ];
    },
  },
  mounted() {
    this.fetchStudents();
  },
  methods: {
    toggleView() {
      this.viewMode = this.viewMode === "table" ? "card" : "table";
    },
    async fetchStudents() {
      try {
        this.loading = true;
        const { data } = await axios.get(`${this.apiUrl}?action=read`);
        this.students = data || [];
      } catch (e) {
        alert("Failed to fetch students");
      } finally {
        this.loading = false;
      }
    },
    async saveStudent() {
      const action = this.form.id ? "update" : "create";
      const now = new Date().toISOString();
      this.form.room = JSON.stringify([{ ...this.newRoom, timeStamp: now }]);
      try {
        this.loading = true;
        await axios.post(this.apiUrl, JSON.stringify({ ...this.form, action }), {
          headers: { "Content-Type": "text/plain" },
        });
        await this.fetchStudents();
        this.resetForm();
        alert(`Student ${action === "create" ? "added" : "updated"} successfully`);
      } catch {
        alert("Save failed");
      } finally {
        this.loading = false;
      }
    },
    async deleteStudent(id) {
      if (!confirm("Delete this student?")) return;
      try {
        this.loading = true;
        await axios.post(this.apiUrl, JSON.stringify({ action: "delete", id }), {
          headers: { "Content-Type": "text/plain" },
        });
        await this.fetchStudents();
        alert("Deleted successfully");
      } catch {
        alert("Delete failed");
      } finally {
        this.loading = false;
      }
    },
    openEditModal(s) {
      this.form = { ...s, imageData: "" };
      window.scrollTo({ top: this.$refs.addForm.offsetTop, behavior: "smooth" });
    },
    resetForm() {
      this.form = { id: "", name: "", email: "", personPhone: "", adharNumber: "", Advance: "", dateofjoining: "", dob: "", room: "", imageData: "" };
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
      window.scrollTo({ top: this.$refs.addForm.offsetTop, behavior: "smooth" });
    },
    exportCSV() {
      const csv =
        "data:text/csv;charset=utf-8," +
        this.students
          .map((s) => [s.name, s.email, this.getLatestRoom(s.room), s.personPhone].join(","))
          .join("\n");
      const link = document.createElement("a");
      link.href = encodeURI(csv);
      link.download = "students.csv";
      link.click();
    },
    exportPDF() {
      try {
        const doc = new window.jspdf.jsPDF();
        doc.text("Student List", 10, 10);
        const rows = this.students.map((s) => [s.name, s.email, this.getLatestRoom(s.room), s.personPhone]);
        doc.autoTable({ head: [["Name", "Email", "Room", "Phone"]], body: rows });
        doc.save("students.pdf");
      } catch {
        alert("jsPDF not loaded");
      }
    },
    async syncGoogleSheet() {
      const endpoint = import.meta.env.VITE_GOOGLE_SHEETS_URL;
      if (!endpoint) return alert("Set VITE_GOOGLE_SHEETS_URL in .env");
      try {
        this.loading = true;
        await axios.post(endpoint, { students: this.students });
        alert("Synced to Google Sheet");
      } catch {
        alert("Sync failed");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.card-img-top {
  border-bottom: 1px solid #ddd;
}
@media (max-width: 576px) {
  .table {
    font-size: 0.9rem;
  }
}
</style>
