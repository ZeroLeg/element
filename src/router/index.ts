import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'ListView',
      component: () => import('../views/listView.vue'),
    },
    {
      path: '/detail',
      name: 'DetailView',
      component: () => import('../views/detailView.vue'),
    },
  ],
})

export default router
