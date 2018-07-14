<template>
  <div class="bgContainer" ref="pixicanvas">
    <!--<pixi-canvas @startGame="gameStart"></pixi-canvas>-->
    <!--<div></div>-->
  </div>
</template>
<script>
  import {mapActions, mapState} from 'vuex'
  import IndexPage from './indexpage.js'
  import {Debugs, myVueMixin} from "./Utils";
  import {PIXIAudio} from "./EasyPIXI";
  var pixiScene = null;
  var canvasApp = null;
  export default {
    name: "module1",
    mixins: [myVueMixin],

    computed: {
      ...mapState(['lessonPartsList','currentModuleList', 'lessonCurrentPageIndex','bookOpened','openMagicBookByGameIndex', 'gameThemeType', 'showMagicBook', 'energyCurrentNum', 'alreadyHasOneCard', 'indexPageInitialSlide', 'gameHasBeenCompleted', 'alreadyHasOneCard', 'assetsPages', 'assetsPages','allLessonsNum', 'baseAssetsCompleted', 'completedLessonNum', 'allLessonCompleteStat', 'restArrangementStat', 'allPartNames', 'gameInitResponse', 'allGameCards']),
      ufoStyle() {
        return {
          backgroundImage: 'url("static/img/indexpage/table.png")',
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat'
        }
      }
    },

    mounted(){


      if(this.$store.state.lessonPartsList.length==0){
        this.$router.push('/');
        window.location.reload()
      }
    },
    methods: {
      ...mapActions(['PUSH_GAMES','SET_MODULELIST','SET_GAMESECONDPLAYED', 'SET_GAMETHEMETYPE', 'SET_BOOKOPENED','SET_MAGICBOOKBYGAMEINDEX', 'SET_SHOWMAGICBOOK', 'SET_INDEXPAGEINITIALSLIDE', 'SET_ALREADYHASONECARD',  'SET_ALLASSETSPACKAGE', 'SET_ASSETSPAGES', 'SET_COMPLETEDLESSONNUM', 'SET_GAMEHASBEENCOMPLETED', 'SET_ENERGY', 'SET_ALLPARTNAMES', 'SET_GAMEINITRESPONSE', 'SET_ALLLESSONNUM', 'SET_GAMECARDS',
        'SET_PREPARATION', 'SET_LESSONPARTSINDEX',
        'SET_LESSONPARTSLIST', 'SET_BASEASSETSCOMPLETE', 'SET_LESSONCOMPLETESTAT', 'SET_RESTARRANGEMENTSTAT', 'SET_ALLLESSONCOMPONENTSNAMES']),
      gameStart(app) {
        const self = this;
        pixiScene= new IndexPage({
          json: null,
          app: app,
          vueInstance: self
        });

        app.stage.addChild(pixiScene);
        PIXIAudio.audios.bgSound.volume = 1;
        //END
      },
    },



    mounted(){
      const self = this;
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
    },
    beforeDestroy(){
      if(pixiScene){
        pixiScene.destroyed();
        pixiScene.destroy();
        pixiScene = null;
      }
      if(canvasApp){

        canvasApp.destroy();
        canvasApp = null;
      }

    }
  }
</script>

<style scoped>
  .bgContainer {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }

</style>
