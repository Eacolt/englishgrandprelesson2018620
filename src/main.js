// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import axios from 'axios'
import Router from 'vue-router'
import VueAxios from 'vue-axios'
import App from './App'
import router from './router'
import store from './store'


require('pixi-sound');
const _ = require('lodash');


Vue.use(VueAxios,axios)

Vue.use(Router)
Vue.config.productionTip = false


  new Vue({
    el: '#app',
    router,
    store,
    components: { App },
    template: '<App/>'
  })



/* eslint-disable no-new */
