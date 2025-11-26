<template>
  <div>  
  
  
  <router-view></router-view> 
  <MemoryPanel />
  
  </div>
</template>

<script>
import MemoryPanel from "./MemoryPanel.vue";
// If you want a global header/footer, you would place them outside the router-view.
// For example:
// <template>
//   <AppHeader />
//   <router-view></router-view>
//   <AppFooter />
// </template>
export default {
  name: 'App',
  components: { MemoryPanel }
};

</script>

<style>
/* Global application styles */
</style>