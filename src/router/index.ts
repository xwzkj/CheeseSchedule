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
                    name: 'editor-home',
                    path: '',
                    component: () => import('../pages/editor-home.vue')
                },
                {
                    name: 'editor-pattern',
                    path: 'pattern',
                    component: () => import('../pages/editor-pattern.vue')
                },
                {
                    name: 'editor-schedule',
                    path: 'schedule',
                    component: () => import('../pages/editor-schedule.vue')
                },
                {
                    name: 'editor-override',
                    path: 'override',
                    component: () => import('../pages/editor-override.vue')
                },
                {
                    name: 'editor-draw',
                    path: 'draw',
                    component: () => import('../pages/editor-draw.vue')
                },
                {
                    name: 'editor-widget',
                    path: 'widget',
                    component: () => import('../pages/editor-widget.vue')

                },
                {
                    name: 'editor-setting',
                    path: 'setting',
                    component: () => import('../pages/editor-setting.vue')
                },
                {
                    name: 'editor-password',
                    path: 'password',
                    component: () => import('../pages/editor-password.vue')
                }
            ]
        },
        {
            name: 'draw',
            path: '/draw',
            children:[
                {
                    name: 'draw-home',
                    path: '',
                    component: () => import('../pages/draw-home.vue')
                },
                {
                    name: 'draw-float',
                    path: 'float',
                    component: () => import('../pages/draw-float.vue')
                }
            ]
        }

    ]
})

export default router
