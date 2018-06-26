<template>
  <div class="bgContainer">
    <pixi-canvas @startGame="gameStart"></pixi-canvas>
  </div>
</template>

<script>
  import {mapActions, mapState} from 'vuex'
 import {PIXIAudio} from './EasyPIXI.js'
  import {LoadingAnimation} from "./gameui/GameManager";

  import ChoiceInterface from './choiceInterface.js'
  import GameMenuBars from './gameui/GameMenuBar.js'


 var pixiScene = null;
  export default {
    name: "choice-interface",
    data() {
      return {
        moduleList: [],
        pixiApp: null
      }
    },
    beforeCreate() {
      if (this.$store.state.lessonPartsList.length == 0) {
        this.$router.push('/');
        window.location.reload()
      }
    },
    beforeDestroy(){

      PIXIAudio.audios.bgSound.volume = 0;
    },
    destroyed() {
      if(pixiScene){
        pixiScene.destroyed();
        pixiScene.destroy();
      }

    },
    mounted() {
      const self = this;


      this.SET_MODULEINDEX(0);//初始化列表index;
      this.moduleList = this.lessonPartsList[this.lessonPartsIndex].menus;



    },

    computed: {
      ...mapState(['lessonPartsList','energyCurrentNum', 'assetsPages', 'assetsResources', 'lessonPartsIndex', 'currentModuleList', 'baseAssetsCompleted']),
      bgContainer() {
        return {
          backgroundImage: 'url("static/img/choicepage/back2.jpg")',
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat'
        }
      }

    },
    methods: {
      ...mapActions(['SET_MODULEINDEX', 'SET_ASSETSPAGES','SET_CANVASPAGE', 'PUSH_GAMES', 'SET_PREPARATION', 'SET_LESSONPART', 'SET_MODULELIST', 'SET_BASEASSETSCOMPLETED']),
      gameStart(app) {
        const self = this;
        if (self.assetsPages.choicePages == 1) {
          GameStart.call(self);
        }else{

          PIXI.loader.add([
            {
              "name": "popupIconbandWin_png",
              "url": "static/img/menus/popups/icon-win.png"
            },

            {
              "name": "popupIconbandNext_png",
              "url": "static/img/menus/popups/icon-tankuang.png"
            },
            {
              "name": "popupIconbandAgain_png",
              "url": "static/img/menus/popups/tuichuyemian.png"
            },
            {
              "name": "popupIconNext_png",
              "url": "static/img/menus/popups/btn-1.png"
            },
            {
              "name": "popupIconResume_png",
              "url": "static/img/menus/popups/btn-2.png"
            },
            {
              "name": "popupIconQuit_png",
              "url": "static/img/menus/popups/btn-quit.png"
            },
            {
              "name": "popupIconGetCard_png",
              "url": "static/img/menus/popups/icon-hengfu.png"
            },
            {
              "name":"choiceDesk_png",
              "url":"static/themetypeui/back2ground.png"
            },
            {
              "name": "practiceBox_skeleton",
              "url": "static/img/choicepage/boxskeleton/skeleton.json"
            },
          ]);
          PIXI.loader.load(function (loader, resource) {
            GameStart.call(self);
            self.SET_ASSETSPAGES({assetsName: 'choicePages', completedStat: 1});
              LoadingAnimation.setMaskShow(false);
          });

        }
        function GameStart() {
          var scene1 = new ChoiceInterface({
            app: app,
            ticker: app.ticker,
            resources: PIXI.loader.resources,
            vueInstance: self
          });
          app.stage.addChild(scene1);
          pixiScene = scene1;

          LoadingAnimation.setMaskShow(false);
        }


      }

    },


  }
</script>

<style scoped>


  .bgContainer {
    position: relative;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    background: black;

  }
</style>
