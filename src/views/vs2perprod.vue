<template>
  <div class="container py-5">
    <div v-if="student" class="student-card shadow-lg p-4 rounded-4 bg-white">
      <!-- Header -->
      <div class="text-center mb-4">
        <img
          :src="student.photoUrl || defaultPhoto"
          alt="Profile"
          class="rounded-circle border border-3 border-primary shadow-sm mb-3"
          width="120"
          height="120"
        />
        <h2 class="fw-bold text-primary mb-0">{{ student.name }}</h2>
        <p class="text-muted mb-1">{{ student.email }}</p>
        <span class="badge bg-success">Active Student</span>
      </div>

      <hr class="my-4" />

      <!-- Personal Info -->
      <div class="row g-4">
        <div class="col-md-6">
          <div class="info-card p-3 border rounded-3 bg-light shadow-sm h-100">
            <h5 class="fw-semibold text-secondary mb-3">
              <i class="bi bi-person-vcard me-2"></i>Personal Details
            </h5>
            <ul class="list-unstyled mb-0">
              <li><strong>ID:</strong> {{ student.id }}</li>
              <li><strong>Aadhar:</strong> {{ student.adharNumber }}</li>
              <li><strong>DOB:</strong> {{ formatDate(student.dob) }}</li>
              <li><strong>Date of Joining:</strong> {{ formatDate(student.dateofjoining) }}</li>
            </ul>
          </div>
        </div>

        <div class="col-md-6">
          <div class="info-card p-3 border rounded-3 bg-light shadow-sm h-100">
            <h5 class="fw-semibold text-secondary mb-3">
              <i class="bi bi-telephone-fill me-2"></i>Contact Info
            </h5>
            <ul class="list-unstyled mb-0">
              <li><strong>Phone:</strong> {{ student.personPhone }}</li>
              <li><strong>Parent Phone:</strong> {{ student.parentPhone }}</li>
              <li><strong>Advance:</strong> ₹{{ student.Advance?.toLocaleString() }}</li>
            </ul>
          </div>
        </div>
      </div>

      <hr class="my-4" />

      <!-- Room History -->
      <div class="room-history mt-3">
        <h5 class="fw-semibold text-secondary mb-3">
          <i class="bi bi-door-closed-fill me-2 text-primary"></i>Room History
        </h5>

        <div v-if="rooms.length" class="table-responsive rounded-4 shadow-sm">
          <table class="table align-middle table-hover mb-0">
            <thead class="table-primary text-center">
              <tr>
                <th>#</th>
                <th>Room Number</th>
                <th>Room Type</th>
                <th>Time Assigned</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(room, index) in rooms" :key="index" class="text-center">
                <td>{{ index + 1 }}</td>
                <td><span class="badge bg-primary fs-6">{{ room.roomNumber }}</span></td>
                <td>{{ room.roomType }}</td>
                <td>{{ formatDateTime(room.timeStamp) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="alert alert-info mt-3">
          <i class="bi bi-info-circle me-2"></i>No room history found.
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="d-flex justify-content-between mt-5">
        <button class="btn btn-outline-secondary" @click="$router.back()">
          <i class="bi bi-arrow-left"></i> Back
        </button>
        <button class="btn btn-primary" @click="addRentHistory">
          <i class="bi bi-cash-coin me-1"></i> Add Rent
        </button>
      </div>
    </div>

    <!-- Fallback -->
    <div v-else class="alert alert-warning mt-5 text-center p-5 shadow-sm rounded-4">
      <h5>No student data found</h5>
      <p>Please go back and select a student from the list.</p>
      <button class="btn btn-outline-primary mt-3" @click="$router.push('/')">
        Go Home
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ViewStudent",
  data() {
    return {
      student: null,
      rooms: [],
      defaultPhoto: "https://via.placeholder.com/120?text=Student",
      apiUrl: import.meta.env.VITE_API_URL,
    };
  },
  created() {
    // Load from route meta or session storage
    let metaStudent = this.$route.meta.student;
    if (!metaStudent) {
      const saved = sessionStorage.getItem("selectedStudent");
      if (saved) metaStudent = JSON.parse(saved);
    }

    if (metaStudent) {
      this.student = metaStudent;
      sessionStorage.setItem("selectedStudent", JSON.stringify(metaStudent));
      try {
        this.rooms = JSON.parse(metaStudent.room || "[]");
      } catch {
        this.rooms = [];
      }
    }
  },
  methods: {
    async addRentHistory() {
      try {
        const res = await fetch(`${this.apiUrl}?action=addRent&id=${this.student.id}`, {
          method: "POST",
        });
       
        const data = await res.json();
        alert(data.message || "Rent history added successfully!");
      } catch (err) {
        console.error(err);
        alert("Error adding rent history.");
      }
    },
    formatDate(date) {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
    formatDateTime(date) {
      if (!date) return "-";
      return new Date(date).toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
};
</script>

<style scoped>
.student-card {
  max-width: 900px;
  margin: auto;
  transition: all 0.3s ease-in-out;
}
.student-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}
.info-card ul li {
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}
.table th {
  background: linear-gradient(45deg, #007bff, #4a90e2);
  color: white;
  border: none;
}
.table td {
  vertical-align: middle;
}
.badge {
  font-size: 0.85rem;
}
</style>
