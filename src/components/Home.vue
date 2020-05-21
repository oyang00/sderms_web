<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/images/home_logo.png" alt="">
        <span>学生宿舍设备报修管理系统</span>
      </div>
      <el-dropdown @command="handleCommand">
        <span class="el-dropdown-link">
          <span v-if="type == 0">{{this.user.name}} ({{this.user.account}})</span>
          <span v-else>{{this.user.account}}</span>
          <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-if="type == '0'" command="dormitory">宿舍：{{this.user.dormitory.name}}</el-dropdown-item>
          <el-dropdown-item command="logout">注销</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <!--      <el-button type="info" @click="logout">注销</el-button>-->
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏测单区域 -->
        <el-menu router :collapse-transition="false" :collapse="isCollapse" unique-opened
                 background-color="#333744"
                 text-color="#fff" active-text-color="#409eff" :default-active="activePath">
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="item.icon"></i>
              <!-- 文本 -->
              <span>{{item.name}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id"
                          @click="saveNavState('/' + subItem.path)">
              <template slot="title">
                <!-- 图标 -->
                <i :class="subItem.icon"></i>
                <!-- 文本 -->
                <span>{{subItem.name}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view/>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    data () {
      return {
        // 用户类型
        type: '0',
        // 用户数据
        user: {
          account: '',
          name: '',
          dormitory: {
            id: -1,
            name: ''
          }
        },
        // 左侧菜单数据
        menuList: [],
        // 是否折叠
        isCollapse: false,
        // 被激活的链接地址
        activePath: 'forms/list'
      }
    },
    created () {
      this.activePath = window.sessionStorage.getItem('activePath')
      this.getStorageUser()
      this.menuInit()
    },
    methods: {
      // 菜单初始化
      async menuInit () {
        if (this.type === '0') {
          // 学生
          this.menuList = [
            {
              id: 1,
              icon: 'el-icon-s-order',
              name: '报修表单',
              children: [
                {
                  id: 101,
                  icon: 'el-icon-document',
                  name: '报修列表',
                  path: 'forms/list'
                },
                {
                  id: 102,
                  icon: 'el-icon-document-remove',
                  name: '我的报修',
                  path: 'forms/my'
                },
                {
                  id: 103,
                  icon: 'el-icon-document-add',
                  name: '提出报修',
                  path: 'forms/propose'
                }
              ]
            },
            {
              id: 2,
              icon: 'el-icon-user-solid',
              name: '我',
              children: [
                {
                  id: 201,
                  icon: 'el-icon-setting',
                  name: '修改姓名',
                  path: 'user/name'
                },
                {
                  id: 202,
                  icon: 'el-icon-lock',
                  name: '修改密码',
                  path: 'user/password'
                }
              ]
            }
          ]
          return
        }

        if (this.type === '1') {
          // 维修人员
          this.menuList = [
            {
              id: 1,
              icon: 'el-icon-s-order',
              name: '报修表单',
              children: [
                {
                  id: 101,
                  icon: 'el-icon-document',
                  name: '报修列表',
                  path: 'forms/list'
                },
                {
                  id: 102,
                  icon: 'el-icon-document-remove',
                  name: '我的报修',
                  path: 'forms/my'
                }
              ]
            },
            {
              id: 2,
              icon: 'el-icon-user-solid',
              name: '我',
              children: [
                {
                  id: 201,
                  icon: 'el-icon-lock',
                  name: '修改密码',
                  path: 'user/password'
                }
              ]
            }
          ]
          return
        }

        if (this.type === '2') {
          // 管理员
          this.menuList = [
            {
              id: 1,
              icon: 'el-icon-s-order',
              name: '报修表单',
              children: [
                {
                  id: 101,
                  icon: 'el-icon-document',
                  name: '报修列表',
                  path: 'forms/list'
                }
              ]
            },
            {
              id: 2,
              icon: 'el-icon-user-solid',
              name: '学生管理',
              children: [
                {
                  id: 201,
                  icon: 'el-icon-user',
                  name: '学生列表',
                  path: 'admin/student_list'
                }
              ]
            },
            {
              id: 3,
              icon: 'el-icon-s-check',
              name: '维修人员管理',
              children: [
                {
                  id: 301,
                  icon: 'el-icon-user',
                  name: '维修人员列表',
                  path: 'admin/repair_list'
                }
              ]
            },
            {
              id: 4,
              icon: 'el-icon-s-shop',
              name: '宿舍管理',
              children: [
                {
                  id: 401,
                  icon: 'el-icon-school',
                  name: '宿舍列表',
                  path: 'admin/dormitory_list'
                }
              ]
            }
          ]
          return
        }
        this.$message.error('登录发生错误')
        const { data: res } = await this.$http.put('user/logout')
        if (res.code !== 200) this.$message.error(res.msg)
        window.sessionStorage.clear()
        await this.$router.push('/login')
      },
      // 用户信息操作
      async handleCommand (command) {
        if (command === 'logout') {
          const { data: res } = await this.$http.put('user/logout')
          if (res.code !== 200) this.$message.error(res.msg)
          this.$message.success(res.msg)
          window.sessionStorage.clear()
          await this.$router.push('/login')
        }
      },
      // 获取存储的用户信息
      getStorageUser () {
        this.user = JSON.parse(window.sessionStorage.getItem('user'))
        this.type = window.sessionStorage.getItem('type')
      },
      // 菜单折叠与展开
      toggleCollapse () {
        this.isCollapse = !this.isCollapse
      },
      // 保存链接的激活状态
      saveNavState (activePath) {
        window.sessionStorage.setItem('activePath', activePath)
        this.activePath = activePath
      }
    }
  }
</script>

<style scoped lang="less">
  .home-container {
    height: 100%;
  }

  .el-header {
    background-color: #7093DB;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;

    > div {
      display: flex;
      align-items: center;
      height: inherit;

      > span {
        margin-left: 15px;
      }

      > img {
        height: 50px;
        padding-left: 10px;
      }
    }
  }

  .el-dropdown-link {
    cursor: pointer;
    color: #fff;
    font-size: 18px;
  }

  .el-aside {
    background-color: #333744;

    .el-menu {
      border-right: none;
    }
  }

  .el-main {
    background-color: #eaedf1;
  }

  .toggle-button {
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
</style>
