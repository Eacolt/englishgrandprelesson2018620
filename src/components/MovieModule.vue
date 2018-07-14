<template>
  <div ref="moduleMain">
    <video id="myVideo" ref="myVideo" class="myVideo" :src="movieUrl" v-show="showOriginVideo"
           webkit-playsinline playsinline x5-video-player-type='h5' x5-video-player-fullscreen=”true”>

    </video>


    <!--<div :style="pixiCanvasStyle" ref="pixicanvas" ></div>-->

    <div :style="pixiCanvasStyle" ref="pixicanvas" ></div>


      <congraPopup style="z-index: 9999" :showType="popupType" v-if="showCongra"
                   @quitGame.once="quitGame_hdr()"
                   @continueGame.once="continueGame_hdr()"
                   @continueClicked.once="clickContinue_hdr()"
                   @againClicked.once="againClicked_hdr"></congraPopup>

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
  var canvasApp = null;
  var movieModule = null;
  var videoDuration = 0;
  var tickerment = null;
  var movieModule = null;
  var videoDuration = null;




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

        videoPlayBtnShow: true,
        videoPicPng:'static',
        movieUrl:"#",
        videoHasBeenLoaded:false,//视频是否第一次加载过





      }
    },

    components: {congraPopup},
    computed: {
      ...mapState(['restArrangementStat', 'gameSecondPlayed','appPlatform', 'allPartNames', 'alreadyHasOneCard', 'completedLessonNum', 'allLessonsNum', 'showPopupDelay', 'allLessonComponentsNames', 'energyCurrentNum', 'lessonCurrentPageIndex', 'gameHasBeenCompleted']),
      pixiCanvasStyle(){
        return {
          pointerEvents:'auto',
          zIndex:999
        }
      }

    },
    methods: {
      ...mapActions(['SET_CANVASPAGE', 'SET_INDEXPAGEINITIALSLIDE',  'PUSH_GAMES', 'SET_LESSONCOMPLETESTAT', 'SET_RESTARRANGEMENTSTAT', 'SET_LESSONCURRENTPAGEINDEX']),
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
        // setTimeout(() => {
        //   self.$router.push('/index/')
        // }, 1000);


        let arr = this.$route.fullPath.split('/');
        let index = self.allPartNames.indexOf(arr[2]);
        self.SET_INDEXPAGEINITIALSLIDE(Number(index));

        self.$router.push('/index/')

      },
      continueGame_hdr() {
        this.showCongra = false;
      },

      gameStart(app) {
        const self = this;


        var modulesUrl = this.$route.meta.assetsUrl;

        self.axios.get('static/' + modulesUrl + '/gameconfig.json').then((gameConfigData) => {
          var assets = gameConfigData.data.assets.map((item, index) => {
            return {
              name: '' + item.name,
              url: item.url
            }
          });
          self.movieUrl = gameConfigData.data.gameData.movieUrl;

          //PIXI 加载逻辑
          var avalidiAssets = [];
          assets.forEach((item)=>{
            if(!PIXI.loader.resources[item.name]){
              avalidiAssets.push({
                name:item.name,
                url:item.url
              })
            };
          });
          if(avalidiAssets.length>0){
            PIXI.loader.add(avalidiAssets)
              .load(function(){
                GameStart.call(self,gameConfigData.data);
              });
          }else{
            GameStart.call(self,gameConfigData.data);
          }
          //PIXI加载逻辑 ---END
        });


        ///End加载逻辑
        function GameStart() {
          Debugs.log('视频已经打开')

          movieModule = new MovieModulePure({
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
            videoDuration = self.$refs.myVideo.duration;

          }
          tickerment = setInterval(() => {
            if (videoDuration > 0) {

              self.$refs.videoPlayBtn.style.pointerEvents = 'auto';
              self.$refs.videoPlayBtn.style.opacity = 1;
              movieModule.myVideo = self.$refs.myVideo;
              movieModule.initProgressBar();

              clearInterval(tickerment);
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
            if(videoDuration>0){
              movieModule.changeModeBack();
              movieModule.showProgressBar();
              movieModule.showMovieBgAnime();
              if(eventGet==false){
                //已经注册过事件就不用重复；
                movieModule.initEvents();
              }
              eventGet = true;
            }
            self.$refs.videoPlayBtn.style.pointerEvents = 'none';
            self.$refs.videoPlayBtn.style.opacity = 0;
          }
          LoadingAnimation.setMaskShow(false);
          app.stage.addChild(movieModule);
          pixiScene = movieModule;

        }
      }
    },
    beforeCreate() {
      if (this.$store.state.lessonPartsList.length == 0) {
        this.$router.push('/');
        window.location.reload()
      }
    },
    mounted() {
      const self = this;
      self.SET_LESSONCURRENTPAGEINDEX(Number(self.allLessonComponentsNames.indexOf(self.$route.name)));

      canvasApp  = new PIXI.Application({
        width: 1920,
        height: 1080,
        antialias: false,
        transparent:true
      });

      canvasApp.view.style.position = 'absolute';
      canvasApp.view.style.width = '100%';
      canvasApp.view.style.height = '100%';
      canvasApp.view.style.top = '0px';
      canvasApp.view.style.left = '0px';
      canvasApp.view.style.right = '0px';
      canvasApp.view.style.margin = '0px auto';
      self.$refs.pixicanvas.appendChild(canvasApp.view);
       this.gameStart(canvasApp)


    },
    beforeDestroy(){
      if(canvasApp){
        canvasApp.destroy();
        canvasApp = null;
      };
      if(pixiScene){
        pixiScene.destroy();
        pixiScene = null;
      }
       movieModule = null;
       videoDuration = null;
       tickerment = null;
       movieModule = null;
       videoDuration = null;

       Debugs.log("电影页面已经退出")
    }
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
