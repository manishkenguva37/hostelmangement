import Vue from 'vue'

import App from './App.vue'
import router from './router'
import store from './store'
import GlobalMixin from "./Global";
import GlobalComponents from "./GlobalComponents"; 


Vue.mixin(GlobalMixin);


import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
Vue.use(store)

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')
