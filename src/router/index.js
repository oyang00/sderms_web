import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import List from '../components/forms/List'
import One from '../components/forms/One'
import My from '../components/forms/My'
import Propose from '../components/forms/Propose'
import Password from '../components/user/Password'
import Name from '../components/user/Name'
import StudentList from '../components/admin/StudentList'
import RepairList from '../components/admin/RepairList'
import DormitoryList from '../components/admin/DormitoryList'
import Register from '../components/Register'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/register',
    component: Register
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/forms/list',
    children: [
      {
        path: '/forms/list',
        component: List
      },
      {
        path: '/forms/one/:type/:account',
        component: One
      },
      {
        path: '/forms/my',
        component: My
      },
      {
        path: '/forms/propose',
        component: Propose
      },
      {
        path: '/user/password',
        component: Password
      },
      {
        path: '/user/name',
        component: Name
      },
      {
        path: '/admin/student_list',
        component: StudentList
      },
      {
        path: '/admin/repair_list',
        component: RepairList
      },
      {
        path: '/admin/dormitory_list',
        component: DormitoryList
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to：将要访问的路径
  // from：从那个路径来
  // next：是一个函数，表示放行
  if (to.path === '/login') return next()
  if (to.path === '/register') return next()
  // 获取 token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
