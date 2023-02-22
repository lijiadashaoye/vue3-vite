<template>
    <div>
        <input @input="moFn" :value="modelValue" />
        <p>child1:{{modelValue}}</p>
    </div>
</template>

<script>
export default {
    props: ['modelValue'],
    methods: {
        moFn(e) {
            let val = e.target.value
            this.$emit('update:modelValue', val)
        }
    }
}
</script>
