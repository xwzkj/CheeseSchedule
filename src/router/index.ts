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
            component: () => import('../pages/editor-layout.vue'),
            children: [
                {
                    name: 'editorHome',
                    path: '',
                    component: () => import('../pages/editor-home.vue')
                },
                {
                    name: 'scheduleEditor',
                    path: 'schedule',
                    component: () => import('../pages/editor-schedule.vue')
                },
                {
                    name: 'patternEditor',
                    path: 'pattern',
                    component: () => import('../pages/editor-pattern.vue')
                },
                {
                    name: 'overrideEditor',
                    path: 'override',
                    component: () => import('../pages/editor-override.vue')
                },
                {
                    name: 'drawEditor',
                    path: 'draw',
                    component: () => import('../pages/editor-draw.vue')
                },
                {
                    name: 'widgetEditor',
                    path: 'widget',
                    component: () => import('../pages/editor-widget.vue')

                },
                {
                    name: 'setting',
                    path: 'setting',
                    component: () => import('../pages/editor-setting.vue')
                }
            ]
        },

    ]
})

export default router
