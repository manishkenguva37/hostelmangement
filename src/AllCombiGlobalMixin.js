// // // GlobalMixin.js
// // export default {
// //   data() {
// //     return {
// //       __activeIntervals: [],
// //       __activeTimeouts: [],
// //       __activeListeners: []
// //     };
// //   },

// //   beforeMount() {
// //     const name = this.$options.name || "Anonymous";
// //     console.log(`beforeMount: ${name}`);
// //     this.__startTime = performance.now();

// //     if (!window.__memoryPanelData) window.__memoryPanelData = [];
// //   },

// //   mounted() {
// //     const name = this.$options.name || "Anonymous";
// //     const mountTime = performance.now() - this.__startTime;
// //     const SLOW_THRESHOLD = 40;

// //     const slow = mountTime > SLOW_THRESHOLD;
// //     console.log(slow ? `⚠ SLOW MOUNT: ${name} took ${mountTime.toFixed(2)}ms` : `⏱ ${name} mounted in ${mountTime.toFixed(2)}ms`);

// //     // Add component to memory panel
// //     window.__memoryPanelData.push({
// //       id: this._uid,
// //       name,
// //       mounted: true,
// //       slow,
// //       intervals: this.__activeIntervals,
// //       timeouts: this.__activeTimeouts,
// //       listeners: this.__activeListeners,
// //       rerenders: 0
// //     });

// //     this.updateMemoryPanel();
// //   },

// //   methods: {
// //     $trackInterval(intervalId) {
// //       this.__activeIntervals.push(intervalId);
// //       return intervalId;
// //     },

// //     $trackTimeout(timeoutId) {
// //       this.__activeTimeouts.push(timeoutId);
// //       return timeoutId;
// //     },

// //     $trackListener(target, event, handler, options) {
// //       target.addEventListener(event, handler, options);
// //       this.__activeListeners.push({ target, event, handler, options });
// //     },

// //     updateMemoryPanel() {
// //       const data = window.__memoryPanelData.map(c => ({
// //         id: c.id,
// //         name: c.name,
// //         mounted: c.mounted,
// //         slow: c.slow,
// //         intervals: Array.isArray(c.intervals) ? c.intervals.length : 0,
// //         timeouts: Array.isArray(c.timeouts) ? c.timeouts.length : 0,
// //         listeners: Array.isArray(c.listeners) ? c.listeners.length : 0,
// //         rerenders: c.rerenders || 0
// //       }));
// //       window.dispatchEvent(new CustomEvent("memory-panel-update", { detail: data }));
// //     }
// //   },

// //   beforeDestroy() {
// //     const name = this.$options.name || "Anonymous";
// //     console.log(`🧹 ${name} beforeDestroy`);

// //     this.__activeIntervals.forEach(clearInterval);
// //     this.__activeTimeouts.forEach(clearTimeout);
// //     this.__activeListeners.forEach(l =>
// //       l.target.removeEventListener(l.event, l.handler, l.options)
// //     );

// //     if (this.__activeIntervals.length || this.__activeTimeouts.length || this.__activeListeners.length) {
// //       console.warn(`⚠ ${name} had active timers/listeners cleared`);
// //     }
// //   },

// //   destroyed() {
// //     const name = this.$options.name || "Anonymous";
// //     console.log(`✅ ${name} destroyed`);

// //     const comp = window.__memoryPanelData.find(c => c.id === this._uid);
// //     if (comp) {
// //       comp.mounted = false;
// //       comp.intervals = [];
// //       comp.timeouts = [];
// //       comp.listeners = [];
// //     }

// //     this.updateMemoryPanel();
// //   }
// // };



// // AllGlobalMixin.js
// export default {
//   data() {
//     return {
//       __activeIntervals: [],
//       __activeTimeouts: [],
//       __activeListeners: [],
//       __startTime: 0,
//     };
//   },

//   beforeMount() {
//     this.__startTime = performance.now();
//     if (!window.__memoryPanelData) window.__memoryPanelData = [];
//   },

//   mounted() {
//     const name = this.$options.name || "Anonymous";
//     const mountTime = performance.now() - this.__startTime;
//     const SLOW_THRESHOLD = 40;

//     if (mountTime > SLOW_THRESHOLD) {
//       console.warn(`%c⚠ SLOW MOUNT: ${name} took ${mountTime.toFixed(2)}ms`, "color: orange; font-weight: bold;");
//     } else {
//       console.log(`%c⏱ ${name} mounted in ${mountTime.toFixed(2)}ms`, "color: #4caf50");
//     }

//     // Add to memory panel
//     window.__memoryPanelData.push({
//       id: this._uid,
//       name,
//       mounted: true,
//       slow: mountTime > SLOW_THRESHOLD,
//       intervals: this.__activeIntervals,
//       timeouts: this.__activeTimeouts,
//       listeners: this.__activeListeners,
//       rerenders: 0
//     });

//     this.updateMemoryPanel();
//   },

//   methods: {
//     $trackInterval(id) {
//       this.__activeIntervals.push(id);
//       return id;
//     },

//     $trackTimeout(id) {
//       this.__activeTimeouts.push(id);
//       return id;
//     },

//     $trackListener(target, event, handler, options) {
//       target.addEventListener(event, handler, options);
//       this.__activeListeners.push({ target, event, handler, options });
//     },

//     updateMemoryPanel() {
//       if (!window.__memoryPanelData) return;
//       const data = window.__memoryPanelData.map(c => ({
//         id: c.id,
//         name: c.name,
//         mounted: c.mounted,
//         slow: c.slow,
//         intervals: Array.isArray(c.intervals) ? c.intervals.length : 0,
//         timeouts: Array.isArray(c.timeouts) ? c.timeouts.length : 0,
//         listeners: Array.isArray(c.listeners) ? c.listeners.length : 0,
//         rerenders: c.rerenders || 0
//       }));
//       window.dispatchEvent(new CustomEvent("memory-panel-update", { detail: data }));
//     }
//   },

//   beforeDestroy() {
//     const name = this.$options.name || "Anonymous";
//     this.__activeIntervals.forEach(clearInterval);
//     this.__activeTimeouts.forEach(clearTimeout);
//     this.__activeListeners.forEach(l => l.target.removeEventListener(l.event, l.handler, l.options));
//     if (this.__activeIntervals.length || this.__activeTimeouts.length || this.__activeListeners.length) {
//       console.warn(`%c⚠ ${name} had active timers/listeners cleared`, "color: red; font-weight: bold;");
//     }
//   },

//   destroyed() {
//     const name = this.$options.name || "Anonymous";
//     const comp = window.__memoryPanelData.find(c => c.id === this._uid);
//     if (comp) {
//       comp.mounted = false;
//       comp.intervals = [];
//       comp.timeouts = [];
//       comp.listeners = [];
//     }
//     this.updateMemoryPanel();

//     if (this.$el && this.$el.parentNode) {
//       console.warn(`⚠ ${name} may be leaking! Removing DOM node.`, this.$el);
//       this.$el.parentNode.removeChild(this.$el);
//     }

//     console.log(`✅ ${name} destroyed`);
//   }
// };



// export default {
//   data() {
//     return {
//       __activeIntervals: [],
//       __activeTimeouts: [],
//       __activeListeners: [],
//       __startTime: null
//     };
//   },

//   beforeMount() {
//     // Initialize tracking arrays
//     this.__activeIntervals = this.__activeIntervals || [];
//     this.__activeTimeouts = this.__activeTimeouts || [];
//     this.__activeListeners = this.__activeListeners || [];

//     // Start performance timer
//     if (process.env.NODE_ENV === "development") {
//       this.__startTime = performance.now();
//     }

//     // Initialize global memory panel
//     if (!window.__memoryPanelData) window.__memoryPanelData = [];
//   },

//   mounted() {
//     const name = this.$options.name || "Anonymous";

//     // Track mount time
//     const mountTime = this.__startTime ? performance.now() - this.__startTime : 0;
//     const SLOW_THRESHOLD = 40; // ms

//     if (mountTime > SLOW_THRESHOLD) {
//       console.warn(`%c⚠ SLOW MOUNT: ${name} took ${mountTime.toFixed(2)}ms`, "color: orange; font-weight: bold;");
//     } else {
//       console.log(`%c⏱ ${name} mounted in ${mountTime.toFixed(2)}ms`, "color: #4caf50");
//     }

//     // Add to memory panel
//     window.__memoryPanelData.push({
//       id: this._uid,
//       name,
//       mounted: true,
//       slow: mountTime > SLOW_THRESHOLD,
//       intervals: this.__activeIntervals,
//       timeouts: this.__activeTimeouts,
//       listeners: this.__activeListeners,
//       rerenders: 0
//     });

//     this.updateMemoryPanel();
//   },

//   methods: {
//     // Track interval safely
//     $trackInterval(intervalId) {
//       this.__activeIntervals.push(intervalId);
//       return intervalId;
//     },

//     // Track timeout safely
//     $trackTimeout(timeoutId) {
//       this.__activeTimeouts.push(timeoutId);
//       return timeoutId;
//     },

//     // Track DOM listeners safely
//     $trackListener(target, event, handler, options) {
//       target.addEventListener(event, handler, options);
//       this.__activeListeners.push({ target, event, handler, options });
//     },

//     // Update memory panel
//     updateMemoryPanel() {
//       if (!window.__memoryPanelData) return;

//       const data = window.__memoryPanelData.map(c => ({
//         id: c.id,
//         name: c.name,
//         mounted: c.mounted,
//         slow: c.slow,
//         intervals: Array.isArray(c.intervals) ? c.intervals.length : 0,
//         timeouts: Array.isArray(c.timeouts) ? c.timeouts.length : 0,
//         listeners: Array.isArray(c.listeners) ? c.listeners.length : 0,
//         rerenders: c.rerenders || 0
//       }));

//       window.dispatchEvent(new CustomEvent("memory-panel-update", { detail: data }));
//     }
//   },

//   beforeDestroy() {
//     const name = this.$options.name || "Anonymous";
//     console.log(`🧹 ${name} is being destroyed`);

//     // Cleanup intervals/timeouts/listeners safely
//     if (Array.isArray(this.__activeIntervals)) this.__activeIntervals.forEach(clearInterval);
//     if (Array.isArray(this.__activeTimeouts)) this.__activeTimeouts.forEach(clearTimeout);
//     if (Array.isArray(this.__activeListeners)) {
//       this.__activeListeners.forEach(l =>
//         l.target.removeEventListener(l.event, l.handler, l.options)
//       );
//     }

//     if ((this.__activeIntervals?.length || 0) || (this.__activeTimeouts?.length || 0) || (this.__activeListeners?.length || 0)) {
//       console.warn(`%c⚠ ${name} had active timers/listeners cleared before destroy`, "color: red; font-weight: bold;");
//     }
//   },

// //   destroyed() {
// //     const name = this.$options.name || "Anonymous";

// //     // Mark component as unmounted in memory panel
// //     const comp = window.__memoryPanelData.find(c => c.id === this._uid);
// //     if (comp) {
// //       comp.mounted = false;
// //       comp.intervals = [];
// //       comp.timeouts = [];
// //       comp.listeners = [];
// //     }

// //     this.updateMemoryPanel();

// //     // Warn about potential leaks
// //     if (this.$el && this.$el.parentNode) {
// //       console.warn(`⚠ ${name} may be leaking! Removing DOM node.`, this.$el);
// //       this.$el.parentNode.removeChild(this.$el);
// //     }

// //     console.log(`✅ ${name} destroyed`);
// //   }
// destroyed() {
//   const name = this.$options.name || "Anonymous";

//   // List of internal Vue components to ignore
//   const ignoredComponents = ["RouterLink", "transition", "KeepAlive", "Teleport"];

//   // Mark component as unmounted in memory panel
//   const comp = window.__memoryPanelData.find(c => c.id === this._uid);
//   if (comp) {
//     comp.mounted = false;
//     comp.intervals = [];
//     comp.timeouts = [];
//     comp.listeners = [];
//   }

//   this.updateMemoryPanel();

//   // Warn only for user-defined components
//   if (!ignoredComponents.includes(name) && this.$el && this.$el.parentNode) {
//     console.warn(`⚠ ${name} may be leaking! Removing DOM node.`, this.$el);
//     this.$el.parentNode.removeChild(this.$el);
//   } else if (this.$el && this.$el.parentNode) {
//     // remove silently
//     this.$el.parentNode.removeChild(this.$el);
//   }

//   console.log(`✅ ${name} destroyed`);
// },
// };



// export default {
//   data() {
//     return {
//       __activeIntervals: [],
//       __activeTimeouts: [],
//       __activeListeners: [],
//       __startTime: null,
//       __startMemory: 0
//     };
//   },

//   beforeMount() {
//     // Initialize tracking arrays
//     this.__activeIntervals = this.__activeIntervals || [];
//     this.__activeTimeouts = this.__activeTimeouts || [];
//     this.__activeListeners = this.__activeListeners || [];

//     // Start performance timer
//     if (process.env.NODE_ENV === "development") {
//       this.__startTime = performance.now();
//       this.__startMemory = performance.memory?.usedJSHeapSize || 0;
//     }

//     // Initialize global memory panel
//     if (!window.__memoryPanelData) window.__memoryPanelData = [];
//   },

//   mounted() {
//     const name = this.$options.name || "Anonymous";

//     // Track mount time
//     const mountTime = this.__startTime ? performance.now() - this.__startTime : 0;
//     const SLOW_THRESHOLD = 40; // ms

//     if (mountTime > SLOW_THRESHOLD) {
//       console.warn(`%c⚠ SLOW MOUNT: ${name} took ${mountTime.toFixed(2)}ms`, "color: orange; font-weight: bold;");
//     } else {
//       console.log(`%c⏱ ${name} mounted in ${mountTime.toFixed(2)}ms`, "color: #4caf50");
//     }

//     // Add component to memory panel
//     window.__memoryPanelData.push({
//       id: this._uid,
//       name,
//       mounted: true,
//       slow: mountTime > SLOW_THRESHOLD,
//       intervals: this.__activeIntervals,
//       timeouts: this.__activeTimeouts,
//       listeners: this.__activeListeners,
//       rerenders: 0,
//       memoryDiff: 0
//     });

//     this.updateMemoryPanel();
//   },

//   updated() {
//     // Track rerenders
//     const comp = window.__memoryPanelData.find(c => c.id === this._uid);
//     if (comp) {
//       comp.rerenders = (comp.rerenders || 0) + 1;
//       this.updateMemoryPanel();
//     }
//   },

//   methods: {
//     // Track interval safely
//     $trackInterval(intervalId) {
//       this.__activeIntervals.push(intervalId);
//       return intervalId;
//     },

//     // Track timeout safely
//     $trackTimeout(timeoutId) {
//       this.__activeTimeouts.push(timeoutId);
//       return timeoutId;
//     },

//     // Track DOM listeners safely
//     $trackListener(target, event, handler, options) {
//       target.addEventListener(event, handler, options);
//       this.__activeListeners.push({ target, event, handler, options });
//     },

//     // Update memory panel
//     updateMemoryPanel() {
//       if (!window.__memoryPanelData) return;

//       const data = window.__memoryPanelData.map(c => ({
//         id: c.id,
//         name: c.name,
//         mounted: c.mounted,
//         slow: c.slow,
//         intervals: Array.isArray(c.intervals) ? c.intervals.length : 0,
//         timeouts: Array.isArray(c.timeouts) ? c.timeouts.length : 0,
//         listeners: Array.isArray(c.listeners) ? c.listeners.length : 0,
//         rerenders: c.rerenders || 0,
//         memoryDiff: c.memoryDiff || 0
//       }));

//       window.dispatchEvent(new CustomEvent("memory-panel-update", { detail: data }));
//     }
//   },

//   beforeDestroy() {
//     const name = this.$options.name || "Anonymous";
//     console.log(`🧹 ${name} is being destroyed`);

//     // Cleanup intervals/timeouts/listeners
//     if (Array.isArray(this.__activeIntervals)) this.__activeIntervals.forEach(clearInterval);
//     if (Array.isArray(this.__activeTimeouts)) this.__activeTimeouts.forEach(clearTimeout);
//     if (Array.isArray(this.__activeListeners)) {
//       this.__activeListeners.forEach(l => l.target.removeEventListener(l.event, l.handler, l.options));
//     }

//     if ((this.__activeIntervals?.length || 0) || (this.__activeTimeouts?.length || 0) || (this.__activeListeners?.length || 0)) {
//       console.warn(`%c⚠ ${name} had active timers/listeners cleared before destroy`, "color: red; font-weight: bold;");
//     }
//   },

//   destroyed() {
//     const name = this.$options.name || "Anonymous";

//     // List of internal Vue components to ignore
//     const ignoredComponents = ["RouterLink", "transition", "KeepAlive", "Teleport"];

//     // Track memory difference
//     const endMemory = performance.memory?.usedJSHeapSize || 0;
//     const comp = window.__memoryPanelData.find(c => c.id === this._uid);
//     if (comp) {
//       comp.mounted = false;
//       comp.intervals = [];
//       comp.timeouts = [];
//       comp.listeners = [];
//       comp.memoryDiff = endMemory - (this.__startMemory || 0);
//     }

//     this.updateMemoryPanel();

//     // Warn only for user-defined components
//     if (!ignoredComponents.includes(name) && this.$el && this.$el.parentNode) {
//       console.warn(`⚠ ${name} may be leaking! Removing DOM node.`, this.$el);
//       this.$el.parentNode.removeChild(this.$el);
//     } else if (this.$el && this.$el.parentNode) {
//       // remove silently
//       this.$el.parentNode.removeChild(this.$el);
//     }

//     console.log(`✅ ${name} destroyed`);
//   }
// };



// AllGlobalMixin.js
// export default {
//   data() {
//     return {
//       __activeIntervals: [],
//       __activeTimeouts: [],
//       __activeListeners: [],
//       __startTime: null,
//       __startMemory: 0
//     };
//   },

//   beforeMount() {
//     this.__activeIntervals = this.__activeIntervals || [];
//     this.__activeTimeouts = this.__activeTimeouts || [];
//     this.__activeListeners = this.__activeListeners || [];

//     if (process.env.NODE_ENV === "development") {
//       this.__startTime = performance.now();
//       this.__startMemory = performance.memory?.usedJSHeapSize || 0;
//     }

//     if (!window.__memoryPanelData) window.__memoryPanelData = [];
//   },

//   mounted() {
//     const name = this.$options.name || "Anonymous";
//     const mountTime = this.__startTime ? performance.now() - this.__startTime : 0;
//     const SLOW_THRESHOLD = 40;

//     console.log(
//       `%c⏱ ${name} mounted in ${mountTime.toFixed(2)}ms`,
//       `color: ${mountTime > SLOW_THRESHOLD ? "orange" : "#4caf50"}`
//     );

//     window.__memoryPanelData.push({
//       id: this._uid,
//       name,
//       mounted: true,
//       slow: mountTime > SLOW_THRESHOLD,
//       intervals: this.__activeIntervals,
//       timeouts: this.__activeTimeouts,
//       listeners: this.__activeListeners,
//       rerenders: 0,
//       memoryDiff: 0
//     });

//     this.updateMemoryPanel();
//   },

//   updated() {
//     const comp = window.__memoryPanelData.find(c => c.id === this._uid);
//     if (comp) {
//       comp.rerenders = (comp.rerenders || 0) + 1;
//       this.updateMemoryPanel();
//     }
//   },

//   methods: {
//     $trackInterval(intervalId) {
//       this.__activeIntervals.push(intervalId);
//       return intervalId;
//     },

//     $trackTimeout(timeoutId) {
//       this.__activeTimeouts.push(timeoutId);
//       return timeoutId;
//     },

//     $trackListener(target, event, handler, options) {
//       target.addEventListener(event, handler, options);
//       this.__activeListeners.push({ target, event, handler, options });
//     },

//     updateMemoryPanel: function () {
//       if (!window.__memoryPanelData) return;

//       // Debounced update
//       clearTimeout(this.__updateTimer);
//       this.__updateTimer = setTimeout(() => {
//         const data = window.__memoryPanelData.map(c => ({
//           id: c.id,
//           name: c.name,
//           mounted: c.mounted,
//           slow: c.slow,
//           intervals: Array.isArray(c.intervals) ? c.intervals.length : 0,
//           timeouts: Array.isArray(c.timeouts) ? c.timeouts.length : 0,
//           listeners: Array.isArray(c.listeners) ? c.listeners.length : 0,
//           rerenders: c.rerenders || 0,
//           memoryDiff: c.memoryDiff || 0
//         }));
//         window.dispatchEvent(new CustomEvent("memory-panel-update", { detail: data }));
//       }, 100);
//     }
//   },

//   beforeDestroy() {
//     const name = this.$options.name || "Anonymous";
//     console.log(`🧹 ${name} is being destroyed`);

//     if (Array.isArray(this.__activeIntervals)) this.__activeIntervals.forEach(clearInterval);
//     if (Array.isArray(this.__activeTimeouts)) this.__activeTimeouts.forEach(clearTimeout);
//     if (Array.isArray(this.__activeListeners)) {
//       this.__activeListeners.forEach(l => l.target.removeEventListener(l.event, l.handler, l.options));
//     }

//     if ((this.__activeIntervals?.length || 0) || (this.__activeTimeouts?.length || 0) || (this.__activeListeners?.length || 0)) {
//       console.warn(`%c⚠ ${name} had active timers/listeners cleared before destroy`, "color: red; font-weight: bold;");
//     }
//   },

//   destroyed() {
//     const name = this.$options.name || "Anonymous";
//     const ignoredComponents = ["RouterLink", "transition", "KeepAlive", "Teleport","Anonymous"];

//     const endMemory = performance.memory?.usedJSHeapSize || 0;
//     const comp = window.__memoryPanelData.find(c => c.id === this._uid);
//     if (comp) {
//       comp.mounted = false;
//       comp.intervals = [];
//       comp.timeouts = [];
//       comp.listeners = [];
//       comp.memoryDiff = endMemory - (this.__startMemory || 0);
//     }

//     this.updateMemoryPanel();

//     if (!ignoredComponents.includes(name) && this.$el && this.$el.parentNode) {
//       console.warn(`⚠ ${name} may be leaking! Removing DOM node.`, this.$el);
//       this.$el.parentNode.removeChild(this.$el);
//     } else if (this.$el && this.$el.parentNode) {
//       this.$el.parentNode.removeChild(this.$el);
//     }

//     console.log(`✅ ${name} destroyed`);
//   }
// };

// export default {
//   data() {
//     return {
//       __activeIntervals: [],
//       __activeTimeouts: [],
//       __activeListeners: [],
//       __startTime: null,
//       __startMemory: 0,
//       __updateTimer: null
//     };
//   },

//   beforeMount() {
//     this.__activeIntervals = this.__activeIntervals || [];
//     this.__activeTimeouts = this.__activeTimeouts || [];
//     this.__activeListeners = this.__activeListeners || [];

//     if (process.env.NODE_ENV === "development") {
//       this.__startTime = performance.now();
//       this.__startMemory = performance.memory?.usedJSHeapSize || 0;
//     }

//     if (!window.__memoryPanelData) window.__memoryPanelData = [];
//   },

//   mounted() {
//     const name = this.$options.name || "Anonymous";
//     const mountTime = this.__startTime ? performance.now() - this.__startTime : 0;
//     const SLOW_THRESHOLD = 40;

//     console.log(
//       `%c⏱ ${name} mounted in ${mountTime.toFixed(2)}ms`,
//       `color: ${mountTime > SLOW_THRESHOLD ? "orange" : "#4caf50"}`
//     );

//     // Only add user components to memory panel
//     const ignored = ["RouterLink", "transition", "KeepAlive", "Teleport", "MemoryPanel", "Anonymous"];
//     if (!ignored.includes(name)) {
//       window.__memoryPanelData.push({
//         id: this._uid,
//         name,
//         mounted: true,
//         slow: mountTime > SLOW_THRESHOLD,
//         intervals: this.__activeIntervals,
//         timeouts: this.__activeTimeouts,
//         listeners: this.__activeListeners,
//         rerenders: 0,
//         memoryDiff: 0
//       });
//       this.updateMemoryPanel();
//     }
//   },

//   updated() {
//     const comp = window.__memoryPanelData.find(c => c.id === this._uid);
//     if (comp) {
//       comp.rerenders = (comp.rerenders || 0) + 1;
//       this.updateMemoryPanel();
//     }
//   },

//   methods: {
//     $trackInterval(intervalId) {
//       this.__activeIntervals.push(intervalId);
//       return intervalId;
//     },

//     $trackTimeout(timeoutId) {
//       this.__activeTimeouts.push(timeoutId);
//       return timeoutId;
//     },

//     $trackListener(target, event, handler, options) {
//       target.addEventListener(event, handler, options);
//       this.__activeListeners.push({ target, event, handler, options });
//     },

//     updateMemoryPanel() {
//       clearTimeout(this.__updateTimer);
//       this.__updateTimer = setTimeout(() => {
//         if (!window.__memoryPanelData) return;

//         const data = window.__memoryPanelData.map(c => ({
//           id: c.id,
//           name: c.name,
//           mounted: c.mounted,
//           slow: c.slow,
//           intervals: Array.isArray(c.intervals) ? c.intervals.length : 0,
//           timeouts: Array.isArray(c.timeouts) ? c.timeouts.length : 0,
//           listeners: Array.isArray(c.listeners) ? c.listeners.length : 0,
//           rerenders: c.rerenders || 0,
//           memoryDiff: c.memoryDiff || 0
//         }));

//         window.dispatchEvent(new CustomEvent("memory-panel-update", { detail: data }));
//       }, 100);
//     }
//   },

//   beforeDestroy() {
//     const name = this.$options.name || "Anonymous";
//     console.log(`🧹 ${name} is being destroyed`);

//     if (Array.isArray(this.__activeIntervals)) this.__activeIntervals.forEach(clearInterval);
//     if (Array.isArray(this.__activeTimeouts)) this.__activeTimeouts.forEach(clearTimeout);
//     if (Array.isArray(this.__activeListeners)) {
//       this.__activeListeners.forEach(l => l.target.removeEventListener(l.event, l.handler, l.options));
//     }

//     if ((this.__activeIntervals?.length || 0) || (this.__activeTimeouts?.length || 0) || (this.__activeListeners?.length || 0)) {
//       console.warn(`%c⚠ ${name} had active timers/listeners cleared before destroy`, "color: red; font-weight: bold;");
//     }
//   },

//   destroyed() {
//     const name = this.$options.name || "Anonymous";
//     const ignored = ["RouterLink", "transition", "KeepAlive", "Teleport", "MemoryPanel", "Anonymous"];

//     if (!ignored.includes(name)) {
//       const comp = window.__memoryPanelData.find(c => c.id === this._uid);
//       const endMemory = performance.memory?.usedJSHeapSize || 0;
//       if (comp) {
//         comp.mounted = false;
//         comp.intervals = [];
//         comp.timeouts = [];
//         comp.listeners = [];
//         comp.memoryDiff = endMemory - (this.__startMemory || 0);
//       }
//       this.updateMemoryPanel();
//     }

//     if (this.$el && this.$el.parentNode) this.$el.parentNode.removeChild(this.$el);
//     console.log(`✅ ${name} destroyed`);
//   }
// };


// export default {
//   data() {
//     return {
//       __activeIntervals: [],
//       __activeTimeouts: [],
//       __activeListeners: [],
//       __startTime: null,
//       __startMemory: 0,
//       __updateTimer: null,
//       __memoryHistory: [], // added for sparkline
//     };
//   },

//   beforeMount() {
//     this.__activeIntervals = this.__activeIntervals || [];
//     this.__activeTimeouts = this.__activeTimeouts || [];
//     this.__activeListeners = this.__activeListeners || [];

//     if (process.env.NODE_ENV === "development") {
//       this.__startTime = performance.now();
//       this.__startMemory = performance.memory?.usedJSHeapSize || 0;
//     }

//     if (!window.__memoryPanelData) window.__memoryPanelData = [];
//   },

//   mounted() {
//     const name = this.$options.name || "Anonymous";
//     const mountTime = this.__startTime ? performance.now() - this.__startTime : 0;
//     const SLOW_THRESHOLD = 40;

//     const ignored = ["RouterLink", "transition", "KeepAlive", "Teleport", "MemoryPanel", "Anonymous"];
//     if (!ignored.includes(name)) {
//       window.__memoryPanelData.push({
//         id: this._uid,
//         name,
//         mounted: true,
//         slow: mountTime > SLOW_THRESHOLD,
//         intervals: this.__activeIntervals,
//         timeouts: this.__activeTimeouts,
//         listeners: this.__activeListeners,
//         rerenders: 0,
//         memoryDiff: 0,
//         memoryHistory: [] // for graph
//       });
//       this.updateMemoryPanel();
//     }
//   },

//   updated() {
//     const comp = window.__memoryPanelData.find(c => c.id === this._uid);
//     if (comp) {
//       comp.rerenders = (comp.rerenders || 0) + 1;

//       // Update memory history
//       const mem = performance.memory?.usedJSHeapSize || 0;
//       comp.memoryHistory = comp.memoryHistory || [];
//       comp.memoryHistory.push(mem - (this.__startMemory || 0));
//       if (comp.memoryHistory.length > 50) comp.memoryHistory.shift();

//       this.updateMemoryPanel();
//     }
//   },

//   methods: {
//     $trackInterval(intervalId) {
//       this.__activeIntervals.push(intervalId);
//       return intervalId;
//     },
//     $trackTimeout(timeoutId) {
//       this.__activeTimeouts.push(timeoutId);
//       return timeoutId;
//     },
//     $trackListener(target, event, handler, options) {
//       target.addEventListener(event, handler, options);
//       this.__activeListeners.push({ target, event, handler, options });
//     },

//     updateMemoryPanel() {
//       clearTimeout(this.__updateTimer);
//       this.__updateTimer = setTimeout(() => {
//         if (!window.__memoryPanelData) return;

//         const data = window.__memoryPanelData.map(c => ({
//           id: c.id,
//           name: c.name,
//           mounted: c.mounted,
//           slow: c.slow,
//           intervals: Array.isArray(c.intervals) ? c.intervals.length : 0,
//           timeouts: Array.isArray(c.timeouts) ? c.timeouts.length : 0,
//           listeners: Array.isArray(c.listeners) ? c.listeners.length : 0,
//           rerenders: c.rerenders || 0,
//           memoryDiff: c.memoryDiff || 0,
//           memoryHistory: c.memoryHistory || []
//         }));

//         window.dispatchEvent(new CustomEvent("memory-panel-update", { detail: data }));
//       }, 100);
//     }
//   },

//   beforeDestroy() {
//     const name = this.$options.name || "Anonymous";

//     if (Array.isArray(this.__activeIntervals)) this.__activeIntervals.forEach(clearInterval);
//     if (Array.isArray(this.__activeTimeouts)) this.__activeTimeouts.forEach(clearTimeout);
//     if (Array.isArray(this.__activeListeners)) {
//       this.__activeListeners.forEach(l => l.target.removeEventListener(l.event, l.handler, l.options));
//     }
//   },

//   destroyed() {
//     const name = this.$options.name || "Anonymous";
//     const ignored = ["RouterLink", "transition", "KeepAlive", "Teleport", "MemoryPanel", "Anonymous"];

//     if (!ignored.includes(name)) {
//       const comp = window.__memoryPanelData.find(c => c.id === this._uid);
//       const endMemory = performance.memory?.usedJSHeapSize || 0;
//       if (comp) {
//         comp.mounted = false;
//         comp.intervals = [];
//         comp.timeouts = [];
//         comp.listeners = [];
//         comp.memoryDiff = endMemory - (this.__startMemory || 0);
//       }
//       this.updateMemoryPanel();
//     }

//     if (this.$el && this.$el.parentNode) this.$el.parentNode.removeChild(this.$el);
//   }
// };



// export default {
//   data() {
//     return {
//       __activeIntervals: [],
//       __activeTimeouts: [],
//       __activeListeners: [],
//       __startTime: null,
//       __startMemory: 0
//     };
//   },

//   beforeMount() {
//     this.__activeIntervals = this.__activeIntervals || [];
//     this.__activeTimeouts = this.__activeTimeouts || [];
//     this.__activeListeners = this.__activeListeners || [];

//     if (process.env.NODE_ENV === "development") {
//       this.__startTime = performance.now();
//       this.__startMemory = performance.memory?.usedJSHeapSize || 0;
//     }

//     if (!window.__memoryPanelData) window.__memoryPanelData = [];
//   },

//   mounted() {
//     const name = this.$options.name || "Anonymous";
//     const mountTime = this.__startTime ? performance.now() - this.__startTime : 0;
//     const SLOW_THRESHOLD = 40;

//     console.log(
//       `%c⏱ ${name} mounted in ${mountTime.toFixed(2)}ms`,
//       `color: ${mountTime > SLOW_THRESHOLD ? "orange" : "#4caf50"}`
//     );

//     // Add component to memory panel data
//     window.__memoryPanelData.push({
//       id: this._uid,
//       name,
//       mounted: true,
//       slow: mountTime > SLOW_THRESHOLD,
//       intervals: this.__activeIntervals,
//       timeouts: this.__activeTimeouts,
//       listeners: this.__activeListeners,
//       rerenders: 0,
//       memoryDiff: 0,
//       memoryHistory: [] // For visual graphing
//     });

//     this.updateMemoryPanel();
//     this.trackMemoryUsage();
//   },

//   updated() {
//     const comp = window.__memoryPanelData.find(c => c.id === this._uid);
//     if (comp) {
//       comp.rerenders = (comp.rerenders || 0) + 1;
//       this.updateMemoryPanel();
//     }
//   },

//   methods: {
//     $trackInterval(intervalId) {
//       this.__activeIntervals.push(intervalId);
//       return intervalId;
//     },

//     $trackTimeout(timeoutId) {
//       this.__activeTimeouts.push(timeoutId);
//       return timeoutId;
//     },

//     $trackListener(target, event, handler, options) {
//       target.addEventListener(event, handler, options);
//       this.__activeListeners.push({ target, event, handler, options });
//     },

//     updateMemoryPanel() {
//       if (!window.__memoryPanelData) return;

//       clearTimeout(this.__updateTimer);
//       this.__updateTimer = setTimeout(() => {
//         const data = window.__memoryPanelData.map(c => ({
//           id: c.id,
//           name: c.name,
//           mounted: c.mounted,
//           slow: c.slow,
//           intervals: Array.isArray(c.intervals) ? c.intervals.length : 0,
//           timeouts: Array.isArray(c.timeouts) ? c.timeouts.length : 0,
//           listeners: Array.isArray(c.listeners) ? c.listeners.length : 0,
//           rerenders: c.rerenders || 0,
//           memoryDiff: c.memoryDiff || 0,
//           memoryHistory: c.memoryHistory || []
//         }));
//         window.dispatchEvent(new CustomEvent("memory-panel-update", { detail: data }));
//       }, 100);
//     },

//     // Track memory usage over time
//     trackMemoryUsage() {
//       if (!performance.memory) return;

//       const comp = window.__memoryPanelData.find(c => c.id === this._uid);
//       if (!comp) return;

//       const currentMemory = performance.memory.usedJSHeapSize;
//       const diff = currentMemory - (this.__startMemory || 0);
//       comp.memoryDiff = diff;

//       // Keep last 20 memory samples for visual graph
//       comp.memoryHistory.push(diff);
//       if (comp.memoryHistory.length > 20) comp.memoryHistory.shift();

//       this.updateMemoryPanel();

//       // Continue tracking if component is still mounted
//       if (comp.mounted) requestAnimationFrame(this.trackMemoryUsage.bind(this));
//     }
//   },

//   beforeDestroy() {
//     const name = this.$options.name || "Anonymous";
//     console.log(`🧹 ${name} is being destroyed`);

//     if (Array.isArray(this.__activeIntervals)) this.__activeIntervals.forEach(clearInterval);
//     if (Array.isArray(this.__activeTimeouts)) this.__activeTimeouts.forEach(clearTimeout);
//     if (Array.isArray(this.__activeListeners)) {
//       this.__activeListeners.forEach(l => l.target.removeEventListener(l.event, l.handler, l.options));
//     }

//     if ((this.__activeIntervals?.length || 0) || (this.__activeTimeouts?.length || 0) || (this.__activeListeners?.length || 0)) {
//       console.warn(`%c⚠ ${name} had active timers/listeners cleared before destroy`, "color: red; font-weight: bold;");
//     }
//   },

//   destroyed() {
//     const name = this.$options.name || "Anonymous";
//     const ignoredComponents = ["RouterLink", "transition", "KeepAlive", "Teleport","Anonymous","MemoryPanel"];

//     const endMemory = performance.memory?.usedJSHeapSize || 0;
//     const comp = window.__memoryPanelData.find(c => c.id === this._uid);
//     if (comp) {
//       comp.mounted = false;
//       comp.intervals = [];
//       comp.timeouts = [];
//       comp.listeners = [];
//       comp.memoryDiff = endMemory - (this.__startMemory || 0);
//     }

//     this.updateMemoryPanel();

//     if (!ignoredComponents.includes(name) && this.$el && this.$el.parentNode) {
//       console.warn(`⚠ ${name} may be leaking! Removing DOM node.`, this.$el);
//       this.$el.parentNode.removeChild(this.$el);
//     } else if (this.$el && this.$el.parentNode) {
//       this.$el.parentNode.removeChild(this.$el);
//     }

//     console.log(`✅ ${name} destroyed`);
//   }
// };


// export default {
//   data() {
//     return {
//       __activeIntervals: [],
//       __activeTimeouts: [],
//       __activeListeners: [],
//       __startTime: null,
//       __startMemory: 0
//     };
//   },

//   beforeMount() {
//     this.__activeIntervals = this.__activeIntervals || [];
//     this.__activeTimeouts = this.__activeTimeouts || [];
//     this.__activeListeners = this.__activeListeners || [];

//     if (process.env.NODE_ENV === "development") {
//       this.__startTime = performance.now();
//       this.__startMemory = performance.memory?.usedJSHeapSize || 0;
//     }

//     if (!window.__memoryPanelData) window.__memoryPanelData = [];
//   },

//   mounted() {
//     const name = this.$options.name || "Anonymous";
//     const mountTime = this.__startTime ? performance.now() - this.__startTime : 0;
//     const SLOW_THRESHOLD = 40;

//     console.log(
//       `%c⏱ ${name} mounted in ${mountTime.toFixed(2)}ms`,
//       `color: ${mountTime > SLOW_THRESHOLD ? "orange" : "#4caf50"}`
//     );

//     window.__memoryPanelData.push({
//       id: this._uid,
//       name,
//       mounted: true,
//       slow: mountTime > SLOW_THRESHOLD,
//       intervals: this.__activeIntervals,
//       timeouts: this.__activeTimeouts,
//       listeners: this.__activeListeners,
//       rerenders: 0,
//       memoryDiff: 0,
//       memoryHistory: [],
//       isLeaking: false // NEW: flag for leak
//     });

//     this.updateMemoryPanel();
//     this.trackMemoryUsage();
//   },

//   updated() {
//     const comp = window.__memoryPanelData.find(c => c.id === this._uid);
//     if (comp) {
//       comp.rerenders = (comp.rerenders || 0) + 1;
//       this.updateMemoryPanel();
//     }
//   },

//   methods: {
//     $trackInterval(intervalId) {
//       this.__activeIntervals.push(intervalId);
//       return intervalId;
//     },

//     $trackTimeout(timeoutId) {
//       this.__activeTimeouts.push(timeoutId);
//       return timeoutId;
//     },

//     $trackListener(target, event, handler, options) {
//       target.addEventListener(event, handler, options);
//       this.__activeListeners.push({ target, event, handler, options });
//     },

//     updateMemoryPanel() {
//       if (!window.__memoryPanelData) return;

//       clearTimeout(this.__updateTimer);
//       this.__updateTimer = setTimeout(() => {
//         const data = window.__memoryPanelData.map(c => ({
//           id: c.id,
//           name: c.name,
//           mounted: c.mounted,
//           slow: c.slow,
//           intervals: Array.isArray(c.intervals) ? c.intervals.length : 0,
//           timeouts: Array.isArray(c.timeouts) ? c.timeouts.length : 0,
//           listeners: Array.isArray(c.listeners) ? c.listeners.length : 0,
//           rerenders: c.rerenders || 0,
//           memoryDiff: c.memoryDiff || 0,
//           memoryHistory: c.memoryHistory || [],
//           isLeaking: c.isLeaking || false
//         }));
//         window.dispatchEvent(new CustomEvent("memory-panel-update", { detail: data }));
//       }, 100);
//     },

//     trackMemoryUsage() {
//       if (!performance.memory) return;

//       const comp = window.__memoryPanelData.find(c => c.id === this._uid);
//       if (!comp) return;

//       const currentMemory = performance.memory.usedJSHeapSize;
//       const diff = currentMemory - (this.__startMemory || 0);
//       comp.memoryDiff = diff;

//       comp.memoryHistory.push(diff);
//       if (comp.memoryHistory.length > 20) comp.memoryHistory.shift();

//       // NEW: Detect potential memory leak
//       if (!comp.mounted && comp.memoryHistory.length >= 2) {
//         const last = comp.memoryHistory[comp.memoryHistory.length - 1];
//         const prev = comp.memoryHistory[comp.memoryHistory.length - 2];
//         if (last > prev * 1.05) comp.isLeaking = true; // memory growing >5% after destroy
//       }

//       this.updateMemoryPanel();

//       if (comp.mounted || !comp.isLeaking) requestAnimationFrame(this.trackMemoryUsage.bind(this));
//     }
//   },

//   beforeDestroy() {
//     const name = this.$options.name || "Anonymous";
//     console.log(`🧹 ${name} is being destroyed`);

//     if (Array.isArray(this.__activeIntervals)) this.__activeIntervals.forEach(clearInterval);
//     if (Array.isArray(this.__activeTimeouts)) this.__activeTimeouts.forEach(clearTimeout);
//     if (Array.isArray(this.__activeListeners)) {
//       this.__activeListeners.forEach(l => l.target.removeEventListener(l.event, l.handler, l.options));
//     }

//     if ((this.__activeIntervals?.length || 0) || (this.__activeTimeouts?.length || 0) || (this.__activeListeners?.length || 0)) {
//       console.warn(`%c⚠ ${name} had active timers/listeners cleared before destroy`, "color: red; font-weight: bold;");
//     }
//   },

//   destroyed() {
//     const name = this.$options.name || "Anonymous";
//     const ignoredComponents = ["RouterLink", "transition", "KeepAlive", "Teleport","Anonymous","MemoryPanel"];

//     const endMemory = performance.memory?.usedJSHeapSize || 0;
//     const comp = window.__memoryPanelData.find(c => c.id === this._uid);
//     if (comp) {
//       comp.mounted = false;
//       comp.intervals = [];
//       comp.timeouts = [];
//       comp.listeners = [];
//       comp.memoryDiff = endMemory - (this.__startMemory || 0);
//     }

//     this.updateMemoryPanel();

//     if (!ignoredComponents.includes(name) && this.$el && this.$el.parentNode) {
//       console.warn(`⚠ ${name} may be leaking! Removing DOM node.`, this.$el);
//       this.$el.parentNode.removeChild(this.$el);
//     } else if (this.$el && this.$el.parentNode) {
//       this.$el.parentNode.removeChild(this.$el);
//     }

//     console.log(`✅ ${name} destroyed`);
//   }
// };


export default {
  data() {
    return {
      __activeIntervals: [],
      __activeTimeouts: [],
      __activeListeners: [],
      __startTime: null,
      __startMemory: 0
    };
  },

  beforeMount() {
    this.__activeIntervals = this.__activeIntervals || [];
    this.__activeTimeouts = this.__activeTimeouts || [];
    this.__activeListeners = this.__activeListeners || [];

 
      this.__startTime = performance.now();
      this.__startMemory = performance.memory?.usedJSHeapSize || 0;


    if (!window.__memoryPanelData) window.__memoryPanelData = [];
  },

  mounted() {
    const name = this.$options.name || "Anonymous";
    const mountTime = this.__startTime ? performance.now() - this.__startTime : 0;
    const SLOW_THRESHOLD = 40;

    console.log(
      `%c⏱ ${name} mounted in ${mountTime.toFixed(2)}ms`,
      `color: ${mountTime > SLOW_THRESHOLD ? "orange" : "#4caf50"}`
    );

    window.__memoryPanelData.push({
      id: this._uid,
      name,
      mounted: true,
      slow: mountTime > SLOW_THRESHOLD,
      intervals: this.__activeIntervals,
      timeouts: this.__activeTimeouts,
      listeners: this.__activeListeners,
      rerenders: 0,
      memoryDiff: 0
    });

    this.updateMemoryPanel();
  },

  updated() {
    const comp = window.__memoryPanelData.find(c => c.id === this._uid);
    if (comp) {
      comp.rerenders = (comp.rerenders || 0) + 1;
      this.updateMemoryPanel();
    }
  },

  methods: {
    $trackInterval(intervalId) {
      this.__activeIntervals.push(intervalId);
      return intervalId;
    },

    $trackTimeout(timeoutId) {
      this.__activeTimeouts.push(timeoutId);
      return timeoutId;
    },

    $trackListener(target, event, handler, options) {
      target.addEventListener(event, handler, options);
      this.__activeListeners.push({ target, event, handler, options });
    },

    updateMemoryPanel() {
      if (!window.__memoryPanelData) return;

      clearTimeout(this.__updateTimer);
      this.__updateTimer = setTimeout(() => {
        const data = window.__memoryPanelData.map(c => ({
          id: c.id,
          name: c.name,
          mounted: c.mounted,
          slow: c.slow,
          intervals: Array.isArray(c.intervals) ? c.intervals.length : 0,
          timeouts: Array.isArray(c.timeouts) ? c.timeouts.length : 0,
          listeners: Array.isArray(c.listeners) ? c.listeners.length : 0,
          rerenders: c.rerenders || 0,
          memoryDiff: c.memoryDiff || 0
        }));
        window.dispatchEvent(new CustomEvent("memory-panel-update", { detail: data }));
      }, 100);
    }
  },

  beforeDestroy() {
    const name = this.$options.name || "Anonymous";
    if (Array.isArray(this.__activeIntervals)) this.__activeIntervals.forEach(clearInterval);
    if (Array.isArray(this.__activeTimeouts)) this.__activeTimeouts.forEach(clearTimeout);
    if (Array.isArray(this.__activeListeners)) {
      this.__activeListeners.forEach(l => l.target.removeEventListener(l.event, l.handler, l.options));
    }
  },

  destroyed() {
    const name = this.$options.name || "Anonymous";
    const comp = window.__memoryPanelData.find(c => c.id === this._uid);
    if (comp) {
      comp.mounted = false;
      comp.intervals = [];
      comp.timeouts = [];
      comp.listeners = [];
      const endMemory = performance.memory?.usedJSHeapSize || 0;
      comp.memoryDiff = endMemory - (this.__startMemory || 0);
    }
    this.updateMemoryPanel();
  }
};

