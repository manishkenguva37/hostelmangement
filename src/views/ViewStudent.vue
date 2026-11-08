<template>
  <div class="container py-5">
    <div v-if="student" class="card shadow-lg p-4 rounded-4">
      <div class="d-flex align-items-center mb-3">
        <img
          v-if="student.photoUrl"
          :src="student.photoUrl"
          class="rounded-circle me-3"
          alt="photo"
          width="100"
          height="100"
        />
        <div>
          <h3 class="mb-0 text-primary fw-bold">{{ student.name }}</h3>
          <p class="text-muted mb-0">ID: {{ student.id }}</p>
        </div>
      </div>

      <table class="table table-bordered">
        <tbody>
          <tr><th>Email</th><td>{{ student.email }}</td></tr>
          <tr><th>Parent Phone</th><td>{{ student.parentPhone }}</td></tr>
          <tr><th>Personal Phone</th><td>{{ student.personPhone }}</td></tr>
          <tr><th>Date of Birth</th><td>{{ formatDate(student.dob) }}</td></tr>
          <tr><th>Date of Joining</th><td>{{ formatDate(student.dateofjoining) }}</td></tr>
          <tr><th>Advance</th><td>₹{{ student.Advance }}</td></tr>
        </tbody>
      </table>

      <h5 class="mt-4 text-success fw-bold">🏠 Room History</h5>
      <ul class="list-group">
        <li v-for="(room, index) in parsedRooms" :key="index" class="list-group-item">
          <strong>{{ room.roomNumber }}</strong> — {{ room.roomType }}
          <small class="text-muted d-block">{{ formatDate(room.timeStamp) }}</small>
        </li>
      </ul>
    </div>

    <div v-else class="text-center text-danger mt-5">
      <h4>Student not found 😢</h4>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ViewStudent",
  data() {
    return {
      student: null,
      loading: false,
    };
  },
  computed: {
    parsedRooms() {
      try {
        return JSON.parse(this.student?.room || "[]");
      } catch {
        return [];
      }
    },
  },
  async mounted() {
    const endpoint = import.meta.env.VITE_GOOGLE_SHEETS_URL;
    if (!endpoint) return alert("Set VITE_GOOGLE_SHEETS_URL in .env");

    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get("viewdetails");

    if (!studentId) return alert("Missing student ID!");

    try {
      this.loading = true;
      const res = await axios.get(endpoint);
      const allStudents = res.data;

      this.student = allStudents.find(
        (s) => String(s.id) === String(studentId)
      );
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Failed to load student data.");
    } finally {
      this.loading = false;
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return "-";
      const d = new Date(date);
      return d.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 700px;
}
</style>
