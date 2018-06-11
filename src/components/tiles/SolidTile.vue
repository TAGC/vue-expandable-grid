<template functional>
  <div
    class="tile-solid"
    :style="{height: props.size + 'px', width: props.size + 'px', background: props.color}"
  />
</template>

<script lang="ts">
export default {
  props: {
    /**
     * The background colour of the tile.
     */
    color: String,

    /**
     * The length and width of the tiles in pixels
     */
    size: Number,
  },
};
</script>

<style lang="scss" scoped>
$border: 1px solid black;

.tile-solid {
  border-left: $border;
  border-top: $border;
}
</style>