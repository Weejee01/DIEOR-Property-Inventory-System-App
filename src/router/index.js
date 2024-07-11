import { createRouter, createWebHistory } from 'vue-router'
import SideMenu from '../components/SideMenu.vue'
import ImportExcel from '../components/ImportExcel.vue'

const routes = [
  {
    path: '/side-menu',
    name: 'SideMenu',
    component: SideMenu
  },
  {
    path: '/import-excel',
    name: 'ImportExcel',
    component: ImportExcel
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router