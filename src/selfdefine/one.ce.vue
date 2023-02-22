<template>
  <p class="test">5555-{{ num }}</p>
</template>

<script>
export default {
  props: ["num"],
};
</script>

<style scoped>
.test {
  color: red;
}
</style>