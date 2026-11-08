import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    // login status
    isAuthenticated: localStorage.getItem("isauthicated") === 'true',

    // ADD THIS ↓↓↓
    user: JSON.parse(localStorage.getItem("user")) || {
      name: "Guest",
      email: ""
    }
  },

  getters: {
    isAuthenticated: state => state.isAuthenticated,
    user: state => state.user
  },

  mutations: {
    SET_AUTH_STATUS(state, status) {
      state.isAuthenticated = status
      localStorage.setItem("isauthicated", status ? 'true' : 'false')
    },

    // ADD THIS ↓↓↓
    SET_USER(state, userData) {
      state.user = userData
      localStorage.setItem("user", JSON.stringify(userData))
    }
  },

  actions: {
    login({ commit }, userData) {
      // You can pass user details during login
      commit('SET_AUTH_STATUS', true)
      commit('SET_USER', userData)
    },

    logout({ commit }) {
      commit('SET_AUTH_STATUS', false)
      commit('SET_USER', { name: "Guest", email: "" })
      localStorage.removeItem("user")
    }
  }
})

export default store
