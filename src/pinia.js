
import { createPinia, defineStore, acceptHMRUpdate } from 'pinia'
import { pinia1Store } from './pinia1'
const pinia = createPinia();

const store = defineStore('counter', {
    state: () => ({
        count: 0,
        age: 0
    }),
    // 可通过 this 访问整个 store 实例
    getters: {
        double: (state) => state.count * 2,
        double1() { return this.count * 2 },
    },
    actions: {
        increment() {
            setTimeout(() => { this.count++; }, 1000)
        },
        mixStore() {
            // 使用其他store
            let pinia1 = pinia1Store();
            pinia1.addage();// 执行 actions
            this.age = pinia1.getAge // 执行getters
        }
    },
})

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(store, import.meta.hot))
}
export default { store, pinia }