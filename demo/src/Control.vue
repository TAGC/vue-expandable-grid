<template>
  <md-field>
    <md-input type="number" v-model="inputValue" :style="{width: width + 'px'}" />
  </md-field>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop, Watch } from "vue-property-decorator";

@Component
export default class Control extends Vue {
  @Prop({ required: true })
  private width: number;

  @Prop({ required: true })
  private value: any;

  private inputValue = this.value;

  @Watch("value")
  private onValueChanged(newValue, oldValue) {
    if (newValue !== oldValue) {
      this.inputValue = newValue;
    }
  }

  @Watch("inputValue")
  private onInputValueChanged(newValue, oldValue) {
    if (newValue !== oldValue) {
      this.$emit("input", newValue);
    }
  }
}
</script>

<style lang="scss" scoped>
@import "variables";

.md-field {
  display: inline-grid;
  width: auto;

  .md-input {
    font-size: $font-size;
  }

  input {
    text-align: center;
    border: 0;
    width: 75px;
    border-bottom: 1px solid #e0e0e0;
    background: none;
  }

  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}
</style>
