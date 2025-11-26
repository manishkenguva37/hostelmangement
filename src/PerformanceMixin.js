export default {
  beforeMount() {
    if (import.meta.env.DEV) {
      this.__startTime = performance.now();
    }
  },

  mounted() {

      const name = this.$options.name || "Anonymous";
      const mountTime = performance.now() - this.__startTime;

      const SLOW_THRESHOLD = 40; // ms

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

  },

  beforeDestroy() {

      const name = this.$options.name || "Anonymous";
      console.log(`🧹 ${name} is being destroyed`);

  },

  destroyed() {

      const name = this.$options.name || "Anonymous";
      console.log(`✅ ${name} destroyed`);

  }
};
