<template>
  <div class="gameContainer">
    <pixi-canvas @startGame="gameStart"></pixi-canvas>

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
  import {ResourceMent, myVueMixin, myVueMixin_Popup,loaderAssetsByValided} from './Utils.js'

  import {mapActions, mapState} from 'vuex'
 import {LoadingAnimation} from "./gameui/GameManager";
  import congraPopup from './gameui/congraPopup.vue'
  import PixiScene1 from './choiceTextModule.js'
  import {PIXIAudio,AnimationSprite} from "./EasyPIXI";
  import {TweenMax} from 'gsap'
  // const _ = require('lodash');

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
        popupType:'popup1'
      }
    },
    beforeCreate() {


      if (this.$store.state.lessonPartsList.length == 0) {
        this.$router.push('/');
        window.location.reload()
      }
    },

    computed: {
      ...mapState(['lessonPartsList','alreadyHasOneCard','allPartNames','assetsPages','assetsGameConfig', 'assetsResources','completedLessonNum','allLessonsNum','showPopupDelay','lessonPartsIndex', 'allLessonComponentsNames','restArrangementStat','energyCurrentNum','lessonCurrentPageIndex','gameHasBeenCompleted']),

    },
    components: {congraPopup},
    methods: {
      ...mapActions(['SET_CANVASPAGE', 'SET_ASSETSPAGES','SET_INDEXPAGEINITIALSLIDE','SET_ASSETSRESOURCES','SET_ASSETSGAMECONFIG','PUSH_GAMES', 'SET_LESSONCOMPLETESTAT','SET_RESTARRANGEMENTSTAT','SET_LESSONCURRENTPAGEINDEX']),


      againClicked() {
        if (pixiScene) {
       //   this.$parent.$parent.$refs.gameMenu.showGrandMask = false;
          pixiScene.playAgain()
        }
      },
      clickContinue() {

        if (pixiScene) {
         // this.$parent.$parent.$refs.gameMenu.showGrandMask = false;

          pixiScene.playContinue();
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
         modulesUrl = this.$route.meta.assetsUrl;


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

        // 加载页面小人
        var loadingContainer = new PIXI.Container();
        let animeloader = new AnimationSprite();
        animeloader.resName = 'loadingmonster_json';
        let imgs = [];
        for(let i=0;i<18;i++){
          imgs.push('loading'+i+'.png');
        }
        animeloader.alienImages = imgs;
        loadingContainer.addChild(animeloader);
        animeloader.pivot.x = animeloader.width/2;
        animeloader.pivot.y = animeloader.height/2;
        animeloader.x = 1920/2;
        animeloader.y = 1080/2;
        animeloader.speed = 0.42;
        animeloader.play();
        app.stage.addChild(loadingContainer);
        //加载页面小人END


        function GameStart(resource,gameConfigData){

          let audioManifest = [];
          for(let i=0;i<gameConfigData.gameData.levels.length;i++){
            let audioSrc = gameConfigData.gameData.levels[i].audioSrc;
            let audioSrcTrim = _.trim(audioSrc);
            if(audioSrcTrim!=''){
              let audioName = modulesUrl+'_'+audioSrcTrim.replace(/\./g,'_');

              audioManifest.push({
                id:audioName,
                src:audioSrc
              });
            };

          };



          if(PIXIAudio.loadedStatus[modulesUrl]==undefined && audioManifest.length>0){
            PIXIAudio.addAudio(audioManifest, 'static/' + modulesUrl+'/', ()=>{
              app.stage.removeChildAt(0)

              var scene1 = new PixiScene1({
                json: gameConfigData.gameData,
                app: app,
                ticker: app.ticker,
                resources: resource,
                vueInstance: self
              });
              app.stage.addChild(scene1);

              pixiScene = scene1;
               LoadingAnimation.setMaskShow(false)

            },modulesUrl);
          }else{
            app.stage.removeChildAt(0)
            var scene1 = new PixiScene1({
              json: gameConfigData.gameData,
              app: app,
              ticker: app.ticker,
              resources: resource,
              vueInstance: self
            });
            app.stage.addChild(scene1);

            pixiScene = scene1;
             LoadingAnimation.setMaskShow(false)
          }
        }
      }
    },
    beforeDestroy() {
      if(pixiScene){

        pixiScene.destroyed();
        pixiScene.destroy();
      }
    },

    mounted() {
      const self = this;
      self.SET_LESSONCURRENTPAGEINDEX(Number(self.allLessonComponentsNames.indexOf(self.$route.name)))

      this.$on('changeGameLevel', function (n) {
        self.currentGameLevel = n;



      })



    }
  }
</script>

<style scoped>


  .gameContainer {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
</style>
