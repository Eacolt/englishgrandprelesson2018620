<template>
  <div class="gameContainer" ref="pixicanvas">



      <congraPopup :showType="popupType" v-if="showCongra"
                   @quitGame="quitGame()"
                   @continueGame="continueGame()"
                   @continueClicked="clickContinue()"
                   @againClicked="againClicked"></congraPopup>
    <!--</transition>-->
  </div>

</template>

<script>
  import Vue from 'vue'
  import {ResourceMent, myVueMixin, myVueMixin_Popup, checkForJumpRoute,loaderAssetsByValided} from './Utils.js'

  import congraPopup from './gameui/congraPopup.vue'
  import {mapActions, mapState} from 'vuex'
  import PixiScene1 from './bookReadingModule.js'
  import {PIXIAudio,AnimationSprite} from "./EasyPIXI";


  var pixiScene = null;
  var modulesUrl = null;
  var canvasApp = null;

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
      ...mapState(['lessonPartsList','gameSecondPlayed','allPartNames','assetsPages','completedLessonNum','allLessonsNum','lessonPartsIndex', 'restArrangementStat','allLessonComponentsNames','energyCurrentNum','lessonCurrentPageIndex','gameHasBeenCompleted']),

    },
    components: {congraPopup},
    methods: {
      ...mapActions(['SET_CANVASPAGE','SET_INDEXPAGEINITIALSLIDE','SET_COMPLETEDLESSONNUM', 'SET_ASSETSPAGES','PUSH_GAMES', 'SET_LESSONCOMPLETESTAT','SET_RESTARRANGEMENTSTAT','SET_LESSONCURRENTPAGEINDEX']),

      clickContinue() {

        if(this.gameHasBeenCompleted){
          checkForJumpRoute.call(this,false);
        }else{
          checkForJumpRoute.call(this,true);
        }

        // if (this.gameHasBeenCompleted) {
        //   /////////////////////
        //   let restArrangmentArr = this.$store.state.restArrangementStat;
        //   if (restArrangmentArr.length > 0) {
        //     this.$router.push({name: restArrangmentArr[0]});
        //     let d = Number(restArrangmentArr[0].split('-')[1]);
        //     this.$store.dispatch('SET_LESSONPARTSINDEX', d);
        //   }
        // } else {
        //   let allLessonComponentsNames = this.$store.state.allLessonComponentsNames;
        //   let b = Number(allLessonComponentsNames[0].split('-')[1]);
        //   let currentPageIndex = this.lessonCurrentPageIndex;
        //   if (currentPageIndex < allLessonComponentsNames.length - 1) {
        //     this.$router.push({name: allLessonComponentsNames[currentPageIndex + 1]});
        //   } else {
        //     this.$router.push({name: allLessonComponentsNames[0]});
        //   }
        // }


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

        function GameStart(gameConfigData){




          let audioManifest = [];
          for(let i=0;i<gameConfigData.gameData.levels.length;i++){
            let audioSrc = gameConfigData.gameData.levels[i].audioSrc;
            let audioName = modulesUrl+'_'+audioSrc.replace(/\./g,'_');
            if(audioSrc && _.trim(audioSrc)!=''){
              audioManifest.push({
                id:audioName,
                src:audioSrc
              });
            }

          }
          if(gameConfigData.gameData.showCoverpage==true){
            if(gameConfigData.gameData.coverpageAudio && _.trim(gameConfigData.gameData.coverpageAudio)!=''){
              audioManifest.push({
                id: modulesUrl+'_'+gameConfigData.gameData.coverpageAudio.replace(/\./g,'_'),
                src:gameConfigData.gameData.coverpageAudio,
              });
            }

          }
          if(PIXIAudio.loadedStatus[modulesUrl]==undefined && audioManifest.length>0){
            PIXIAudio.addAudio(audioManifest, 'static/' + modulesUrl+'/', ()=>{
              var scene1 = new PixiScene1({
                json: gameConfigData.gameData,
                vueInstance:self,
              });
              app.stage.addChild(scene1);
              pixiScene = scene1;

              document.getElementById('gamebasemasker').style.visibility = 'hidden';
            },modulesUrl);
          }else{
            var scene1 = new PixiScene1({
              json: gameConfigData.gameData,
              vueInstance:self,
            });
            app.stage.addChild(scene1);
            pixiScene = scene1;

            document.getElementById('gamebasemasker').style.visibility = 'hidden';
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
    created(){
      document.getElementById('gamebasemasker').style.visibility = 'visible';
    },
    beforeDestroy(){
      if(pixiScene){
        pixiScene.destroyed();
        pixiScene.destroy()
        pixiScene = null;
      }
      if(canvasApp){
        canvasApp.destroy();
        canvasApp = null;
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
