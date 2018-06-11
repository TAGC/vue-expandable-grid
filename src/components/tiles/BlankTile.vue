<template functional>
  <div :style="{height: props.size + 'px', width: props.size + 'px'}" />
</template>

<script lang="ts">
export default {
  props: {
    /**
     * The length and width of the tiles in pixels
     */
    size: Number,
  },
};
</script>

<style lang="scss" scoped>
</style>