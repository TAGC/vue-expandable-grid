<template>
  <div class="intro-page">
    <div>
      <b>vue-expandable-grid is currently under development.</b>
      <p />
      Although a lot of the functionality is in place, there are still various graphical glitches.
      Additionally, the performance leaves a lot to be desired. The demonstration may lag quite
      significantly on weaker hardware.
      <p />
      Out of the browsers this library has been tested in, it seems to work best in Chrome.
    </div>
    <md-button class="md-raised md-primary" @click="navigate">
      My i7-8700K can handle it <md-icon style="padding-left: 15px">thumb_up</md-icon>
    </md-button>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

@Component
export default class LangingPage extends Vue {
  private navigate() {
    this.$router.push("/demo");
  }
}
</script>

<style lang="scss" scoped>
$grid-size: 50px;
$grid-row-lines: #80808010;

.intro-page {
  display: grid;
  grid-template-rows: auto auto;
  height: 100%;
  width: 100%;
  padding: 10% 20% 10% 20%;
  position: relative;
  text-align: center;
  align-items: stretch;
  align-content: space-evenly;
  background-size: $grid-size $grid-size;
  background-image: linear-gradient(to right, $grid-row-lines 1px, transparent 1px), linear-gradient(to bottom, $grid-row-lines 1px, transparent 1px);
}
</style>

