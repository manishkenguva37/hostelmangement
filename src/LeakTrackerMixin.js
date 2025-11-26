// LeakTrackerMixin.js
export default {
  data() {
    return {
      __activeIntervals: [],
      __activeTimeouts: [],
      __activeListeners: []
    };
  },

  beforeMount() {
    this.__startTime = performance.now();
    if (!window.__memoryPanelData) window.__memoryPanelData = [];
  },

  mounted() {
    const name = this.$options.name || "Anonymous";
    const mountTime = performance.now() - this.__startTime;
    const SLOW_THRESHOLD = 40;

    if (mountTime > SLOW_THRESHOLD) {
      console.warn(
        `%c⚠ SLOW MOUNT: ${name} took ${mountTime.toFixed(2)}ms`,
        "color: orange; font-weight: bold;"
      );
    } else {
      console.log(
        `%c⏱ ${name} mounted in ${mountTime.toFixed(2)}ms`,
        "color: #4caf50"
      );
    }

    // Add component to global memory panel (single entry)
    window.__memoryPanelData.push({
      id: this._uid,
      name,
      mounted: true,
      slow: mountTime > SLOW_THRESHOLD,
      intervals: this.__activeIntervals,
      timeouts: this.__activeTimeouts,
      listeners: this.__activeListeners,
      rerenders: 0 // initial rerender count
    });

    this.updateMemoryPanel();
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
      const data = window.__memoryPanelData.map(c => ({
        id: c.id,
        name: c.name,
        mounted: c.mounted,
        slow: c.slow,
        intervals: c.intervals.length,
        timeouts: c.timeouts.length,
        listeners: c.listeners.length,
        rerenders: c.rerenders || 0
      }));
      window.dispatchEvent(
        new CustomEvent("memory-panel-update", { detail: data })
      );
    }
  },

  beforeDestroy() {
    const name = this.$options.name || "Anonymous";
    console.log(`🧹 ${name} is being destroyed`);

    this.__activeIntervals.forEach(clearInterval);
    this.__activeTimeouts.forEach(clearTimeout);
    this.__activeListeners.forEach(l =>
      l.target.removeEventListener(l.event, l.handler, l.options)
    );

    if (
      this.__activeIntervals.length ||
      this.__activeTimeouts.length ||
      this.__activeListeners.length
    ) {
      console.warn(
        `%c⚠ ${name} had active timers/listeners cleared before destroy`,
        "color: red; font-weight: bold;"
      );
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
    }

    this.updateMemoryPanel();

    console.log(`✅ ${name} destroyed`);
  }
};
