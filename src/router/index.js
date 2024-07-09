import { createRouter, createWebHistory } from 'vue-router'
import InventoryTable from '../components/InventoryTable.vue'

const routes = [
  {
    path: '/',
    name: 'InventoryTable',
    component: InventoryTable
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router