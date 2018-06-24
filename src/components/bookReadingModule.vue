<template>
  <div class="gameContainer">
    <pixi-canvas @startGame="gameStart"></pixi-canvas>

    <transition @before-enter="beforeEnter"
                @enter="enter"
                @leave="leave">
      <!--<congraPopup showType="popup2" v-show="showCongra" @continueClicked="clickContinue()" @againClicked="againClicked"></congraPopup>-->

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
  import {ResourceMent, myVueMixin, myVueMixin_Popup, checkForJumpRoute,loaderAssetsByValided} from './Utils.js'

  import congraPopup from './gameui/congraPopup.vue'
  import {mapActions, mapState} from 'vuex'
  import PixiScene1 from './bookReadingModule.js'
  import {PIXIAudio} from "./EasyPIXI";
  import {LoadingAnimation} from './gameui/GameManager.js'

  var pixiScene = null;
  var modulesUrl = null;

  export default {
    name: "module1",
    mixins: [myVueMixin, myVueMixin_Popup],
    data: function () {
      return {
        backShow: false,
        homeShow: true,
        currentGameLevel: 0,
        showCongra: false,
        popupType:'popup2',
        currentLessonCompleted:false
      }
    },


    computed: {
      ...mapState(['lessonPartsList','alreadyHasOneCard','showPopupDelay','allPartNames','assetsPages','assetsGameConfig', 'assetsResources', 'completedLessonNum','allLessonsNum','lessonPartsIndex', 'restArrangementStat','allLessonComponentsNames','energyCurrentNum','lessonCurrentPageIndex','gameHasBeenCompleted']),

    },
    components: {congraPopup},
    methods: {
      ...mapActions(['SET_CANVASPAGE','SET_INDEXPAGEINITIALSLIDE','SET_COMPLETEDLESSONNUM', 'SET_ASSETSPAGES','SET_ASSETSRESOURCES','SET_ASSETSGAMECONFIG', 'PUSH_GAMES', 'SET_LESSONCOMPLETESTAT','SET_RESTARRANGEMENTSTAT','SET_LESSONCURRENTPAGEINDEX']),

      clickContinue() {
        //
        // this.$parent.$parent.$refs.gameMenu.showGrandMask = false;
        if(this.gameHasBeenCompleted){
          checkForJumpRoute.call(this,false);
        }else{
          checkForJumpRoute.call(this,true);
        }
      },
      againClicked() {
        this.showCongra = false;
        // this.$parent.$parent.$refs.gameMenu.showGrandMask = false;
        if(pixiScene){
          pixiScene.gameTryAgain();
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

      gotoBack() {
        if (pixiScene) {
          pixiScene.goBackComing();
        }
      },
      gameStart(app) {
        const self = this;

         modulesUrl = this.$route.meta.assetsUrl;
      //  var gameConfig;
        var urls = 'static/' + modulesUrl + '/resource.json';

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

        function GameStart(resource,gameConfigData){

          let audioManifest = [];
          for(let i=0;i<gameConfigData.gameData.levels.length;i++){
            let audioSrc = gameConfigData.gameData.levels[i].audioSrc;
            let audioName = modulesUrl+'_'+audioSrc.replace(/\./g,'_');

            audioManifest.push({
              id:audioName,
              src:audioSrc
            });

          }
          if(gameConfigData.gameData.showCoverpage==true){
            audioManifest.push({
              id: modulesUrl+'_'+gameConfigData.gameData.coverpageAudio.replace(/\./g,'_'),
              src:gameConfigData.gameData.coverpageAudio,
            });
          }
          if(PIXIAudio.loadedStatus[modulesUrl]==undefined && audioManifest.length>0){
            PIXIAudio.addAudio(audioManifest, 'static/' + modulesUrl+'/', ()=>{
              var scene1 = new PixiScene1({
                json: gameConfigData.gameData,
                vueInstance:self,
              });
              app.stage.addChild(scene1);
              pixiScene = scene1;
              LoadingAnimation.setMaskShow(false);
            },modulesUrl);
          }else{
            var scene1 = new PixiScene1({
              json: gameConfigData.gameData,
              app: app,
              ticker: app.ticker,
              resources: resource,
              vueInstance:self,
            });
            app.stage.addChild(scene1);
            pixiScene = scene1;
            LoadingAnimation.setMaskShow(false);
          }



          //
        }


      }
    },
    beforeCreate() {
      if (this.$store.state.lessonPartsList.length == 0) {
        this.$router.push('/');
        window.location.reload()
      }
    },
    beforeDestroy(){
      if(pixiScene){
        pixiScene.destroyed();
        pixiScene.destroy()
        pixiScene = null;
      }


    },
    mounted() {
      const self = this;

      self.SET_LESSONCURRENTPAGEINDEX(Number(self.allLessonComponentsNames.indexOf(self.$route.name)))



      this.$on('changeGameLevel', function (n) {
        self.currentGameLevel = n;
      });

      this.$on('showCongra', function () {
        self.showCongra = true;
      });




    },
  }
</script>

<style scoped>
  .domContent {
    position: absolute;

    z-index: 10;
  }

  .domContent .title {
    position: absolute;

    border: 1px solid red;
  }

  .gameContainer {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
</style>
