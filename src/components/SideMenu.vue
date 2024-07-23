<template>
  <nav>
    <a 
      v-for="sheet in sheets" 
      :key="sheet" 
      href="#" 
      @click="$emit('selectSheet', sheet)"
      :class="{ active: currentSheet === sheet }"
    >
      {{ sheet }}
    </a>
    <a 
      href="#" 
      @click="$emit('selectSheet', 'import')"
      :class="{ active: currentSheet === 'import' }"
    >
      Manage Spreadsheet
    </a>
  </nav>
</template>

<script>
export default {
  props: ['sheets', 'currentSheet'],
}
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