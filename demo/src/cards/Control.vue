<template>
  <md-field :class="{ 'md-invalid': !isValid }">
    <md-input
      type="number"
      :style="{ width: width + 'px' }"
      :value="value"
      :min="min"
      :max="max"
      @input="$emit('input', $event)"
      @focus="isFocused = true"
      @blur="isFocused = false"
    />
  </md-field>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop, Watch } from "vue-property-decorator";

@Component
export default class Control extends Vue {
  private isFocused = false;

  @Prop({ required: true })
  private width: number;

  @Prop({ required: true })
  private value: number;

  @Prop({ required: false })
  private min: number;

  @Prop({ required: false })
  private max: number;

  @Prop({ default: () => (x) => true })
  private validator: (number) => boolean;

  private get isValid() {
    return this.validator(this.value);
  }

  private get isStable() {
    return this.isValid && !this.isFocused;
  }

  @Watch("isStable")
  private onValidityChange(curr: boolean, old: boolean) {
    if (curr === old) {
      return;
    }

    this.$emit("stable", curr);
  }
}
</script>

<style lang="scss" scoped>
@import "variables";

.md-field {
  display: inline-grid;
  width: auto;
  padding: 0;
  margin: 0;
  min-height: 0;

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
