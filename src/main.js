import Vue from 'vue'

import App from './App.vue'
import router from './router'
import store from './store'
import GlobalMixin from "./Global";
import GlobalComponents from "./GlobalComponents"; 
import PerformanceMixin from "./PerformanceMixin";
import LeakTrackerMixin from "./LeakTrackerMixin";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import GlobalTrackerMixin from "./GlobalTrackerMixin";

Vue.mixin(GlobalTrackerMixin);



// import  PerfDevtool from "vue-perf-devtool";
//   Vue.use(PerfDevtool);
Vue.mixin(LeakTrackerMixin);
Vue.mixin({
  destroyed() {
    const name = this.$options.name || 'Anonymous';
    if (this.$el && this.$el.parentNode) {
      console.warn(`⚠ ${name} may be leaking! Removing DOM node.`, this.$el);
      this.$el.parentNode.removeChild(this.$el);
    }
  }
});

  import("@welldone-software/why-did-you-render").then(({ default: whyDidYouRender }) => {
    whyDidYouRender(Vue, {
      include: [/./],        // Track all components (you can limit later)
      collapseGroups: true,  // Cleaner console logs
      trackPropsDiff: true,     // Show differences in props
      trackStateDiff: true,     // Show differences in Vuex/state
      trackHooks: true,         // Track hook re-renders
      collapseGroups: true,
       notifier: (options) => {
    const comp = window.__memoryPanelData.find(c => c.name === options.componentName);
    if (comp) {
      comp.rerenders = (comp.rerenders || 0) + 1;
      // Update panel after each rerender
      window.dispatchEvent(new CustomEvent("memory-panel-update", { detail: window.__memoryPanelData }));
    }
    console.log("%c🔄 Re-rendered:", "color: #ffa500", options);
  }
    });
    console.log("%c whyDidYouRender enabled", "color: green; font-weight: bold;");
  });

Vue.mixin({
    destroyed() {
      const name = this.$options.name || 'Anonymous';
      if (this.$el && this.$el.parentNode) {
        console.warn(`⚠ ${name} may be leaking!`, this.$el);
      }
    }
  });
  
Vue.mixin(GlobalMixin);
Vue.mixin(PerformanceMixin);


Vue.use(store)

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')
