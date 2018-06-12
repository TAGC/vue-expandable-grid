<template functional>
  <div class="tile-debug" :style="{height: props.size + 'px', width: props.size + 'px'}">
    <div>{{props.debug}}</div>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    /**
     * The debug information to display.
     */
    debug: String,

    /**
     * The length and width of the tiles in pixels
     */
    size: Number,
  },
};
</script>

<style lang="scss" scoped>
$border: 1px solid black;

.tile-debug {
  border-left: $border;
  border-top: $border;
  font-size: 12px;
}
</style>