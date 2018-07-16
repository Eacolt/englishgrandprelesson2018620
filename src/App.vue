<template>
  <div id="app">
    <router-view :key="routerKey"/>
    <masker id="gamebasemasker" ref="masker"></masker>
  </div>
</template>
<script>
  import Vue from 'vue'
  import masker from './components/masker.vue'
  import {TweenMax} from 'gsap'
  import * as PIXI from 'pixi.js'
  import axios from 'axios';
  import VueAxios from 'vue-axios'
  import $ from 'jquery'
  import {mapActions, mapState} from 'vuex'
  import {Debugs} from './components/Utils.js'
  import {Broswer} from "./components/EasyPIXI";
  import 'swiper/dist/css/swiper.css'
  require('pixi-spine')
  Vue.use(VueAxios, axios);

  export default {
    name: 'App',
    created() {
      Debugs.locked = true;
      PIXI.utils.skipHello();
    },
    mounted() {
      const self = this;
      this.SET_CURRENTPAGE(1);
      if (Broswer.IsPC()) {
        self.SET_PLATFORM('pc');

      }else{
        self.SET_PLATFORM('mobile')
      };


    //  document.documentElement.style.cursor = 'url("static/img/myhand.ico") auto'

       //document.documentElement.style.cursor = 'url("static/img/myhand.ico") auto';


    },
    methods: {
      ...mapActions(['SET_CURRENTPAGE','SET_COMPLETEDLESSONNUM', 'SET_PLATFORM', 'SET_ENERGY','SET_GAMEHASBEENCOMPLETED']),

    },
    watch:{
      allLessonCompleteStat: {
        handler(val, oldval) {
          const self = this;
          let myarr = [];
          let allarr = [];
          val.forEach((item) => {
            if (item) {
              let _arr = item.filter((item2) => {
                return item2.meta.completed == 1;
              })
              item.forEach((item3) => {
                allarr.push(item3)
              })
              myarr.push(..._arr);
            }
          });
          //设置全局能量条
          self.SET_ENERGY((myarr.length / allarr.length));
        },
        deep: true
      },
      energyCurrentNum(newval){

        if(newval>=1){
          this.SET_GAMEHASBEENCOMPLETED(true);
        };
        this.SET_COMPLETEDLESSONNUM(newval*this.allLessonsNum);

      }
    },
    components:{masker},
    computed: {

      ...mapState(['gamesArr', 'allLessonsNum','completedLessonNum','currentPage', 'bgMaskShow', 'baseAssetsCompleted', 'allLessonCompleteStat', 'energyCurrentNum','gameHasBeenCompleted']),
      routerKey(){
        return this.$route.name !== undefined? this.$route.name +new Date(): this.$route +new Date()
      },
      swiper() {
        return this.$refs.mySwiper.swiper
      },

      nextBtnStyle() {
        return {
          backgroundImage: "url('./static/img/buttonstyle/next1.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "100% 100%"
        }
      },
      prevBtnStyle() {
        return {
          backgroundImage: "url('./static/img/buttonstyle/back1.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "100% 100%"
        }
      }
    }


  }
</script>
<style>
  html, body{
    overflow: hidden;
    background:black;

  }
  html, body, div {
    padding: 0;
    margin: 0;
    -webkit-tap-highlight-color: transparent;
    tap-highlight-color: transparent;
    -webkit-text-size-adjust:none;
    -moz-text-size-adjust: none;
    user-select: none;
    outline: none;
    box-sizing: border-box !important;
  }

  #app {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 19.20rem;
    height: 10.80rem;
    margin: 0 auto;
    left: 0;
    right: 0;
    top: 50%;
    transform: translate(0, -50%);
    transform-origin: center center;
    background: black;
    overflow: hidden;
    box-sizing: border-box;
    /*font-family: sans-serif;*/
  }



</style>
