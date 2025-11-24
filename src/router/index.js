import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: import.meta.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/upload',
      name: 'upload',
      component: () => import('../views/UploadView.vue')
    },
     {
      path: '/upload3',
      name: 'upload3',
      component: () => import('../views/UploadView2.vue')
    },
    {
      path: '/upload2',
      name: 'upload2',
      component: () => import('../views/upload2.vue')
    },
    //  { path: "/student/:id", name: "ViewStudent", component: () => import('../views/ViewStudent.vue'), props: true },
     { path: '/student',  component: () => import('../views/ViewStudent.vue'), },
     {
      path: "/viewstudent",
      name: "ViewStudent",
      component:  () => import('../views/ViewStudent2.vue'),
      meta: { student: null } // placeholder for dynamic data
    },

    { path: '/:catchAll(.*)', redirect: '/' } 
  ]
})

export default router
router.beforeEach((to, from, next) => {
  // This function runs before every route navigation.

  // 'to': The target Route Object being navigated to.
  // 'from': The current Route Object being navigated away from.
  // 'next': A function that must be called to resolve the hook.

  // Example: Basic Authentication Check
  // const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  // const isAuthenticated = false; // Replace with actual auth check (e.g., store state, token check)
  const isAuthenticated = localStorage.getItem("isauthicated") === 'true';
  //  const isAuthenticated = 'true';
  const publicPaths = [ '/login', '/register'];
  const authRequired = !publicPaths.includes(to.path);
  if (authRequired && !isAuthenticated) {
    console.log(`Access Denied: Redirecting ${to.name} to /login`);
    next('/login');
    
  } else if (isAuthenticated && to.path=="/") {
  
    console.log(`Already Logged In: Redirecting ${to.name} to /`);
    next('/upload3');

  } else {
 
    next();
  }
 
})
