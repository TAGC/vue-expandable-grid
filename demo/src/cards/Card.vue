<template>
  <md-card class="md-elevation-20">
    <md-card-content>
      <div class="card-content-layout">
        <div v-if="nextCardDirection" :class="`card-pointer-${nextCardDirection}`">
          <md-icon>{{cardPointer}}</md-icon>
        </div>
        <div class="card-body">
          <slot />
        </div>
      </div>
    </md-card-content>
  </md-card>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import Control from "./Control.vue";

type NextCardDirection = "up" | "down" | "left" | "right";

@Component({ components: { Control } })
export default class Card extends Vue {
  @Prop({ default: undefined })
  private nextCardDirection: NextCardDirection | undefined;

  private get cardPointer(): string {
    switch (this.nextCardDirection) {
      case undefined: return "";
      case "up": return "expand_less";
      case "down": return "expand_more";
      case "left": return "chevron_left";
      case "right": return "chevron_right";
      default: throw new Error(`Invalid direction: ${this.nextCardDirection}`);
    }
  }
}
</script>

<style lang="scss" scoped>
@import "variables";
$pointer-section: 50px;
$pointer-movement: calc(#{$pointer-section} / 5);
$neg-pointer-movement: calc(-#{$pointer-section} / 5);

.md-card {
  font-size: $font-size;
  position: absolute;
  width: 100%;
  height: 100%;
  background: white;
  border: thin solid black;
  user-select: none;

  .md-card-content {
    font-size: $font-size;
    padding: 0;
  }

  .md-icon {
    display: block;
  }

  .card-content-layout {
    display: grid;
    grid-template-columns: $pointer-section 1fr $pointer-section;
    grid-template-rows: $pointer-section 1fr $pointer-section;
    align-items: center;
    justify-items: center;
    height: 100%;
    width: 100%;
    padding: 5px;
  }

  .card-pointer {
    align-content: center;
    justify-content: center;
    animation-name: move-right;
    animation-duration: 2s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
  }

  .card-pointer-up {
    @extend .card-pointer;
    animation-name: move-up;
    grid-column: 2;
    grid-row: 1;
  }

  .card-pointer-down {
    @extend .card-pointer;
    animation-name: move-down;
    grid-column: 2;
    grid-row: 3;
  }

  .card-pointer-left {
    @extend .card-pointer;
    animation-name: move-left;
    grid-column: 1;
    grid-row: 2;
  }

  .card-pointer-right {
    @extend .card-pointer;
    animation-name: move-right;
    grid-column: 3;
    grid-row: 2;
  }
  
  .card-body {
    grid-row: 2;
    grid-column: 2;
    justify-self: start;
    align-self: start;
  }
}

@keyframes move-up {
  from {
    transform: translateY(0px);
    opacity: 1;
  }

  to {
    transform: translateY($neg-pointer-movement);
    opacity: 0;
  }
}

@keyframes move-down {
  from {
    transform: translateY(0px);
    opacity: 1;
  }

  to {
    transform: translateY($pointer-movement);
    opacity: 0;
  }
}

@keyframes move-left {
  from {
    transform: translateX(0px);
    opacity: 1;
  }

  to {
    transform: translateX($neg-pointer-movement);
    opacity: 0;
  }
}

@keyframes move-right {
  from {
    transform: translateX(0px);
    opacity: 1;
  }

  to {
    transform: translateX($pointer-movement);
    opacity: 0;
  }
}
</style>
