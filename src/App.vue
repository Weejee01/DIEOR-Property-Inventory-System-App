<template>
  <div id="app">
    <header class="app-header">
      <img src="@/assets/dieor_logo.png" alt="DIEOR Logo" class="logo">
      <h1>DIEOR Property Inventory System</h1>
    </header>
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
.app-header {
  display: flex;
  align-items: center;
  padding: 10px;
}

.logo {
  height: 40px; /* Adjust this value to match your desired logo size */
  margin-right: 15px; /* Adjust this value to set the space between the logo and the text */
}

/* Add other custom styles if needed */
</style>