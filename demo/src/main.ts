import "vue-material/dist/theme/default.css";
import "vue-material/dist/vue-material.min.css";

import Vue from "vue";
import VueMaterial from "vue-material";
import App from "./App.vue";

Vue.config.productionTip = false;

Vue.use(VueMaterial);

new Vue({
  el: "#app",
  render: (h) => h(App),
}).$mount("#app");
