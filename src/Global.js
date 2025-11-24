// src/global.js
export default {
  data() {
    return {
      globalVersion: "1.0.0"
    };
  },

  computed: {
    appName() {
      return "My Vue App";
    }
  },

  methods: {
    $formatDate(date) {
      if (!date) return "-";
      return new Date(date).toLocaleDateString();
    }
  }
};
