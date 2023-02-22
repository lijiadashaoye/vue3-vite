<template>
    <div class="makeComWap">
        <p>{{text}}</p>
        <button @click="toClose">关闭</button>
    </div>
</template>

<script setup>
defineProps({
    text: String
})
let toEmite = defineEmits(['close'])
function toClose() {
    toEmite('close', '自定义组件关闭了')
}
</script>
<style lang="scss">
.makeComWap {
    display: inline-block;
    padding: 10px 30px;
    border: 1px solid red
}
</style>