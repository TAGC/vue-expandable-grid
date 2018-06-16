<template>
  <md-card class="md-elevation-20">
    <md-card-content>
      <slot />
    </md-card-content>
  </md-card>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import Control from "./Control.vue";

@Component({ components: { Control } })
export default class Card extends Vue {
}
</script>

<style lang="scss" scoped>
@import "variables";

.md-card {
  font-size: $font-size;
  position: absolute;
  width: 100%;
  height: 100%;
  background: white;
  border: thin solid black;

  .md-card-content {
    font-size: $font-size;
  }
}
</style>
