<template functional>
  <div class="cell" :class="{ disabled: props.disabled }" :style="{ background: props.color }" />
</template>

<script lang="ts">
export default {
  props: {
    color: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      required: false,
    },
  },
};
</script>

<style lang="scss" scoped>
.cell {
  height: 100%;
  width: 100%;
  transition: opacity 0.5s linear;
  opacity: 1;
  margin: 1px;

  &.disabled {
    opacity: 0.5;
  }
}
</style>