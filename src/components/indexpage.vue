<template>
  <div class="bgContainer">
    <pixi-canvas @startGame="gameStart"></pixi-canvas>
  </div>
</template>
<script>
  import Vue from 'vue'
  import $ from 'jquery'
  import {mapActions, mapState} from 'vuex'
  import IndexPage from './indexpage.js'
  import GameHand from './gameui/Gamehand.js'
  import {LoadingAnimation} from './gameui/GameManager.js'
  import {Debugs, myVueMixin, TextureCache, AudioManager} from "./Utils";
  import {PIXIAudio} from "./EasyPIXI";
  import GameMenuBars from './gameui/GameMenuBar.js'
  var pixiScene = null;

  export default {
    name: "module1",
    mixins: [myVueMixin],
    data: function () {
      return {
        gameConfig: "static/module1/gameconfig.json",
      }
    },
    computed: {
      ...mapState(['lessonPartsList', 'lessonCurrentPageIndex','bookOpened','openMagicBookByGameIndex', 'gameThemeType', 'showMagicBook', 'energyCurrentNum', 'alreadyHasOneCard', 'indexPageInitialSlide', 'gameHasBeenCompleted', 'alreadyHasOneCard', 'assetsPages', 'assetsPages','allLessonsNum', 'baseAssetsCompleted', 'completedLessonNum', 'allLessonCompleteStat', 'restArrangementStat', 'allPartNames', 'gameInitResponse', 'allGameCards']),
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
      ...mapActions(['PUSH_GAMES', 'SET_GAMESECONDPLAYED', 'SET_GAMETHEMETYPE', 'SET_BOOKOPENED','SET_MAGICBOOKBYGAMEINDEX', 'SET_SHOWMAGICBOOK', 'SET_INDEXPAGEINITIALSLIDE', 'SET_ALREADYHASONECARD',  'SET_ALLASSETSPACKAGE', 'SET_ASSETSPAGES', 'SET_COMPLETEDLESSONNUM', 'SET_GAMEHASBEENCOMPLETED', 'SET_ENERGY', 'SET_ALLPARTNAMES', 'SET_GAMEINITRESPONSE', 'SET_ALLLESSONNUM', 'SET_GAMECARDS',
        'SET_PREPARATION', 'SET_LESSONPARTSINDEX',
        'SET_LESSONPARTSLIST', 'SET_BASEASSETSCOMPLETE', 'SET_LESSONCOMPLETESTAT', 'SET_RESTARRANGEMENTSTAT', 'SET_ALLLESSONCOMPONENTSNAMES']),
      gameStart(app) {
        const self = this;
        var scene1 = new IndexPage({
          json: null,
          app: app,
          res: PIXI.loader.resources,
          vueInstance: self
        });
        app.stage.addChild(scene1);
        LoadingAnimation.setMaskShow(false);
        PIXIAudio.audios.bgSound.volume = 1;
        //END
      },
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
