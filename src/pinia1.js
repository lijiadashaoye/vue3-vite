
import { defineStore, acceptHMRUpdate } from 'pinia'

export const pinia1Store = defineStore('pinia1', {
    state: () => ({
        age: 0
    }),
    getters: {
        getAge: (state) => state.age
    },
    actions: {
        addage() {
            this.$patch({
                age: ++this.age
            })
        }
    },
})
// 使页面支持热更新
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(pinia1Store, import.meta.hot))
}