import { createRouter, createWebHistory } from 'vue-router'
import ImportExcel from '../components/ImportExcel.vue'
import ViewExcel from '../components/ViewExcel.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: ViewExcel
  },
  {
    path: '/import',
    name: 'ImportExcel',
    component: ImportExcel
  },
  {
    path: '/sheet/:sheetName',
    name: 'ViewExcel',
    component: ViewExcel,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router