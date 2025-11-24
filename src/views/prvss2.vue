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

          <!-- Room History -->
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
              <p v-else class="text-center text-muted py-5">No room history available</p>
            </div>
          </div> 

          <!-- Rent History - Collapsible & Lazy Loaded -->
          <div class="col-lg-6">
            <div class="glass-card p-4 rounded-3 h-100">
              <div class="d-flex justify-content-between align-items-center mb-3 cursor-pointer user-select-none" @click="toggleRentHistory">
                <h5 class="mb-0">
                  <i class="bi bi-receipt me-2 text-primary"></i> Rent History
                  <span class="badge bg-primary ms-2">{{ rentHistory.length }}</span>
                </h5>
                <i :class="['bi fs-4 transition-all', showRentHistory ? 'bi-chevron-up' : 'bi-chevron-down']"></i>
              </div>

              <transition name="fade">
                <div v-if="showRentHistory">
                  <div v-if="rentLoading" class="text-center py-5">
                    <div class="spinner-border text-primary" style="width:3rem;height:3rem;"></div>
                  </div>

                  <div v-else-if="rentHistory.length" class="table-responsive mt-3">
                    <table class="table table-hover align-middle">
                      <thead class="table-light">
                        <tr>
                          <th>Month</th>
                          <th>Rent</th>
                          <th>Paid</th>
                          <th>Due</th>
                          <th>Status</th>
                          <th>Proof</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="r in rentHistory" :key="r.id">
                          <td><strong>{{ r.month }} {{ r.year }}</strong></td>
                          <td>₹{{ numberWithCommas(r.rent) }}</td>
                          <td class="text-success fw-bold">₹{{ numberWithCommas(r.paid) }}</td>
                          <td class="text-danger fw-bold">₹{{ numberWithCommas(r.due) }}</td>
                          <td>
                            <span :class="['badge fs-6', r.status === 'Paid' ? 'bg-success' : 'bg-warning text-dark']">
                              {{ r.status }}
                            </span>
                          </td>
                          <td>
                            <div v-if="r.photoUrls" class="d-flex gap-2 flex-wrap">
                              <a v-for="(url, i) in splitUrls(r.photoUrls)" :key="i" :href="finalPhotoUrl(url)" target="_blank" class="shadow-sm">
                                <img :src="finalPhotoUrl(url)" width="60" height="60" class="rounded border object-fit-cover" />
                              </a>
                            </div>
                            <small v-else class="text-muted">-</small>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p v-else class="text-center text-muted py-5">No rent payments recorded yet</p>
                </div>
              </transition>

              <div v-if="!showRentHistory" class="text-center text-muted py-4 opacity-75">
                Click to expand rent history
              </div>

              <!-- Add Rent Button -->
              <div class="mt-4 text-end">
                <button class="btn btn-primary btn-lg" @click="openModal">
                  <i class="bi bi-plus-circle me-2"></i> Add Payment
                </button>
              </div>
            </div>
          </div>
          
        </div>
          
        <!-- RENT HISTORY - BANK STYLE ROADMAP + TABLE -->
<div class="col-lg-6">
  <div class="glass-card p-4 rounded-3 h-100 d-flex flex-column">
    <div class="d-flex justify-content-between align-items-center mb-4 cursor-pointer" @click="toggleRentHistory">
      <h5 class="mb-0">
        <i class="bi bi-credit-card-2-back-fill me-2 text-success"></i> Rent Payment Roadmap
        <span class="badge bg-success ms-2">{{ rentHistory.length }}</span>
      </h5>
      <i :class="['bi fs-3 transition-all', showRentHistory ? 'bi-chevron-up' : 'bi-chevron-down']"></i>
    </div>

    <transition name="slide-fade">
      <div v-if="showRentHistory" class="flex-fill overflow-auto">
        <div v-if="rentLoading" class="text-center py-5">
          <div class="spinner-border text-success" style="width:3rem;height:3rem;"></div>
        </div>

        <div v-else-if="rentHistory.length" class="position-relative">
          <!-- Timeline Line -->
          <div class="position-absolute start-0 translate-middle-x bg-success opacity-25" style="top: 40px; bottom: 20px; width: 4px; border-radius: 2px;"></div>

          <div v-for="(r, i) in rentHistory" :key="r.id || i" class="d-flex mb-4 position-relative align-items-start">
            <!-- Timeline Dot -->
            <div class="flex-shrink-0 z-10">
              <div :class="['rounded-circle text-white d-flex align-items-center justify-content-center shadow-lg', r.status === 'Paid' ? 'bg-success' : 'bg-warning']" style="width: 48px; height: 48px;">
                <i class="bi" :class="r.status === 'Paid' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
              </div>
            </div>

            <!-- Transaction Card -->
            <div class="ms-4 flex-fill">
              <div class="bg-white rounded-3 shadow-sm p-3 border-start border-5" :class="r.status === 'Paid' ? 'border-success' : 'border-warning'">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 class="mb-1 fw-bold">{{ r.month }} {{ r.year }}</h6>
                    <small class="text-muted">{{ r.paymentMode.toUpperCase() }}</small>
                  </div>
                  <div class="text-end">
                    <div class="h5 mb-0" :class="r.status === 'Paid' ? 'text-success' : 'text-danger'">
                      ₹{{ numberWithCommas(r.paid) }}
                    </div>
                    <small v-if="r.due > 0" class="text-danger">Due: ₹{{ numberWithCommas(r.due) }}</small>
                  </div>
                </div>

                <!-- Proof Images -->
                <div v-if="r.photoUrls" class="mt-3 d-flex gap-2 flex-wrap">
                  <a v-for="(url, j) in splitUrls(r.photoUrls)" :key="j" :href="finalPhotoUrl(url)" target="_blank">
                    <img :src="finalPhotoUrl(url)" width="70" height="70" class="rounded border object-fit-cover shadow-sm" />
                  </a>
                </div>

                <small class="text-muted d-block mt-2">
                  <i class="bi bi-clock-history me-1"></i> {{ formatDateTime(r.timestamp) }}
                </small>
              </div>
            </div>
          </div>

          <!-- Summary Card at Bottom -->
          <div class="mt-5 p-4 bg-gradient text-white rounded-3 shadow-lg" :style="{ background: totalPaid >= totalRent ? 'linear-gradient(135deg, #28a745, #20c997)' : 'linear-gradient(135deg, #ffc107, #fd7e14)' }">
            <div class="row text-center">
              <div class="col">
                <small>Total Rent</small>
                <h4 class="mb-0">₹{{ numberWithCommas(totalRent) }}</h4>
              </div>
              <div class="col">
                <small>Total Paid</small>
                <h4 class="mb-0">₹{{ numberWithCommas(totalPaid) }}</h4>
              </div>
              <div class="col">
                <small :class="totalDue > 0 ? 'text-warning' : 'text-white'">Balance</small>
                <h4 class="mb-0">₹{{ numberWithCommas(totalDue) }}</h4>
              </div>
            </div>
          </div>
        </div>

        <p v-else class="text-center text-muted py-5">No rent payments yet</p>
      </div>
    </transition>

    <!-- Add Button -->
    <div class="mt-auto text-end pt-3">
      <button class="btn btn-success btn-lg" @click="openModal">
        <i class="bi bi-plus-circle-fill me-2"></i> Record Payment
      </button>
    </div>
  </div>
</div> 
<!-- MONTH-BY-MONTH RENT TRACKER (LIKE IRCTC) -->
 {{ rentHistory }}
<div class="col-lg-6">
  <div class="glass-card p-4 rounded-3 h-100 d-flex flex-column">
    <h5 class="mb-4">
      <i class="bi bi-calendar3-week-fill me-2 text-primary"></i> Monthly Rent Tracker
      <small class="text-muted ms-2">(Click month to view details)</small>
    </h5>

    <div class="flex-fill overflow-auto">
      <div v-for="monthData in monthlySummary" :key="monthData.key" 
           class="mb-3 cursor-pointer" @click="selectedMonth = selectedMonth === monthData.key ? null : monthData.key">
        
        <!-- Month Row -->
        <div class="d-flex align-items-center justify-content-between p-3 rounded-3 shadow-sm transition-all" 
             :class="getMonthClass(monthData)">
          
          <div class="d-flex align-items-center gap-3">
            <div class="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold shadow" 
                 style="width: 50px; height: 50px;" 
                 :class="monthData.status === 'Paid' ? 'bg-success' : monthData.status === 'Partial' ? 'bg-warning text-dark' : 'bg-danger'">
              {{ monthData.monthShort }}
            </div>
            <div>
              <div class="fw-bold fs-5">{{ monthData.monthName }} {{ monthData.year }}</div>
              <small class="text-muted">{{ monthData.payments }} payment{{ monthData.payments !== 1 ? 's' : '' }}</small>
            </div>
          </div>

          <div class="text-end">
            <div class="h5 mb-0">₹{{ numberWithCommas(monthData.paid) }} / ₹{{ numberWithCommas(monthData.rent) }}</div>
            <small v-if="monthData.due > 0" class="text-danger fw-bold">Due: ₹{{ numberWithCommas(monthData.due) }}</small>
            <i class="bi fs-4 ms-3" :class="selectedMonth === monthData.key ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
          </div>
        </div>

        <!-- Expanded Details -->
        <transition name="slide">
          <div v-if="selectedMonth === monthData.key" class="mt-3 ms-5 ps-4 border-start border-3 border-primary">
            <div v-for="payment in monthData.details" :key="payment.id" class="bg-light rounded-3 p-3 mb-3 shadow-sm">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="fw-bold">₹{{ numberWithCommas(payment.paid) }} via {{ payment.paymentMode.toUpperCase() }}</div>
                  <small class="text-success">{{ payment.status }} • {{ formatDateTime(payment.timestamp) }}</small>
                </div>
                <div v-if="payment.photoUrls" class="d-flex gap-2">
                  <a v-for="(url, i) in splitUrls(payment.photoUrls)" :key="i" :href="finalPhotoUrl(url)" target="_blank">
                    <img :src="finalPhotoUrl(url)" width="70" height="70" class="rounded border object-fit-cover shadow" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- Add Payment Button -->
    <div class="mt-4 text-end">
      <button class="btn btn-success btn-lg" @click="openModal">
        <i class="bi bi-plus-circle-fill me-2"></i> Record Payment
      </button>
    </div>
  </div>
</div>
<!-- MONTHLY RENT TRACKER - BANK / IRCTC STYLE -->
<div class="col-lg-6">
  <div class="glass-card p-4 rounded-4 h-100 d-flex flex-column shadow-sm">
    <h5 class="mb-4 fw-bold text-primary">
      <i class="bi bi-calendar-check-fill me-2"></i> Monthly Rent Tracker
    </h5>

    <div class="flex-fill overflow-auto pe-2" style="max-height: 70vh;">
      <div v-for="month in monthlyRentData" :key="month.key" class="mb-3">
        
        <!-- MONTH HEADER - CLICK TO EXPAND -->
        <div class="d-flex align-items-center justify-content-between p-3 rounded-3 shadow-sm cursor-pointer user-select-none transition-all hover-shadow"
             :class="getMonthBg(month)"
             @click="toggleMonth(month.key)">
          
          <div class="d-flex align-items-center gap-3">
            <div class="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center shadow" 
                 style="width: 56px; height: 56px; font-size: 1.1rem;"
                 :class="month.status === 'Paid' ? 'bg-success' : month.status === 'Partial' ? 'bg-warning text-dark' : 'bg-danger'">
              {{ month.monthShort }}
            </div>
            <div>
              <div class="fw-bold fs-5">{{ month.monthName }} {{ month.year }}</div>
              <small class="text-muted">{{ month.transactions }} transaction{{ month.transactions > 1 ? 's' : '' }}</small>
            </div>
          </div>

          <div class="text-end">
            <div class="h5 mb-1 fw-bold" :class="month.status === 'Paid' ? 'text-success' : 'text-danger'">
              ₹{{ numberWithCommas(month.paid) }} 
              <span class="text-muted fs-6">/ ₹{{ numberWithCommas(month.rent) }}</span>
            </div>
            <div v-if="month.due > 0" class="text-danger fw-bold">Due ₹{{ numberWithCommas(month.due) }}</div>
            <i class="bi fs-4 ms-3" :class="expandedMonths.includes(month.key) ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
          </div>
        </div>

        <!-- EXPANDED PAYMENT DETAILS -->
        <transition name="slide">
          <div v-if="expandedMonths.includes(month.key)" class="mt-3">
            <div v-for="payment in month.payments" :key="payment.id" class="bg-white rounded-3 p-3 mb-3 shadow-sm border-start border-4 border-primary ms-5">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="fw-bold text-dark">₹{{ numberWithCommas(payment.paid) }}</div>
                  <div class="small text-muted">
                    via <span class="text-uppercase fw-bold">{{ payment.paymentMode }}</span> • 
                    {{ payment.status }}
                  </div>
                  <small class="text-muted d-block mt-1">
                    <i class="bi bi-clock me-1"></i> {{ formatDateTime(payment.timestamp) }}
                  </small>
                </div>
                <div v-if="payment.photoUrls" class="text-end">
                  <div class="d-flex gap-2 flex-wrap justify-content-end">
                    <a v-for="(url, i) in splitUrls(payment.photoUrls)" :key="i" :href="finalPhotoUrl(url)" target="_blank">
                      <img :src="finalPhotoUrl(url)" width="70" height="70" class="rounded border object-fit-cover shadow-sm" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- Add Payment Button -->
    <div class="mt-4 text-center">
      <button class="btn btn-success btn-lg px-5" @click="openModal">
        <i class="bi bi-plus-circle-fill me-2"></i> Record New Payment
      </button>
    </div>
  </div>
</div>

<!-- ULTIMATE MONTHLY RENT TRACKER - EXACTLY LIKE IRCTC / BANK -->
<div class="col-lg-6">
  <div class="glass-card p-4 rounded-4 h-100 d-flex flex-column shadow-sm">
    <h5 class="mb-4 fw-bold text-primary">
      <i class="bi bi-calendar-check-fill me-2"></i> Monthly Rent Tracker
      <small class="text-muted">(Click month to see payments)</small>
    </h5>
{{allMonths}}
    <div class="flex-fill overflow-auto">
      <div v-for="month in allMonths" :key="month.key" class="mb-3">
        
        <!-- Month Header -->
        <div class="d-flex align-items-center justify-content-between p-4 rounded-4 shadow-sm cursor-pointer user-select-none transition-all"
             :class="getMonthStyle(month)"
             @click="toggleMonth(month.key)">
          
          <div class="d-flex align-items-center gap-4">
            <div class="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center shadow-lg" 
                 style="width: 60px; height: 60px; font-size: 1.3rem;"
                 :class="month.status === 'Paid' ? 'bg-success' : month.status === 'Partial' ? 'bg-warning text-dark' : 'bg-danger'">
              {{ month.monthShort }}
            </div>
            <div>
              <h6 class="mb-1 fw-bold fs-4">{{ month.monthName }} {{ month.year }}</h6>
              <small class="text-muted">{{ month.transactions }} payment{{ month.transactions !== 1 ? 's' : '' }}</small>
            </div>
          </div>

          <div class="text-end">
            <div class="h4 fw-bold mb-1" :class="month.status === 'Paid' ? 'text-success' : month.due > 0 ? 'text-danger' : 'text-warning'">
              ₹{{ numberWithCommas(month.paid) }}
            </div>
            <div v-if="month.due > 0" class="h6 text-danger mb-0">Due: ₹{{ numberWithCommas(month.due) }}</div>
            <div v-else-if="month.status === 'Paid'" class="h6 text-success mb-0">Full Paid</div>
            <i class="bi fs-3 ms-3" :class="expandedMonths.includes(month.key) ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
          </div>
        </div>

        <!-- Expanded Payment Details -->
        <transition name="slide">
          <div v-if="expandedMonths.includes(month.key)" class="mt-3">
            <div v-for="payment in month.payments" :key="payment.id" 
                 class="bg-white rounded-3 p-4 mb-3 shadow border-start border-5 border-primary ms-5">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <div class="fw-bold fs-5 text-success">₹{{ numberWithCommas(payment.paid) }}</div>
                  <div class="small text-muted">
                    via <span class="text-uppercase fw-bold">{{ payment.paymentMode }}</span> • 
                    {{ payment.status }} • {{ formatDateTime(payment.timestamp) }}
                  </div>
                </div>
                <div v-if="payment.photoUrls" class="d-flex gap-2">
                  <a v-for="(url, i) in splitUrls(payment.photoUrls)" :key="i" :href="finalPhotoUrl(url)" target="_blank">
                    <img :src="finalPhotoUrl(url)" width="80" height="80" class="rounded border object-fit-cover shadow" />
                  </a>
                </div>
              </div>
            </div>

            <!-- No Payment Message -->
            <div v-if="month.transactions === 0" class="text-center py-4 text-muted">
              <i class="bi bi-x-circle fs-1 d-block mb-2"></i>
              No payment recorded for this month
            </div>
          </div>
        </transition>
      </div>
    </div>

    <div class="mt-4 text-center">
      <button class="btn btn-success btn-lg px-5" @click="openModal">
        <i class="bi bi-plus-circle-fill me-2"></i> Record Payment
      </button>
    </div>
  </div>
</div>
{{rentHistory}}
        <!-- Add Rent Modal -->
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
                      <button class="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle" @click="rentImages.splice(i,1)">×</button>
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
import axios from "axios";

export default {
  data() {
    return {
      student: {},
      roomHistory: [],
      rentHistory: [],
      expandedMonths: [],
      showRentHistory: false,
      rentLoading: false,
      placeholder: "https://placehold.co/150x150/cccccc/666666?text=No+Photo",
      showModal: false,
      rentForm: { month: "", rent: 0, paid: 0, paymentMode: "cash" },
      rentImages: [],
      toast: { message: "", type: "success" },
      apiUrl: import.meta.env.VITE_API_URL || "",
      loading: false,
      selectedMonth: null
    };
  },

  created() {
    this.student = this.$route.meta.student || JSON.parse(sessionStorage.getItem("selectedStudent") || "{}");
    this.parseRoomField();
  },
  computed: {
  allMonths() {
    const months = [];
    let joinDate = new Date(this.student.dateofjoining || Date.now());
    
    // Start from the joining month
    let current = new Date(joinDate.getFullYear(), joinDate.getMonth(), 1);
    const today = new Date();

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthShorts = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    while (current <= today) {
      const year = current.getFullYear();
      const monthIndex = current.getMonth(); // 0-11
      const monthName = monthNames[monthIndex];
      const monthShort = monthShorts[monthIndex];
      const key = `${year}-${monthIndex}`;

      const payments = this.rentHistory.filter(p =>
        p.year == year && 
        p.month === monthName  // exact match with English name
      );

      const rent = payments.reduce((sum, p) => sum + Number(p.rent || 0), 0) || 10000;
      const paid = payments.reduce((sum, p) => sum + Number(p.paid || 0), 0);
      const due = rent - paid;

      let status = 'Not Paid';
      if (paid >= rent && paid > 0) status = 'Paid';
      else if (paid > 0) status = 'Partial';

      months.push({
        key,
        year,
        monthName,
        monthShort,
        rent,
        paid,
        due,
        status,
        transactions: payments.length,
        payments
      });

      current.setMonth(current.getMonth() + 1);
    }

    return months.reverse(); // latest month first
  },
    monthlyRentData() {
    const months = [];
    const joinDate = new Date(this.student.dateofjoining || Date.now());
    const today = new Date();
    today.setMonth(today.getMonth() + 1); // include current month

    let current = new Date(joinDate.getFullYear(), joinDate.getMonth(), 1);

    while (current < today) {
      const year = current.getFullYear();
      const monthNum = current.getMonth();
      const monthName = current.toLocaleString('default', { month: 'long' });
      const monthShort = current.toLocaleString('default', { month: 'short' });
      const key = `${year}-${monthNum}`;

      const payments = this.rentHistory.filter(p => 
        p.year == year && 
        p.month.toLowerCase() === monthName.toLowerCase()
      );

      const rent = payments.reduce((sum, p) => sum + Number(p.rent || 0), 0);
      const paid = payments.reduce((sum, p) => sum + Number(p.paid || 0), 0);
      const due = rent - paid;

      let status = 'Not Paid';
      if (paid >= rent && paid > 0) status = 'Paid';
      else if (paid > 0) status = 'Partial';
      months.push({
        key,
        year,
        monthName,
        monthShort,
        rent: rent || 10000, // fallback rent amount
        paid,
        due,
        status,
        transactions: payments.length,
        payments // all transactions in this month
      });

      current.setMonth(current.getMonth() + 1);
    }

    return months.reverse(); // latest month first
  },
    monthlySummary() {
    const summary = [];
    const joinDate = new Date(this.student.dateofjoining || new Date());
    const today = new Date();
    
    // Generate all months from joining to now
    let current = new Date(joinDate.getFullYear(), joinDate.getMonth(), 1);
    
    while (current <= today) {
      const year = current.getFullYear();
      const month = current.getMonth();
      const monthName = current.toLocaleString('default', { month: 'long' });
      const monthShort = current.toLocaleString('default', { month: 'short' });
      const key = `${year}-${month}`;
      
      // Filter payments for this month
      const paymentsThisMonth = this.rentHistory.filter(p => 
        Number(p.year) === year && 
        p.month.toLowerCase() === monthName.toLowerCase()
      );
      
      const totalRent = paymentsThisMonth.reduce((sum, p) => sum + Number(p.rent || 0), 0);
      const totalPaid = paymentsThisMonth.reduce((sum, p) => sum + Number(p.paid || 0), 0);
      const totalDue = totalRent - totalPaid;
      
      let status = 'Not Paid';
      if (totalPaid >= totalRent && totalPaid > 0) status = 'Paid';
      else if (totalPaid > 0) status = 'Partial';
      summary.push({
        key,
        year,
        month: month + 1,
        monthName,
        monthShort,
        rent: totalRent || 1000, // default rent if not set
        paid: totalPaid,
        due: totalDue,
        status,
        payments: paymentsThisMonth.length,
        details: paymentsThisMonth
      });
      
      current.setMonth(current.getMonth() + 1);
    }
    
    return summary.reverse(); // latest first
  },
  totalRent() {
    return this.rentHistory.reduce((sum, r) => sum + Number(r.rent || 0), 0);
  },
  totalPaid() {
    return this.rentHistory.reduce((sum, r) => sum + Number(r.paid || 0), 0);
  },
  totalDue() {
    return this.totalRent - this.totalPaid;
  }
},

  methods: {
    toggleMonth(key) {
    if (this.expandedMonths.includes(key)) {
      this.expandedMonths = this.expandedMonths.filter(k => k !== key);
    } else {
      this.expandedMonths.push(key);
    }
  },

  getMonthStyle(month) {
    if (month.status === 'Paid') return 'bg-success bg-opacity-15 border border-success';
    if (month.status === 'Partial') return 'bg-warning bg-opacity-15 border border-warning';
    return 'bg-danger bg-opacity-15 border border-danger';
  },
    toggleMonth(key) {
    if (this.expandedMonths.includes(key)) {
      this.expandedMonths = this.expandedMonths.filter(k => k !== key);
    } else {
      this.expandedMonths.push(key);
    }
  },

  getMonthBg(month) {
    if (month.status === 'Paid') return 'bg-success bg-opacity-10 border border-success';
    if (month.status === 'Partial') return 'bg-warning bg-opacity-10 border border-warning';
    return 'bg-danger bg-opacity-10 border border-danger';
  },
    getMonthClass(month) {
    if (month.status === 'Paid') return 'bg-success bg-opacity-10 border border-success';
    if (month.status === 'Partial') return 'bg-warning bg-opacity-10 border border-warning';
    return 'bg-danger bg-opacity-10 border border-danger';
  },
    finalPhotoUrl(url) {
      if (!url) return this.placeholder;
      const match = url.match(/id=([a-zA-Z0-9_-]+)/);
      return match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000` : this.placeholder;
    },

    parseRoomField() {
      const raw = this.student.room || "[]";
      let entries = [];

      try {
        let parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (!Array.isArray(parsed)) parsed = [parsed];

        parsed.forEach(item => {
          if (Array.isArray(item)) item.forEach(x => x && entries.push(x));
          else if (typeof item === "string") {
            try { const sub = JSON.parse(item); if (Array.isArray(sub)) sub.forEach(x => x && entries.push(x)); else if (sub?.roomNumber) entries.push(sub); } catch {}
          } else if (item?.roomNumber) entries.push(item);
        });
      } catch (e) { console.warn("Room parse error", e); }

      entries = entries.filter(r => r && r.roomNumber).map(r => ({
        roomNumber: String(r.roomNumber || "").trim(),
        roomType: r.roomType || "",
        timeStamp: r.timeStamp || r.timestamp || ""
      }));

      entries.sort((a, b) => new Date(a.timeStamp || 0) - new Date(b.timeStamp || 0));
      this.roomHistory = entries;
    },

    toggleRentHistory() {
      this.showRentHistory = !this.showRentHistory;
      if (this.showRentHistory && this.rentHistory.length === 0) {
        this.fetchRentHistory();
      }
    },

    async fetchRentHistory() {
      this.rentLoading = true;
      try {
        const res = await fetch(`${this.apiUrl}?action=getRentHistory&studentId=${this.student.id}`);
        const data = await res.json();
        this.rentHistory = Array.isArray(data) ? data : [];
      } catch (err) {
        this.showToast("Failed to load rent history", "error");
      } finally {
        this.rentLoading = false;
      }
    },

    openModal() { this.showModal = true; },
    closeModal() {
      this.showModal = false;
      this.rentForm = { month: "", rent: 0, paid: 0, paymentMode: "cash" };
      this.rentImages = [];
    },

    handleFiles(e) {
      const files = Array.from(e.target.files);
      files.forEach(f => {
        if (f.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = ev => this.rentImages.push(ev.target.result);
          reader.readAsDataURL(f);
        }
      });
    },

    async submitRent() {
      if (!this.rentForm.month || !this.rentForm.rent) {
        this.showToast("Month and rent amount required", "error");
        return;
      }

      const [year, month] = this.rentForm.month.split("-");
      const payload = {
        action: "addRent",
        studentId: this.student.id,
        name: this.student.name,
        year: Number(year),
        month: new Date(year, month - 1).toLocaleString('en-US', { month: 'short' }), // "Dec", "Mar", etc.
        rent: Number(this.rentForm.rent),
        paid: Number(this.rentForm.paid || 0),
        due: Number(this.rentForm.rent) - Number(this.rentForm.paid || 0),
        status: Number(this.rentForm.paid || 0) >= Number(this.rentForm.rent) ? "Paid" : "Pending",
        paymentMode: this.rentForm.paymentMode,
        photoDataList: this.rentImages
      };

      try {
        this.loading = true;
        await axios.post(this.apiUrl, JSON.stringify(payload), { headers: { "Content-Type": "text/plain" } });
        this.showToast("Payment recorded successfully!");
        this.closeModal();
        this.rentHistory = []; // Force refresh
        if (this.showRentHistory) await this.fetchRentHistory();
      } catch (err) {
        this.showToast("Failed to save payment", "error");
      } finally {
        this.loading = false;
      }
    },

    splitUrls(str) {
      if (!str) return [];
      return str.split(",").map(s => s.trim()).filter(Boolean);
    },

    numberWithCommas(x) { return x ? String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0"; },
    formatDate(d) { return d ? new Date(d).toLocaleDateString("en-IN") : "-"; },
    formatDateTime(d) { return d ? new Date(d).toLocaleString("en-IN") : "-"; },
    showToast(msg, type = "success") {
      this.toast = { message: msg, type };
      setTimeout(() => this.toast.message = "", 4000);
    }
  }
}
</script>

<style scoped>
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.4s ease;
}
.slide-fade-enter-from, .slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
.transition-all { transition: all 0.3s ease; }
.glass-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from, .slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.cursor-pointer { cursor: pointer; }
.transition-all { transition: all 0.2s; }

.timeline {
  position: relative;
}
.timeline::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #ddd;
}
.timeline-dot {
  width: 14px;
  height: 14px;
  z-index: 1;
}

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  width: 95%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}
.slide-enter-active, .slide-leave-active { transition: all 0.4s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-20px); }
.cursor-pointer { cursor: pointer; }
.transition-all { transition: all 0.3s ease; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.cursor-pointer { cursor: pointer; }
.transition-all { transition: all 0.2s; }
</style>