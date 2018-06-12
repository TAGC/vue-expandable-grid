<template functional>
  <div :class="[props.alive ? 'cell-alive' : 'cell-dead']" />
</template>

<script lang="ts">
export default {
  props: {
    alive: {
      required: true,
      type: Boolean,
    },
  },
};
</script>

<style lang="scss" scoped>
.cell {
  height: 100%;
  width: 100%;
  background: var(--colour);
  border: thin solid black;
}

.cell-alive {
  @extend .cell;
  background: lightblue;
}

.cell-dead {
  @extend .cell;
  background: white;
}
</style>