import {
    createRouter,
    createWebHashHistory
} from 'vue-router'

const routes = [
    {
        name: 'one',
        path: '/',
        component: () => import('@/components/one.vue')
    },
    {
        name: 'two',
        path: '/two/:obj2/:id',
        component: () => import('@/components/two.vue'),
        // 将路由参数作为组件props
        props: route => ({
            query: route.query,
            params: route.params,
        })
    },
    {
        name: 'three',
        path: '/three',
        component: () => import('@/components/three.vue')
    },
    {
        name: 'four',
        path: '/four',
        component: () => import('@/components/four.vue')
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router