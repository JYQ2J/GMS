import Vue from 'vue'
import Vuex from 'vuex'
import { copyItem } from '../utils/tool'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: {
      name: '',
      role: ''
    },
    childrenClip: []
  },
  mutations: {
    updateUser(state, user) {
      state.user = user
    },
    updateChildrenClip(state, clip) {
      state.childrenClip = copyItem(clip)
    }
  },
  actions: {},
  modules: {}
})