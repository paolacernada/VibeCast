// src/router.js

import { createRouter, createWebHistory } from 'vue-router';
import WeatherHome from './components/weatherhome.vue';
import UserRegistration from './components/userregistration.vue';

const routes = [
    { path: '/', component: UserRegistration },
    { path: '/weather', component: WeatherHome, meta: { requiresAuth: true } }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/'); // Redirect to login if not authenticated
    } else {
        next(); // Proceed if authenticated or the route doesn't require auth
    }
});


export default router;
