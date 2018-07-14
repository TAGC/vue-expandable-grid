import "vue-material/dist/theme/default.css";
import "vue-material/dist/vue-material.min.css";

import Vue from "vue";
import VueMaterial from "vue-material";
import VueRouter from "vue-router";
import App from "./App.vue";
import DemoPage from "./pages/DemoPage.vue";
import LandingPage from "./pages/LandingPage.vue";

Vue.config.productionTip = false;

Vue.use(VueRouter);
Vue.use(VueMaterial);

const routes = [
  { path: "/", component: LandingPage },
  { path: "/demo", component: DemoPage },
];

const router = new VueRouter({routes});

new Vue({
  el: "#app",
  router,
  render: (h) => h(App),
}).$mount("#app");
