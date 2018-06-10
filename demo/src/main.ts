import Vue from "vue";
import ExpandableGrid from "../../src";

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(ExpandableGrid),
}).$mount("#app");
