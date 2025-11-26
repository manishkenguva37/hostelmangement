<template>
  <SidebarLayout>
    <template #header>
      <h3 class="text-xl font-semibold">Student Details</h3>
    </template>

    <template #body>
      <div class="container py-5">
        <!-- Toast Notification -->
        <div v-if="toast.message" class="position-fixed top-3 end-3 z-50">
          <div :class="['toast align-items-center text-white show border-0 shadow-lg', toast.type === 'error' ? 'bg-danger' : 'bg-success']" role="alert">
            <div class="d-flex">
              <div class="toast-body px-4">{{ toast.message }}</div>
              <button type="button" class="btn-close btn-close-white me-3 m-auto" @click="toast.message = ''"></button>
            </div>
          </div>
        </div>
        

        <!-- Student Profile Card -->
        <div class="glass-card p-5 rounded-4 shadow-lg mb-5">
          <div class="row align-items-center g-4">
            <div class="col-auto">
              <img :src="finalPhotoUrl(student.photoUrl)" width="140" height="140" class="rounded-circle border border-4 border-white shadow" alt="Student Photo" />
            </div>
            <div class="col">
              <h2 class="mb-1 fw-bold text-primary">{{ student.name }}</h2>
              <p class="mb-3 text-muted">ID: <strong class="text-dark">{{ student.id }}</strong></p>
              <div class="row g-4 text-muted">
                <div class="col-sm-6 col-lg-4">
                  <small>Email</small>
                  <div class="fw-semibold text-dark">{{ student.email || '-' }}</div>
                </div>
                <div class="col-sm-6 col-lg-4">
                  <small>Phone</small>
                  <div class="fw-semibold text-dark">{{ student.personPhone || '-' }}</div>
                </div>
                <div class="col-sm-6 col-lg-4">
                  <small>Advance Paid</small>
                  <div class="h5 text-success mb-0">₹{{ numberWithCommas(student.Advance || 0) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-5">

          <!-- Room History (FIXED) -->
          <div class="col-lg-6">
            <div class="glass-card p-4 rounded-3 h-100">
              <h5 class="mb-4"><i class="bi bi-house-door-fill me-2 text-primary"></i> Room History</h5>

              <div v-if="roomHistory.length" class="timeline position-relative">
                <div v-for="(r, i) in roomHistory" :key="i" class="d-flex align-items-center mb-4 position-relative">
                  <div class="timeline-dot bg-primary rounded-circle"></div>
                  <div class="ms-4 flex-fill">
                    <div class="fw-bold fs-5">Room {{ r.roomNumber }}</div>
                    <small class="text-muted">{{ r.roomType || 'Not specified' }}</small>
                  </div>
                  <small class="text-muted">{{ formatDateTime(r.timeStamp) }}</small>
                </div>
              </div>
              <p v-else class="text-center text-muted py-5">No room{{student.room}} history available</p>
            </div>
          </div>

          <!-- Monthly Rent Tracker (FULLY WORKING) -->
          <div class="col-lg-6">
            <div class="glass-card p-4 rounded-4 h-100 d-flex flex-column shadow-sm">
              <h5 class="mb-4 fw-bold text-primary">
                <i class="bi bi-calendar-check-fill me-2"></i> Monthly Rent Tracker
                <small class="text-muted">(Click month to expand)</small>
              </h5>

              <div class="flex-fill overflow-auto pe-2" style="max-height: 70vh;">
                <div v-for="month in allMonths" :key="month.key" class="mb-4">
                  <!-- Month Header -->
                  <div class="d-flex align-items-center justify-content-between p-4 rounded-4 shadow-sm cursor-pointer user-select-none transition-all hover-shadow"
                    :class="getHeaderClass(month)" @click="toggleMonth(month.key)">

                    <div class="d-flex align-items-center gap-4">
                      <div class="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center shadow-lg"
                        style="width: 64px; height: 64px; font-size: 1.4rem;"
                        :class="getCircleClass(month)">
                        {{ month.monthShort }}
                      </div>
                      <div>
                        <h6 class="mb-1 fw-bold fs-4">{{ month.monthName }} {{ month.year }}</h6>
                        <small class="text-muted">{{ month.transactions }} payment{{ month.transactions !== 1 ? 's' : '' }}</small>
                      </div>
                    </div>

                    <div class="text-end">
                      <div class="h4 fw-bold mb-1" :class="month.status === 'Paid' ? 'text-success' : 'text-danger'">
                        ₹{{ numberWithCommas(month.paid) }} / ₹{{ numberWithCommas(month.rent) }}
                      </div>
                      <div v-if="month.due > 0" class="h6 text-danger fw-bold mb-0">Due: ₹{{ numberWithCommas(month.due) }}</div>
                      <div v-else class="h6 text-success mb-0">Fully Paid</div>
                      <i class="bi fs-3 ms-3" :class="expandedMonths.includes(month.key) ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                    </div>
                  </div>

                  <!-- Expanded Payments -->
                  <transition name="slide">
                    <div v-if="expandedMonths.includes(month.key)" class="mt-3">
                      <div v-for="payment in month.payments" :key="payment.id"
                        class="bg-white rounded-3 p-4 mb-3 shadow-sm border-start border-5 ms-5"
                        :class="payment.status === 'Paid' ? 'border-success' : 'border-warning'">
                        <div class="d-flex justify-content-between align-items-center">
                          <div>
                            <div class="fw-bold fs-5 text-success">₹{{ numberWithCommas(payment.paid) }}</div>
                            <div class="small text-muted mt-1">
                              via <strong>{{ payment.paymentMode.toUpperCase() }}</strong> • {{ payment.status }}<br>
                              <i class="bi bi-clock me-1"></i> {{ formatDateTime(payment.timestamp) }}
                            </div>
                          </div>
                          <div v-if="payment.photoUrls" class="d-flex gap-2 flex-wrap">
                            <a v-for="(url, i) in splitUrls(payment.photoUrls)" :key="i"
                              :href="finalPhotoUrl(url)" target="_blank">
                              <img :src="finalPhotoUrl(url)" width="80" height="80" class="rounded border object-fit-cover shadow-sm" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>

              <div class="mt-4 text-center">
                <button class="btn btn-success btn-lg px-5 shadow-lg" @click="openModal">
                  <i class="bi bi-plus-circle-fill me-2"></i> Record Payment
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Full Add Payment Modal -->
        <div v-if="showModal" class="modal-backdrop-custom" @click="closeModal">
          <div class="modal-card" @click.stop>
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h5 class="mb-0"><i class="bi bi-cash-coin me-2"></i> Record Rent Payment</h5>
              <button class="btn-close" @click="closeModal"></button>
            </div>
            <form @submit.prevent="submitRent">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Month & Year *</label>
                  <input type="month" class="form-control form-control-lg" v-model="rentForm.month" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Total Rent *</label>
                  <input type="number" class="form-control" v-model.number="rentForm.rent" min="0" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Amount Paid</label>
                  <input type="number" class="form-control" v-model.number="rentForm.paid" min="0" />
                </div>
                <div class="col-12">
                  <label class="form-label">Payment Mode</label>
                  <select class="form-select" v-model="rentForm.paymentMode">
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label">Upload Proofs (optional)</label>
                  <input type="file" class="form-control" multiple accept="image/*" @change="handleFiles" />
                </div>
                <div class="col-12" v-if="rentImages.length">
                  <div class="d-flex flex-wrap gap-3 mt-3">
                    <div v-for="(img, i) in rentImages" :key="i" class="position-relative">
                      <img :src="img" width="100" height="100" class="rounded border shadow-sm" />
                      <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle" @click="rentImages.splice(i,1)">×</button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="d-flex justify-content-end gap-3 mt-4">
                <button type="button" class="btn btn-outline-secondary" @click="closeModal">Cancel</button>
                <button type="submit" class="btn btn-success btn-lg" :disabled="loading">
                  <i class="bi bi-check2-circle me-2"></i> Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </template>
  </SidebarLayout>
</template>

<script>
import axios from "axios"

export default {
  name:"vue Students 2",

  data() {
    return {
      student: {},
      roomHistory: [],
      rentHistory: [],
      expandedMonths: [],
      showModal: false,
      rentForm: { month: "", rent: 0, paid: 0, paymentMode: "cash" },
      rentImages: [],
      toast: { message: "", type: "success" },
      loading: false,
      apiUrl: import.meta.env.VITE_API_URL || ""
    }
  },
mounted() {
  console.log("Jsooo",this.student.room.room);
  
  console.log("--------------")
},
  computed: {
    allMonths() {
      const map = new Map()
      const monthMap = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 }

      this.rentHistory.forEach(p => {
        const idx = monthMap[p.month]
        if (idx === undefined) return
        const key = `${p.year}-${String(idx + 1).padStart(2, '0')}`
        const fullName = new Date(p.year, idx).toLocaleString('default', { month: 'long' })

        if (!map.has(key)) {
          map.set(key, {
            key, year: p.year, monthName: fullName, monthShort: p.month,
            rent: p.rent, paid: 0, due: 0, status: "Not Paid", transactions: 0, payments: []
          })
        }
        const m = map.get(key)
        m.paid += Number(p.paid || 0)
        m.transactions += 1
        m.payments.push(p)
      })

      const result = []
      map.forEach(m => {
        m.due = m.rent - m.paid
        if (m.paid >= m.rent) m.status = "Paid"
        else if (m.paid > 0) m.status = "Partial"
        result.push(m)
      })

      return result.sort((a, b) => b.key.localeCompare(a.key))
    }
  },

  created() {
    this.student = this.$route.meta.student  || "{}";
    this.parseRoomField()
    this.fetchRentHistory()
  },

  methods: {
    // FULLY FIXED ROOM PARSER
    // parseRoomField() {
    //   const raw = this.student.room || "[]"
    //   let entries = []

    //   try {
    //     let cleaned = raw
    //       .replace(/\\"/g, '"')
    //       .replace(/\\\\"/g, '"')
    //       .replace(/\\\\/g, '')
    //       .replace(/"\[/g, '[')
    //       .replace(/\]"/g, ']')
    //       .replace(/"""/g, '"')

    //     let data = JSON.parse(cleaned)
    //     while (typeof data === "string") data = JSON.parse(data)

    //     const process = (item) => {
    //       if (Array.isArray(item)) item.forEach(process)
    //       else if (typeof item === "string") { try { process(JSON.parse(item)) } catch {} }
    //       else if (item && (item.roomNumber || item.roomNumber === "")) {
    //         entries.push({
    //           roomNumber: String(item.roomNumber || "").trim(),
    //           roomType: String(item.roomType || "").trim(),
    //           timeStamp: item.timeStamp || item.timestamp || new Date().toISOString()
    //         })
    //       }
    //     }

    //     process(data)

    //     const seen = new Set()
    //     this.roomHistory = entries
    //       .filter(e => {
    //         const k = `${e.roomNumber}|${e.roomType}|${e.timeStamp}`
    //         if (seen.has(k)) return false
    //         seen.add(k)
    //         return true
    //       })
    //       .sort((a, b) => new Date(a.timeStamp) - new Date(b.timeStamp))

    //   } catch (e) {
    //     console.warn("Room parse failed:", e)
    //     this.roomHistory = []
    //   }
    // },
    parseRoomField() {
  const raw = this.student.room || "[]"
  let entries = []

  // Aggressive unescaping + JSON extraction using regex and recursive parsing
  const extractAndParse = (text) => {
    if (!text || typeof text !== 'string') return []

    // Find all valid-looking room objects: {..."roomNumber":"xxx",..."roomType":"yyy",..."timeStamp":"zzz"...}
    const roomRegex = /\{[^}]*"roomNumber"\s*:\s*"([^"]*)"[^}]*"roomType"\s*:\s*"([^"]*)"[^}]*"timeStamp"\s*:\s*"([^"]*)"[^}]*\}/g
    const matches = [...text.matchAll(roomRegex)]

    const found = matches.map(match => ({
      roomNumber: match[1].trim(),
      roomType: match[2].trim() || 'Not specified',
      timeStamp: match[3].trim()
    }))

    // Also try to parse full JSON arrays if present
    try {
      // Clean common escape patterns
      let cleaned = text
        .replace(/\\+"/g, '"')           // Replace \" with "
        .replace(/\\\\+/g, '\\')         // Reduce excessive backslashes
        .replace(/"\[/g, '[')            // Fix "[
        .replace(/\]"/g, ']')            // Fix ]"
        .replace(/"""/g, '"')            // Fix triple quotes

      // Try parsing as JSON array directly
      let parsed = JSON.parse(cleaned)

      // Handle nested string case
      let attempts = 0
      while (typeof parsed === 'string' && attempts < 10) {
        try {
          parsed = JSON.parse(parsed)
        } catch {
          break
        }
        attempts++
      }

      // Walk through arrays/objects recursively
      const walk = (item) => {
        if (Array.isArray(item)) {
          item.forEach(walk)
        } else if (item && typeof item === 'object') {
          if (item.roomNumber !== undefined) {
            entries.push({
              roomNumber: String(item.roomNumber || '').trim(),
              roomType: String(item.roomType || 'Not specified').trim(),
              timeStamp: item.timeStamp || item.timestamp || new Date().toISOString()
            })
          }
          // Recurse into all values in case room array is buried deeper
          Object.values(item).forEach(walk)
        }
      }

      walk(parsed)

    } catch (e) {
      // Silent fallback — regex already caught what it could
    }

    return found.length > 0 ? found : entries
  }

  // Run extraction
  const fromRegex = extractAndParse(raw)
  if (fromRegex.length > 0) {
    entries = fromRegex
  }

  // Deduplicate and sort
  const seen = new Set()
  this.roomHistory = entries
    .filter(e => {
      const key = `${e.roomNumber}|${e.roomType}|${e.timeStamp}`
      if (seen.has(key) || !e.roomNumber) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => new Date(a.timeStamp) - new Date(b.timeStamp))
    .reverse() // Latest first (optional)
},

    async fetchRentHistory() {
      try {
        const res = await fetch(`${this.apiUrl}?action=getRentHistory&studentId=${this.student.id}`)
        const data = await res.json()
        this.rentHistory = Array.isArray(data) ? data : []
      } catch (err) {
        this.showToast("Failed to load rent history", "error")
      }
    },

    toggleMonth(key) {
      const i = this.expandedMonths.indexOf(key)
      if (i > -1) this.expandedMonths.splice(i, 1)
      else this.expandedMonths.push(key)
    },

    getHeaderClass(month) {
      if (month.status === "Paid") return "bg-success bg-opacity-10 border border-success"
      if (month.status === "Partial") return "bg-warning bg-opacity-10 border border-warning"
      return "bg-danger bg-opacity-10 border border-danger"
    },

    getCircleClass(month) {
      if (month.status === "Paid") return "bg-success"
      if (month.status === "Partial") return "bg-warning text-dark"
      return "bg-danger"
    },

    finalPhotoUrl(url) {
      if (!url) return "https://placehold.co/150x150?text=No+Photo"
      const match = url.match(/id=([a-zA-Z0-9_-]+)/)
      return match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000` : url
    },

    splitUrls(str) {
      return str ? str.split(",").map(s => s.trim()).filter(Boolean) : []
    },

    numberWithCommas(x) {
      return x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0"
    },

    formatDateTime(d) {
      return d ? new Date(d).toLocaleString("en-IN") : "-"
    },

    openModal() { this.showModal = true },
    closeModal() {
      this.showModal = false
      this.rentForm = { month: "", rent: 0, paid: 0, paymentMode: "cash" }
      this.rentImages = []
    },

    handleFiles(e) {
      Array.from(e.target.files).forEach(file => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader()
          reader.onload = ev => this.rentImages.push(ev.target.result)
          reader.readAsDataURL(file)
        }
      })
    },

    async submitRent() {
      if (!this.rentForm.month || !this.rentForm.rent) {
        this.showToast("Please fill required fields", "error")
        return
      }

      const [year, month] = this.rentForm.month.split("-")
      const payload = {
        action: "addRent",
        studentId: this.student.id,
        name: this.student.name,
        year: Number(year),
        month: new Date(year, month - 1).toLocaleString('en-US', { month: 'short' }),
        rent: Number(this.rentForm.rent),
        paid: Number(this.rentForm.paid || 0),
        paymentMode: this.rentForm.paymentMode,
        photoDataList: this.rentImages
      }

      try {
        this.loading = true
        await axios.post(this.apiUrl, JSON.stringify(payload), { headers: { "Content-Type": "text/plain" } })
        this.showToast("Payment recorded successfully!")
        this.closeModal()
        this.fetchRentHistory()
      } catch (err) {
        this.showToast("Failed to save payment", "error")
      } finally {
        this.loading = false
      }
    },

    showToast(msg, type = "success") {
      this.toast = { message: msg, type }
      setTimeout(() => this.toast.message = "", 4000)
    }
  }
}
</script>

<style scoped>
.glass-card {
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(12px);
  border-radius: 1rem;
  border: 1px solid rgba(255,255,255,0.5);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}
.hover-shadow:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.2) !important; }
.slide-enter-active, .slide-leave-active { transition: all 0.35s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-10px); }
.timeline::before { content: ''; position: absolute; left: 6px; top: 0; bottom: 0; width: 3px; background: #0d6efd33; }
.timeline-dot { width: 16px; height: 16px; background: #0d6efd; }
.modal-backdrop-custom { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.modal-card { background: white; border-radius: 1rem; padding: 2rem; width: 95%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
.cursor-pointer { cursor: pointer; }
.transition-all { transition: all 0.3s ease; }
</style>