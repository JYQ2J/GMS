import Vue from 'vue'
import VueRouter from 'vue-router'
import About from '../views/About.vue'
import Api from '../views/Api.vue'
import Block from '../views/Block.vue'
import Statistic from '../views/Statistic.vue'
import User from '../views/User.vue'
import Empty from '../views/404.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    {
      path: '/',
      name: '概述',
      icon: 'appstore',
      component: About
    },
    {
      admin: true,
      path: '/block/:platform',
      name: '模块管理',
      icon: 'block',
      component: Block
    },
    {
      admin: true,
      path: '/api/:platform',
      name: '数据源管理',
      icon: 'api',
      component: Api
    },
    {
      master: true,
      path: '/user',
      name: '用户权限',
      icon: 'user',
      component: User
    },
    {
      path: '/statistic/:platform',
      name: '统计',
      icon: 'stock',
      component: Statistic
    },
    {
      path: '/404',
      name: '404',
      component: Empty
    },
    {
      path: '*',
      name: '404',
      redirect: '/404'
    }
  ]
})

export default router
