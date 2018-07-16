<template>
  <div v-if="renderpage" class="bgContainer" ref="pixicanvas">


    <div id="checkAreaEl" v-if="showCheckArea" class="checkArea"></div>
  </div>

</template>
<script>
  import {mapActions, mapState} from 'vuex'

  import { Debugs, myVueMixin} from "./Utils";

  import {TweenMax} from 'gsap'
  var canvasApp = null;
  var canPlayGame = false;
  var PixiSound = require('pixi-sound')
  export default {
    name: "module1",
    mixins: [myVueMixin],
    data: function () {
      return {
        isgo:true,
        renderpage:true,
        getIdAlready:true,
        showCheckArea:true,
        gameConfig: "static/module1/gameconfig.json",

      }
    },
    computed: {
      ...mapState(['lessonPartsList','appPlatform', 'bookOpened', 'openMagicBookByGameIndex', 'gameThemeType', 'showMagicBook', 'energyCurrentNum', 'alreadyHasOneCard', 'indexPageInitialSlide', 'gameHasBeenCompleted', 'alreadyHasOneCard', 'assetsPages', 'assetsPages', 'allLessonsNum', 'baseAssetsCompleted', 'completedLessonNum', 'allLessonCompleteStat', 'restArrangementStat', 'allPartNames', 'gameInitResponse', 'allGameCards']),
      ufoStyle() {
        return {
          backgroundImage: 'url("static/img/indexpage/table.png")',
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat'
        }
      }
    },
    created() {

      console.log(PIXI.sound.Sound,'sound')
    },
    destroyed(){
      if(canvasApp){
        canvasApp.destroy(true);
        canvasApp = null;
      }

    },
    destroyed(){
      this.renderpage = false;
    },
    mounted: function () {
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
     // this.gameStart(canvasApp)



      if (self.lessonPartsList.length <= 0) {
        self.axios.get('static/preparation.json').then((responseX) => {
          self.SET_GAMEINITRESPONSE(responseX.data);
          self.SET_GAMETHEMETYPE(responseX.data.themeType);
          self.gameInit.call(self, responseX.data);

          setTimeout(()=>{
            self.gameStart(canvasApp)
          },300)

        })
      } else {
        self.gameInit.call(self, self.gameInitResponse);
        setTimeout(()=>{
          self.gameStart(canvasApp)
        },300)


      }


    },
    //todo:观察者;

    methods: {
      ...mapActions(['PUSH_GAMES', 'SET_BOOKOPENED', 'SET_GAMESECONDPLAYED','SET_GAMETHEMETYPE', 'SET_MAGICBOOKBYGAMEINDEX', 'SET_SHOWMAGICBOOK', 'SET_INDEXPAGEINITIALSLIDE', 'SET_ALREADYHASONECARD',  'SET_ALLASSETSPACKAGE', 'SET_ASSETSPAGES', 'SET_COMPLETEDLESSONNUM', 'SET_GAMEHASBEENCOMPLETED', 'SET_ENERGY', 'SET_ALLPARTNAMES', 'SET_GAMEINITRESPONSE', 'SET_ALLLESSONNUM', 'SET_GAMECARDS',
        'SET_PREPARATION', 'SET_LESSONPARTSINDEX',
        'SET_LESSONPARTSLIST', 'SET_BASEASSETSCOMPLETE', 'SET_LESSONCOMPLETESTAT', 'SET_RESTARRANGEMENTSTAT', 'SET_ALLLESSONCOMPONENTSNAMES']),
      gameInit(response) {
        const self = this;
        var allEnergy = [], allComponentsNames = [], allCompletes = [], allcompletedNum = [];
        var slideLists = [];
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
          slideLists = response.menus.map((item) => {
            return item.name
          });

          if (getId_response && getId_response.detail && getId_response.detail.length) {
            getId_response.detail.forEach((item, index) => {
              if (allCompletes[item] && allCompletes[item].meta) {
                allCompletes[item].meta.completed = 1;
              }
              //
            });

            self.SET_COMPLETEDLESSONNUM(getId_response.detail.length)
          }
          ;
          self.updateRestArrangementStat();
          self.SET_ALLLESSONNUM(allComponentsNames.length);
          self.SET_ALLLESSONCOMPONENTSNAMES(allComponentsNames);
          self.SET_LESSONCOMPLETESTAT(allEnergy);
          if (self.lessonPartsList.length == 0) {
            self.SET_ALLASSETSPACKAGE(allComponentsNames);//资源包裹初始化，用于检测resource
            //Debugs.log('初始化成功')
          }
          self.SET_LESSONPARTSLIST(response.menus);
          self.SET_ALLPARTNAMES(slideLists);
          if (self.completedLessonNum >= self.allLessonsNum) {
            self.SET_GAMEHASBEENCOMPLETED(true);
            //  console.log("初始化课程全部完成")
          }
          if (self.alreadyHasOneCard) {
            self.SET_GAMECARDS(Number(getId_response.card) + 1);
          } else {
            self.SET_GAMECARDS(Number(getId_response.card));
          }
          Debugs.log('是否打开过宝箱？opened：',getId_response.opened);
          self.SET_BOOKOPENED(getId_response.opened);

          //是否完成了所有游戏；
          if(getId_response.detail.length>=self.allLessonsNum){
            // Debugs.log('所有课程都已经完成了')
            self.SET_GAMESECONDPLAYED(true);//
          }
          //是否从游戏过来;
          if (getId_response.isOpenBook && getId_response.isOpenBook) {
            self.SET_MAGICBOOKBYGAMEINDEX(getId_response.isOpenBook);
          };
          setTimeout(()=>{
            self.emitRender = true;
          },400);


        }, (error) => {
          console.log('error:', error)
        });


      },
      getStuAnswerPromise() {
        const self = this;
        return new Promise(function (resolve, reject) {
          window.parent.postMessage({
            type: "indexcomplete"
          }, "*");
          window.addEventListener('message', function (e) {
            if (e.data.type === 'getId' && self.getIdAlready) {
              self.getIdAlready = false;
              resolve(e.data.stuAnswer);
            } else {
              if (self.isgo) {

                resolve({detail: [0,1,2,3,4,5], card: 11, opened: 1, isOpenBook: 0});
                self.isgo = false;
              }
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
      gameStart(app) {
        const self = this;
        var monsterLoaders = [];

        var _Ga = {};

        _Ga.monster = document.getElementById('starmonster');
        _Ga.planet1 = document.getElementById('load_planet1');//8
        _Ga.planet2 = document.getElementById('load_planet2');
        _Ga.meter = document.getElementById('load_meteor');
        _Ga.starmonsterImg = new Image();
        _Ga.starmonsterImg.src = 'static/img/loadingpage/starmonster.gif';
        _Ga.starmonsterImg.onload = function () {
          _Ga.monster.setAttribute('src', 'static/img/loadingpage/starmonster.gif');
          _Ga.starmonsterImg = null;
        };
        TweenMax.to(_Ga.meter, 0, {
          left: '19.8rem',
          top: '0rem',
          opacity:1
        })
        _Ga.tl = new TimelineMax({repeat:-1,delay:3,repeatDelay:3});
        _Ga.tm_meter = TweenMax.to(_Ga.meter, 2,
          {
            bezier: {
              type: "soft", values: [
                {left: '16.2rem', top: '1rem'},
                {left: '16.2rem', top: '1rem'},
                {left: '9rem', top: '4rem'},
                {left: '-2rem', top: '12rem'}],
              autoRotate: true
            }
          })
        _Ga.tl.add(_Ga.tm_meter);

        _Ga.tm_plane2 = TweenMax.to(_Ga.planet2, 25, {
          bezier: [{left: '8rem', top: '+=0.8rem'},
            {left: '12rem', top: '-=0.4rem'},
            {left: '16rem', top: '+=1rem'},
            {left: '19rem', top: '-=0.8rem'}]
        });
        _Ga.tm_plane1 = TweenMax.to(_Ga.planet1, 25, {
          bezier: [{left: '10rem', top: '+=0.3rem'},
            {left: '12rem', top: '-=0.3rem'},
            {left: '14rem', top: '+=.3rem'},
            {left: '16rem', top: '-=0.3rem'}]
        });
        _Ga.progressBar = document.getElementById('progress_masker')
        _Ga.intervalment = setInterval(() => {
          if (_Ga.progress) {


            TweenMax.to(_Ga.monster,0.3,{
              left:5.2 + 6.78 * (_Ga.progress / 100) + 'rem'
            })
            TweenMax.to(_Ga.progressBar,0.3,{
              width:6.78 * (_Ga.progress / 100) + 'rem'
            })
          }
        }, 10);

        self.axios.get('static/assetsConfig.json').then((response) => {
          self.axios.get('static/allSounds.json').then((soundRes) => {

            // console.log(soundRes.data,self.appPlatform)
            // if(self.appPlatform != 'pc'){
            //
            // }else{
            //   console.log('ffff?')
            //   canPlayGame = true;
            //   MainGame.call(self,soundRes.data)
            // //  AudioManager.add(soundRes.data,MainGame.bind(self));
            //    for(let i=0;i<soundRes.data.length;i++){
            //      PIXI.sound.add(soundRes.data[i].name,soundRes.data[i].url)
            //      console.log('name:',soundRes.data[i].name,'url:',soundRes.data[i].url)
            //    }
            //    PIXI.sound.play('bgSound')
            //
            // }
            self.showCheckArea = false;
            MainGame.call(self,soundRes.data);



          });

          /**
           * 判断所有对小怪物的资源加载
           */
          function MainGame(soundData){
            console.log("COM ON")
            var self = this;
            for(let i=0;i<self.allPartNames.length;i++){
              switch (self.allPartNames[i]){
                case 'song':
                  monsterLoaders.push({
                    "name": "indexMonster1_json",
                    "url": "static/themetypeui/monster1_song.json"
                  });
                  break;
                case 'vocabulary':
                  monsterLoaders.push({
                    "name": "indexMonster2_json",
                    "url": "static/themetypeui/monster2_vocabulary.json"
                  });
                  break;
                case 'sentences':
                  monsterLoaders.push(
                    {
                      "name": "indexMonster3_json",
                      "url": "static/themetypeui/monster3_sentences.json"
                    });
                  break;

                case 'story':
                  monsterLoaders.push(
                    {
                      "name": "indexMonster4_json",
                      "url": "static/themetypeui/monster4_story.json"
                    });
                  break;
                case 'grammar':
                  monsterLoaders.push(
                    {
                      "name": "indexMonster5_json",
                      "url": "static/themetypeui/monster5_grammar.json"
                    });
                  break;
                case 'text':
                  monsterLoaders.push(
                    {
                      "name": "indexMonster6_json",
                      "url": "static/themetypeui/monster6_text.json"
                    });
                  break;
                case 'ketpet':
                  monsterLoaders.push(
                    {
                      "name": "indexMonster7_json",
                      "url": "static/themetypeui/monster7_ketpet.json"
                    });
                  break;
                case 'reading':

                  monsterLoaders.push(
                    {
                      "name": "indexMonster8_json",
                      "url": "static/themetypeui/monster8_reading.json"
                    });
                  break;
                default:
                  break;
              }
            };


            PIXI.loader.add(soundData)
            PIXI.loader.add(response.data)
              .add(monsterLoaders)
              .on('progress', (loader) => {
                _Ga.progress = loader.progress;
              })
              .load(function (loader, resource) {
                console.log('res;;',PIXI.loader.resources)


                var gameCtn = new PIXI.Container();
                var gameStartPage = new PIXI.spine.Spine(PIXI.loader.resources['monsterStartPage_json'].spineData);
                gameStartPage.x = 1920 / 2;
                gameStartPage.y = 1080 / 2;
                let gameBg = new PIXI.Graphics();
                gameBg.beginFill(0xffffff);
                gameBg.drawRect(0, 0, 1920, 1080);
                gameBg.endFill();
                gameBg.interactive = true;
                gameStartPage.state.setAnimation(0, 'animation', true);
                let gameStartBtn = new PIXI.Graphics();
                gameStartBtn.beginFill(0xffffff, 0);
                gameStartBtn.drawRect(-80, -190, 600, 400);
                gameStartBtn.endFill();
                gameStartBtn.x = 1920 / 2 - 200;
                gameStartBtn.y = 820;
                gameStartBtn.interactive = true;
                gameCtn.addChild(gameBg);
                gameCtn.addChild(gameStartPage);
                gameCtn.addChild(gameStartBtn);
                gameStartBtn.on('pointertap', () => {


                  var bgsound = PIXI.loader.resources['bgSound'].sound.play();
                  bgsound.loop =true;

                  gameStartBtn.destroy(true);
                  gameStartPage.destroy(true);
                  gameBg.destroy(true);




                  self.$router.push('/index');
                  gameStartBtn.removeListener('pointertap')

                });
                app.stage.addChild(gameCtn)
                self.SET_ASSETSPAGES({assetsName: 'indexPage', completedStat: 1});



                _Ga.loading = document.getElementsByClassName('container')[0];
                _Ga.loading.parentNode.removeChild(_Ga.loading);


                clearInterval(_Ga.intervalment);
                //
                PIXI.loader.removeListener('progress');


                _Ga.tm_meter.kill();
                _Ga.tm_plane1.kill();
                _Ga.tm_plane2.kill();
                _Ga = null;

                if (Number(self.openMagicBookByGameIndex) > 0) {
                  self.$router.push('/index');
                }

              });
          }


        });
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
.checkArea{
  position: absolute;
  width:19.2rem;
  height:10.8rem;
  z-index: 999;
  background: red;
  opacity: 0;
}
</style>
