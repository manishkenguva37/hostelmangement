<template>
  <div class="container py-5">

    <!-- Student Info -->
    <div v-if="student" class="card p-4 shadow-lg mb-4">
    {{student}}
      <div class="d-flex align-items-center mb-3 flex-wrap">
        <img :src="student.photoUrl || 'https://via.placeholder.com/100'" 
             width="100" class="me-3 rounded-circle border" alt="Student" />
        <div>
          <h2 class="mb-1">{{ student.name }}</h2>
          <p class="mb-1"><strong>ID:</strong> {{ student.id }}</p>
          <p class="mb-1"><strong>Email:</strong> {{ student.email || '-' }}</p>
          <p class="mb-1"><strong>Phone:</strong> {{ student.personPhone || '-' }}</p>
          <p class="mb-1"><strong>Parent Phone:</strong> {{ student.parentPhone || '-' }}</p>
          <p class="mb-1"><strong>Advance:</strong> ₹{{ student.Advance || 0 }}</p>
          <p class="mb-1"><strong>DOJ:</strong> {{ formatDate(student.dateofjoining) }}</p>
          <p class="mb-1"><strong>DOB:</strong> {{ formatDate(student.dob) }}</p>
        </div>
      </div>
    </div>

    <!-- Room History -->
    <div class="card p-4 shadow mb-4">
      <h4 class="mb-3">Room History</h4>
      <div class="table-responsive">
        <table class="table table-bordered table-hover">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Room Number</th>
              <th>Room Type</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(room, index) in roomHistory" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ room.roomNumber }}</td>
              <td>{{ room.roomType }}</td>
              <td>{{ formatDateTime(room.timeStamp) }}</td>
            </tr>
            <tr v-if="!roomHistory.length">
              <td colspan="4" class="text-center text-muted">No room history</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Rent History -->
    <div class="card p-4 shadow mb-4">
      <h4 class="mb-3">Rent History</h4>
      <div class="table-responsive">
        <table class="table table-bordered table-hover">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Month</th>
              <th>Rent</th>
              <th>Paid</th>
              <th>Due</th>
              <th>Status</th>
              <th>Proofs</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(rent, index) in rentHistory" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ rent.month }} {{ rent.year }}</td>
              <td>₹{{ rent.rent }}</td>
              <td>₹{{ rent.paid }}</td>
              <td>₹{{ rent.due }}</td>
              <td>
                <span :class="rent.status === 'Paid' ? 'badge bg-success' : 'badge bg-warning'">
                  {{ rent.status }}
                </span>
              </td>
              <td>
                <div v-if="rent.photoUrls && rent.photoUrls.trim()">
                  <a v-for="(url, i) in rent.photoUrls.split(',')" :key="i" :href="url.trim()" target="_blank">
                    <img :src="url.trim()" width="50" height="50" 
                         class="me-1 mb-1 rounded border object-fit-cover" 
                         style="cursor: pointer;" />
                  </a>
                </div>
                <span v-else class="text-muted">-</span>
              </td>
            </tr>
            <tr v-if="!rentHistory.length">
              <td colspan="7" class="text-center text-muted">No rent records</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Rent Button -->
    <button class="btn btn-primary btn-lg shadow" @click="showModal = true">
      <i class="bi bi-plus-circle"></i> Add Rent Payment
    </button>

    <!-- MODAL - FULLY FIXED -->
    <div v-if="showModal" class="modal-backdrop" @click="closeModal">
      <div class="modal-dialog" @click.stop>
        <div class="modal-content">
          <h5 class="mb-4 fw-bold text-center">Add Rent Payment</h5>

          <div class="mb-3">
            <label class="form-label fw-semibold">Month <span class="text-danger">*</span></label>
            <input type="month" v-model="rentForm.month" class="form-control" required />
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">Rent Amount <span class="text-danger">*</span></label>
            <input type="number" v-model.number="rentForm.rent" class="form-control" 
                   placeholder="e.g. 8500" min="0" />
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">Paid Amount</label>
            <input type="number" v-model.number="rentForm.paid" class="form-control" 
                   placeholder="e.g. 8500" min="0" />
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">Payment Mode</label>
            <select v-model="rentForm.paymentMode" class="form-select">
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>

          <div class="mb-4">
            <label class="form-label fw-semibold">Upload Payment Proof (Optional)</label>
            <input type="file" multiple accept="image/*" @change="handleFilesUpload" class="form-control" />
            <div class="mt-3 d-flex flex-wrap gap-2">
              <div v-for="(img, i) in rentImages" :key="i" class="position-relative">
                <img :src="img" width="80" height="80" 
                     class="rounded border shadow-sm object-fit-cover" />
                <button @click="rentImages.splice(i, 1)" 
                        class="btn-close position-absolute top-0 end-0 bg-white rounded-circle shadow" 
                        style="font-size: 10px; transform: translate(50%, -50%);"></button>
              </div>
            </div>
          </div>

          <div class="d-flex gap-3 justify-content-end">
            <button class="btn btn-outline-secondary px-4" @click="closeModal">Cancel</button>
            <button class="btn btn-success px-5" @click="submitRent" 
                    :disabled="!rentForm.month || !rentForm.rent">
              <span v-if="!rentForm.month || !rentForm.rent" class="spinner-border spinner-border-sm me-2"></span>
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  data() {
    return {
      student: null,
      rentHistory: [],
      roomHistory: [],
      showModal: false,
      rentForm: { 
        month: '', 
        rent: 0, 
        paid: 0, 
        paymentMode: 'cash' 
      },
      rentImages: [],
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
  mounted() {
    window.addEventListener('keydown', this.handleEscape);
    const saved = sessionStorage.getItem("selectedStudent");
    if (saved) {
      this.student = JSON.parse(saved);
      this.prepareRoomHistory();
      this.fetchRentHistory();
    }
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleEscape);
  },
  methods: {
    handleEscape(e) {
      if (e.key === 'Escape' && this.showModal) {
        this.closeModal();
      }
    },
    prepareRoomHistory() {
      if (!this.student || !this.student.room) return;
      try {
        this.roomHistory = JSON.parse(this.student.room);
      } catch {
        this.roomHistory = [];
      }
    },
    fetchRentHistory() {
      if (!this.student) return;
      fetch(`${this.apiUrl}?action=getRentHistory&studentId=${this.student.id}`)
        .then(res => res.json())
        .then(data => this.rentHistory = data || [])
        .catch(err => console.error('Fetch Rent History Error:', err));
    },
    handleFilesUpload(event) {
      this.rentImages = [];
      const files = Array.from(event.target.files);
      files.forEach(file => {
        if (file.type.match('image.*')) {
          const reader = new FileReader();
          reader.onload = e => this.rentImages.push(e.target.result);
          reader.readAsDataURL(file);
        }
      });
    },
    submitRent() {
      if (!this.student || !this.rentForm.month || !this.rentForm.rent) return;

      const [year, month] = this.rentForm.month.split('-');
      const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'short' });

      const payload = {
        action: 'addRent',
        studentId: this.student.id,
        name: this.student.name,
        year: parseInt(year),
        month: monthName,
        rent: this.rentForm.rent,
        paid: this.rentForm.paid || 0,
        due: this.rentForm.rent - (this.rentForm.paid || 0),
        status: (this.rentForm.paid || 0) >= this.rentForm.rent ? 'Paid' : 'Pending',
        paymentMode: this.rentForm.paymentMode,
        photoDataList: this.rentImages
      };

      fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Rent added successfully!');
          this.closeModal();
          this.fetchRentHistory();
        } else {
          alert('Failed: ' + (data.error || 'Unknown error'));
        }
      })
      .catch(err => {
        console.error('Submit Error:', err);
        alert('Network error. Please try again.');
      });
    },
    closeModal() {
      this.showModal = false;
      this.rentForm = { month: '', rent: 0, paid: 0, paymentMode: 'cash' };
      this.rentImages = [];
      // Reset file input
      const input = document.querySelector('input[type="file"]');
      if (input) input.value = '';
    },
    formatDate(dateStr) {
      if (!dateStr) return '-';
      return new Date(dateStr).toLocaleDateString('en-IN');
    },
    formatDateTime(dateStr) {
      if (!dateStr) return '-';
      return new Date(dateStr).toLocaleString('en-IN');
    }
  }
};
</script>

<style scoped>
/* MODAL BACKDROP */
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease-out;
}

/* MODAL BOX */
.modal-dialog {
  width: 95%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  animation: zoomIn 0.3s ease-out;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.35);
  border: none;
}

/* ANIMATIONS */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoomIn {
  from {
    transform: scale(0.85);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Scrollbar */
.modal-dialog::-webkit-scrollbar {
  width: 8px;
}
.modal-dialog::-webkit-scrollbar-thumb {
  background: #aaa;
  border-radius: 4px;
}

/* Responsive */
@media (max-width: 576px) {
  .modal-content {
    padding: 20px;
    border-radius: 16px;
  }
  h5 { font-size: 1.1rem; }
}
</style>