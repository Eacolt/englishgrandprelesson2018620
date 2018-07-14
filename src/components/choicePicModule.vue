<template>
  <div class="gameContainer" ref="pixicanvas">
    <!--<pixi-canvas @startGame="gameStart"></pixi-canvas>-->

    <!--<transition  @before-enter="beforeEnter"-->
                 <!--@enter="enter"-->
                 <!--@leave="leave">-->
      <congraPopup :showType="popupType" v-if="showCongra"
                   @quitGame="quitGame_hdr()"
                   @continueGame="continueGame_hdr()"
                   @continueClicked="clickContinue_hdr()"
                   @againClicked="againClicked_hdr"></congraPopup>
    <!--</transition>-->
  </div>

</template>
<script>
  import Vue from 'vue'
  import {ResourceMent,myVueMixin,Debugs,myVueMixin_Popup,loaderAssetsByValided} from './Utils.js'
  import {mapActions, mapState} from 'vuex'
  import PixiScene1 from './choicePicModule.js'
  import congraPopup from './gameui/congraPopup.vue'

  import {PIXIAudio,AnimationSprite} from "./EasyPIXI";
  import {checkForJumpRoute} from './Utils.js'
  var pixiScene = null;
  var modulesUrl = null;
  var canvasApp = null;
  export default {
    name: "module2",
    mixins:[myVueMixin,myVueMixin_Popup],
    data: function () {
      return {
        backShow:false,
        homeShow:true,
        currentGameLevel:0,

        showCongra:false,
        popupType:'popup1'
      }
    },
    beforeCreate(){
      if(this.$store.state.lessonPartsList.length==0){
        this.$router.push('/');
        window.location.reload()
      }
    },
    created(){

      document.getElementById('gamebasemasker').style.visibility = 'visible';
    },



    computed:{
      ...mapState(['lessonPartsIndex','gameSecondPlayed','alreadyHasOneCard','allPartNames','lessonPartsList','assetsPages','completedLessonNum','allLessonsNum','allLessonComponentsNames','restArrangementStat','energyCurrentNum','lessonCurrentPageIndex','gameHasBeenCompleted']),

    },
    components:{congraPopup},
    methods: {
      ...mapActions(['SET_CANVASPAGE','SET_INDEXPAGEINITIALSLIDE','SET_ASSETSPAGES','PUSH_GAMES','SET_LESSONCOMPLETESTAT','SET_RESTARRANGEMENTSTAT','SET_LESSONCURRENTPAGEINDEX']),
      againClicked_hdr(){
        if(pixiScene){
          //this.$parent.$parent.$refs.gameMenu.showGrandMask = false;
          pixiScene.playAgain()
        }
      },
      clickContinue_hdr(){
        if (this.gameHasBeenCompleted) {
          checkForJumpRoute.call(this, false);


        } else {
          checkForJumpRoute.call(this, true);
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
      quitGame_hdr(){
        const self = this;

        let arr = this.$route.fullPath.split('/');
        let index = self.allPartNames.indexOf(arr[2]);
        self.SET_INDEXPAGEINITIALSLIDE(Number(index));
        self.$router.push('/index/')

      },


      continueGame_hdr(){
        this.showCongra = false;
      },

      gameStart(app) {
        const self = this;
        var pixiLoader = new PIXI.loaders.Loader();
        modulesUrl = this.$route.meta.assetsUrl;

        //加载逻辑
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






        //加载页面小人END

        //end



        function GameStart(gameConfigData){
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

              pixiScene= new PixiScene1({
                json: gameConfigData.gameData,
                app: app,
                ticker: app.ticker,

                vueInstance: self
              });
              app.stage.addChild(pixiScene);
            },modulesUrl)
          }else{
            pixiScene = new PixiScene1({
              json: gameConfigData.gameData,
              app: app,
              ticker: app.ticker,

              vueInstance: self
            });
            app.stage.addChild(pixiScene);
          };

          document.getElementById('gamebasemasker').style.visibility = 'hidden';
        }
      },
    },
    beforeDestroy() {
      if(pixiScene){
        pixiScene.destroyed();
        pixiScene.destroy();
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
      this.$on('changeGameLevel',function(n){
        self.currentGameLevel = n;
      });
      canvasApp  = new PIXI.Application({
        width: 1920,
        height: 1080,
        antialias: false,
      });

      canvasApp.view.style.position = 'absolute';
      canvasApp.view.style.width = '100%';
      canvasApp.view.style.height = '100%';
      canvasApp.view.style.top = '0px';
      canvasApp.view.style.left = '0px';
      canvasApp.view.style.right = '0px';
      canvasApp.view.style.margin = '0px auto';
      self.$refs.pixicanvas.appendChild(canvasApp.view);

      this.gameStart(canvasApp);

    }
  }
</script>
<style scoped>
.gameContainer{
  position:absolute;
  width:100%;
  height:100%;
  top:0;
  left:0;
}
</style>
