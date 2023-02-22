import {
    createStore
} from 'vuex'

const store = createStore({
    state() {
        return {
            count: 0,

        }
    },
    mutations: {
        increment(state) {
            state.count++;
        },
    },
    modules: {
        isModule: {
            state: '55555'
        }
    }
})
export default store