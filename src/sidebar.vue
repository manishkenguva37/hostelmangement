<template>
  <div>

    <!-- OVERLAY (mobile) -->
    <div
      v-if="isOpen"
      class="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 backdrop-blur"
      style="z-index: 1040;"
      @click="toggleSidebar"
    ></div>

    <!-- HAMBURGER BUTTON (ALWAYS LEFT) -->
    <button
      class="btn btn-light shadow rounded-circle position-fixed top-0 start-0 m-3 d-lg-none"
      style="z-index: 2000;"
      @click="toggleSidebar"
    >
      <i class="bi bi-list fs-3"></i>
    </button>

    <!-- SIDEBAR (RIGHT SLIDE) -->
    <div
      :class="['sidebar bg-white shadow-lg', isOpen ? 'sidebar-open' : '']"
    >
      <h4 class="mb-4 fw-bold px-3 mt-3">Dashboard</h4>

      <ul class="nav flex-column gap-2 px-2">
        <li class="nav-item">
          <RouterLink class="nav-link d-flex align-items-center text-dark gap-2" to="/dashboard">
            <i class="bi bi-house-door"></i> Home
          </RouterLink>
        </li>

        <li class="nav-item">
          <RouterLink class="nav-link d-flex align-items-center text-dark gap-2" to="/uploads">
            <i class="bi bi-cloud-upload"></i> Uploads
          </RouterLink>
        </li>

        <li class="nav-item">
          <RouterLink class="nav-link d-flex align-items-center text-dark gap-2" to="/students">
            <i class="bi bi-people"></i> Students
          </RouterLink>
        </li>
      </ul>

      <div class="p-3 mt-auto">
        <button class="btn btn-danger w-100" @click="logout">
          <i class="bi bi-box-arrow-right"></i> Logout
        </button>
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="main-content">
      <div class="p-4">
        <slot name="header"></slot>
      </div>
      <div class="p-4">
        <slot name="body"></slot>
      </div>
    </div>

  </div>
</template>


<script>
export default {
  name: "SidebarLayout",

  data() {
    return {
      isOpen: false,
    };
  },

  methods: {
    toggleSidebar() {
      this.isOpen = !this.isOpen;
    },

    logout() {
      localStorage.removeItem("user");
      this.$router.push("/login");
    },
  },
};
</script>


<style scoped>
/* --- SIDEBAR BASE --- */
.sidebar {
  width: 270px;
  height: 100vh;
  position: fixed;
  top: 0;
  right: -300px;          /* hides sidebar */
  transition: all 0.35s ease;
  z-index: 1051;
  border-radius: 12px 0 0 12px;
}

/* When visible */
.sidebar-open {
  right: 0;
}

/* Desktop always open */
@media (min-width: 992px) {
  .sidebar {
    right: 0 !important;
  }

  .main-content {
    margin-right: 270px;
  }
}

/* Mobile content */
@media (max-width: 991px) {
  .main-content {
    margin-right: 0 !important;
  }
}

/* MAIN CONTENT SECTION */
.main-content {
  min-height: 100vh;
  background: #f5f6fa;
  transition: margin 0.3s ease;
}

/* Optional blur for overlay */
.backdrop-blur {
  backdrop-filter: blur(3px);
}
</style>
