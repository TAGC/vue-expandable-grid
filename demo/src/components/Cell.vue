<template>
  <div :class="[alive ? 'cell-alive' : 'cell-dead']" />
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

@Component
export default class Cell extends Vue {
  @Prop({ required: true })
  private alive: boolean;
}
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