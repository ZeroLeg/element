import { createRouter, createWebHistory } from 'vue-router'
import ListView from '@/views/ListView.vue'
import DetailView from '@/views/DetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'record-list',
      component: ListView,
    },
    {
      path: '/records/:id',
      name: 'record-detail',
      component: DetailView,
      props: true,
    },
  ],
})

export default router
