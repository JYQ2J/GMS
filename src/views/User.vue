<template>
  <a-row>
    <a-table :data-source="tableList" row-key="name" :loading="loading" :pagination="false">
      <a-table-column title="用户名" data-index="name" align="center" :width="200">
        <a-row slot="filterDropdown" :gutter="[8, 6]" style="padding: 5px 8px; width: 200px;">
          <a-col :span="24">
            <a-input v-model="searchName" @pressEnter="search(searchName)" size="small" />
          </a-col>
          <a-col :span="12">
            <a-button block type="primary" size="small" @click="search(searchName)">查找</a-button>
          </a-col>
          <a-col :span="12">
            <a-button block size="small" @click="search()">重置</a-button>
          </a-col>
        </a-row>
        <a-icon
          slot="filterIcon"
          type="search"
          :style="`line-height: 53px; ${isFilter ? 'color: #108ee9;' : ''}`"
        />
      </a-table-column>
      <a-table-column title="用户权限" data-index="role" align="center" :width="400" />
      <a-table-column title="操作" align="center" :width="100">
        <template slot-scope="text, record">
          <a @click="edit(record)">编辑</a>
        </template>
      </a-table-column>
    </a-table>
    <a-modal
      :title="`用户权限 - ${form.name}`"
      :visible="editing"
      :confirm-loading="editLoading"
      @ok="update"
      @cancel="editing = false"
    >
      <a-row :gutter="[20, 20]">
        <a-col :span="6">
          <a-tag class="modal-tag">超级管理员</a-tag>
        </a-col>
        <a-col :span="18">
          <a-switch :checked="form.role === 'master'" @change="masterChange" />
        </a-col>
      </a-row>
      <a-row v-if="form.role !== 'master'" :gutter="[20, 20]">
        <a-col :span="6">
          <a-tag class="modal-tag">操作权限</a-tag>
        </a-col>
        <a-col :span="18">
          <a-checkbox-group v-model="roleList" :options="platformList" @change="roleChange" />
        </a-col>
      </a-row>
      <a-row v-if="form.role !== 'master'" :gutter="[20, 20]">
        <a-col :span="6">
          <a-tag class="modal-tag">只读权限</a-tag>
        </a-col>
        <a-col :span="18">
          <a-checkbox-group v-model="roleList" :options="platformListReadOnly" @change="roleChange" />
        </a-col>
      </a-row>
    </a-modal>
  </a-row>
</template>

<script>
import { http } from '../utils/http'
import { copyItem } from '../utils/tool'

let mockData = [{
  "name":"dev",
  "role":"master",
  "group":"ALL"
}]
const domain = 'xxx'

export default {
  data() {
    return {
      loading: false,
      form: {},
      roleList: [],
      editing: false,
      editLoading: false,
      list: [],
      tableList: [],
      isFilter: false,
      searchName: ''
    }
  },
  async mounted() {
    await this.getData()
    this.filterList()
  },
  computed: {
    role() {
      return this.$store.state.user.role || ''
    },
    platformList() {
      const list = ['PCW', 'PCA', 'PHW']
      return this.role === 'master' ? list : list.filter(item => this.role.split(',').includes(item))
    },
    platformListReadOnly() {
      return this.platformList.map(item => ({
        label: item,
        value: `${item}_READONLY`
      }))
    }
  },
  methods: {
    search(val) {
      this.isFilter = !!val
      this.searchName = val || ''
      this.filterList()
    },
    masterChange(val) {
      this.form.role = val ? 'master' : ''
    },
    roleChange(val) {
      this.form.role = val.join(',')
    },
    edit(item) {
      const { name, role = '' } = item || {}
      this.editing = true
      this.roleList = role === 'master' ? [] : role.split(',')
      this.form = {
        name,
        role,
        prevRole: role
      }
    },
    filterList() {
      this.tableList = this.searchName ? this.list.filter(item => item.name.includes(this.searchName)) : this.list
    },
    async update() {
      this.editLoading = true

      // MOCK注释
      // const data = await http(`http://${domain}/user/role`, {
      //   withCredentials: true,
      //   method: 'POST',
      //   data: {
      //     user: {
      //       business: 'strategy',
      //       name: this.form.name,
      //       role: this.form.prevRole
      //     },
      //     params: {
      //       role: this.form.role
      //     }
      //   }
      // })
      mockData = [{ ...mockData[0], role: this.form.role }]

      //请求成功
      if (true) {
        await this.getData()
        this.filterList()
        this.editing = false
      }
      this.editLoading = false
    },
    async getData() {
      this.loading = true

      // MOCK注释
      // this.list = await http(`http://${domain}/user/list`, {
      //   defaultData: [],
      //   params: {
      //     business: 'strategy'
      //   }
      // })
      this.list = mockData

      this.loading = false
    }
  }
}
</script>

<style scoped>
.modal-tag {
  width: 100px;
  text-align: center;
  font-size: 14px;
  line-height: 22px;
}
</style>