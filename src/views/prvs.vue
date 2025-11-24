<template>
    <SidebarLayout>
    <template #header>
      <h3 class="text-xl font-semibold">Student Manager</h3>
    </template>

    <template #body>
  <div class="container py-5">

    <!-- TOAST -->
    <div aria-live="polite" aria-atomic="true" class="position-fixed top-3 end-3" style="z-index: 2000">
      <div v-if="toast.message" :class="['toast align-items-center text-white show border-0', toast.type === 'error' ? 'bg-danger' : 'bg-success']" role="alert">
        <div class="d-flex">
          <div class="toast-body px-3">{{ toast.message }}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="toast.message = ''"></button>
        </div>
      </div>
    </div>

    <!-- STUDENT PROFILE (GLASS CARD) -->
    <div class="glass-card p-4 rounded-3 shadow-lg mb-4">
      <div class="d-flex align-items-center gap-4 flex-wrap">
        <img :src="student.photoUrl || placeholder" width="110" height="110" class="rounded-circle border" alt="photo" />
        <div class="flex-fill">
          <h2 class="mb-1 fw-bold">{{ student.name }}</h2>
          <div class="text-muted mb-2">ID: <span class="fw-semibold">{{ student.id }}</span></div>

          <div class="row gy-2">
            <div class="col-auto"><small class="text-muted">Email</small><div>{{ student.email || '-' }}</div></div>
            <div class="col-auto"><small class="text-muted">Phone</small><div>{{ student.personPhone || '-' }}</div></div>
            <div class="col-auto"><small class="text-muted">Parent</small><div>{{ student.parentPhone || '-' }}</div></div>
            <div class="col-auto"><small class="text-muted">Aadhar</small><div>{{ student.adharNumber || '-' }}</div></div>
          </div>
        </div>

        <div class="text-end ms-auto">
          <div class="mb-2"><small class="text-muted">Advance</small><div class="h5 mb-0">₹{{ numberWithCommas(student.Advance || 0) }}</div></div>
          <div><small class="text-muted">Joined</small><div>{{ formatDate(student.dateofjoining) }}</div></div>
        </div>
      </div>
    </div>

    <div class="row g-4">

      <!-- ROOM HISTORY -->
      <div class="col-12 col-lg-6">
        <div class="glass-card p-3 rounded-3 shadow-sm h-100">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0">Room History</h5>
            <small class="text-muted">{{ roomHistory.length }} entries</small>
          </div>

          <div v-if="roomHistory.length" class="list-group list-group-flush">
            <div v-for="(r, idx) in roomHistory" :key="idx" class="list-group-item bg-transparent d-flex justify-content-between align-items-start">
              <div>
                <div class="fw-semibold">Room {{ r.roomNumber }}</div>
                <div class="text-muted small">{{ r.roomType }}</div>
              </div>
              <div class="text-end text-muted small">{{ formatDateTime(r.timeStamp) }}</div>
            </div>
          </div>

          <div v-else class="text-muted py-3 text-center">No room history</div>
        </div>
      </div>

      <!-- RENT HISTORY -->
      <div class="col-12 col-lg-6">
        <div class="glass-card p-3 rounded-3 shadow-sm h-100 d-flex flex-column">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0">Rent History</h5>
            <div>
              <button class="btn btn-sm btn-outline-primary me-2" @click="fetchRentHistory">
                <i class="bi bi-arrow-clockwise"></i> Refresh
              </button>
              <button class="btn btn-sm btn-primary" @click="openModal">
                <i class="bi bi-plus-circle"></i> Add Rent
              </button>
            </div>
          </div>

          <div v-if="rentHistory.length" class="table-responsive mb-2">
            <table class="table table-borderless table-striped align-middle mb-0">
              <thead class="small text-muted">
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
                <tr v-for="(r, i) in rentHistory" :key="i">
                  <td>{{ i+1 }}</td>
                  <td>{{ r.month }} {{ r.year || '' }}</td>
                  <td>₹{{ numberWithCommas(r.rent) }}</td>
                  <td>₹{{ numberWithCommas(r.paid) }}</td>
                  <td>₹{{ numberWithCommas(r.due) }}</td>
                  <td>
                    <span :class="['badge', r.status === 'Paid' ? 'bg-success' : 'bg-warning text-dark']">{{ r.status }}</span>
                  </td>
                  <td>
                    <div v-if="r.photoUrls && r.photoUrls.trim()">
                      <a v-for="(u, j) in splitUrls(r.photoUrls)" :key="j" :href="u" target="_blank" class="me-1">
                        <img :src="u" width="44" height="44" class="rounded border object-fit-cover" />
                      </a>
                    </div>
                    <div v-else class="text-muted small">-</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="text-center text-muted mt-auto">No rent records</div>
        </div>
      </div>
    </div>

    <!-- ADD/EDIT RENT MODAL (custom) -->
    <div v-if="showModal" class="modal-backdrop-custom" @click="closeModal">
      <div class="modal-card" @click.stop>
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">Add Rent Payment</h5>
          <button class="btn-close" @click="closeModal"></button>
        </div>

        <div class="mb-2">
          <label class="form-label small">Month *</label>
          <input type="month" class="form-control" v-model="rentForm.month" />
        </div>

        <div class="row g-2">
          <div class="col-6">
            <label class="form-label small">Rent *</label>
            <input type="number" class="form-control" v-model.number="rentForm.rent" min="0" />
          </div>
          <div class="col-6">
            <label class="form-label small">Paid</label>
            <input type="number" class="form-control" v-model.number="rentForm.paid" min="0" />
          </div>
        </div>

        <div class="row g-2 mt-2">
          <div class="col-md-6">
            <label class="form-label small">Payment Mode</label>
            <select class="form-select" v-model="rentForm.paymentMode">
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank">Bank</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label small">Upload proofs</label>
            <input type="file" class="form-control" multiple accept="image/*" @change="handleFiles" />
          </div>
        </div>

        <div class="mt-3 d-flex flex-wrap gap-2">
          <div v-for="(img, idx) in rentImages" :key="idx" class="position-relative">
            <img :src="img" width="90" height="90" class="rounded border" />
            <button class="btn btn-sm btn-danger position-absolute top-0 end-0" @click="rentImages.splice(idx,1)">×</button>
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-4">
          <button class="btn btn-outline-secondary" @click="closeModal">Cancel</button>
          <button class="btn btn-primary" :disabled="!rentForm.month || !rentForm.rent" @click="submitRent">
            <i class="bi bi-check2-circle me-1"></i> Submit
          </button>
        </div>
      </div>
    </div>

  </div>
   </template>
</SidebarLayout>
</template>


<script>
export default {
  name: "StudentDetail",
  data() {
    // sample fallback from your provided JSON if meta/session is absent
    const sample = {
      id: 1762684596701,
      name: "Manish kenguva",
      email: "vijayakenguva@gmail.com",
      room:
        '["[{\\"roomNumber\\":\\"400\\",\\"roomType\\":\\"3 sharing\\",\\"timeStamp\\":\\"2025-11-09T10:36:34.530Z\\"}]","[{\\"roomNumber\\":\\"400\\",\\"roomType\\":\\"3 sharing\\",\\"timeStamp\\":\\"2025-11-09T10:36:34.530Z\\"}]",{\\"roomNumber\\":\\"4000\\",\\"roomType\\":\\"Single\\",\\"timeStamp\\":\\"2025-11-09T10:37:09.655Z\\"}]',
      photoUrl: "https://drive.google.com/thumbnail?id=1SUrt3abKa5fczg82xSsspEVsgQ8kaMAJ&sz=w200",
      timestamp: "2025-11-09T10:36:36.701Z",
      personPhone: "8179807655",
      adharNumber: "87878787878787",
      dateofjoining: "2025-11-18T18:30:00.000Z",
      Advance: 45000,
      dob: "2025-11-11T18:30:00.000Z",
      parentPhone: "7780103877"
    };

    return {
      student: null,
      roomHistory: [],
      rentHistory: [],
      placeholder: "https://placehold.co/150x150/cccccc/000000?text=No+Photo",
      showModal: false,
      rentForm: { month: "", rent: 0, paid: 0, paymentMode: "cash" },
      rentImages: [],
      toast: { message: "", type: "success" },
      apiUrl: import.meta.env.VITE_API_URL || "",

      sample
    };
  },

  created() {
    // Try route meta, session storage, fallback to sample
    let s = this.$route?.meta?.student || null;
    if (!s) {
      const ss = sessionStorage.getItem("selectedStudent");
      if (ss) s = JSON.parse(ss);
    }
    if (!s) s = this.sample;
    this.student = s;
    sessionStorage.setItem("selectedStudent", JSON.stringify(this.student));
    this.parseRoomField();
  },

  mounted() {
    this.fetchRentHistory();
    window.addEventListener("keydown", this.onEsc);
  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.onEsc);
  },

  methods: {
    // === Utilities ===
    numberWithCommas(x) {
      if (x == null) return "0";
      return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    formatDate(d) {
      if (!d) return "-";
      const dd = new Date(d);
      if (isNaN(dd)) return d;
      return dd.toLocaleDateString("en-IN");
    },

    formatDateTime(d) {
      if (!d) return "-";
      const dd = new Date(d);
      if (isNaN(dd)) return d;
      return dd.toLocaleString("en-IN");
    },

    splitUrls(val) {
      if (!val) return [];
      try {
        // If array-like string, attempt parse
        if (val.startsWith("[")) {
          const arr = JSON.parse(val);
          if (Array.isArray(arr)) return arr.flatMap(x => (typeof x === "string" ? x.split(",") : []));
        }
      } catch {}
      return val.split(",").map(x => x.trim()).filter(Boolean);
    },

    showToast(msg, type = "success") {
      this.toast.message = msg;
      this.toast.type = type;
      setTimeout(() => (this.toast.message = ""), 3000);
    },

    onEsc(e) {
      if (e.key === "Escape" && this.showModal) this.closeModal();
    },

    // === ROOM parsing (handles messy nested JSON strings) ===
    parseRoomField() {
      const raw = this.student?.room;
      const out = [];

      if (!raw) {
        this.roomHistory = [];
        return;
      }

      // raw may be a JSON string containing arrays, objects, or nested strings
      const tryParse = (v) => {
        // If it's already an object with roomNumber, return it
        if (v && typeof v === "object" && v.roomNumber) return v;
        if (typeof v !== "string") return null;

        // Try to parse JSON repeatedly until we get an object or array
        let cur = v;
        for (let i = 0; i < 6; i++) {
          try {
            const parsed = JSON.parse(cur);
            cur = parsed;
            if (Array.isArray(parsed)) return parsed.flatMap(x => tryParse(x) ? [tryParse(x)] : []).filter(Boolean);
            // If parsed is object -> return it
            if (parsed && typeof parsed === "object" && parsed.roomNumber) return parsed;
            // else continue loop
          } catch (e) {
            break;
          }
        }
        return null;
      };

      try {
        // If top is a string representing an array
        let top = raw;
        if (typeof raw === "string" && raw.trim().startsWith("[")) {
          const parsedTop = JSON.parse(raw);
          // parsedTop is an array containing strings/objects
          parsedTop.forEach(item => {
            // if item is string containing an array/object, try parse deeper
            if (typeof item === "string" && item.trim().startsWith("[")) {
              try {
                const inner = JSON.parse(item);
                inner.forEach(x => {
                  if (x && x.roomNumber) out.push(x);
                });
              } catch (e) {
                // fallback
              }
            } else if (typeof item === "string" && item.trim().startsWith("{")) {
              try {
                const obj = JSON.parse(item);
                if (obj && obj.roomNumber) out.push(obj);
              } catch (e) {}
            } else if (typeof item === "object" && item.roomNumber) {
              out.push(item);
            }
          });
        } else if (Array.isArray(raw)) {
          raw.forEach(r => { if (r && r.roomNumber) out.push(r); });
        } else if (typeof raw === "object" && raw.roomNumber) {
          out.push(raw);
        }
      } catch (err) {
        // last resort: try single parse
        const maybe = tryParse(raw);
        if (maybe) {
          if (Array.isArray(maybe)) out.push(...maybe);
          else out.push(maybe);
        }
      }

      // Normalize timestamps and sort oldest->newest
      const normalized = out
        .map(r => {
          return {
            roomNumber: String(r.roomNumber || r.room || "-"),
            roomType: r.roomType || r.roomtype || "-",
            timeStamp: r.timeStamp || r.timestamp || r.time || null
          };
        })
        .sort((a,b) => {
          if (!a.timeStamp) return 1;
          if (!b.timeStamp) return -1;
          return new Date(a.timeStamp) - new Date(b.timeStamp);
        });

      this.roomHistory = normalized;
    },

    // === RENT history ===
    async fetchRentHistory() {
      if (!this.student?.id) {
        this.rentHistory = [];
        return;
      }

      // Try to fetch from API, gracefully fallback to mock
      if (!this.apiUrl) {
        // create mock data
        this.rentHistory = [
          { month: "Nov", year: 2025, rent: 8500, paid: 8500, due: 0, status: "Paid", photoUrls: "" },
          { month: "Oct", year: 2025, rent: 8500, paid: 0, due: 8500, status: "Pending", photoUrls: "" }
        ];
        return;
      }

      try {
        const resp = await fetch(`${this.apiUrl}?action=getRentHistory&studentId=${this.student.id}`);
        const data = await resp.json();
        this.rentHistory = data || [];
      } catch (err) {
        console.error("rent fetch error", err);
        this.showToast("Failed to load rent history, showing mock data", "error");
        this.rentHistory = [
          { month: "Nov", year: 2025, rent: 8500, paid: 8500, due: 0, status: "Paid", photoUrls: "" }
        ];
      }
    },

    // === Modal / file handling ===
    openModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.rentForm = { month: "", rent: 0, paid: 0, paymentMode: "cash" };
      this.rentImages = [];
    },
    handleFiles(evt) {
      const files = Array.from(evt.target.files || []);
      files.forEach(f => {
        if (!f.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (e) => this.rentImages.push(e.target.result);
        reader.readAsDataURL(f);
      });
    },

    async submitRent() {
      if (!this.rentForm.month || !this.rentForm.rent) {
        this.showToast("Month and rent are required", "error");
        return;
      }

      // prepare payload
      const [year, month] = this.rentForm.month.split("-");
      const monthName = new Date(year, month - 1).toLocaleString("default", { month: "short" });

      const payload = {
        action: "addRent",
        studentId: this.student.id,
        name: this.student.name,
        year: parseInt(year,10),
        month: monthName,
        rent: Number(this.rentForm.rent),
        paid: Number(this.rentForm.paid || 0),
        due: Number(this.rentForm.rent) - Number(this.rentForm.paid || 0),
        status: (Number(this.rentForm.paid || 0) >= Number(this.rentForm.rent)) ? "Paid" : "Pending",
        paymentMode: this.rentForm.paymentMode,
        photoDataList: this.rentImages
      };

      try {
        if (!this.apiUrl) {
          // mock success
          this.rentHistory.unshift({
            month: monthName,
            year: parseInt(year,10),
            rent: payload.rent,
            paid: payload.paid,
            due: payload.due,
            status: payload.status,
            photoUrls: "" // we don't upload images in mock
          });
          this.showToast("Rent added (mock)");
          this.closeModal();
          return;
        }

        const resp = await fetch(this.apiUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify(payload)
        });
        const result = await resp.json();
        if (result.success) {
          this.showToast("Rent added");
          this.closeModal();
          await this.fetchRentHistory();
        } else {
          this.showToast(result.error || "Failed to add rent", "error");
        }
      } catch (err) {
        console.error("submit rent error", err);
        this.showToast("Network error", "error");
      }
    }
  }
};
</script>

<style scoped>
/* ===== Glass card base (re-usable) ===== */
.glass-card {
  background: rgba(255,255,255,0.55);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.6);
}

/* modal backdrop custom */
.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 16px;
}

/* modal card */
.modal-card {
  width: 100%;
  max-width: 720px;
  background: rgba(255,255,255,0.95);
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 20px 60px rgba(10,10,10,0.25);
  border: 1px solid rgba(0,0,0,0.06);
}

/* small image object-fit fallback */
.object-fit-cover { object-fit: cover; }

/* responsive tweaks */
@media (max-width: 576px) {
  .glass-card { padding: 16px; border-radius: 12px; }
  .modal-card { padding: 14px; border-radius: 10px; }
}
</style>
