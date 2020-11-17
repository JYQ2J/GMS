<template>
  <a-layout id="components-layout-demo-responsive" style="min-width: 1200px; min-height: 100vh;">
    <a-layout-sider
      theme="light"
      breakpoint="md"
      collapsed-width="80"
      @collapse="onCollapse"
    >
      <a-icon v-if="isCollapse" class="m-logo" type="control" theme="twoTone" />
      <a-page-header v-else title="奇策" sub-title="策略配置中心" />
      <a-menu mode="inline" v-model="currentName">
        <a-menu-item
          v-for="item in pathList"
          :key="item.name"
          @click="switchRoute(item.platform, item.name)"
        >
          <a-icon :type="item.icon" />
          <span>{{ item.name }}</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0 20px;">
        <b v-if="adminList.includes(currentPageName)">
          <a-dropdown>
            <a class="ant-dropdown-link">
              <a-icon type="switcher" theme="filled" />
              <span> {{ currentPlatform.toUpperCase() }} </span>
              <a-icon type="down" />
            </a>
            <a-menu slot="overlay">
              <a-menu-item
                v-for="(item, index) in platformList"
                :key="index"
                @click="switchRoute(item)"
              >{{ item }}</a-menu-item>
            </a-menu>
          </a-dropdown>
        </b>
        <a-dropdown-button style="float: right;">
          <span>{{ username }}</span>
          <a-menu slot="overlay">
            <a-menu-item @click="logout">
              <a-icon type="logout" />
              <span>退出登录</span>
            </a-menu-item>
          </a-menu>
          <a-icon slot="icon" type="user" />
        </a-dropdown-button>
      </a-layout-header>
      <a-layout-content style="margin: 24px 16px 0;">
        <a-breadcrumb v-if="adminList.includes(currentPageName)" style="margin: 0 8px 10px;">
          <a-breadcrumb-item style="color: #1890ff; font-weight: 700;">
            <a-icon type="switcher" theme="filled" />
            <span>{{ currentPlatform.toUpperCase() }}</span>
          </a-breadcrumb-item>
          <a-breadcrumb-item>{{ currentPageName }}</a-breadcrumb-item>
        </a-breadcrumb>
        <router-view class="content-view" />
      </a-layout-content>
      <a-layout-footer style="text-align: center;">
        <a-icon type="github" style="font-size: 24px; margin-right: 5px;" />
        <span style="font-size: 15px;">
          Build By <a href="https://github.com/JYQ2J" target="_blank">JYQ2J</a>.
        </span>
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script>
import { http } from './utils/http'

export default {
  data() {
    return {
      isCollapse: false,
      currentName: [this.$route.name],
      currentPlatform: this.$route.params.platform,
      menuIgnoreList: ['404']
    }
  },
  watch: {
    $route: {
      immediate: true,
      async handler(to, from) {
        const routeName = to.name
        if (!from) {
          const { name, role } = process.env.NODE_ENV !== 'development' ? (this.auth() || {}) : {
            name: 'dev',
            role: 'master'
          }
          if (name) {
            this.$store.commit('updateUser', { name, role })
          } else {
            this.login()
          }
        }
        if (!routeName || (
          this.adminList.includes(routeName)
          && !this.platformList.includes(to.params.platform.toUpperCase())
        ) || (
          this.masterList.includes(routeName)
          && this.role !== 'master'
        )) {
          this.switchRoute(this.defaultPlatform, '404')
        }
      }
    }
  },
  methods: {
    auth() {
      // 鉴权操作
    },
    login() {
      // 登录操作
    },
    logout() {
      // 退出登录
    },
    onCollapse(collapsed, type) {
      this.isCollapse = collapsed
    },
    switchRoute(platform, name = '') {
      platform = platform.toLowerCase()
      name = name || this.$route.name
      if (this.currentPlatform !== platform || !this.currentName.includes(name)) {
        this.currentName = [name]
        this.currentPlatform = platform
        this.$router.push({ name, params: { platform } })
      }
    },
  },
  computed: {
    username() {
      return this.$store.state.user.name || ''
    },
    role() {
      return this.$store.state.user.role || ''
    },
    defaultPlatform() {
      const role = this.role.split(',')[0]
      return role === 'master' ? 'pcw' : role;
    },
    platformList() {
      const list = ['PCW', 'PCA', 'PHW']
      return this.role === 'master' ? list : list.filter(item => this.role.split(',').includes(item))
    },
    masterList() {
      return (this.$router.options.routes || []).filter(item => item.master).map(item => item.name)
    },
    adminList() {
      return (this.$router.options.routes || []).filter(item => item.admin).map(item => item.name)
    },
    pathList() {
      return (this.$router.options.routes || []).map(item => ({
        ...item,
        platform: this.currentPlatform || this.defaultPlatform
      })).filter(item => (
        !this.menuIgnoreList.includes(item.name) && (
          (!item.admin && !item.master) || 
          this.role === 'master' ||
          (item.admin && this.role)
        )
      ))
    },
    currentPageName() {
      return this.$route.name
    }
  }
}
</script>

<style>
#components-layout-demo-responsive .logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px;
}
.content-view {
  background: #fff;
  padding: 24px;
  height: auto;
  min-height: calc(100vh - 188px);
}
.mt-30 {
  margin-top: 30px;
}
.mt-20 {
  margin-top: 20px;
}
.mt-15 {
  margin-top: 15px;
}
.mt-10 {
  margin-top: 10px;
}
.mt-5 {
  margin-top: 5px;
}
.ml-16 {
  margin-left: 16px;
}
.ml-24 {
  margin-left: 24px;
}
.pd-0 {
  padding: 0;
}
.pd-20 {
  padding: 20px;
}
.width-90 {
  width: 90px;
}
.width-50 {
  width: 50px;
}
.height-24 {
  line-height: 24px;
  height: 24px;
}
.a-switch {
  margin: 0;
}
.relative {
  position: relative;
}
.inline-block {
  display: inline-block;
  width: auto;
  margin-right: 10px;
}
.center-100 {
  width: 100%;
  text-align: center;
}
.center-50 {
  width: 50%;
  text-align: center;
}
.center {
  text-align: center;
}
.right {
  text-align: right;
}
.fl {
  float: left;
  width: auto;
}
.fr {
  float: right;
  width: auto;
}
.mask {
  position: absolute;
  z-index: 1;
  width: calc(100% - 60px);
  height: 100%;
  margin: -80px 0;
  background-color: transparent;
  cursor: not-allowed;
}
.tip-item {
  width: calc(100% - 36px);
}
.m-logo {
  width: 100%;
  height: 64px;
  font-size: 28px;
  padding-top: 18px;
}
</style>
