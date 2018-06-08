import Vue from "vue"
import Foo from "@/Foo.vue";

Vue.config.productionTip = false

new Vue({
  render: h => h(Foo)
}).$mount('#app')
