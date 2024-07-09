<template>
  <div>
    <!-- Toggle button -->
    <button
      class="btn btn-primary"
      type="button"
      @click="toggleMenu"
    >
      Toggle Menu
    </button>

    <!-- Offcanvas menu -->
    <div
      class="offcanvas offcanvas-start"
      :class="{ show: isMenuOpen }"
      tabindex="-1"
      id="offcanvasMenu"
      aria-labelledby="offcanvasMenuLabel"
      style="visibility: visible;"
    >
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="offcanvasMenuLabel">Menu</h5>
        <button
          type="button"
          class="btn-close text-reset"
          aria-label="Close"
          @click="toggleMenu"
        ></button>
      </div>
      <div class="offcanvas-body">
        <ul class="nav flex-column">
          <li class="nav-item">
            <a class="nav-link" href="#">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Inventory</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SideMenu',
  data() {
    return {
      isMenuOpen: false
    }
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    }
  }
}
</script>

<style scoped>
.offcanvas {
  transition: transform 0.3s ease-in-out;
  transform: translateX(-100%);
  visibility: hidden;
}

.offcanvas.show {
  transform: translateX(0);
  visibility: visible;
}
</style>
