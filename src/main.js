import Vue from 'vue'

import App from './App.vue'
import router from './router'
import store from './store'
import GlobalMixin from "./Global";
import GlobalComponents from "./GlobalComponents"; 
import AllGlobalMixin from "./AllCombiGlobalMixin";
Vue.mixin(AllGlobalMixin);

Vue.mixin(GlobalMixin);
// import("@welldone-software/why-did-you-render").then(({ default: whyDidYouRender }) => {
//   whyDidYouRender(Vue, {
//     include: [/./],
//     collapseGroups: true,
//     trackPropsDiff: true,
//     trackStateDiff: true,
//     trackHooks: true,
//     notifier: (options) => {
//       const comp = window.__memoryPanelData.find(c => c.name === options.componentName);
//       if (comp) {
//         comp.rerenders = (comp.rerenders || 0) + 1;
//         window.dispatchEvent(new CustomEvent("memory-panel-update", { detail: window.__memoryPanelData }));
//       }
//       console.log("%c🔄 Re-rendered:", "color: #ffa500", options);
//     }
//   });
//   console.log("%c whyDidYouRender enabled", "color: green; font-weight: bold;");
// });
import("@welldone-software/why-did-you-render").then(({ default: whyDidYouRender }) => {
  whyDidYouRender(Vue, {
    include: [/./],
    collapseGroups: true,
    trackPropsDiff: true,
    trackStateDiff: true,
    trackHooks: true,
    notifier: (options) => {
      const comp = window.__memoryPanelData.find(c => c.name === options.componentName);
      if (comp) {
        comp.rerenders = (comp.rerenders || 0) + 1;
        window.dispatchEvent(new CustomEvent("memory-panel-update", { detail: window.__memoryPanelData }));
      }
      console.log("%c🔄 Re-rendered:", "color: #ffa500", options);
    }
  });
  console.log("%c whyDidYouRender enabled", "color: green; font-weight: bold;");
});


import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
Vue.use(store)

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')
