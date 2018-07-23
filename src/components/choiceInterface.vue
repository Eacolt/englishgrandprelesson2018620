<template>
  <div class="bgContainer" ref="pixicanvas">


  </div>
</template>

<script>
  import {mapActions, mapState} from 'vuex'


  import ChoiceInterface from './choiceInterface.js'

  var pixiScene = null;
  var canvasApp = null;
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
    created() {
      document.getElementById('gamebasemasker').style.visibility = 'visible';
    },

    beforeDestroy() {

      //
      // let bgsound = PIXI.loader.resources['bgSound'].sound;
      // bgsound.volume = 0;
      if (canvasApp) {
        canvasApp.destroy(true);
        canvasApp = null;
      }
      if (pixiScene) {
        pixiScene.destroyed();
        pixiScene.destroy();
        pixiScene = null;
      }

    },
    mounted() {
      var self = this;


      this.SET_MODULEINDEX(0);//初始化列表index;
      this.moduleList = this.lessonPartsList[this.lessonPartsIndex].menus;

      canvasApp = new PIXI.Application({
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


    },

    computed: {
      ...mapState(['lessonPartsList', 'energyCurrentNum', 'assetsPages', 'lessonPartsIndex', 'currentModuleList', 'baseAssetsCompleted']),
      bgContainer() {
        return {
          backgroundImage: 'url("static/img/choicepage/back2.jpg")',
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat'
        }
      }

    },
    methods: {
      ...mapActions(['SET_MODULEINDEX', 'SET_ASSETSPAGES', 'SET_CANVASPAGE', 'PUSH_GAMES', 'SET_PREPARATION', 'SET_LESSONPART', 'SET_MODULELIST', 'SET_BASEASSETSCOMPLETED']),
      gameStart(app) {
        var self = this;

        var assets = [
          {
            "name": "choiceDesk_png",
            "url": "static/themetypeui/back2ground.png"
          },
          {
            "name": "practiceBox_skeleton",
            "url": "static/img/choicepage/boxskeleton/skeleton.json"
          },
          {
            "name": "backbg_jpg",
            "url": "static/themetypeui/backbg.jpg"
          },
          {
            "name": "practicebg_jpg",
            "url": "static/themetypeui/practicebg.jpg"
          }
        ]
        //PIXI 加载逻辑
        var avalidiAssets = [];
        assets.forEach((item) => {
          if (!PIXI.loader.resources[item.name]) {
            avalidiAssets.push({
              name: item.name,
              url: item.url
            })
          }
          ;
        });
        if (avalidiAssets.length > 0) {
          PIXI.loader.add(avalidiAssets)
            .load(function () {
              GameStart.call(self);
            });
        } else {
          GameStart.call(self);
        }

        //PIXI加载逻辑 ---END


        function GameStart() {
          pixiScene = new ChoiceInterface({

            vueInstance: self
          });
          app.stage.addChild(pixiScene);

          document.getElementById('gamebasemasker').style.visibility = 'hidden';

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
