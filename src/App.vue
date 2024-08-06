<template>
  <div id="app">
    <header :class="{ shifted: isSidebarOpen }">
      <div class="menu-icon" @click="toggleSidebar">&#9776;</div>
      <img src="@/assets/dieor_logo.png" alt="DIEOR Logo" class="logo" />
      <h1>DIEOR Property Inventory System</h1>
    </header>
    <aside :class="{ open: isSidebarOpen }">
      <div class="close-btn" @click="toggleSidebar">&times;</div>
      <SideMenu
        :sheets="sheets"
        :currentSheet="$route.params.sheetName || 'import'"
        @selectSheet="selectSheet"
      />
    </aside>
    <div :class="{ 'main-content': true, shifted: isSidebarOpen }">
      <router-view @importComplete="handleImportComplete" />
    </div>
  </div>
</template>

<script>
import SideMenu from "./components/SideMenu.vue";

export default {
  components: {
    SideMenu,
  },
  data() {
    return {
      isSidebarOpen: false,
      sheets: [],
    };
  },
  async mounted() {
    await this.loadExistingData();
  },
  methods: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },
    async handleImportComplete(sheetNames) {
      this.sheets = sheetNames;
      if (sheetNames.length > 0) {
        this.$router.push({
          name: "ViewExcel",
          params: { sheetName: sheetNames[0] },
        });
      }
    },
    selectSheet(sheetName) {
      if (sheetName === "import") {
        this.$router.push({ name: "ImportExcel" });
      } else {
        this.$router.push({ name: "ViewExcel", params: { sheetName } });
      }
    },
    async loadExistingData() {
      try {
        const jsonData = await window.electron.loadJsonFile(
          "imported_data.json"
        );
        if (jsonData) {
          const allSheets = JSON.parse(jsonData);
          this.sheets = Object.keys(allSheets);
          if (this.sheets.length > 0) {
            this.$router.push({
              name: "ViewExcel",
              params: { sheetName: this.sheets[0] },
            });
          } else {
            this.$router.push({ name: "ImportExcel" });
          }
        } else {
          this.$router.push({ name: "ImportExcel" });
        }
      } catch (err) {
        console.error("App: Error loading existing data:", err);
        this.$router.push({ name: "ImportExcel" });
      }
    },
  },
};
</script>

<style>
/* Add your existing styles here */
header {
  display: flex;
  align-items: center;
  background-color: #333;
  color: #fff;
  padding: 10px;
  transition: margin-left 0.1s;
}
header.shifted {
  margin-left: 200px; /* This should match the width of your sidebar */
}
.menu-icon {
  cursor: pointer;
  font-size: 24px;
  margin-right: 15px;
}

.logo {
  height: 50px;
  margin-right: 10px;
}

h1 {
  flex: 1;
}

aside {
  position: fixed;
  top: 0;
  left: 0;
  width: 200px;
  height: 100%;
  background-color: #333;
  color: #fff;
  padding-top: 60px;
  transform: translateX(-200px);
  transition: transform 0.1s;
  z-index: 1000;
}

aside.open {
  transform: translateX(0);
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  cursor: pointer;
  color: #fff;
}

aside nav {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
}

aside nav a {
  padding: 10px;
  text-decoration: none;
  color: #42b983;
}

aside nav a.router-link-active {
  font-weight: bold;
}

.main-content {
  transition: margin-left 0.1s;
  padding-left: 5px;
}

.main-content.shifted {
  margin-left: 200px;
}

.container {
  margin-top: 60px;
}
</style>
