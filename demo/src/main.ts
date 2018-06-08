import Vue from "vue";
import InfiniteGrid from "../../src";

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(InfiniteGrid),
}).$mount("#app");
