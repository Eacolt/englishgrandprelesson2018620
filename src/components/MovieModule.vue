<template>
  <div ref="moduleMain">
    <video id="myVideo" ref="myVideo" class="myVideo" :src="myVideoSrc" v-show="showOriginVideo"
           webkit-playsinline playsinline  x5-video-player-type='h5'>

    </video>
    <pixi-canvas ref="myPixiCanvas" :auto-render="autoRender" :z-order="canvasZOrder" :can-touch="canvasCanTouch" @startGame="gameStart"  ></pixi-canvas>
    <transition @before-enter="beforeEnter"
                @enter="enter"
                @leave="leave">

      <congraPopup :showType="popupType" v-if="showCongra"
                   @quitGame="quitGame()"
                   @continueGame="continueGame()"
                   @continueClicked="clickContinue()"
                   @againClicked="againClicked"></congraPopup>
    </transition>

  </div>
</template>
<script>
  import Vue from 'vue'
  import {ResourceMent, myVueMixin, myVueMixin_Popup,checkForJumpRoute,loaderAssetsByValided} from './Utils.js'

  import {mapActions, mapState} from 'vuex'
  import MovieModule from './MovieModule.js'

  import congraPopup from './gameui/congraPopup.vue'
  import {LoadingAnimation} from "./gameui/GameManager";
  import {AnimationSprite} from  "./EasyPIXI.js"
  import MovieModulePure from "./MovieModulePure";

  var pixiScene = null;
  export default {
    name: "module1",
    mixins: [myVueMixin, myVueMixin_Popup],
    data: function () {
      return {
        showCongra: false,
        bookShow: false,
        bookAniShow: false,
        popupType:'popup2',
        showOriginVideo:false,
        myVideoSrc:'#',
        canvasCanTouch:false,
        canvasZOrder:999,
        autoRender:false
      }
    },

    components: {congraPopup},
    computed: {
      ...mapState(['restArrangementStat','appPlatform','allPartNames','alreadyHasOneCard','assetsPages','assetsGameConfig', 'assetsResources','completedLessonNum','allLessonsNum','showPopupDelay','allLessonComponentsNames','energyCurrentNum','lessonCurrentPageIndex','gameHasBeenCompleted'])
    },
    methods: {
      ...mapActions(['SET_CANVASPAGE', 'SET_INDEXPAGEINITIALSLIDE','SET_ASSETSPAGES','SET_ASSETSRESOURCES','SET_ASSETSGAMECONFIG','PUSH_GAMES', 'SET_LESSONCOMPLETESTAT','SET_RESTARRANGEMENTSTAT','SET_LESSONCURRENTPAGEINDEX']),
      clickContinue() {
        if (pixiScene) {

          this.showCongra = false;
          if(this.alreadyHasOneCard){
            checkForJumpRoute.call(this,false);


          }else{
            checkForJumpRoute.call(this,true);
          }


        }
      },
      againClicked() {
        if (pixiScene) {
          this.showCongra = false;
          pixiScene.videoDom.currentTime = 0;
          pixiScene.videoDom.play();
          pixiScene.showMovieControl()
        }
      },
      quitGame(){
        const self = this;
        setTimeout(() => {
          self.$router.push('/index/')
        }, 1000);
        LoadingAnimation.setMaskShow(true);
        let arr = this.$route.fullPath.split('/');
        let index = self.allPartNames.indexOf(arr[2]);
        self.SET_INDEXPAGEINITIALSLIDE(Number(index));

      },
      continueGame(){
        this.showCongra = false;
      },

      gameStart(app) {
        const self = this;

        var modulesUrl = this.$route.meta.assetsUrl;
        //var gameConfig;
        var urls = 'static/' + modulesUrl + '/resource.json';

        LoadingAnimation.setMaskShow(true,0)

        ////加载逻辑
        self.axios.get('static/' + modulesUrl + '/gameconfig.json').then((gameConfigData) => {
          var assets = gameConfigData.data.assets.map((item, index) => {
            return {
              name: '' + item.name,
              url: item.url
            }
          });
          loaderAssetsByValided.call(self,modulesUrl,assets,GameStart);
        });
        ///End加载逻辑

        function GameStart(resources,gameConfigData){



          if(self.appPlatform == 'pc'){
            self.myVideoSrc = gameConfigData.gameData.movie;
            self.showOriginVideo = false;
            self.canvasCanTouch = true;
            var movieModule = new MovieModule({
              json: gameConfigData.gameData,
              app: app,
              vueInstance: self
            });
            app.stage.addChild(movieModule);
            pixiScene = movieModule;
            LoadingAnimation.setMaskShow(false);
          }else{
            self.showOriginVideo = true;
            self.canvasCanTouch = true;
            //self.$refs.myVideo.load();
            self.myVideoSrc = gameConfigData.gameData.movie;
            var movieModulePure = new MovieModulePure({
              json: gameConfigData.gameData,
              app: app,
              video:self.$refs.myVideo,
              vueInstance: self
            });
            app.stage.addChild(movieModulePure);
            pixiScene = movieModulePure;
            LoadingAnimation.setMaskShow(false);

          }
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
    destroyed(){
      if(pixiScene){
        pixiScene.destroyed();
        pixiScene.destroy();
        pixiScene = null;
      }
    },
    mounted() {
      const self = this;
      self.SET_LESSONCURRENTPAGEINDEX(Number(self.allLessonComponentsNames.indexOf(self.$route.name)));
      self.autoRender = true;

    },
  }
</script>

<style scoped>
.myVideo{
  position: absolute;
  z-index: 0;
  width:100%;
  height:100%;
  left:0;
  top:0;
}
</style>
