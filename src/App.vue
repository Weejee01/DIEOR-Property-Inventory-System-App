<template>
  <div id="app">
    <SideMenu />
    <div class="container mt-3">
      <router-view />
    </div>
  </div>
</template>

<script>
import SideMenu from './components/SideMenu.vue'

export default {
  components: {
    SideMenu
  }
}
</script>

<style>
/* Add custom styles if needed */
</style>
