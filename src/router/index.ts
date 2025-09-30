import { createRouter, createWebHashHistory } from 'vue-router'
const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            name: 'mainWindow',
            path: '/',
            component: () => import('../pages/mainWindow.vue'),
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
        },
        {
            name:'overrideEditor',
            path:'/override/editor',
            component: () => import('../pages/overrideEditor.vue')
        }
    ]
})

export default router
