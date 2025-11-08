\<template>
  <div class="min-vh-100" :class="theme">
    <!-- Floating WhatsApp Auto Reminder -->
    <div v-if="today == 1" class="position-fixed top-0 start-50 translate-middle-x p-3 bg-success text-white rounded shadow-lg" style="z-index:9999;">
      <h5>Auto Reminder Sent to {{ dueToday.length }} Students! </h5>
      <button @click="sendBulkWhatsApp" class="btn btn-light btn-sm">Send Again</button>
    </div>

    <!-- Header -->
    <div class="bg-primary text-white p-4 shadow">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="mb-0"> {{ hostelName }} </h1>
            <small>Ultimate PG Manager v3</small>
          </div>
          <div class="d-flex gap-2">
            <button @click="toggleLang" class="btn btn-light btn-sm">{{ lang == 'hi' ? 'EN' : 'हिं' }}</button>
            <button @click="cycleTheme" class="btn btn-light btn-sm">Theme</button>
            <button @click="installPWA" class="btn btn-warning btn-sm">Install App</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="container mt-4">
      <div class="row g-3">
        <div class="col-6 col-md-3">
          <div class="card bg-success text-white">
            <div class="card-body text-center">
              <h3>{{ students.length }}</h3>
              <small>Students</small>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card text-white" :class="vacantRooms > 10 ? 'bg-info' : 'bg-danger'">
            <div class="card-body text-center">
              <h3>{{ vacantRooms }}</h3>
              <small>Vacant</small>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card bg-warning text-dark">
            <div class="card-body text-center">
              <h3>₹{{ monthlyDue.toLocaleString('en-IN') }}</h3>
              <small>Due Today</small>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card bg-dark text-white">
            <div class="card-body text-center">
              <h3>{{ occupiedPercentage }}%</h3>
              <small>Full</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="container mt-4">
      <div class="d-flex flex-wrap gap-2">
        <button @click="showQR = true" class="btn btn-primary">Show QR</button>
        <button @click="sendBulkWhatsApp" class="btn btn-success">WhatsApp All</button>
        <button @click="printAllIDs" class="btn btn-info">Print IDs</button>
        <button @click="exportExcel" class="btn btn-success">Excel</button>
      </div>
    </div>

    <!-- Student Cards -->
    <div class="container mt-4 pb-5">
      <div class="row g-3">
        <div v-for="s in displayStudents" :key="s.id" class="col-6 col-md-4 col-lg-3">
          <div class="card shadow-sm h-100">
            <img :src="fixPhoto(s.photoUrl)" class="card-img-top" style="height:150px;object-fit:cover;">
            <div class="card-body p-2 text-center">
              <h6 class="mb-0">{{ s.name }}</h6>
              <small class="text-muted">Room {{ getLatestRoom(s.room) }}</small>
              <div class="mt-2">
                <span class="badge" :class="getDueBadge(s)">{{ getDueText(s) }}</span>
              </div>
              <div class="mt-2 d-flex justify-content-center gap-1">
                <a :href="'https://wa.me/91'+s.personPhone+'?text='+waMessage(s)" target="_blank" class="btn btn-success btn-sm">
                  <i class="bi bi-whatsapp"></i>
                </a>
                <button @click="payRent(s)" class="btn btn-warning btn-sm">Paid</button>
                <button @click="deleteStudent(s.id)" class="btn btn-danger btn-sm">Del</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FAB -->
    <button @click="openEditModal({})" class="position-fixed bottom-0 end-0 m-4 btn btn-primary rounded-circle shadow-lg" style="width:70px;height:70px;font-size:30px;">
      +
    </button>

    <!-- QR Modal -->
    <div v-if="showQR" class="position-fixed inset-0 bg-black bg-opacity-75 d-flex align-items-center justify-content-center" style="z-index:9999;" @click="showQR=false">
      <img src="/qr.png" class="img-fluid" style="max-width:90vw;">
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      apiUrl: import.meta.env.VITE_API_URL,
      students: [],
      showQR: false,
      lang: 'en',
      theme: 'bg-light',
      themes: ['bg-light', 'bg-dark', 'bg-gradient-primary', 'bg-gradient-success'],
      themeIndex: 0,
      hostelName: import.meta.env.VITE_HOSTEL_NAME,
      monthlyRent: parseInt(import.meta.env.VITE_MONTHLY_RENT),
      totalRooms: parseInt(import.meta.env.VITE_TOTAL_ROOMS)
    };
  },
  computed: {
    today() { return new Date().getDate(); },
    occupiedRooms() {
      const rooms = this.students.map(s => this.getLatestRoom(s.room));
      return new Set(rooms).size;
    },
    vacantRooms() { return this.totalRooms - this.occupiedRooms; },
    occupiedPercentage() { return Math.round((this.occupiedRooms / this.totalRooms) * 100); },
    monthlyDue() {
      return this.students.filter(s => this.isDue(s)).length * this.monthlyRent;
    },
    dueToday() {
      return this.students.filter(s => this.isDue(s));
    },
    displayStudents() {
      return this.students.sort((a,b) => this.getLatestRoom(a.room) - this.getLatestRoom(b.room));
    }
  },
  mounted() {
    this.fetchStudents();
    setInterval(() => this.autoBackup(), 5*60*1000);
    if (this.today === 1) setTimeout(() => this.sendBulkWhatsApp(), 3000);
  },
  methods: {
    async fetchStudents() {
      try {
        const { data } = await axios.get(this.apiUrl, { params: { action: 'read' } });
        this.students = data || [];
      } catch { alert('Check internet or API URL'); }
    },
    fixPhoto(url) {
      if (!url) return 'https://via.placeholder.com/150?text=No+Photo';
      const id = url.match(/id=([^&]+)/);
      return id ? `https://drive.google.com/thumbnail?id=${id[1]}&sz=w300` : url;
    },
    getLatestRoom(json) {
      try {
        const arr = JSON.parse(json || '[]');
        return arr[arr.length-1]?.roomNumber || '-';
      } catch { return String(json || '-'); }
    },
    isDue(s) {
      const advance = parseInt(s.Advance || 0);
      return advance < this.monthlyRent;
    },
    getDueBadge(s) {
      if (!this.isDue(s)) return 'bg-success';
      return (parseInt(s.Advance || 0) > 0) ? 'bg-warning' : 'bg-danger';
    },
    getDueText(s) {
      if (!this.isDue(s)) return 'Paid';
      return (parseInt(s.Advance || 0) > 0) ? 'Partial' : 'Due';
    },
    waMessage(s) {
      const msg = this.lang === 'hi' 
        ? `नमस्ते ${s.name} जी, ${this.hostelName} का ${this.monthlyRent} रेंट बाकी है। कृपया आज जमा करें। धन्यवाद!`
        : `Hi ${s.name}, Your rent ₹${this.monthlyRent} is pending for ${this.hostelName}. Please pay today!`;
      return encodeURIComponent(msg);
    },
    sendBulkWhatsApp() {
      this.dueToday.forEach((s, i) => {
        setTimeout(() => {
          window.open(`https://wa.me/91${s.personPhone}?text=${this.waMessage(s)}`, '_blank');
        }, i * 2000);
      });
    },
    async payRent(s) {
      s.Advance = (parseInt(s.Advance || 0) + this.monthlyRent).toString();
      await axios.post(this.apiUrl, JSON.stringify({ ...s, action: 'update' }), {
        headers: { 'Content-Type': 'text/plain' }
      });
      this.fetchStudents();
    },
    async deleteStudent(id) {
      if (!confirm('Delete forever?')) return;
      await axios.post(this.apiUrl, JSON.stringify({ action: 'delete', id }), {
        headers: { 'Content-Type': 'text/plain' }
      });
      this.fetchStudents();
    },
    openEditModal() { alert('Full edit form in your original App.vue — this is lite mode!'); },
    printAllIDs() {
      const win = window.open('', '_blank');
      let html = '<html><body style="font-family:Arial">';
      this.students.forEach(s => {
        html += `<div style="page-break-after:always;text-align:center;margin:20px;">
          <h2>${this.hostelName} ID CARD</h2>
          <img src="${this.fixPhoto(s.photoUrl)}" width="100"><br>
          <h3>${s.name}</h3>
          Room: ${this.getLatestRoom(s.room)} | Phone: ${s.personPhone}
          <hr>
        </div>`;
      });
      win.document.write(html + '</body></html>');
    },
    exportExcel() {
      const data = this.students.map(s => ({
        Name: s.name,
        Room: this.getLatestRoom(s.room),
        Phone: s.personPhone,
        Status: this.getDueText(s),
        Due: this.isDue(s) ? this.monthlyRent - (parseInt(s.Advance || 0)) : 0
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Hostel');
      XLSX.writeFile(wb, 'Hostel-Report.xlsx');
    },
    installPWA() {
      alert('Click Share → Add to Home Screen!');
    },
    toggleLang() { this.lang = this.lang === 'en' ? 'hi' : 'en'; },
    cycleTheme() {
      this.themeIndex = (this.themeIndex + 1) % this.themes.length;
      this.theme = this.themes[this.themeIndex];
    },
    autoBackup() {
      // Silent backup
      axios.post(this.apiUrl, JSON.stringify({ action: 'backup', data: this.students }));
    }
  }
};
</script>

<style>
.bg-gradient-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important; color: white; }
.bg-gradient-success { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important; color: white; }
</style>