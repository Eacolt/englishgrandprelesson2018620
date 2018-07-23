<template>
  <div class="gameContainer" ref="pixicanvas">

      <congraPopup :showType="popupType" v-if="showCongra"
                   @quitGame="quitGame_handler()"
                   @continueGame="continueGame_handler()"
                   @continueClicked="clickContinue_handler()"
                   @againClicked="againClicked_handler">

      </congraPopup>

  </div>

</template>

<script>

  import {myVueMixin} from './Utils.js'
  import {mapActions, mapState} from 'vuex'
  import congraPopup from './gameui/congraPopup.vue'
  import PixiScene1 from './choiceTextModule.js'
  import {checkForJumpRoute} from "./Utils";
  import {TweenMax} from 'gsap'
  import {Debugs} from "./Utils";


  var pixiScene = null;
  var modulesUrl = null;
  var canvasApp = null;
  export default {
    name: "module1",
    mixins: [myVueMixin],
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
    created(){
       document.getElementById('gamebasemasker').style.visibility = 'visible';
    },

    computed: {
      ...mapState(['lessonPartsList','gameSecondPlayed','alreadyHasOneCard','gameThemeType','allPartNames','assetsPages', 'completedLessonNum','allLessonsNum','lessonPartsIndex', 'allLessonComponentsNames','restArrangementStat','energyCurrentNum','lessonCurrentPageIndex','gameHasBeenCompleted']),

    },
    components: {congraPopup},
    methods: {
      ...mapActions(['SET_CANVASPAGE', 'SET_ASSETSPAGES','SET_INDEXPAGEINITIALSLIDE','PUSH_GAMES', 'SET_LESSONCOMPLETESTAT','SET_RESTARRANGEMENTSTAT','SET_LESSONCURRENTPAGEINDEX']),


      againClicked_handler() {
        if (pixiScene) {
       //   this.$parent.$parent.$refs.gameMenu.showGrandMask = false;
          pixiScene.playAgain()
        }
      },
      clickContinue_handler() {
        Debugs.log("Contirue")

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
      quitGame_handler(){
        const self = this;



        let arr = this.$route.fullPath.split('/');
        let index = self.allPartNames.indexOf(arr[2]);
        self.SET_INDEXPAGEINITIALSLIDE(Number(index));
        self.$router.push('/index/')

      },
      continueGame_handler(){
        this.showCongra = false;
        this.popupType = 'popup1';
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
          var audioManifest = [];
          for(let i=0;i<gameConfigData.data.gameData.levels.length;i++){
            let audioSrc = gameConfigData.data.gameData.levels[i].audioSrc;
            let audioSrcTrim = _.trim(audioSrc);
            if(audioSrcTrim!=''){
              let audioName = modulesUrl+'_'+audioSrcTrim.replace(/\./g,'_');

              audioManifest.push({
                id:audioName,
                src:'static/'+modulesUrl+'/'+audioSrc
              });
            };

          };

          //加载逻辑

          var avalidiAssets = [];
          var SoundLoaded = 0;
          assets.forEach((item)=>{
            if(!PIXI.loader.resources[item.name]){
              avalidiAssets.push({
                name:item.name,
                url:item.url
              })
            };
          });


          if(self.assetsPages[modulesUrl] && self.assetsPages[modulesUrl] == 1) {
            setUpGame.call(self)
          }else {
            var queue = new createjs.LoadQueue();
            queue.installPlugin(createjs.Sound);
            queue.on("complete", handleComplete, this);
            queue.loadManifest(audioManifest);
            function handleComplete() {

              setUpGame.call(self)

              self.SET_ASSETSPAGES({
                assetsName:modulesUrl,
                completedStat:1
              });
            }
          }







          function setUpGame(){


            if(avalidiAssets.length>0){
              PIXI.loader.add(avalidiAssets)
                .load(function(){
                  pixiScene = new PixiScene1({
                    json: gameConfigData.data.gameData,
                    vueInstance:self,
                  });
                  app.stage.addChild(pixiScene);
                  document.getElementById('gamebasemasker').style.visibility = 'hidden';
                });
            }else{
              pixiScene = new PixiScene1({
                json: gameConfigData.data.gameData,
                vueInstance:self,
              });
              app.stage.addChild(pixiScene);
              document.getElementById('gamebasemasker').style.visibility = 'hidden';
            }
          }

          //PIXI加载逻辑 ---END

        });




      }
    },
    beforeDestroy() {
      this.showCongra = false;
      if(pixiScene){
        pixiScene.destroyed();
        pixiScene.destroy();
        pixiScene = null;
      }
      if(canvasApp){
        canvasApp.destroy(true);
        canvasApp = null;
      }
    },

    mounted() {
      const self = this;
      self.SET_LESSONCURRENTPAGEINDEX(Number(self.allLessonComponentsNames.indexOf(self.$route.name)))

      this.$on('changeGameLevel', function (n) {
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


  .gameContainer {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
</style>
