<template>
  <div ref="moduleMain">
    <video id="myVideo" ref="myVideo" class="myVideo" src="static/moviemodule/001.mp4" v-show="showOriginVideo"
           webkit-playsinline playsinline x5-video-player-type='h5' x5-video-player-fullscreen=”true”>

    </video>
    <pixi-canvas ref="myPixiCanvas" :z-order="canvasZOrder" :can-touch="canvasCanTouch"
                 @startGame="gameStart"></pixi-canvas>
    <transition @before-enter="beforeEnter"
                @enter="enter"
                @leave="leave">

      <congraPopup style="z-index: 9999" :showType="popupType" v-if="showCongra"
                   @quitGame.once="quitGame_hdr()"
                   @continueGame.once="continueGame_hdr()"
                   @continueClicked.once="clickContinue_hdr()"
                   @againClicked.once="againClicked_hdr"></congraPopup>
    </transition>
    <div id="videoPlayBtn"
         class="videoPlayBtn" ref="videoPlayBtn" v-show="videoPlayBtnShow">
        <img src="static/themetypeui/goplaybtn.png"/>
    </div>

  </div>
</template>
<script>
  import {myVueMixin, myVueMixin_Popup, checkForJumpRoute, loaderAssetsByValided} from './Utils.js'
  import {mapActions, mapState} from 'vuex'
  import congraPopup from './gameui/congraPopup.vue'
  import {LoadingAnimation} from "./gameui/GameManager";
  import MovieModulePure from "./MovieModulePure";
  import {Debugs} from "./Utils";
  var pixiScene = null;
  export default {
    name: "module1",
    mixins: [myVueMixin, myVueMixin_Popup],
    data: function () {
      return {
        showCongra: false,
        bookShow: false,
        bookAniShow: false,
        popupType: 'popup2',
        showOriginVideo: true,
        myVideoSrc: '#',
        canvasCanTouch: true,
        canvasZOrder: 999,
        videoPlayBtnShow: true,
        videoPicPng:'static',
        videoHasBeenLoaded:false//视频是否第一次加载过


      }
    },

    components: {congraPopup},
    computed: {
      ...mapState(['restArrangementStat', 'gameSecondPlayed','appPlatform', 'allPartNames', 'alreadyHasOneCard', 'assetsPages', 'assetsResources', 'completedLessonNum', 'allLessonsNum', 'showPopupDelay', 'allLessonComponentsNames', 'energyCurrentNum', 'lessonCurrentPageIndex', 'gameHasBeenCompleted'])
    },
    methods: {
      ...mapActions(['SET_CANVASPAGE', 'SET_INDEXPAGEINITIALSLIDE', 'SET_ASSETSPAGES', 'PUSH_GAMES', 'SET_LESSONCOMPLETESTAT', 'SET_RESTARRANGEMENTSTAT', 'SET_LESSONCURRENTPAGEINDEX']),
      clickContinue_hdr() {
        if (pixiScene) {

          this.showCongra = false;
          if (this.gameHasBeenCompleted) {
            checkForJumpRoute.call(this, false);


          } else {
            checkForJumpRoute.call(this, true);
          }


        }
      },
      againClicked_hdr() {
        if (pixiScene) {
          this.showCongra = false;
          this.$refs.myVideo.currentTime = 0;
          this.$refs.myVideo.play();
          pixiScene._G.videoIsEnd = false;//让timeupdate继续运作

        }
      },
      quitGame_hdr() {
        const self = this;
        setTimeout(() => {
          self.$router.push('/index/')
        }, 1000);
        LoadingAnimation.setMaskShow(true);
        let arr = this.$route.fullPath.split('/');
        let index = self.allPartNames.indexOf(arr[2]);
        self.SET_INDEXPAGEINITIALSLIDE(Number(index));

      },
      continueGame_hdr() {
        this.showCongra = false;
      },

      gameStart(app) {
        const self = this;

        var modulesUrl = this.$route.meta.assetsUrl;
        //var gameConfig;
        var urls = 'static/' + modulesUrl + '/resource.json';

        LoadingAnimation.setMaskShow(true, 0)

        ////加载逻辑
        self.axios.get('static/' + modulesUrl + '/gameconfig.json').then((gameConfigData) => {
          var assets = gameConfigData.data.assets.map((item, index) => {
            return {
              name: '' + item.name,
              url: item.url
            }
          });
          loaderAssetsByValided.call(self, modulesUrl, assets, GameStart);
        });

        ///End加载逻辑

        function GameStart(resources, gameConfigData) {
          let _G = {};
          _G.movieModule = null;
          _G.videoDuration = 0;
          _G.tickerment = null;

          _G.movieModule = new MovieModulePure({
            vueInstance: self
          });
          self.$refs.myVideo.load();

          if (self.appPlatform == 'pc') {

            self.$refs.videoPlayBtn.onclick = playVideoStart;
          } else {
            self.$refs.videoPlayBtn.ontouchstart = playVideoStart;

          }


          self.$refs.myVideo.ondurationchange = durationChangeHandler;
         // self.$refs.myVideo.onloadedmetadata = loadedmetadataHandler

          function durationChangeHandler() {
            _G.videoDuration = self.$refs.myVideo.duration;

          }
          _G.tickerment = setInterval(() => {
            if (_G.videoDuration > 0) {

              self.$refs.videoPlayBtn.style.pointerEvents = 'auto';
              self.$refs.videoPlayBtn.style.opacity = 1;
              _G.movieModule.myVideo = self.$refs.myVideo;
              _G.movieModule.initProgressBar();
              clearInterval(_G.tickerment);
            }
          }, 10)
          let eventGet = false;

          function playVideoStart() {
            if(self.videoHasBeenLoaded==false){
              self.$refs.myVideo.load();
              self.videoHasBeenLoaded = true;

            }

            self.$refs.myVideo.play();
            Debugs.log('888')
            if(_G.videoDuration>0){
              _G.movieModule.changeModeBack();
              _G.movieModule.showProgressBar();
              _G.movieModule.showMovieBgAnime();
              if(eventGet==false){
                //已经注册过事件就不用重复；
                _G.movieModule.initEvents();
              }


              eventGet = true;

            }
            self.$refs.videoPlayBtn.style.pointerEvents = 'none';
            self.$refs.videoPlayBtn.style.opacity = 0;


          }

          app.stage.addChild(_G.movieModule);
          pixiScene = _G.movieModule;
          LoadingAnimation.setMaskShow(false);

        }
      }
    },
    beforeCreate() {

      if (this.$store.state.lessonPartsList.length == 0) {
        this.$router.push('/');
        window.location.reload()
      }
    },
    beforeDestroy() {


    },
    destroyed() {

      if(this.$refs.myVideo && this.$refs.videoPlayBtn){
        this.$refs.myVideo.ondurationchange = null;
       // this.$refs.myVideo.onloadedmetadata = null;
        this.$refs.videoPlayBtn.onclick = null;
      }
      if(pixiScene){
        pixiScene.destroyed();
        pixiScene.destroy();
        pixiScene = null

      }
    },
    mounted() {
      const self = this;
      self.SET_LESSONCURRENTPAGEINDEX(Number(self.allLessonComponentsNames.indexOf(self.$route.name)));


    },
  }
</script>

<style scoped>
  .myVideo {
    position: absolute;
    z-index: 0;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    pointer-events: none;
  }

  .videoPlayBtn {
    position: absolute;
    width: 3rem;
    height: 3rem;
    background: transparent;
    opacity: 0.2;
    top: 4rem;
    left: 0;
    right: 0;
    margin: 0 auto;
    z-index: 99;

  }
  .videoPlayBtn img{
    position: absolute;
    left:0;
    top:0;
    right:0;
    bottom:0;
    margin:auto;
    width:0.8rem;
    height:auto;
    display: block;
  }
</style>
