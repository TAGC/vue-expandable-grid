<template>
  <Grid />
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import Grid from "./components/Grid.vue";

@Component({ components: { Grid } })
export default class App extends Vue {}
</script>