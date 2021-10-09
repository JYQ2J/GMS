import Vue from 'vue'
import Vuex from 'vuex'
import { copyItem, obj2Tree } from '../utils/tool'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: {
      name: '',
      role: ''
    },
    childrenClip: [],
    nodeClip: null,
    extraClip: null,
    initTree: [],
    transIndex: -1
  },
  mutations: {
    updateUser(state, user) {
      state.user = user
    },
    updateChildrenClip(state, clip) {
      state.childrenClip = copyItem(clip)
    },
    updateNodeClip(state, clip) {
      state.nodeClip = copyItem(clip)
    },
    updateExtraClip(state, clip) {
      state.extraClip = copyItem(clip)
    },
    updateInitTree(state, data) {
      state.initTree = Object.keys(data).filter(key => key).map(key => obj2Tree(data[key], key))
    },
    updateTransIndex(state, data) {
      state.transIndex = data
    }
  },
  actions: {},
  modules: {}
})