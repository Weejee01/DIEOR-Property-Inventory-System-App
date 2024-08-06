import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    redirect: '/Import',
  },
  {
    path: '/Import',
    name: 'ImportExcel',
    component: () => import('../components/ImportExcel.vue'),
  },
  {
    path: '/sheet/:sheetName',
    name: 'ViewExcel',
    component: () => import('../components/ViewExcel.vue'),
    props: true,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  console.log(`Router: Navigating from ${from.path} to ${to.path}`);
  next();
});

export default router;
