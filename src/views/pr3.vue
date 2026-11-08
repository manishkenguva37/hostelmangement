<template>
  <div class="container py-5 position-relative">
    <!-- Student Card -->
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
        <p class="text-muted mb-1">{{ student.email || "No email" }}</p>
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
              <li>
                <strong>Date of Joining:</strong>
                {{ formatDate(student.dateofjoining) }}
              </li>
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
        <button class="btn btn-primary" @click="showRentModal = true">
          <i class="bi bi-cash-coin me-1"></i> Add Rent
        </button>
      </div>
    </div>

    <!-- Fallback -->
    <div
      v-else
      class="alert alert-warning mt-5 text-center p-5 shadow-sm rounded-4"
    >
      <h5>No student data found</h5>
      <p>Please go back and select a student from the list.</p>
      <button class="btn btn-outline-primary mt-3" @click="$router.push('/')">
        Go Home
      </button>
    </div>

    <!-- Add Rent Modal -->
    <div
      class="modal fade show"
      tabindex="-1"
      v-if="showRentModal"
      style="display: block; background: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 shadow-lg">
          <div class="modal-header bg-primary text-white rounded-top-4">
            <h5 class="modal-title fw-semibold">
              <i class="bi bi-cash me-2"></i>Add Rent Payment
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>

          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Month</label>
              <input v-model="rentForm.month" type="month" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label">Rent Amount</label>
              <input
                v-model="rentForm.rent"
                type="number"
                class="form-control"
                placeholder="Enter rent"
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Paid Amount</label>
              <input
                v-model="rentForm.paid"
                type="number"
                class="form-control"
                placeholder="Amount paid"
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Payment Mode</label>
              <select v-model="rentForm.paymentMode" class="form-select">
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Reference ID (optional)</label>
              <input
                v-model="rentForm.referenceId"
                class="form-control"
                placeholder="Transaction reference"
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Upload Payment Proof (optional)</label>
              <input type="file" class="form-control" @change="handlePhotoUpload" />
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeModal">Cancel</button>
            <button class="btn btn-primary" :disabled="loading" @click="submitRent">
              <span v-if="loading">
                <span class="spinner-border spinner-border-sm me-2"></span> Saving...
              </span>
              <span v-else>Submit</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div class="toast-container position-fixed top-0 end-0 p-3">
      <div
        v-for="(toast, index) in toasts"
        :key="index"
        class="toast align-items-center text-white border-0 show mb-2"
        :class="toast.type === 'success' ? 'bg-success' : 'bg-danger'"
        role="alert"
      >
        <div class="d-flex">
          <div class="toast-body fw-semibold">{{ toast.message }}</div>
          <button
            type="button"
            class="btn-close btn-close-white me-2 m-auto"
            @click="removeToast(index)"
          ></button>
        </div>
      </div>
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
      rooms: [],
      defaultPhoto: "https://via.placeholder.com/120?text=Student",
      showRentModal: false,
      loading: false,
      toasts: [],
      rentForm: {
        month: "",
        rent: "",
        paid: "",
        paymentMode: "cash",
        referenceId: "",
        photo: null,
      },
      apiUrl: import.meta.env.VITE_API_URL,
    };
  },
  created() {
    let metaStudent = this.$route.meta.student;
    if (!metaStudent) {
      const saved = sessionStorage.getItem("selectedStudent");
      if (saved) metaStudent = JSON.parse(saved);
    }
    if (metaStudent) {
      this.student = metaStudent;
      sessionStorage.setItem("selectedStudent", JSON.stringify(metaStudent));
      this.fetchRoomHistory();
    }
  },
  methods: {
    async fetchRoomHistory() {
      try {
        const res = await axios.get(`${this.apiUrl}?action=getRooms&studentId=${this.student.id}`);
        this.rooms = res.data.rooms || [];
      } catch (err) {
        console.error(err);
        this.showToast("Failed to fetch room history", "error");
      }
    },
    closeModal() {
      this.showRentModal = false;
      this.loading = false;
      this.rentForm = {
        month: "",
        rent: "",
        paid: "",
        paymentMode: "cash",
        referenceId: "",
        photo: null,
      };
    },
    handlePhotoUpload(e) {
      this.rentForm.photo = e.target.files[0] || null;
    },
    async submitRent() {
      if (!this.student) return;
      this.loading = true;

      try {
        const formData = new FormData();
        formData.append("studentId", this.student.id);
        formData.append("month", this.rentForm.month);
        formData.append("rent", this.rentForm.rent);
        formData.append("paid", this.rentForm.paid);
        formData.append("paymentMode", this.rentForm.paymentMode);
        formData.append("referenceId", this.rentForm.referenceId || "");
        formData.append("due", this.rentForm.rent - this.rentForm.paid);
        formData.append("status", this.rentForm.paid >= this.rentForm.rent ? "Paid" : "Pending");
        if (this.rentForm.photo) {
          formData.append("photo", this.rentForm.photo);
        }

        const { data } = await axios.post(`${this.apiUrl}?action=addRent`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        this.showToast(data.message || "Rent added successfully!", "success");
        this.closeModal();
        this.fetchRoomHistory();
      } catch (err) {
        console.error(err);
        this.showToast("Error adding rent. Try again.", "error");
      } finally {
        this.loading = false;
      }
    },
    showToast(message, type = "success") {
      const toast = { message, type };
      this.toasts.push(toast);
      setTimeout(() => {
        this.toasts.splice(this.toasts.indexOf(toast), 1);
      }, 4000);
    },
    removeToast(index) {
      this.toasts.splice(index, 1);
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
.modal-content {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.toast-container {
  z-index: 1055;
}
</style>
