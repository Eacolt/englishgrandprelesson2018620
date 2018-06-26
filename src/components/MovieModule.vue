<template>
  <div ref="moduleMain">
    <pixi-canvas @startGame="gameStart"></pixi-canvas>
    <transition @before-enter="beforeEnter"
                @enter="enter"
                @leave="leave">
      <!--<congraPopup showType="popup2"  v-show="showCongra" @continueClicked="clickContinue()" @againClicked="againClicked"></congraPopup>-->

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

  var pixiScene = null;
  export default {
    name: "module1",
    mixins: [myVueMixin, myVueMixin_Popup],
    data: function () {
      return {
        showCongra: false,
        bookShow: false,
        bookAniShow: false,
        popupType:'popup2'
      }
    },

    components: {congraPopup},
    computed: {
      ...mapState(['restArrangementStat','allPartNames','alreadyHasOneCard','assetsPages','assetsGameConfig', 'assetsResources','completedLessonNum','allLessonsNum','showPopupDelay','allLessonComponentsNames','energyCurrentNum','lessonCurrentPageIndex','gameHasBeenCompleted'])
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

          var movieModule = new MovieModule({
            json: gameConfigData.gameData,
            app: app,
            vueInstance: self
          });
          app.stage.addChild(movieModule);
          pixiScene = movieModule;
          LoadingAnimation.setMaskShow(false)
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
        pixiScene.destroy();
        pixiScene = null;
      }
    },
    mounted() {
      const self = this;
      self.SET_LESSONCURRENTPAGEINDEX(Number(self.allLessonComponentsNames.indexOf(self.$route.name)))


    },
  }
</script>

<style scoped>

</style>
