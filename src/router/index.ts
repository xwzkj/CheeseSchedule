import { createRouter, createWebHashHistory } from 'vue-router'
const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            name: 'home',
            path: '/',
            component: () => import('../pages/home.vue'),
        },
        {
            name: 'editor',
            path: '/editor',
            component: () => import('../pages/editor.vue')
        },
        {
            name: 'patternEditor',
            path: '/pattern/editor',
            component: () => import('../pages/patternEditor.vue')
        }
    ]
})

export default router
