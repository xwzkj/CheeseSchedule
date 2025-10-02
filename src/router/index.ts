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
            component: () => import('../pages/editorLayout.vue'),
            children: [
                {
                    name: 'editorHome',
                    path: '',
                    component: () => import('../pages/editorHome.vue')
                },
                {
                    name: 'scheduleEditor',
                    path: 'schedule',
                    component: () => import('../pages/scheduleEditor.vue')
                },
                {
                    name: 'patternEditor',
                    path: 'pattern',
                    component: () => import('../pages/patternEditor.vue')
                },
                {
                    name: 'overrideEditor',
                    path: 'override',
                    component: () => import('../pages/overrideEditor.vue')
                },
                {
                    name: 'widgetEditor',
                    path: 'widget',
                    component: () => import('../pages/widgetEditor.vue')

                }
            ]
        },

    ]
})

export default router
