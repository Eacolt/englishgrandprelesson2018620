<template>
  <div>
    <div  class="bg"></div>
    <pixi-canvas  @startGame="gameStart"></pixi-canvas>
    <!--<pixi-canvas :gameConfig="gameConfig" @startGame="gameStart"></pixi-canvas>-->
    <div  id="swiperContainerMain" class="swiper-container">
      <div v-cloak id="swiperWrapperMain" class="swiper-wrapper" @mouseenter="swiperMainMouseEnter()" @mouseleave="swiperMainMouseLeave()">
        <div   v-for="(item,index) in slideLists" class="swiper-slide swiper-slide-main">
          <div class="slideInnerPic" :style="item.styles">
            {{item.slideName}}
          </div>
        </div>
      </div>
      <!-- 如果需要分页器 -->
      <div class="swiper-button-prev diyButtonPrev"></div>
      <div class="swiper-button-next diyButtonNext"></div>
    </div>

    <div ref="paginationPic" class="paginationPicture" :style="paginationPicture">
      <div  id="paginationdiy" class=" swiper-container ">
        <div v-cloak class="swiper-wrapper swiper-wrapper-paginationdiv ">
          <div v-for="(item,index) in slideLists" class="swiper-slide swiper-slide-paginationdiy">
            <div @mouseenter='paginationBallMouseEnter()'
                 @mouseleave='paginationBallMouseLeave()'
                 @click="paginationBallClick(index)" class="paginationballs" :style="paginationballs_style">
              {{index+1}}
            </div>
          </div>
        </div>
      </div>
      <div class="pagi_triangles">
        <div class="left" @click="goPrevPagi()" :style="leftTriangle_style" v-show="leftTriangleShow"></div>
        <div class="right"  @click="goNextPagi()" :style="rightTriangle_style" v-show="rightTriangleShow"></div>
      </div>
    </div>
    <div ref="boyBtnArea" class="boyBtnArea" @click="boyBtnAreaClicked"></div>
    <!--<div :style="canvas2Style" class="canvas2">-->
      <!--<pixi-canvas :style="canvas2Style"  @startGame="gameStart2"></pixi-canvas>-->
    <!--</div>-->



    <!--<transition  @before-enter="beforeEnter"-->
                 <!--@enter="enter"-->
                 <!--@leave="leave">-->
      <congraPopup :showType="popupType" v-if="showCongra"
                   @quitGame="quitGame_hdr()"
                   @continueGame="continueGame_hdr()"
                   @continueClicked="clickContinue_hdr()"
                   @againClicked="againClicked_hdr">

      </congraPopup>
    <!--</transition>-->

  </div>
</template>
<script>
  import {myVueMixin,checkForJumpRoute,myVueMixin_Popup,loaderAssetsByValided} from './Utils.js'
  import {mapActions, mapState} from 'vuex'
  import PixiScene1 from './picSwipeModule.js'
  import GameMenuBars from './gameui/GameMenuBar.js'
  import GameHand from './gameui/Gamehand.js'
  import {LoadingAnimation} from "./gameui/GameManager";

  import congraPopup from './gameui/congraPopup.vue'
  import masker from './masker.vue'
  import {Debugs} from "./Utils";
  import {swiper, swiperSlide} from 'vue-awesome-swiper'

  import 'swiper/dist/css/swiper.css'
  import {PIXIAudio} from './EasyPIXI.js'
  var pixiScene = null;
  var mySwiper = null;
  var mySwiperPagination = null;
  var modulesUrl = null;

  export default {
    name: "module1",
    mixins:[myVueMixin,myVueMixin_Popup],
    data: function () {
      return {
        slideLists: [],
        paginationLists: [],
        paginationPicture: {},
        openEnergyed:-1,

        popupType:'popup2',
        paginationballs_style:{
          opacity:0
        },
        backShow:false,
        homeShow:true,
        currentPage:0,
        currentGameLevel:0,
        showCongra:false,

        globalStatic:null,
        swiperX:[],
        scaleArr:[],//缩放大小
        currentLessonCompleted:false,

        leftTriangle_style:{},
        rightTriangle_style:{},

        boyCanClicked:true,

        currentPaginationPages:-1,
        canvas2Style:{
          pointerEvents:'none'
        }

      }
    },
    components:{congraPopup,masker},
    computed: {
      ...mapState(['lessonPartsList','appPlatform','gameSecondPlayed','allPartNames','lessonPartsIndex','allLessonsNum','showPopupDelay','allLessonComponentsNames','energyCurrentNum','restArrangementStat','lessonCurrentPageIndex','gameHasBeenCompleted']),
      leftTriangleShow(){
        return this.currentPaginationPages>=4
      },
      rightTriangleShow(){

        return this.currentPaginationPages<=this.slideLists.length-5
      }
    },


    methods: {
      ...mapActions(['SET_CANVASPAGE','SET_INDEXPAGEINITIALSLIDE','SET_ASSETSPAGES','PUSH_GAMES','SET_LESSONCOMPLETESTAT','SET_RESTARRANGEMENTSTAT','SET_LESSONCURRENTPAGEINDEX']),
      goPrevPagi(){
        if(mySwiperPagination){

          mySwiperPagination.slidePrev()
        }
      },
      goNextPagi(){
        if(mySwiperPagination){
          mySwiperPagination.slideNext();

        }

      },
      boyBtnAreaClicked(){
        const self = this;
        if(self.boyCanClicked==false)return;
        self.boyCanClicked = false;
        Debugs.log('点到我了')
        if(mySwiper){
          if(mySwiper.activeIndex <mySwiper.slides.length-1){
            return;
          }
        }
        pixiScene.stopAudios();




       //TODO:开始设置清算界面逻辑全套66;
        self.$route.meta.completed = 1;
        self.setOwnLessonComplete();
        if (self.gameHasBeenCompleted == false) {
          window.parent.postMessage({
            type: "stepSubmit",
            page: self.lessonCurrentPageIndex
          }, "*");
        }
        setTimeout(() => {
          let isQingsuan = self.$route.name == self.restArrangementStat[self.restArrangementStat.length - 1];//开始清算;
          setTimeout(() => {
            if (isQingsuan && !self.gameHasBeenCompleted) {
              Debugs.log('清算页面开启，游戏未完成', 'gameCOmpleted?', self.gameHasBeenCompleted)
              // self.gameMenuBar.bookScene.openEnergyCan(false);
              self.openEnergyed = 0;

            } else if (isQingsuan == false && !self.gameHasBeenCompleted) {
              self.showCongra = true;
              Debugs.log('游戏没有完成，并且也不是清算页')
              PIXIAudio.audios['win_jump'].play();
            }else if(self.gameHasBeenCompleted && self.gameSecondPlayed){
              self.showCongra = true;
              Debugs.log('游戏第二周目，继续玩')
              PIXIAudio.audios['win_jump'].play();
            }  else if (self.gameHasBeenCompleted && !self.gameSecondPlayed) {
              self.openEnergyed = 1;
              PIXIAudio.audios['win_jump'].play();
              Debugs.log('游戏完成并且卡片已经获得', 'gameCompleted?', self.gameHasBeenCompleted)
            }
          }, self.showPopupDelay);
          self.updateRestArrangementStat();
        }, 1);
        //TODO:开始设置清算界面逻辑全套---END;




      },
      quitGame_hdr(){
        const self = this;
        setTimeout(() => {
          self.$router.push('/index/')
        }, 1000);

        let arr = this.$route.fullPath.split('/');
        let index = self.allPartNames.indexOf(arr[2]);
        self.SET_INDEXPAGEINITIALSLIDE(Number(index));

        LoadingAnimation.setMaskShow(true)



      },
      continueGame_hdr(){
        this.showCongra = false;
      },
      clickContinue_hdr(){

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

        if(this.gameHasBeenCompleted){
          checkForJumpRoute.call(this,false);

        }else{
          checkForJumpRoute.call(this,true);
        }
      },
      againClicked_hdr(){
        this.showCongra = false;
        this.boyCanClicked = true;

        if(mySwiper){
          mySwiper.slideTo(0,500)
        }
      },

      swiperMainMouseEnter(){
        if(this.appPlatform=='pc'){
          GameHand.setAnimation('swipe')
        }

      },
      swiperMainMouseLeave(){
        if(this.appPlatform=='pc'){
          GameHand.setAnimation('normal')
        }

      },
      paginationBallMouseLeave(){
        if(this.appPlatform == 'pc'){
          GameHand.setAnimation('normal')
        }

      },
      paginationBallMouseEnter(){
        if(this.appPlatform=='pc'){
          GameHand.setAnimation('click')
        }

      },
      paginationBallClick(index){
        const self = this;
        if(mySwiperPagination){


          if(index==mySwiperPagination.activeIndex){

            mySwiperPagination.slideTo(index-4,300,false);

          }else{
            mySwiperPagination.slideTo(index,300,false);
          }
         // self.mySwiperPagination.slideTo(index,300,false);

         Array.prototype.forEach.call(this.slideLists,function(item,index){
           mySwiperPagination.slides.eq(index).find('.paginationballs').css({
             backgroundImage:"url("+self.globalStatic+'/pagiball1.png'+")",
             backgroundRepeat:'no-repeat',
             backgroundSize:'contain',
             color:"#539bc5"
           });
         });

          mySwiperPagination.slides.eq(index).find('.paginationballs').css({
            backgroundImage:"url("+self.globalStatic+'/pagiball2.png'+")",
            backgroundRepeat:'no-repeat',
            backgroundSize:'contain',
            color:"white"
          });
          mySwiper.slideTo(index,300,false);
          this.currentPage = index;
        }

      },
      gameStart2(app){
        const self = this;

        var gameMenuBar = new GameMenuBars();

         app.stage.addChild(gameMenuBar);
        gameMenuBar.backBtnShow = false;
        gameMenuBar.homeBtnShow = false;
        gameMenuBar.bookBtnShow = false;
        gameMenuBar.soundBtnShow = false;
        gameMenuBar.updateGameMenu();
        gameMenuBar.energyBar.alpha = 0;
        gameMenuBar.soundBtn.alpha = 0;
        self.$watch(()=>{
          return self.openEnergyed
        },(newval)=>{

             if(Number(newval)==1){

               gameMenuBar.bookScene.openEnergyCan(true);
               self.canvas2Style = {
                 pointerEvents:'auto'
               }
             }else if(Number(newval)==0){
               gameMenuBar.bookScene.openEnergyCan(false);
               self.canvas2Style = {
                 pointerEvents:'auto'
               }
             }
        });



      },

      gameStart(app) {
        const self = this;
         modulesUrl = this.$route.meta.assetsUrl;
         self.globalStatic = 'static/' + modulesUrl;


        self.axios.get(self.globalStatic + '/gameconfig.json').then((gameConfigData) => {
          var assets = gameConfigData.data.assets.map((item, index) => {
            return {
              name: '' + item.name,
              url: item.url
            }
          });
            self.slideLists =gameConfigData.data.gameData.pictureList.map((item, index) => {

              return {
                slideName: '',
                styles:{
                  backgroundImage: "url("+self.globalStatic+'/'+ gameConfigData.data.gameData.pictureList[index].picture+")",
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat"
                }
              }
            });
          loaderAssetsByValided.call(self,modulesUrl,assets,GameStart);

        });


            function GameStart(resource,gameConfigData){

              Object.assign(self.paginationballs_style,{
                backgroundImage:"url("+self.globalStatic+'/pagiball1.png'+")",
                backgroundRepeat:'no-repeat',
                backgroundSize:'contain',
                opacity:1
              });

              self.paginationPicture = {
                backgroundImage: "url(static/themetypeui"+'/pagination.png'+")",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat"
              }
              self.leftTriangle_style = {
                backgroundImage: "url("+self.globalStatic+'/sanjiao.png'+")",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                transform:"scaleX(-1)"
              }
              self.rightTriangle_style = {
                backgroundImage: "url("+self.globalStatic+'/sanjiao.png'+")",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",

              }




              //初始化Swiper;

                mySwiperPagination = new Swiper('#paginationdiy', {
                  direction: 'horizontal',
                  slidesPerView: 5,
                  slidesPerGroup: 4,
                  resistanceRatio:0,
                  on:{
                    sliderMove:function(e){
                      if(self.appPlatform=='pc'){
                        GameHand.hand.css({
                          left:e.pageX,
                          top:e.pageY
                        })
                      }

                    },
                    init(){
                      this.update();
                    }

                  }
                });
                mySwiper = new Swiper('#swiperContainerMain', {
                  direction: 'horizontal',
                  centeredSlides: true,
                  slidesPerView: 1.3,
                  spcaeBetween: 15,
                  touchEventsTarget: 'wrapper',

                  // 如果需要前进后退按钮
                  navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                  },
                  on: {
                    sliderMove:function(e){
                      if(self.appPlatform=='pc'){
                        GameHand.hand.css({
                          left:e.pageX,
                          top:e.pageY
                        });
                      }

                    },
                    slideChangeTransitionStart: function () {
                      const _swiper = this;

                      Array.prototype.forEach.call(this.slides,function(item,index){
                        _swiper.slides.eq(index).removeClass('none-effect');

                        mySwiperPagination.slides.eq(index).find('.paginationballs').css({
                          backgroundImage:"url("+self.globalStatic+'/pagiball1.png'+")",
                          backgroundRepeat:'no-repeat',
                          backgroundSize:'contain',
                          color:"#539bc5"
                        });
                      });
                      mySwiperPagination.slides.eq(_swiper.activeIndex).find('.paginationballs').css({
                        backgroundImage:"url("+self.globalStatic+'/pagiball2.png'+")",
                        backgroundRepeat:'no-repeat',
                        backgroundSize:'contain',
                        color:"white"
                      });
                      mySwiperPagination.slideTo(_swiper.activeIndex, 1000);
                    },
                    slideChange(){
                      self.currentPage = this.activeIndex;

                      if(this.activeIndex>=this.slides.length-1){
                        self.$refs.boyBtnArea.style.pointerEvents = 'auto';
                        pixiScene.showBoy();
                        // PIXIAudio.audios['nextpart'].play();
                        self.currentLessonCompleted= true;

                      }else{
                        pixiScene.hideBoy();
                        self.$refs.boyBtnArea.style.pointerEvents = 'none';
                      }
                      pixiScene.stopAudios();
                      pixiScene.playAudios();
                      //self.$parent.$parent.$refs.gameMenu.showAudio = false;
                      //【重要】设置当前下部导航的索引;
                      self.currentPaginationPages = this.realIndex;

                    },
                    tap: function () {

                      self.currentPage = this.activeIndex;

                    },
                    init: function () {
                      this.slides.eq(this.activeIndex).addClass('none-effect');

                      setTimeout(()=>{
                        mySwiperPagination.slides.eq(0).find('.paginationballs').css({
                          backgroundImage:"url("+self.globalStatic+'/pagiball2.png'+")",
                          backgroundRepeat:'no-repeat',
                          backgroundSize:'contain',
                          color:"white"
                        });
                      },20)
                      GameHand.locked = false;


                      let s = setInterval(()=>{
                        if(pixiScene){
                          pixiScene.playAudios();
                          clearInterval(s);
                        }
                      },2)
                      this.update();
                    }
                  },
                });

              let audioManifest = [];
              for(let i=0;i<gameConfigData.gameData.pictureList.length;i++){
                let audioSrc = gameConfigData.gameData.pictureList[i].audioSrc;
                let audioName = modulesUrl+'_'+audioSrc.replace(/\./g,'_');

                if(audioSrc && _.trim(audioSrc)!=''){
                  audioManifest.push({
                    id:audioName,
                    src:audioSrc
                  });
                }

              };
              //加载页面小人END
              LoadingAnimation.setMaskShow(true);
              //end
              if(PIXIAudio.loadedStatus[modulesUrl]==undefined && audioManifest.length>0){
                PIXIAudio.addAudio(audioManifest, self.globalStatic+'/', ()=>{
                  PixiGameStart.call(self)

                },modulesUrl)
              }else{
                PixiGameStart.call(self)
              }
              function PixiGameStart(){
                //app.stage.removeChildAt(0)
                var scene1 = new PixiScene1({
                  json: gameConfigData.gameData,
                  app: app,
                  resources: resource,
                  vueInstance:self,
                  swiper:mySwiper
                });
                app.stage.addChild(scene1);
                pixiScene = scene1;
                LoadingAnimation.setMaskShow(false)
              }
              //END
            }
      }
    },
    beforeCreate(){
      if(this.$store.state.lessonPartsList.length==0){
        this.$router.push('/');
        window.location.reload()
      }
    },

    destroyed(){
        if(this.appPlatform=='pc'){
          GameHand.setAnimation('normal')
        }


        mySwiper.destroy(true,true);
        mySwiperPagination.destroy(true,true);
        if(pixiScene){
          pixiScene.destroyed();
          pixiScene.destroy();
          pixiScene = null

        }

    },
    mounted() {
      const self = this;
      self.SET_LESSONCURRENTPAGEINDEX(Number(self.allLessonComponentsNames.indexOf(self.$route.name)));


    },
  }
</script>

<style scoped>
  .bg {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }
  .boyBtnArea{
    position: absolute;
    top:4rem;
    right:0rem;
    width:2rem;
    height:3rem;
    background:gray;
    z-index: 100;
    opacity: 0;
    pointer-events: none;
  }
  .swiper-container {
    position: absolute;
    top: 1rem;
  }
  .diyButtonPrev{

    width:2.5rem;
    height:6.6rem;
    background:transparent;
    left:0;
    top:2.2rem;
    cursor:none;

  }
  .diyButtonNext{
    background:none;
    width:2.5rem;
    height:6.6rem;
    background:transparent;
    right:0;
    top:2.2rem;
    cursor:none;

  }
  .swiper-slide-active, .swiper-slide-duplicate-active {
    transform-origin: center center;
    transform: scale(1) !important;
  }
  .swiper-slide-active.none-effect {
    /*color: green;*/
  }
  .none-effect {
    -webkit-transition: transform !important;
    -moz-transition: transform  !important;
    -ms-transition: transform  !important;
    -o-transition: transform  !important;
    transition: transform  !important;
  }
  #swiperContainerMain {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-grow: 1;
    padding: 0;
    margin: 0;
    width: 100%;
    transform-origin: center center;
    margin: 0 auto;
    left: 0;
    right: 0;
    top: 1.8rem;
    height: 8rem;
  }
  .paginationPicture {
    position: absolute;
    width: 5.3rem;
    height: 1.8rem;
    z-index: 99;
    left: 0;
    right: 0;
    margin: 0 auto;
    top: 8.8rem;
  }
.pagi_triangles{
  position: absolute;
  width:5rem;
  height:0.8rem;
  margin:0 auto;
  left:0;
  right:0;
  top:0.22rem;
}
.pagi_triangles .left{
  position: absolute;
  width:0.22rem;
  height:0.4rem;
  left:0.2rem;
  top:0.23rem;
}
  .pagi_triangles .right{
    position: absolute;
    width:0.22rem;
    height:0.4rem;
    right:0.2rem;
    top:0.23rem;
  }
  .slideInnerPic {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  .paginationballs{
    position:relative;
    width:0.72rem;
    height:0.72rem;
    border-radius:50%;
    font-size:0.42rem;
    line-height:0.6rem;
    text-align:center;
    top:-0.02rem;
    color:#539bc5;
    line-height:170%;
    /*font-weight:bold;*/
  }
  #paginationdiy {
    position: absolute !important;
    width: 4rem;
    height: 1rem;
    left: 0;
    right: 0;
    margin: 0 auto;
    box-sizing: border-box;
    top:0.15rem;
    z-index:999;
  }
  .swiper-slide-paginationdiy {
    position:relative;
    display:flex;
    flex-grow:1;
    flex-direction:row;
    justify-content:center;
    align-items:center;
    background: transparent;
    width: 0.7rem;
    box-sizing: border-box;
  }
  .swiper-wrapper-paginationdiv {
    position: relative;
    box-sizing: border-box;
  }
  .swiper-slide-main {
    position: relative;
    height: 7.8rem;
    top: 0rem;
    transition: transform .1s;
    -webkit-transition: transform 0.1s;
    -moz-transition: transform .1s;
    -ms-transition: transform .1s;
    -o-transition: transform .1s;
    transform-origin: center center;
    -webkit-transform: scale(.9);
    transform: scale(.9);
    box-sizing: border-box;
    background: transparent;
  }

  [v-cloak] {
    display: none;
  }
  .canvas2{
    position: absolute;
    left:0;
    top:0;
    width:100%;
    height:100%;
    z-index: 111;
  }

</style>
