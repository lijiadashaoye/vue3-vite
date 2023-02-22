<template>
    <div>
        <input @input="moFn" :value="modelValue" />
        <p>child2:{{modelValue}}</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
defineProps({
    modelValue: String | Number
});
let emits = defineEmits(['update:modelValue']);
function moFn(e) {
    let val = e.target.value;
    emits('update:modelValue', val)
}
</script>
