<template>
  <div id="app">
    <SideMenu />
    <div class="container mt-3">
      <router-view />
      <ImportExcel />
    </div>
  </div>
</template>

<script>
import SideMenu from './components/SideMenu.vue'
import ImportExcel from './components/ImportExcel.vue'

export default {
  components: {
    SideMenu,
    ImportExcel
  }
}
</script>

<style>
/* Add custom styles if needed */
</style>
