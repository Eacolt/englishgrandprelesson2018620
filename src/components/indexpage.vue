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
  import congraPopup from './gameui/congraPopup.vue'

  import GameHand from './gameui/Gamehand.js'
  import {LoadingAnimation} from './gameui/GameManager.js'
  import {Debugs, myVueMixin, TextureCache, AudioManager} from "./Utils";
  import TestIndex from './TestIndex.js'
  import {PIXIAudio} from "./EasyPIXI";
  import GameMenuBars from './gameui/GameMenuBar.js'

  var pixiScene = null;

  export default {
    name: "module1",
    mixins: [myVueMixin],
    data: function () {
      return {
        gameConfig: "static/module1/gameconfig.json",
        boxOpened: -1
      }
    },
    computed: {
      ...mapState(['lessonPartsList','gameThemeType','showMagicBook', 'energyCurrentNum', 'alreadyHasOneCard', 'indexPageInitialSlide', 'gameHasBeenCompleted', 'alreadyHasOneCard', 'assetsPages', 'assetsPages', 'assetsResources', 'assetsResources', 'allLessonsNum', 'baseAssetsCompleted', 'completedLessonNum', 'allLessonCompleteStat', 'restArrangementStat', 'allPartNames', 'gameInitResponse', 'allGameCards']),
      ufoStyle() {
        return {
          backgroundImage: 'url("static/img/indexpage/table.png")',
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat'
        }
      }
    },
    created() {
      //     Debugs.locked = true;
    },
    mounted: function () {
      const self = this;
      var comparr = [];
      if (self.lessonPartsList.length <= 0) {
        self.axios.get('static/preparation.json').then((responseX) => {
          self.SET_GAMEINITRESPONSE(responseX.data);
          self.SET_GAMETHEMETYPE(responseX.data.themeType);
          self.gameInit.call(self, responseX.data);

        })
      } else {
        self.gameInit.call(self, self.gameInitResponse);

      }


    },
    //todo:观察者;


    beforeDestroy() {


    },
    destroyed() {
      if(pixiScene){
        pixiScene.destroyed();
        pixiScene.destroy();
        pixiScene = null;
      }




    },
    methods: {
      ...mapActions(['PUSH_GAMES','SET_GAMETHEMETYPE','SET_SHOWMAGICBOOK', 'SET_INDEXPAGEINITIALSLIDE', 'SET_ALREADYHASONECARD', 'SET_ASSETSRESOURCES', 'SET_ALLASSETSPACKAGE', 'SET_ASSETSPAGES', 'SET_COMPLETEDLESSONNUM', 'SET_GAMEHASBEENCOMPLETED', 'SET_ENERGY', 'SET_ALLPARTNAMES', 'SET_GAMEINITRESPONSE', 'SET_ALLLESSONNUM', 'SET_GAMECARDS',
        'SET_PREPARATION', 'SET_LESSONPARTSINDEX',
        'SET_LESSONPARTSLIST', 'SET_BASEASSETSCOMPLETE', 'SET_LESSONCOMPLETESTAT', 'SET_RESTARRANGEMENTSTAT', 'SET_ALLLESSONCOMPONENTSNAMES']),
      gameInit(response) {
        const self = this;
        var allEnergy = [], allComponentsNames = [], allCompletes = [], allcompletedNum = [];
        self.getStuAnswerPromise().then((getId_response) => {

          self.$router.options.routes.forEach((item, index) => {
            if (item.children) {
              let arr = item.children.filter((_item, index) => {
                if (_item.meta) {
                  return _item.meta.completed != null
                }
              });
              allEnergy.push(arr);
            }

          });

          //初始化所有课程名称;
          allEnergy.forEach((item) => {
            item.forEach((_item) => {
              allComponentsNames.push(_item.name)
              allCompletes.push(_item)
            })
          });
          allcompletedNum = allCompletes.filter((item) => {
            return item.meta.completed == 1;
          });
          self.slideLists = response.menus.map((item) => {
            return item.name
          });

          if (getId_response && getId_response.detail && getId_response.detail.length) {
            getId_response.detail.forEach((item, index) => {
              if (allCompletes[item] && allCompletes[item].meta) {
                allCompletes[item].meta.completed = 1;
              }
              //
            });
            // console.log('什么个意思草？',getId_response.detail.length)
             self.SET_COMPLETEDLESSONNUM(getId_response.detail.length)
          }
          ;
          self.updateRestArrangementStat();
          self.SET_ALLLESSONNUM(allComponentsNames.length);
          self.SET_ALLLESSONCOMPONENTSNAMES(allComponentsNames);
          self.SET_LESSONCOMPLETESTAT(allEnergy);
          if (self.lessonPartsList.length == 0) {
            //todo:一次性初始化
            self.SET_ALLASSETSPACKAGE(allComponentsNames);//资源包裹初始化，用于检测resource
          }
          self.SET_LESSONPARTSLIST(response.menus);
          self.SET_ALLPARTNAMES(self.slideLists);
          if (self.completedLessonNum >= self.allLessonsNum) {
            self.SET_GAMEHASBEENCOMPLETED(true);
          //  console.log("初始化课程全部完成")
          }
          if (self.alreadyHasOneCard) {
            self.SET_GAMECARDS(Number(getId_response.card) + 1);
          } else {
            self.SET_GAMECARDS(Number(getId_response.card));
          }
          if (getId_response.opened == 1) {
            self.boxOpened = 1;
          } else if (getId_response.opened == 0) {
            self.boxOpened = 0;
          }
        }, (error) => {
          console.log('error:', error)
        });


      },
      getStuAnswerPromise() {
        return new Promise(function (resolve, reject) {
          window.parent.postMessage({
            type: "indexcomplete"
          }, "*");
          window.addEventListener('message', function (e) {
            if (e.data.type === 'getId') {
              resolve(e.data.stuAnswer);
              //console.log('后台卡片数量：',e.data.stuAnswer.card,'是否开启宝箱：',e.data.stuAnswer.opened)
            } else {
              //  reject('getId异步发生错误');
              resolve({detail: [], card: 2, opened: 0});
            }
          });

        });
      },
      //接口
      /**
       * http://i.xueersi.com/libarts/Preparation/getStuAnswer
       http://i.xueersi.com/libarts/Preparation/stepSubmit //每次能量条增加调用;附加一个page:n页面
       http://i.xueersi.com/libarts/Preparation/taskSubmit //所有能量条完毕调用
       * @returns {number}
       */
      getStuAnswer() {
        // this.axio
        this.axios.get('http://i.xueersi.com/libarts/Preparation/getStuAnswer').then((response) => {
        });
      },

      gameStart(app) {
        const self = this;
        LoadingAnimation.loading = self.$parent.$refs.masker;

        if (self.assetsPages.indexPage == 1) {
          var scene1 = new IndexPage({
            json: null,
            app: app,
            res: PIXI.loader.resources,
            vueInstance: self
          });
          app.stage.addChild(scene1);
          LoadingAnimation.setMaskShow(false);
          PIXIAudio.audios.bgSound.volume = 1;

        } else {
          self.axios.get('static/assetsConfig.json').then((response) => {
            self.axios.get('static/allSounds.json').then((soundRes) => {

              PIXIAudio.init(soundRes.data,'static/sound/',function () {

                PIXI.loader.add(response.data)





                  .load(function (loader, resource) {
                  var scene1 = new IndexPage({
                    vueInstance: self
                  });
                  pixiScene = scene1;
                  app.stage.addChild(scene1);
                  self.SET_ASSETSPAGES({assetsName: 'indexPage', completedStat: 1});
                  LoadingAnimation.setMaskShow(false);
                });

              });
            })
          });
        }
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
