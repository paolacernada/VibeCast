// src/router.js

import { createRouter, createWebHistory } from 'vue-router';
import WeatherHome from './components/weatherhome.vue';
import UserRegistration from './components/userregistration.vue';

const routes = [
  { path: '/', component: UserRegistration, meta: { requiresAuth: true } },
  { path: '/weather', component: WeatherHome }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;
