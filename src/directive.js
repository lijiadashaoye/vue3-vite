export default {
    makeFocus: {
        bind(...k) {
            // 当指令绑定到 HTML 元素上时触发.**只调用一次**
            console.log('自定义指令传参方式1，参数名：', k[1].arg)
            console.log('自定义指令传参方式2：参数值', k[1].value)
        },
        inserted(...k) {
            // 当绑定了指令的这个HTML元素插入到父元素上时触发.但不保证,父元素已经插入了 DOM 文档
            /*
              指令钩子函数会被传入以下参数：
                el：指令所绑定的元素，可以用来直接操作 DOM 。
                binding：一个对象，包含以下属性：
                name：指令名，不包括 v- 前缀。
                value：指令的绑定值，例如：v-my-directive=“1 + 1” 中，绑定值为 2。
                oldValue：指令绑定的前一个值，仅在 update 和 componentUpdated 钩子中可用。无论值是否改变都可用。
                expression：字符串形式的指令表达式。例如 v-my-directive=“1 + 1” 中，表达式为 “1 + 1”。
                arg：传给指令的参数，可选。例如 v-my-directive:foo 中，参数为 “foo”。
                modifiers：一个包含修饰符的对象。例如：v-my-directive.foo.bar 中，修饰符对象为 { foo: true, bar: true }。
                vnode： Vue编译生成的虚拟节点。移步 VNode API 来了解更多详情。
                oldVnode：上一个虚拟节点，仅在 update 和 componentUpdated 钩子中可用。
            */
            console.log('inserted', k)
            k[0].focus()
        },
        // updated(...k) {
        //     // 所在组件的`VNode`更新时(标签发生变化)调用，出发的很频繁
        //     console.log('updated', k)
        // },
        // componentUpdated(...k) {
        //     // 指令所在组件的 VNode 及其子 VNode 全部更新后(value发生变动)调用。
        //     console.log('componentUpdated', k)
        // },
        unbind(...k) {
            // 只调用一次，指令与元素解绑时调用，一般指切换页面或隐藏元素.
            console.log('unbind', k)
        }
    },
}