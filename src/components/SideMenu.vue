<template>
  <nav>
    <router-link
      to="/Import"
      :class="{ active: currentSheet === 'import' }"
    >
      Manage Spreadsheet
    </router-link>
    <router-link
      v-for="sheet in sheets"
      :key="sheet"
      :to="{ name: 'ViewExcel', params: { sheetName: sheet } }"
      :class="{ active: currentSheet === sheet }"
    >
      {{ sheet }}
    </router-link>
  </nav>
</template>


<script>
export default {
  props: ["sheets", "currentSheet"],
};
</script>

<style scoped>
nav {
  display: flex;
  flex-direction: column;
}

a {
  padding: 10px;
  text-decoration: none;
  color: #e65416;
}

a:hover {
  background-color: #f0f0f0;
}

a.active {
  background-color: #e65416;
  color: white;
}
</style>
